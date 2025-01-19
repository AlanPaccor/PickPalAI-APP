import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { StyleSheet, Platform, TouchableOpacity, ScrollView, FlatList, StatusBar, Image, ActivityIndicator, TextInput, View, RefreshControl, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { debounce } from 'lodash';
import { Game } from '@/types/sports';
import Colors from '@/constants/Colors';
import { useColorScheme } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { MaterialCommunityIconName } from '@/types/icons';
import axios from 'axios';
import { SearchBar } from '@/components/SearchBar';
import { GameDetailsModal } from '@/components/GameDetailsModal';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { format } from 'date-fns';

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

const SPORTS: Array<{
  id: string;
  name: string;
  color: string;
}> = [
  { id: 'americanfootball_nfl', name: 'NFL', color: '#1E3A5F' },
  { id: 'americanfootball_ncaaf', name: 'NCAAF', color: '#1E3A5F' },
  { id: 'basketball_nba', name: 'NBA', color: '#C9082A' },
  { id: 'basketball_ncaab', name: 'NCAAB', color: '#C9082A' },
  { id: 'icehockey_nhl', name: 'NHL', color: '#041E42' },
  { id: 'baseball_mlb', name: 'MLB', color: '#BF0D3E' },
  { id: 'soccer_epl', name: 'EPL', color: '#3D195B' },
  { id: 'soccer_uefa_champions_league', name: 'UCL', color: '#00235D' },
  { id: 'soccer_uefa_europa_league', name: 'UEL', color: '#FF6900' },
  { id: 'soccer_spain_la_liga', name: 'La Liga', color: '#EE8707' },
  { id: 'soccer_italy_serie_a', name: 'Serie A', color: '#008FD7' },
  { id: 'soccer_germany_bundesliga', name: 'Bundesliga', color: '#D20515' },
  { id: 'soccer_france_ligue_one', name: 'Ligue 1', color: '#091C3E' },
  { id: 'mma_mixed_martial_arts', name: 'MMA', color: '#D20A0A' },
  { id: 'boxing_boxing', name: 'Boxing', color: '#D20A0A' },
  { id: 'cricket_ipl', name: 'IPL', color: '#1B4A91' },
];

const API_KEY = 'b92441712416a49eb772ca291a151b29';
const API_BASE_URL = 'https://api.the-odds-api.com/v4/sports';
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes in milliseconds
const CACHE_PREFIX = 'odds_cache_';
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute window
const MAX_REQUESTS_PER_WINDOW = 10; // Maximum requests per minute
const RATE_LIMIT_KEY = 'odds_rate_limit';

interface OddsApiResponse {
  id: string;
  sport_key: string;
  sport_title: string;
  commence_time: string;
  home_team: string;
  away_team: string;
  bookmakers: Array<{
    key: string;
    title: string;
    markets: Array<{
      key: string;
      outcomes: Array<{
        name: string;
        price: number;
      }>;
    }>;
  }>;
}

interface RateLimitData {
  requests: number;
  windowStart: number;
}

interface CacheData<T> {
  data: T;
  timestamp: number;
  version: string; // Add version to invalidate cache on app updates
}

const CACHE_VERSION = '1.0';

const checkRateLimit = async (): Promise<boolean> => {
  try {
    const now = Date.now();
    const rateLimitData = await AsyncStorage.getItem(RATE_LIMIT_KEY);
    let rateLimit: RateLimitData;

    if (rateLimitData) {
      rateLimit = JSON.parse(rateLimitData);
      // Reset if window has expired
      if (now - rateLimit.windowStart > RATE_LIMIT_WINDOW) {
        rateLimit = { requests: 0, windowStart: now };
      }
    } else {
      rateLimit = { requests: 0, windowStart: now };
    }

    // Check if limit exceeded
    if (rateLimit.requests >= MAX_REQUESTS_PER_WINDOW) {
      return false;
    }

    // Increment request count
    rateLimit.requests++;
    await AsyncStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(rateLimit));
    return true;
  } catch (error) {
    console.error('Rate limit check error:', error);
    return true; // Allow request if rate limit check fails
  }
};

const getCacheKey = (sport: string, filter: string) => `${CACHE_PREFIX}${sport}_${filter}`;

const getFromCache = async <T>(cacheKey: string): Promise<T | null> => {
  try {
    const cached = await AsyncStorage.getItem(cacheKey);
    if (cached) {
      const cacheData: CacheData<T> = JSON.parse(cached);
      if (
        Date.now() - cacheData.timestamp < CACHE_EXPIRY &&
        cacheData.version === CACHE_VERSION
      ) {
        console.log(`Cache hit for ${cacheKey}`);
        return cacheData.data;
      }
    }
    console.log(`Cache miss for ${cacheKey}`);
    return null;
  } catch (error) {
    console.error('Cache read error:', error);
    return null;
  }
};

const saveToCache = async <T>(cacheKey: string, data: T): Promise<void> => {
  try {
    const cacheData: CacheData<T> = {
      data,
      timestamp: Date.now(),
      version: CACHE_VERSION,
    };
    await AsyncStorage.setItem(cacheKey, JSON.stringify(cacheData));
    console.log(`Cached data for ${cacheKey}`);
  } catch (error) {
    console.error('Cache write error:', error);
  }
};

const transformOddsData = (oddsData: OddsApiResponse[], currentFilter: string): Game[] => {
  return oddsData.map((item, index) => {
    const bookmaker = item.bookmakers[0];
    const market = bookmaker?.markets?.find(m => m.key === currentFilter) || bookmaker?.markets[0];
    const outcome = market?.outcomes[0];

    // Create a unique ID using the combination of game ID, filter, and commence time
    const uniqueId = `${item.id}-${currentFilter}-${item.commence_time}`;

    return {
      id: uniqueId,
      player: `${item.home_team} vs ${item.away_team}`,
      position: item.sport_title,
      team: item.home_team,
      opponent: item.away_team,
      prediction: outcome?.price?.toFixed(2) || "N/A",
      stat: market?.key || "odds",
      popularity: "New",
      time: format(new Date(item.commence_time), 'h:mm a'),
      sport: item.sport_key,
      jersey: "0",
      jerseyColor: '#1E3A5F',
      odds: outcome?.price || 1,
      trend: Math.random() * 100,
      value: Math.random() * 100,
    };
  });
};

const cleanupOldCache = async () => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const oddsKeys = keys.filter(key => key.startsWith(CACHE_PREFIX));
    
    for (const key of oddsKeys) {
      const cached = await AsyncStorage.getItem(key);
      if (cached) {
        const { timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp > CACHE_EXPIRY) {
          await AsyncStorage.removeItem(key);
        }
      }
    }
  } catch (error) {
    console.error('Cache cleanup error:', error);
  }
};

// Add a constant for pagination
const GAMES_PER_PAGE = 10;

export default function ExploreScreen() {
  const { t } = useTranslation();
  const [selectedSport, setSelectedSport] = useState('americanfootball_nfl');
  const [selectedFilter, setSelectedFilter] = useState('h2h');
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const colorScheme = useColorScheme();
  const [loadedGameIds, setLoadedGameIds] = useState<Set<string>>(new Set());
  const [searchText, setSearchText] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isInitialLoadDone, setIsInitialLoadDone] = useState(false);
  const [allGames, setAllGames] = useState<Game[]>([]);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [hasMoreData, setHasMoreData] = useState(true);
  const [totalItems, setTotalItems] = useState(0);

  const FILTERS = useMemo(() => [
    { 
      id: 'h2h', 
      label: t('Winner'), 
      type: 'market',
      description: t('Bet on which team will win')
    },
    { 
      id: 'spreads', 
      label: t('Spread'), 
      type: 'market',
      description: t('Bet with point advantage/disadvantage')
    },
    { 
      id: 'totals', 
      label: t('Over/Under'), 
      type: 'market',
      description: t('Bet on total combined score')
    },
    { 
      id: 'outrights', 
      label: t('Championship'), 
      type: 'market',
      description: t('Bet on tournament winner')
    },
    { 
      id: 'player_props', 
      label: t('Player Props'), 
      type: 'market',
      description: t('Bet on player performance')
    },
    { 
      id: 'game_props', 
      label: t('Game Props'), 
      type: 'market',
      description: t('Bet on specific game events')
    },
    // Sport-specific filters
    ...selectedSport.includes('basketball') ? [
      { 
        id: 'team_totals', 
        label: t('Team Points'), 
        type: 'market',
        description: t('Bet on team score')
      },
      {
        id: 'first_half',
        label: t('1st Half'),
        type: 'market',
        description: t('First half betting')
      }
    ] : [],
    ...selectedSport.includes('football') ? [
      { 
        id: 'alternate_spreads', 
        label: t('Alt Spreads'), 
        type: 'market',
        description: t('Different point spreads')
      },
      {
        id: 'quarters',
        label: t('Quarters'),
        type: 'market',
        description: t('Quarter by quarter betting')
      }
    ] : [],
  ], [t, selectedSport]);

  const handleSearch = useCallback((text: string) => {
    setSearchText(text);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchText('');
  }, []);

  const filteredGames = useMemo(() => {
    console.log('filteredGames running with searchText:', searchText);
    console.log('current games:', allGames.length);
    if (!searchText.trim()) {
      return allGames;
    }
    const searchLower = searchText.toLowerCase();
    const filtered = allGames.filter(game => {
      const matchPlayer = game.player.toLowerCase().includes(searchLower);
      const matchTeam = game.team.toLowerCase().includes(searchLower);
      const matchOpponent = game.opponent.toLowerCase().includes(searchLower);
      const matchPosition = game.position.toLowerCase().includes(searchLower);
      return matchPlayer || matchTeam || matchOpponent || matchPosition;
    });
    console.log('filtered results:', filtered.length);
    return filtered;
  }, [allGames, searchText]);

  const loadGames = useCallback(async () => {
    if (loading || refreshing) return;
    
    try {
      setLoading(true);

      const cacheKey = getCacheKey(selectedSport, selectedFilter);
      const cachedData = await getFromCache<Game[]>(cacheKey);
      
      if (cachedData) {
        // Always set allGames when we have data, regardless of page
        setAllGames(cachedData);
        setTotalItems(cachedData.length);

        const startIndex = (page - 1) * GAMES_PER_PAGE;
        const endIndex = startIndex + GAMES_PER_PAGE;
        const paginatedData = cachedData.slice(startIndex, endIndex);
        
        if (paginatedData.length === 0) {
          setHasMoreData(false);
        } else {
          setGames(prev => page === 1 ? paginatedData : [...prev, ...paginatedData]);
          setPage(prev => prev + 1);
        }
        
        if (!isInitialLoadDone) setIsInitialLoadDone(true);
        return;
      }

      // Only check rate limit if we need to make an API call
      const canMakeRequest = await checkRateLimit();
      if (!canMakeRequest) {
        setHasMoreData(false);
        Alert.alert(
          t('rateLimit'),
          t('rateLimitMessage'),
          [{ text: t('ok') }]
        );
        return;
      }

      const markets = selectedFilter === 'outrights' 
        ? 'outrights' 
        : selectedFilter === 'h2h' 
          ? 'h2h'
          : selectedFilter === 'spreads'
            ? 'spreads'
            : selectedFilter === 'totals'
              ? 'totals'
              : 'h2h,spreads,totals';

      const response = await axios.get(`${API_BASE_URL}/${selectedSport}/odds`, {
        params: {
          apiKey: API_KEY,
          regions: 'us',
          markets: markets,
          oddsFormat: 'decimal',
          dateFormat: 'iso',
        }
      });

      if (!response.data || response.data.length === 0) {
        setHasMoreData(false);
        setAllGames([]);
        setGames([]);
        return;
      }

      const transformedGames = transformOddsData(response.data, selectedFilter);
      
      if (transformedGames.length === 0) {
        setHasMoreData(false);
        setAllGames([]);
        setGames([]);
        return;
      }

      await saveToCache(cacheKey, transformedGames);

      // Always set allGames when we have new data
      setAllGames(transformedGames);
      setTotalItems(transformedGames.length);

      const startIndex = (page - 1) * GAMES_PER_PAGE;
      const endIndex = startIndex + GAMES_PER_PAGE;
      const paginatedData = transformedGames.slice(startIndex, endIndex);

      if (paginatedData.length === 0) {
        setHasMoreData(false);
      } else {
        setGames(prev => page === 1 ? paginatedData : [...prev, ...paginatedData]);
        setPage(prev => prev + 1);
      }

      if (!isInitialLoadDone) setIsInitialLoadDone(true);

    } catch (error) {
      console.error('Error loading games:', error);
      setHasMoreData(false);
      setAllGames([]);
      setGames([]);
      Alert.alert(
        t('error'),
        t('errorLoadingGames'),
        [{ text: t('ok') }]
      );
    } finally {
      setLoading(false);
    }
  }, [loading, selectedSport, selectedFilter, page, refreshing, isInitialLoadDone, t]);

  useEffect(() => {
    const loadInitialData = async () => {
      // Reset states
      setGames([]);
      setAllGames([]);
      setPage(1);
      setHasMoreData(true);
      setTotalItems(0);
      setLoadedGameIds(new Set());
      
      // Load new data
      await loadGames();
    };

    loadInitialData();
  }, [selectedSport, selectedFilter]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setGames([]);
    setAllGames([]);
    setPage(1);
    setHasMoreData(true); // Reset hasMoreData
    setTotalItems(0); // Reset total items
    setLoadedGameIds(new Set());
    await loadGames();
    setRefreshing(false);
  }, [loadGames]);

  const renderGameCard = ({ item }: { item: Game }) => {
    // For over/under markets, if odds > 1.9 it usually means "under" is favored
    const isUnderFavored = item.odds > 1.9;

    return (
      <TouchableOpacity 
        key={`game-${item.id}`}
        style={styles.gameCard}
        onPress={() => {
          setSelectedGame(item);
          setIsModalVisible(true);
        }}
      >
        <ThemedView style={styles.gameCardInner}>
          <ThemedView style={styles.mainContent}>
            <ThemedView style={styles.playerInfo}>
              <ThemedText style={styles.position}>{item.position}</ThemedText>
              <ThemedText style={styles.playerName}>{item.player}</ThemedText>
              <ThemedText style={styles.matchup}>vs {item.opponent}</ThemedText>
            </ThemedView>

            <ThemedView style={styles.predictionInfo}>
              <ThemedText style={styles.statValue}>{item.prediction}</ThemedText>
              <ThemedText style={styles.statLabel}>{item.stat}</ThemedText>
            </ThemedView>

            <ThemedView style={styles.popularityContainer}>
              <ThemedText style={styles.popularityText}>Odds: {item.odds.toFixed(2)}</ThemedText>
            </ThemedView>
          </ThemedView>
        </ThemedView>

        <ThemedView style={styles.actionButtons}>
          <ThemedView 
            style={[
              styles.actionButton,
              isUnderFavored && styles.actionButtonHighlight
            ]}
          >
            <MaterialCommunityIcons 
              name="chevron-down" 
              size={20} 
              color={isUnderFavored ? "#FFFFFF" : "#FFFFFF80"} 
            />
            <ThemedText style={[
              styles.actionButtonText,
              isUnderFavored && styles.actionButtonTextHighlight
            ]}>Under</ThemedText>
          </ThemedView>
          <ThemedView 
            style={[
              styles.actionButton,
              !isUnderFavored && styles.actionButtonHighlight
            ]}
          >
            <MaterialCommunityIcons 
              name="chevron-up" 
              size={20} 
              color={!isUnderFavored ? "#FFFFFF" : "#FFFFFF80"} 
            />
            <ThemedText style={[
              styles.actionButtonText,
              !isUnderFavored && styles.actionButtonTextHighlight
            ]}>Over</ThemedText>
          </ThemedView>
        </ThemedView>
      </TouchableOpacity>
    );
  };

  const getSportIcon = (sportKey: string | undefined): IconName => {
    if (!sportKey) return 'help-circle'; // Default icon if sport is undefined
    
    const iconMap: Record<string, IconName> = {
      'basketball': 'basketball',
      'americanfootball': 'football',
      'baseball': 'baseball-bat',
      'icehockey': 'hockey-puck',
      'soccer': 'soccer',
    };
    
    const sport = sportKey.toLowerCase().replace('_', '');
    return iconMap[sport] || 'help-circle';
  };

  const renderFooter = () => {
    if (!loading) return null;
    
    return (
      <ThemedView style={styles.loadingFooter}>
        <ActivityIndicator size="small" color="#FFFFFF" />
      </ThemedView>
    );
  };

  const ListHeader = useCallback(({ 
    selectedSport,
    setSelectedSport,
    selectedFilter,
    setSelectedFilter,
    onSearch,
    onClearSearch
  }: {
    selectedSport: string;
    setSelectedSport: (sport: string) => void;
    selectedFilter: string;
    setSelectedFilter: (filter: string) => void;
    onSearch: (text: string) => void;
    onClearSearch: () => void;
  }) => (
    <ThemedView style={styles.topSection}>
      <SearchBar 
        onSearch={onSearch}
        onClear={onClearSearch}
      />
      <FlatList
        horizontal
        data={SPORTS}
        showsHorizontalScrollIndicator={false}
        style={styles.sportsScroll}
        renderItem={({item: sport}) => (
          <TouchableOpacity
            key={`sport-${sport.id}`}
            style={[
              styles.sportTab,
              selectedSport === sport.id && styles.sportTabSelected,
              { backgroundColor: selectedSport === sport.id ? sport.color : '#000010' }
            ]}
            onPress={() => handleSportChange(sport.id)}
          >
            <MaterialCommunityIcons name={sport.icon} size={24} color="white" />
            <ThemedText style={styles.sportText}>{sport.name}</ThemedText>
          </TouchableOpacity>
        )}
        keyExtractor={item => `sport-${item.id}`}
      />
      <FlatList
        horizontal
        data={FILTERS}
        showsHorizontalScrollIndicator={false}
        style={styles.filtersScroll}
        renderItem={({item: filter}) => (
          <TouchableOpacity
            key={`filter-${filter.id}`}
            style={[
              styles.filterTab,
              selectedFilter === filter.id && styles.filterTabSelected,
            ]}
            onPress={() => handleFilterChange(filter.id)}
          >
            <ThemedText style={[
              styles.filterText,
              selectedFilter === filter.id && styles.filterTextSelected,
            ]}>
              {filter.label}
            </ThemedText>
          </TouchableOpacity>
        )}
        keyExtractor={item => `filter-${item.id}`}
      />
    </ThemedView>
  ), [selectedSport, selectedFilter, FILTERS]);

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setSelectedGame(null);
  };

  const getRelevantFilters = useCallback(() => {
    return FILTERS.filter(filter => 
      !filter.sports || // Show filters that don't have sport restrictions
      filter.sports.includes(selectedSport) // Show filters specific to the selected sport
    );
  }, [selectedSport]);

  useEffect(() => {
    cleanupOldCache();
  }, []);

  const handleFilterChange = useCallback((newFilter: string) => {
    setSelectedFilter(newFilter);
  }, []);

  const handleSportChange = useCallback((newSport: string) => {
    setSelectedSport(newSport);
  }, []);

  return (
    <ThemedView style={styles.container}>
      <ListHeader
        selectedSport={selectedSport}
        setSelectedSport={setSelectedSport}
        selectedFilter={selectedFilter}
        setSelectedFilter={setSelectedFilter}
        onSearch={handleSearch}
        onClearSearch={handleClearSearch}
      />

      <FlatList
        key={`${selectedSport}-${selectedFilter}`}
        data={filteredGames}
        renderItem={renderGameCard}
        keyExtractor={item => item.id}
        onEndReached={() => {
          if (!loading && !refreshing && !searchText && hasMoreData && games.length > 0) {
            const currentlyLoadedItems = games.length;
            if (currentlyLoadedItems < totalItems) {
              loadGames();
            }
          }
        }}
        onEndReachedThreshold={0.2}
        ListFooterComponent={() => 
          loading ? (
            <ThemedView style={styles.loadingFooter}>
              <ActivityIndicator size="small" color="#FFFFFF" />
            </ThemedView>
          ) : null
        }
        contentContainerStyle={styles.gamesList}
        numColumns={2}
        columnWrapperStyle={styles.row}
        ListEmptyComponent={() => (
          <ThemedView style={styles.emptyState}>
            <ThemedText style={styles.emptyStateText}>
              {searchText 
                ? t('noResults')
                : loading 
                  ? t('loading') 
                  : !hasMoreData && games.length === 0
                    ? t('noGamesAvailable')
                    : t('noGames')}
            </ThemedText>
          </ThemedView>
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#FFFFFF"
            titleColor="#FFFFFF"
            colors={["#FFFFFF"]}
            progressBackgroundColor="#000010"
          />
        }
        bounces={true}
        showsVerticalScrollIndicator={true}
      />
      <GameDetailsModal
        game={selectedGame}
        visible={isModalVisible}
        onClose={handleCloseModal}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000010',
  },
  fixedHeader: {
    backgroundColor: '#000010',
    borderBottomWidth: 1,
    borderBottomColor: '#FFFFFF10',
    paddingTop: Platform.OS === 'ios' ? 60 : (StatusBar.currentHeight ?? 20),
    zIndex: 1,
  },
  sportsScroll: {
    height: 48,
    paddingHorizontal: 16,
    marginTop: 12,
  },
  filtersScroll: {
    height: 52,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 4,
    marginBottom: 4,
  },
  gamesList: {
    paddingTop: 8,
    paddingBottom: 20,
  },
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  gameCard: {
    marginBottom: 8,
    backgroundColor: '#000010',
    borderRadius: 12,
    overflow: 'hidden',
    width: '48.5%',
    borderWidth: 1,
    borderColor: '#FFFFFF20',
  },
  gameCardInner: {
    padding: 8,
  },
  jerseyContainer: {
    marginBottom: 8,
  },
  jersey: {
    width: 32,
    height: 32,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  jerseyNumber: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  mainContent: {
    flex: 1,
  },
  playerInfo: {
    gap: 1,
  },
  position: {
    color: '#FFFFFF80',
    fontSize: 11,
  },
  playerName: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  matchup: {
    color: '#FFFFFF80',
    fontSize: 11,
  },
  predictionInfo: {
    marginTop: 4,
  },
  statValue: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  statLabel: {
    color: '#FFFFFF80',
    fontSize: 11,
  },
  popularityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 4,
  },
  popularityText: {
    color: '#FFFFFF80',
    fontSize: 11,
  },
  actionButtons: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#FFFFFF10',
  },
  actionButton: {
    flex: 1,
    padding: 8,
    alignItems: 'center',
    backgroundColor: '#000010',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
  },
  actionButtonHighlight: {
    backgroundColor: '#1E3A5F',
  },
  actionButtonText: {
    color: '#FFFFFF80',
    fontSize: 12,
    fontWeight: '600',
  },
  sportIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#000010',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingFooter: {
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBarWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000010',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFFFFF20',
    paddingHorizontal: 12,
    height: 44,
  },
  searchBarWrapperFocused: {
    borderColor: '#FFFFFF40',
    backgroundColor: '#000010',
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  cancelText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    height: '100%',
    padding: 0,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'normal',
    paddingVertical: 8,
  },
  clearButton: {
    padding: 4,
  },
  sportTab: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginRight: 8,
    borderRadius: 12,
    minWidth: 90,
  },
  sportTabSelected: {
    borderWidth: 1,
    borderColor: '#FFFFFF30',
  },
  sportText: {
    color: 'white',
    marginLeft: 8,
    fontSize: 13,
    fontWeight: '600',
  },
  filterTab: {
    padding: 8,
    paddingHorizontal: 16,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#000010',
    borderWidth: 1,
    borderColor: '#FFFFFF10',
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterTabSelected: {
    backgroundColor: '#FFFFFF15',
    borderColor: '#FFFFFF20',
  },
  filterText: {
    color: '#FFFFFF80',
    fontSize: 14,
    lineHeight: 18,
  },
  filterTextSelected: {
    color: 'white',
    fontWeight: '500',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    backgroundColor: '#000010',
  },
  emptyStateText: {
    color: '#FFFFFF80',
    fontSize: 16,
  },
  actionButtonTextHighlight: {
    color: '#FFFFFF',
  },
  topSection: {
    backgroundColor: '#000010',
    borderBottomWidth: 1,
    borderBottomColor: '#FFFFFF10',
    paddingTop: Platform.OS === 'ios' ? 60 : (StatusBar.currentHeight ?? 20),
    zIndex: 1,
  },
});
