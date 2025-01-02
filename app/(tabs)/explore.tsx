import { StyleSheet, Platform, TouchableOpacity, ScrollView, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Game } from '@/types/sports';
import { Category } from '@/types/categories';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import ParallaxScrollView from '@/components/ParallaxScrollView';

export default function ExploreScreen() {
  const [liveGames, setLiveGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const API_KEY = '34023186e3b9a7b42f66c91853d0d297';

  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    try {
      setIsLoading(true);
      // Get all in-play games
      const response = await fetch(
        `https://api.the-odds-api.com/v4/sports/upcoming/odds/?apiKey=${API_KEY}&regions=us&markets=h2h&oddsFormat=decimal&dateFormat=iso`
      );
      const data = await response.json();
      
      // Transform the data to match our Game interface
      const transformedGames: Game[] = data.map((game: any) => ({
        id: game.id,
        sport_key: game.sport_key,
        sport_title: game.sport_title,
        commence_time: game.commence_time,
        home_team: game.home_team,
        away_team: game.away_team,
        status: {
          long: new Date(game.commence_time) > new Date() ? 'Upcoming' : 'In Progress',
          short: new Date(game.commence_time) > new Date() ? 'UP' : 'LIVE'
        }
      }));

      setLiveGames(transformedGames);
    } catch (error) {
      console.error('Error fetching games:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const categories: Category[] = [
    {
      title: 'Popular Sports',
      items: ['NBA', 'NFL', 'MLB', 'Soccer'],
      icon: 'basketball',
      color: '#2196F3'
    },
    {
      title: 'Trending Bets',
      items: ['Player Props', 'Over/Under', 'Moneyline'],
      icon: 'trending-up',
      color: '#FF9800'
    },
    {
      title: 'AI Insights',
      items: ['Match Analysis', 'Player Stats', 'Historical Data'],
      icon: 'robot',
      color: '#4CAF50'
    }
  ];

  const renderLiveGames = () => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.liveGamesScroll}>
      {liveGames.map((game) => (
        <TouchableOpacity key={game.id} style={styles.liveGameCard}>
          <ThemedView style={styles.liveGameContent}>
            <ThemedText type="defaultSemiBold">{game.sport_title}</ThemedText>
            <ThemedView style={styles.teamsContainer}>
              <ThemedView style={styles.teamInfo}>
                <ThemedText>{game.home_team}</ThemedText>
                {game.scores && (
                  <ThemedText type="defaultSemiBold">{game.scores.home}</ThemedText>
                )}
              </ThemedView>
              <ThemedText>vs</ThemedText>
              <ThemedView style={styles.teamInfo}>
                <ThemedText>{game.away_team}</ThemedText>
                {game.scores && (
                  <ThemedText type="defaultSemiBold">{game.scores.away}</ThemedText>
                )}
              </ThemedView>
            </ThemedView>
            <ThemedText style={[
              styles.gameStatus,
              { color: game.status?.short === 'LIVE' ? '#E53935' : '#4CAF50' }
            ]}>
              {game.status?.long}
            </ThemedText>
            <ThemedText style={styles.gameTime}>
              {new Date(game.commence_time).toLocaleTimeString()}
            </ThemedText>
          </ThemedView>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#1A5F7A', dark: '#1D3D47' }}
      headerImage={
        <MaterialCommunityIcons 
          name="compass" 
          size={120} 
          color="#ffffff50" 
          style={styles.headerIcon} 
        />
      }>
      <ThemedView style={styles.container}>
        <ThemedView style={styles.liveGamesSection}>
          <ThemedView style={styles.categoryHeader}>
            <MaterialCommunityIcons name="clock-outline" size={24} color="#E53935" />
            <ThemedText type="subtitle">Live & Upcoming Games</ThemedText>
          </ThemedView>
          
          {isLoading ? (
            <ThemedText>Loading games...</ThemedText>
          ) : (
            renderLiveGames()
          )}
        </ThemedView>

        {categories.map((category, index) => (
          <ThemedView key={index} style={styles.categoryContainer}>
            <ThemedView style={styles.categoryHeader}>
              <MaterialCommunityIcons name={category.icon} size={24} color={category.color} />
              <ThemedText type="subtitle">{category.title}</ThemedText>
            </ThemedView>
            
            <ThemedView style={styles.itemsGrid}>
              {category.items.map((item, itemIndex) => (
                <TouchableOpacity key={itemIndex} style={styles.gridItem}>
                  <ThemedView style={styles.gridItemContent}>
                    <ThemedText type="defaultSemiBold">{item}</ThemedText>
                  </ThemedView>
                </TouchableOpacity>
              ))}
            </ThemedView>
          </ThemedView>
        ))}
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 24,
  },
  headerIcon: {
    position: 'absolute',
    right: -20,
    bottom: -20,
  },
  categoryContainer: {
    gap: 16,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  itemsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  gridItem: {
    width: '47%',
  },
  gridItemContent: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: Platform.select({ 
      ios: '#00000010', 
      android: '#00000010', 
      web: '#00000010' 
    }),
    alignItems: 'center',
  },
  liveGamesSection: {
    marginBottom: 24,
  },
  liveGamesScroll: {
    marginTop: 16,
  },
  liveGameCard: {
    width: 300,
    marginRight: 16,
  },
  liveGameContent: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: Platform.select({ 
      ios: '#00000010', 
      android: '#00000010', 
      web: '#00000010' 
    }),
  },
  teamsContainer: {
    marginVertical: 12,
    alignItems: 'center',
    gap: 8,
  },
  teamInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  teamLogo: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  gameStatus: {
    color: '#E53935',
    fontSize: 12,
  },
  gameTime: {
    fontSize: 12,
    marginTop: 4,
    opacity: 0.7
  },
});
