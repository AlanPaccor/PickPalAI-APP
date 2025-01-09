import { StyleSheet, Platform, TouchableOpacity, ScrollView, StatusBar, View, LayoutChangeEvent, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useColorScheme } from 'react-native';
import Colors from '@/constants/Colors';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAuth } from '../context/AuthContext';
import { router } from 'expo-router';
import { useState, useRef, useEffect } from 'react';
import Animated, { 
  useSharedValue,
  withRepeat,
  withTiming,
  cancelAnimation,
  useAnimatedStyle,
  Easing,
} from 'react-native-reanimated';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useBetCount } from '../hooks/useBetCount';
import { useTranslation } from 'react-i18next';

// Mock data
const recentWinners = [
  { team: 'Celtics', score: '112-98', opponent: 'Lakers', league: 'NBA' },
  { team: 'Barcelona', score: '3-1', opponent: 'Real Madrid', league: 'La Liga' },
  { team: 'Chiefs', score: '31-17', opponent: 'Raiders', league: 'NFL' },
  { team: 'Man City', score: '2-0', opponent: 'Arsenal', league: 'EPL' },
  { team: 'Rangers', score: '4-2', opponent: 'Bruins', league: 'NHL' },
  { team: 'Yankees', score: '8-3', opponent: 'Red Sox', league: 'MLB' },
];

const hotPicks = [
  { player: 'LeBron James', stat: 'Points > 25.5', confidence: 78 },
  { player: 'Nikola Jokic', stat: 'Assists > 8.5', confidence: 82 },
  { player: 'Luka Doncic', stat: 'Rebounds > 9.5', confidence: 75 },
];

const RecentWinners = () => {
  const scrollViewRef = useRef<ScrollView>(null);
  const [contentWidth, setContentWidth] = useState(0);
  const translateX = useSharedValue(0);

  const startScrolling = () => {
    translateX.value = 0;
    translateX.value = withRepeat(
      withTiming(-contentWidth/2, {
        duration: 15000,
        easing: Easing.linear
      }),
      -1,
      false
    );
  };

  const onContentLayout = (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    setContentWidth(width);
  };

  useEffect(() => {
    if (contentWidth > 0) {
      startScrolling();
    }
  }, [contentWidth]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const repeatedWinners = [...recentWinners, ...recentWinners, ...recentWinners];

  return (
    <ThemedView style={styles.section}>
      <ThemedText style={styles.sectionTitle}>Recent Winners 🏆</ThemedText>
      <ThemedView style={styles.marqueeContainer}>
        <Animated.View 
          style={[styles.marqueeContent, animatedStyle]}
          onLayout={onContentLayout}
        >
          {repeatedWinners.map((win, index) => (
            <ThemedView key={index} style={styles.winCard}>
              <ThemedView style={styles.leagueTag}>
                <ThemedText style={styles.leagueText}>{win.league}</ThemedText>
              </ThemedView>
              <ThemedText style={styles.teamName}>{win.team}</ThemedText>
              <ThemedText style={styles.scoreText}>{win.score}</ThemedText>
              <ThemedText style={styles.opponentText}>vs {win.opponent}</ThemedText>
            </ThemedView>
          ))}
        </Animated.View>
      </ThemedView>
    </ThemedView>
  );
};

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const { betCount } = useBetCount();
  const { t } = useTranslation();

  useEffect(() => {
    const checkSubscription = async () => {
      if (!user) return;
      
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const userData = userDoc.data();
        
        if (!userData?.subscription?.plan) {
          router.replace('/auth/subscription');
        }
      } catch (error) {
        console.error('Error checking subscription:', error);
        router.replace('/auth/subscription');
      } finally {
        setIsLoading(false);
      }
    };

    checkSubscription();
  }, [user]);

  if (isLoading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1E90FF" />
      </ThemedView>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <ThemedView style={styles.header}>
        <ThemedView style={styles.logoContainer}>
          <MaterialCommunityIcons name="trophy" size={32} color="#1E90FF" />
          <ThemedText style={styles.logoText}>SPORTSAI</ThemedText>
        </ThemedView>
      </ThemedView>

      {/* Profile Section */}
      <ThemedView style={styles.profileSection}>
        <ThemedText style={styles.profileName}>Welcome!</ThemedText>
      </ThemedView>

      {/* Quick Stats Section */}
      <ThemedView style={styles.statsContainer}>
        <ThemedView style={styles.statCard}>
          <ThemedText style={styles.statValue}>87%</ThemedText>
          <ThemedText style={styles.statLabel}>AI Accuracy</ThemedText>
        </ThemedView>
        <ThemedView style={styles.statCard}>
          <ThemedText style={styles.statValue}>{betCount}</ThemedText>
          <ThemedText style={styles.statLabel}>Bets Analyzed</ThemedText>
        </ThemedView>
      </ThemedView>

      {/* Recent Winners */}
      <RecentWinners />

      {/* Today's Hot Picks */}
      <ThemedView style={styles.section}>
        <ThemedText style={styles.sectionTitle}>🔥 Today's Hot Picks</ThemedText>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.picksScroll}>
          {hotPicks.map((pick, index) => (
            <ThemedView key={index} style={styles.pickCard}>
              <ThemedText style={styles.pickPlayer}>{pick.player}</ThemedText>
              <ThemedText style={styles.pickStat}>{pick.stat}</ThemedText>
              <ThemedView style={styles.confidenceBar}>
                <ThemedText style={styles.pickConfidence}>{pick.confidence}% Confident</ThemedText>
              </ThemedView>
            </ThemedView>
          ))}
        </ScrollView>
      </ThemedView>

      {/* AI Insights */}
      <ThemedView style={styles.insightsContainer}>
        <ThemedText style={styles.insightTitle}>🤖 AI Daily Report</ThemedText>
        <ThemedText style={styles.insightText}>
          Today's games favor over bets in NBA points (67% confidence) and NHL assists (72% confidence).
          Market inefficiencies detected in MLB strikeout props.
        </ThemedText>
      </ThemedView>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000010',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 100 : StatusBar.currentHeight || 0,
    paddingBottom: 16,
    backgroundColor: '#000010',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#000010',
  },
  logoText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  profileSection: {
    padding: 16,
    backgroundColor: '#000010',
  },
  profileName: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 16,
    backgroundColor: '#000010',
  },
  statCard: {
    flex: 1,
    backgroundColor: '#000010',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFFFFF20',
  },
  statValue: {
    color: '#1E90FF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    color: '#666',
    fontSize: 12,
    marginTop: 4,
  },
  section: {
    padding: 16,
    backgroundColor: '#000010',
    marginTop: 8,
  },
  sectionTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  winnersScroll: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  winCard: {
    backgroundColor: '#000010',
    padding: 16,
    borderRadius: 12,
    width: 144,
    borderWidth: 1,
    borderColor: '#FFFFFF20',
    marginRight: 12,
  },
  leagueTag: {
    backgroundColor: '#000010',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  leagueText: {
    color: '#1E90FF',
    fontSize: 12,
    fontWeight: '600',
  },
  teamName: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  scoreText: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  opponentText: {
    color: '#666',
    fontSize: 14,
  },
  winAmount: {
    color: '#4CAF50',
    fontSize: 20,
    fontWeight: 'bold',
  },
  winType: {
    color: '#FFFFFF',
    fontSize: 14,
    marginTop: 4,
  },
  winDate: {
    color: '#666',
    fontSize: 12,
    marginTop: 4,
  },
  picksScroll: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  pickCard: {
    backgroundColor: '#000010',
    padding: 16,
    borderRadius: 12,
    marginRight: 12,
    width: 200,
    borderWidth: 1,
    borderColor: '#FFFFFF20',
  },
  pickPlayer: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  pickStat: {
    color: '#1E90FF',
    fontSize: 14,
    marginTop: 4,
  },
  confidenceBar: {
    marginTop: 8,
    backgroundColor: '#1E90FF20',
    padding: 8,
    borderRadius: 6,
  },
  pickConfidence: {
    color: '#1E90FF',
    fontSize: 12,
    fontWeight: '600',
  },
  insightsContainer: {
    margin: 16,
    padding: 16,
    backgroundColor: '#000010',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFFFFF20',
  },
  insightTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  insightText: {
    color: '#666',
    fontSize: 14,
    lineHeight: 20,
  },
  startButton: {
    backgroundColor: '#1E90FF',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 24,
    marginTop: 24,
    width: '100%',
  },
  startButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  marqueeContainer: {
    height: 160,
    overflow: 'hidden',
    backgroundColor: '#000010',
    borderRadius: 12,
  },
  marqueeContent: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  winnerRow: {
    flexDirection: 'row',
    gap: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000010',
  },
});
