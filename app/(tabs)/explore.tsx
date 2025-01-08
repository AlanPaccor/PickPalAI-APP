import { StyleSheet, Platform, TouchableOpacity, ScrollView, FlatList, StatusBar, Image, ActivityIndicator, TextInput, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState, useCallback, useMemo, useEffect } from 'react';
import { Game } from '@/types/sports';
import Colors from '@/constants/Colors';
import { useColorScheme } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { MaterialCommunityIconName } from '@/types/icons';
import axios from 'axios';

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
  { id: 'popular', label: 'Popular 🔥' },
  { id: 'passing', label: 'Passing Yards' },
  { id: 'receiving', label: 'Receiving Yards' },
  { id: 'rushing', label: 'Rushing Yards' },
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

export default function ExploreScreen() {
  const [selectedSport, setSelectedSport] = useState('nfl');
  const [selectedFilter, setSelectedFilter] = useState('popular');
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const [loadedGameIds, setLoadedGameIds] = useState<Set<string>>(new Set());
  const [searchText, setSearchText] = useState('');

  const filteredGames = useMemo(() => {
    if (!searchText.trim()) {
      return games;
    }
    const searchLower = searchText.toLowerCase();
    return games.filter(game => {
      return (
        game.player.toLowerCase().includes(searchLower) ||
        game.team.toLowerCase().includes(searchLower) ||
        game.opponent.toLowerCase().includes(searchLower) ||
        game.position.toLowerCase().includes(searchLower)
      );
    });
  }, [games, searchText]);

  const loadGames = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    
    try {
      const response = await axios.get('https://api.the-odds-api.com/v4/sports/upcoming/odds', {
        params: {
          apiKey: '34023186e3b9a7b42f66c91853d0d297',
          regions: 'us',
          markets: 'h2h,spreads',
          oddsFormat: 'decimal',
          page: page
        }
      });

      const newGames = response.data.filter((game: OddsGame) => !loadedGameIds.has(game.id));

      const formattedGames = newGames.map((game: OddsGame) => ({
        id: `${game.id}-${page}`,
        player: game.home_team,
        position: game.sport_key.toUpperCase(),
        team: game.home_team.split(' ')[0],
        opponent: game.away_team.split(' ')[game.away_team.split(' ').length - 1],
        prediction: game.bookmakers?.[0]?.markets[0]?.outcomes[0]?.price.toFixed(1) || 'N/A',
        stat: 'Win',
        popularity: Math.floor(Math.random() * 200) + 'K',
        time: new Date(game.commence_time).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        }),
        sport: game.sport_key || 'unknown',
      }));

      if (formattedGames.length > 0) {
        const newGameIds = new Set([...loadedGameIds, ...newGames.map((game: OddsGame) => game.id)]);
        setLoadedGameIds(newGameIds);
        
        setGames(prev => [...prev, ...formattedGames]);
        setPage(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error loading games:', error);
    } finally {
      setLoading(false);
    }
  }, [page, loading, loadedGameIds]);

  const renderGameCard = ({ item }: any) => (
    <TouchableOpacity style={styles.gameCard}>
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
        <TouchableOpacity style={styles.actionButton}>
          <MaterialCommunityIcons name="chevron-down" size={20} color="#FFFFFF80" />
          <ThemedText style={styles.actionButtonText}>Less</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.actionButtonHighlight]}>
          <MaterialCommunityIcons name="chevron-up" size={20} color="#FFFFFF80" />
          <ThemedText style={styles.actionButtonText}>More</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </TouchableOpacity>
  );

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

  return (
    <ThemedView style={styles.container}>
      <FlatList
        key="two-column-grid"
        data={filteredGames}
        renderItem={renderGameCard}
        keyExtractor={item => item.id}
        onEndReached={loadGames}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        contentContainerStyle={styles.gamesList}
        numColumns={2}
        columnWrapperStyle={styles.row}
        ListHeaderComponent={() => (
          <ThemedView style={styles.topSection}>
            <View style={styles.searchContainer}>
              <View style={styles.searchBarWrapper}>
                <MaterialCommunityIcons 
                  name="magnify" 
                  size={20} 
                  color="#FFFFFF80" 
                  style={styles.searchIcon}
                />
                <TextInput
                  value={searchText}
                  onChangeText={setSearchText}
                  placeholder="Search players, teams..."
                  placeholderTextColor="#FFFFFF60"
                  style={styles.searchInput}
                  returnKeyType="search"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                {searchText.length > 0 && (
                  <TouchableOpacity 
                    onPress={() => setSearchText('')}
                    style={styles.clearButton}
                  >
                    <MaterialCommunityIcons name="close" size={20} color="#FFFFFF80" />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.sportsScroll}
            >
              {SPORTS.map(sport => (
                <TouchableOpacity
                  key={sport.id}
                  style={[
                    styles.sportTab,
                    selectedSport === sport.id && styles.sportTabSelected,
                    { backgroundColor: selectedSport === sport.id ? sport.color : '#1E1E1E' }
                  ]}
                  onPress={() => setSelectedSport(sport.id)}
                >
                  <MaterialCommunityIcons 
                    name={sport.icon} 
                    size={24} 
                    color="white"
                  />
                  <ThemedText style={styles.sportText}>
                    {sport.name}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.filtersScroll}
            >
              {FILTERS.map(filter => (
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
              ))}
            </ScrollView>
          </ThemedView>
        )}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  topSection: {
    paddingBottom: 12,
    backgroundColor: '#0A0A0A',
    borderBottomWidth: 1,
    borderBottomColor: '#FFFFFF10',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : (StatusBar.currentHeight ?? 20) + 20,
    paddingBottom: 12,
    backgroundColor: '#0A0A0A',
  },
  sportsScroll: {
    paddingTop: 6,
    flexGrow: 0,
  },
  filtersScroll: {
    paddingHorizontal: 0,
    paddingTop: 12,
    flexGrow: 0,
  },
  gamesList: {
    paddingTop: 12,
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
    backgroundColor: '#252525',
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFFFFF20',
    paddingHorizontal: 12,
    height: 44,
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
    padding: 10,
    paddingHorizontal: 16,
    marginRight: 8,
    marginHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderColor: '#FFFFFF10',
    height: 40,
    justifyContent: 'center',
  },
  filterTabSelected: {
    backgroundColor: '#FFFFFF15',
    borderColor: '#FFFFFF30',
  },
  filterText: {
    color: '#FFFFFF80',
    fontSize: 14,
    lineHeight: 20,
  },
  filterTextSelected: {
    color: 'white',
  },
});
