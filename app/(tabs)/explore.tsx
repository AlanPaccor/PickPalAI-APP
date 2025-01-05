import { StyleSheet, Platform, TouchableOpacity, ScrollView, FlatList, StatusBar, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState, useCallback } from 'react';
import { Game } from '@/types/sports';
import Colors from '@/constants/Colors';
import { useColorScheme } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

const SPORTS = [
  { id: 'nfl', name: 'NFL', icon: 'football', color: '#6B3FA0' },
  { id: 'nba', name: 'NBA', icon: 'basketball', color: '#C9082A' },
  { id: 'nhl', name: 'NHL', icon: 'hockey-puck', color: '#004687' },
  { id: 'nfl4q', name: 'NFL4Q', icon: 'football-helmet', color: '#17B169' },
  { id: 'cfb', name: 'CFB', icon: 'football-helmet', color: '#FF6B00' },
  { id: 'nba4q', name: 'NBA4Q', icon: 'basketball-hoop', color: '#1E90FF' },
];

const FILTERS = [
  { id: 'popular', label: 'Popular 🔥' },
  { id: 'passing', label: 'Passing Yards' },
  { id: 'receiving', label: 'Receiving Yards' },
  { id: 'rushing', label: 'Rushing Yards' },
];

export default function ExploreScreen() {
  const [selectedSport, setSelectedSport] = useState('nfl');
  const [selectedFilter, setSelectedFilter] = useState('popular');
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  const loadGames = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    try {
      // Simulated data - replace with your API
      const newGames = [
        {
          id: `${page}-1`,
          player: 'Baker Mayfield',
          position: 'TB - QB',
          team: 'TB',
          opponent: 'NO',
          prediction: '255.5',
          stat: 'Pass Yards',
          popularity: '248.1K',
          time: '1:00pm',
          jersey: '#6',
          jerseyColor: '#FF0000',
        },
        {
          id: `${page}-2`,
          player: 'Courtland Sutton',
          position: 'DEN - WR',
          team: 'DEN',
          opponent: 'KC',
          prediction: '80.5',
          stat: 'Receiving Yards',
          popularity: '141.5K',
          time: '4:25pm',
          jersey: '#14',
          jerseyColor: '#002244',
        },
        // Add more games as needed
      ];
      setGames(prev => [...prev, ...newGames]);
      setPage(prev => prev + 1);
    } catch (error) {
      console.error('Error loading games:', error);
    } finally {
      setLoading(false);
    }
  }, [page, loading]);

  const renderGameCard = ({ item }: any) => (
    <TouchableOpacity style={styles.gameCard}>
      <ThemedView style={styles.gameCardInner}>
        <ThemedView style={styles.statsColumn}>
          <MaterialCommunityIcons name="chart-line-variant" size={16} color={theme.tint} />
        </ThemedView>
        
        <ThemedView style={styles.jerseyContainer}>
          <ThemedView style={[styles.jersey, { backgroundColor: item.jerseyColor }]}>
            <ThemedText style={styles.jerseyNumber}>{item.jersey}</ThemedText>
          </ThemedView>
        </ThemedView>

        <ThemedView style={styles.mainContent}>
          <ThemedView style={styles.playerInfo}>
            <ThemedText style={styles.position}>{item.position}</ThemedText>
            <ThemedText style={styles.playerName}>{item.player}</ThemedText>
            <ThemedText style={styles.matchup}>vs {item.opponent} {item.time}</ThemedText>
          </ThemedView>

          <ThemedView style={styles.predictionInfo}>
            <ThemedText style={styles.statValue}>{item.prediction}</ThemedText>
            <ThemedText style={styles.statLabel}>{item.stat}</ThemedText>
          </ThemedView>
        </ThemedView>

        <ThemedView style={styles.popularityContainer}>
          <MaterialCommunityIcons name="fire" size={16} color="#FF9800" />
          <ThemedText style={styles.popularityText}>{item.popularity}</ThemedText>
        </ThemedView>
      </ThemedView>

      <ThemedView style={styles.actionButtons}>
        <TouchableOpacity style={styles.actionButton}>
          <ThemedText style={styles.actionButtonText}>Less</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.actionButtonHighlight]}>
          <ThemedText style={styles.actionButtonText}>More</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </TouchableOpacity>
  );

  return (
    <ThemedView style={styles.container}>
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

      <FlatList
        data={games}
        renderItem={renderGameCard}
        keyExtractor={item => item.id}
        onEndReached={loadGames}
        onEndReachedThreshold={0.5}
        contentContainerStyle={styles.gamesList}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  sportsScroll: {
    paddingHorizontal: 12,
    marginTop: Platform.OS === 'ios' ? 47 : StatusBar.currentHeight || 0,
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
  filtersScroll: {
    paddingHorizontal: 12,
    marginVertical: 12,
  },
  filterTab: {
    padding: 8,
    paddingHorizontal: 16,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderColor: '#FFFFFF10',
  },
  filterTabSelected: {
    backgroundColor: '#FFFFFF15',
    borderColor: '#FFFFFF30',
  },
  filterText: {
    color: '#FFFFFF80',
    fontSize: 14,
  },
  filterTextSelected: {
    color: 'white',
  },
  gamesList: {
    padding: 12,
  },
  gameCard: {
    marginBottom: 16,
    backgroundColor: '#151515',
    borderRadius: 12,
    overflow: 'hidden',
  },
  gameCardInner: {
    flexDirection: 'row',
    padding: 12,
    alignItems: 'center',
  },
  statsColumn: {
    marginRight: 12,
  },
  jerseyContainer: {
    marginRight: 12,
  },
  jersey: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  jerseyNumber: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  mainContent: {
    flex: 1,
  },
  playerInfo: {
    gap: 2,
  },
  position: {
    color: '#FFFFFF80',
    fontSize: 12,
  },
  playerName: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  matchup: {
    color: '#FFFFFF80',
    fontSize: 12,
  },
  predictionInfo: {
    marginTop: 4,
  },
  statValue: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  statLabel: {
    color: '#FFFFFF80',
    fontSize: 12,
  },
  popularityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  popularityText: {
    color: '#FFFFFF80',
    fontSize: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#FFFFFF10',
  },
  actionButton: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
  },
  actionButtonHighlight: {
    backgroundColor: '#252525',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});
