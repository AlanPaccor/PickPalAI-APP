import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { StyleSheet, Platform, TouchableOpacity, ScrollView, FlatList, StatusBar, Image, ActivityIndicator, TextInput, View, RefreshControl } from 'react-native';
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

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

const SPORTS: Array<{
  id: string;
  name: string;
  icon: IconName;
  color: string;
}> = [
  { id: 'nfl', name: 'NFL', icon: 'football', color: '#6B3FA0' },
  { id: 'nba', name: 'NBA', icon: 'basketball', color: '#C9082A' },
  { id: 'nhl', name: 'NHL', icon: 'hockey-puck', color: '#004687' },
  { id: 'mlb', name: 'MLB', icon: 'baseball-bat', color: '#041E42' },
  { id: 'nfl4q', name: 'NFL4Q', icon: 'football', color: '#17B169' },
  { id: 'cfb', name: 'CFB', icon: 'football', color: '#FF6B00' },
  { id: 'nba4q', name: 'NBA4Q', icon: 'basketball', color: '#1E90FF' },
  { id: 'soccer', name: 'Soccer', icon: 'soccer', color: '#2E8B57' },
  { id: 'tennis', name: 'Tennis', icon: 'tennis', color: '#FFD700' },
  { id: 'mma', name: 'MMA', icon: 'boxing-glove', color: '#DC143C' },
];

const FILTERS = [
  { id: 'popular', label: 'Popular 🔥', type: 'popularity' },
  { id: 'trending', label: 'Trending 📈', type: 'trending' },
  { id: 'value', label: 'Best Value 💎', type: 'value' },
  // Sport-specific filters
  { id: 'passing', label: 'Passing Yards 🏈', type: 'stat', sports: ['nfl', 'nfl4q', 'cfb'] },
  { id: 'receiving', label: 'Receiving Yards 🏃', type: 'stat', sports: ['nfl', 'nfl4q', 'cfb'] },
  { id: 'rushing', label: 'Rushing Yards 🏃', type: 'stat', sports: ['nfl', 'nfl4q', 'cfb'] },
  { id: 'points', label: 'Points 🏀', type: 'stat', sports: ['nba', 'nba4q'] },
  { id: 'rebounds', label: 'Rebounds 🏀', type: 'stat', sports: ['nba', 'nba4q'] },
  { id: 'assists', label: 'Assists 🏀', type: 'stat', sports: ['nba', 'nba4q'] },
  { id: 'goals', label: 'Goals ⚽', type: 'stat', sports: ['soccer'] },
  { id: 'shots', label: 'Shots on Goal 🥅', type: 'stat', sports: ['nhl', 'soccer'] },
  { id: 'hits', label: 'Hits ⚾', type: 'stat', sports: ['mlb'] },
  { id: 'strikeouts', label: 'Strikeouts ⚾', type: 'stat', sports: ['mlb'] },
];

type OddsGame = {
  id: string;
  sport_key: string;
  sport_title: string;
  commence_time: string;
  home_team: string;
  away_team: string;
  bookmakers?: Array<{
    markets: Array<{
      outcomes: Array<{
        name: string;
        price: number;
      }>;
    }>;
  }>;
};

const MOCK_PLAYERS = [
  { name: 'Patrick Mahomes', team: 'Chiefs', position: 'NFL', sport: 'americanfootball', stat: 'Pass Yards' },
  { name: 'LeBron James', team: 'Lakers', position: 'NBA', sport: 'basketball', stat: 'Points' },
  { name: 'Connor McDavid', team: 'Oilers', position: 'NHL', sport: 'icehockey', stat: 'Points' },
  { name: 'Shohei Ohtani', team: 'Dodgers', position: 'MLB', sport: 'baseball', stat: 'Home Runs' },
  { name: 'Travis Kelce', team: 'Chiefs', position: 'NFL', sport: 'americanfootball', stat: 'Rec Yards' },
  { name: 'Nikola Jokic', team: 'Nuggets', position: 'NBA', sport: 'basketball', stat: 'Rebounds' },
  { name: 'Erling Haaland', team: 'Man City', position: 'EPL', sport: 'soccer', stat: 'Goals' },
  { name: 'Auston Matthews', team: 'Leafs', position: 'NHL', sport: 'icehockey', stat: 'Goals' },
];

const MOCK_OPPONENTS = [
  'Raiders', 'Warriors', 'Flames', 'Yankees', 
  'Broncos', 'Celtics', 'Arsenal', 'Canadiens',
  'Bills', 'Heat', 'Rangers', 'Astros'
];

// Create a memoized header component
const ListHeader = React.memo(({ 
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
          key={sport.id}
          style={[
            styles.sportTab,
            selectedSport === sport.id && styles.sportTabSelected,
            { backgroundColor: selectedSport === sport.id ? sport.color : '#1E1E1E' }
          ]}
          onPress={() => setSelectedSport(sport.id)}
        >
          <MaterialCommunityIcons name={sport.icon} size={24} color="white" />
          <ThemedText style={styles.sportText}>{sport.name}</ThemedText>
        </TouchableOpacity>
      )}
      keyExtractor={item => item.id}
    />
    <FlatList
      horizontal
      data={FILTERS}
      showsHorizontalScrollIndicator={false}
      style={styles.filtersScroll}
      renderItem={({item: filter}) => (
        <TouchableOpacity
          key={filter.id}
          style={[
            styles.filterTab,
            selectedFilter === filter.id && styles.filterTabSelected,
          ]}
          onPress={() => setSelectedFilter(filter.id)}
        >
          <ThemedText style={[
            styles.filterText,
            selectedFilter === filter.id && styles.filterTextSelected,
          ]}>
            {filter.label}
          </ThemedText>
        </TouchableOpacity>
      )}
      keyExtractor={item => item.id}
    />
  </ThemedView>
));

export default function ExploreScreen() {
  const [selectedSport, setSelectedSport] = useState('nfl');
  const [selectedFilter, setSelectedFilter] = useState('popular');
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
    console.log('loadGames called, loading:', loading, 'page:', page);
    if (loading || refreshing) return;
    setLoading(true);
    
    try {
      console.log('generating games for sport:', selectedSport);
      const mockGames: Game[] = Array.from({ length: 6 }, (_, index) => {
        const eligiblePlayers = selectedSport === 'all' 
          ? MOCK_PLAYERS 
          : MOCK_PLAYERS.filter(p => p.position.toLowerCase() === selectedSport);
        
        const playerInfo = eligiblePlayers.length > 0 
          ? eligiblePlayers[Math.floor(Math.random() * eligiblePlayers.length)]
          : MOCK_PLAYERS[Math.floor(Math.random() * MOCK_PLAYERS.length)];

        const opponent = MOCK_OPPONENTS[Math.floor(Math.random() * MOCK_OPPONENTS.length)];
        const prediction = (Math.random() * 30 + 10).toFixed(1);
        const popularity = Math.floor(Math.random() * 200) + 'K';
        const hour = Math.floor(Math.random() * 12) + 1;
        const minute = Math.floor(Math.random() * 60);
        const ampm = Math.random() > 0.5 ? 'AM' : 'PM';
        
        // Generate a truly unique ID using timestamp and random number
        const uniqueId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${page}-${index}`;
        
        // Generate random metrics for filtering
        const odds = Math.random() * 2 + 0.5; // odds between 0.5 and 2.5
        const trend = Math.random() * 100; // trending score 0-100
        const value = Math.random() * 100; // value score 0-100
        
        return {
          id: uniqueId,
          player: playerInfo.name,
          position: playerInfo.position,
          team: playerInfo.team,
          opponent: opponent,
          prediction: prediction,
          stat: playerInfo.stat,
          popularity: popularity,
          time: `${hour}:${minute.toString().padStart(2, '0')} ${ampm}`,
          sport: playerInfo.sport,
          jersey: Math.floor(Math.random() * 99).toString(),
          jerseyColor: '#' + Math.floor(Math.random()*16777215).toString(16),
          odds,
          trend,
          value,
          popularity,
        };
      });

      // Filter games based on selected filter
      const filteredGames = mockGames.filter(game => {
        switch (selectedFilter) {
          case 'popular':
            return game.odds && game.odds > 1.8; // Games with better odds are marked as popular
          case 'trending':
            return game.trend && game.trend > 70; // Games with high trending score
          case 'value':
            return game.value && game.value > 80; // Games with high value score
          case 'passing':
            return game.stat?.toLowerCase().includes('pass');
          case 'receiving':
            return game.stat?.toLowerCase().includes('rec');
          case 'rushing':
            return game.stat?.toLowerCase().includes('rush');
          case 'points':
            return game.stat?.toLowerCase().includes('points');
          case 'rebounds':
            return game.stat?.toLowerCase().includes('rebounds');
          case 'assists':
            return game.stat?.toLowerCase().includes('assists');
          case 'goals':
            return game.stat?.toLowerCase().includes('goals');
          case 'shots':
            return game.stat?.toLowerCase().includes('shots');
          case 'hits':
            return game.stat?.toLowerCase().includes('hits');
          case 'strikeouts':
            return game.stat?.toLowerCase().includes('strikeouts');
          default:
            return true;
        }
      });

      await new Promise(resolve => setTimeout(resolve, 1000));

      const newGameIds = new Set([...loadedGameIds, ...filteredGames.map(game => game.id)]);
      setLoadedGameIds(newGameIds);
      
      setGames(prev => {
        const newGames = [...prev, ...filteredGames];
        console.log('total games after update:', newGames.length);
        return newGames;
      });
      
      setAllGames(prev => [...prev, ...filteredGames]);
      
      setPage(prev => prev + 1);
      if (!isInitialLoadDone) setIsInitialLoadDone(true);

    } catch (error) {
      console.error('Error loading games:', error);
    } finally {
      setLoading(false);
    }
  }, [page, loading, loadedGameIds, selectedSport, selectedFilter, isInitialLoadDone, refreshing]);

  useEffect(() => {
    setGames([]);
    setAllGames([]);
    setPage(1);
    setLoadedGameIds(new Set());
  }, [selectedSport]);

  // Load initial games when component mounts
  useEffect(() => {
    loadGames();
  }, []); // Empty dependency array for initial load only

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setGames([]); // Clear existing games
    setAllGames([]); // Clear all games
    setPage(1); // Reset page
    setLoadedGameIds(new Set()); // Clear loaded IDs
    await loadGames(); // Load new games
    setRefreshing(false);
  }, [loadGames]);

  const renderGameCard = ({ item }: { item: Game }) => {
    // Determine if prediction suggests "more" or "less"
    const isMorePredicted = Math.random() > 0.5; // Replace this with your actual logic

    return (
      <TouchableOpacity 
        style={styles.gameCard}
        onPress={() => {
          setSelectedGame(item);
          setIsModalVisible(true);
        }}
      >
        <ThemedView style={styles.gameCardInner}>
          <ThemedView style={styles.jerseyContainer}>
            <ThemedView style={styles.sportIconContainer}>
              <MaterialCommunityIcons 
                name={getSportIcon(item.sport)}
                size={24} 
                color="white"
              />
            </ThemedView>
          </ThemedView>

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
              <MaterialCommunityIcons name="fire" size={14} color="#FF9800" />
              <ThemedText style={styles.popularityText}>{item.popularity}</ThemedText>
            </ThemedView>
          </ThemedView>
        </ThemedView>

        <ThemedView style={styles.actionButtons}>
          <ThemedView 
            style={[
              styles.actionButton,
              !isMorePredicted && styles.actionButtonHighlight
            ]}
          >
            <MaterialCommunityIcons 
              name="chevron-down" 
              size={20} 
              color={!isMorePredicted ? "#FFFFFF" : "#FFFFFF80"} 
            />
            <ThemedText style={[
              styles.actionButtonText,
              !isMorePredicted && styles.actionButtonTextHighlight
            ]}>Less</ThemedText>
          </ThemedView>
          <ThemedView 
            style={[
              styles.actionButton,
              isMorePredicted && styles.actionButtonHighlight
            ]}
          >
            <MaterialCommunityIcons 
              name="chevron-up" 
              size={20} 
              color={isMorePredicted ? "#FFFFFF" : "#FFFFFF80"} 
            />
            <ThemedText style={[
              styles.actionButtonText,
              isMorePredicted && styles.actionButtonTextHighlight
            ]}>More</ThemedText>
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

  const memoizedHeader = useMemo(() => (
    <ListHeader
      selectedSport={selectedSport}
      setSelectedSport={setSelectedSport}
      selectedFilter={selectedFilter}
      setSelectedFilter={setSelectedFilter}
      onSearch={handleSearch}
      onClearSearch={handleClearSearch}
    />
  ), [selectedSport, selectedFilter, handleSearch, handleClearSearch]);

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

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.fixedHeader}>
        <SearchBar 
          onSearch={handleSearch}
          onClear={handleClearSearch}
        />
        <FlatList
          horizontal
          data={SPORTS}
          showsHorizontalScrollIndicator={false}
          style={styles.sportsScroll}
          renderItem={({item: sport}) => (
            <TouchableOpacity
              key={sport.id}
              style={[
                styles.sportTab,
                selectedSport === sport.id && styles.sportTabSelected,
                { backgroundColor: selectedSport === sport.id ? sport.color : '#1E1E1E' }
              ]}
              onPress={() => setSelectedSport(sport.id)}
            >
              <MaterialCommunityIcons name={sport.icon} size={24} color="white" />
              <ThemedText style={styles.sportText}>{sport.name}</ThemedText>
            </TouchableOpacity>
          )}
          keyExtractor={item => item.id}
        />
        <FlatList
          horizontal
          data={getRelevantFilters()}
          showsHorizontalScrollIndicator={false}
          style={styles.filtersScroll}
          renderItem={({item: filter}) => (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.filterTab,
                selectedFilter === filter.id && styles.filterTabSelected,
              ]}
              onPress={() => setSelectedFilter(filter.id)}
            >
              <ThemedText style={[
                styles.filterText,
                selectedFilter === filter.id && styles.filterTextSelected,
              ]}>
                {filter.label}
              </ThemedText>
            </TouchableOpacity>
          )}
          keyExtractor={item => item.id}
        />
      </ThemedView>

      <FlatList
        key="two-column-grid"
        data={filteredGames}
        renderItem={renderGameCard}
        keyExtractor={item => item.id}
        onEndReached={() => {
          if (!loading && !refreshing && !searchText) {
            loadGames();
          }
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        contentContainerStyle={styles.gamesList}
        numColumns={2}
        columnWrapperStyle={styles.row}
        ListEmptyComponent={() => (
          <ThemedView style={styles.emptyState}>
            <ThemedText style={styles.emptyStateText}>
              {searchText 
                ? 'No results found'
                : loading 
                  ? 'Loading...' 
                  : 'No games available'}
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
            progressBackgroundColor="#1E1E1E"
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
    backgroundColor: '#0A0A0A',
  },
  fixedHeader: {
    backgroundColor: '#0A0A0A',
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
    backgroundColor: '#151515',
    borderRadius: 12,
    overflow: 'hidden',
    width: '48.5%',
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
    backgroundColor: '#1E1E1E',
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
    backgroundColor: '#2A2A2A',
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
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFFFFF20',
    paddingHorizontal: 12,
    height: 44,
  },
  searchBarWrapperFocused: {
    borderColor: '#FFFFFF40',
    backgroundColor: '#252525',
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
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderColor: '#FFFFFF10',
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterTabSelected: {
    backgroundColor: '#FFFFFF15',
    borderColor: '#FFFFFF30',
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
  },
  emptyStateText: {
    color: '#FFFFFF80',
    fontSize: 16,
  },
  actionButtonTextHighlight: {
    color: '#FFFFFF',
  },
});
