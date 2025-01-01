import { Image, StyleSheet, Platform } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import ParallaxScrollView from '@/components/ParallaxScrollView';

export default function HomeScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#1A5F7A', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={{ 
            uri: 'https://images.unsplash.com/photo-1518133910546-b6c2fb7d79e3?q=80&w=2675&auto=format&fit=crop'
          }}
          style={styles.headerImage}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">BetSmart AI</ThemedText>
        <FontAwesome name="line-chart" size={24} color="#4CAF50" />
      </ThemedView>

      <ThemedView style={styles.highlightContainer}>
        <ThemedText type="subtitle">Today's Top Picks</ThemedText>
        <ThemedView style={styles.card}>
          <ThemedText type="defaultSemiBold">NBA: Lakers vs Warriors</ThemedText>
          <ThemedText>Win Probability: 68%</ThemedText>
          <ThemedText>Confidence Score: High</ThemedText>
        </ThemedView>
      </ThemedView>

      <ThemedView style={styles.featuresContainer}>
        <ThemedText type="subtitle">Smart Features</ThemedText>
        
        <ThemedView style={styles.featureItem}>
          <FontAwesome name="brain" size={20} color="#2196F3" />
          <ThemedView style={styles.featureText}>
            <ThemedText type="defaultSemiBold">AI Analysis</ThemedText>
            <ThemedText>Advanced algorithms analyze historical data and real-time stats</ThemedText>
          </ThemedView>
        </ThemedView>

        <ThemedView style={styles.featureItem}>
          <FontAwesome name="chart-pie" size={20} color="#FF9800" />
          <ThemedView style={styles.featureText}>
            <ThemedText type="defaultSemiBold">Personalized Insights</ThemedText>
            <ThemedText>Custom recommendations based on your betting history</ThemedText>
          </ThemedView>
        </ThemedView>

        <ThemedView style={styles.featureItem}>
          <FontAwesome name="percentage" size={20} color="#4CAF50" />
          <ThemedView style={styles.featureText}>
            <ThemedText type="defaultSemiBold">Win Probabilities</ThemedText>
            <ThemedText>Data-driven predictions for smarter betting decisions</ThemedText>
          </ThemedView>
        </ThemedView>
      </ThemedView>

      <ThemedView style={styles.ctaContainer}>
        <ThemedText type="subtitle">Ready to Start?</ThemedText>
        <ThemedText>
          Tap the Explore tab to discover more features and start making smarter bets today.
        </ThemedText>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    height: 250,
    width: '100%',
    top: 0,
    position: 'absolute',
    resizeMode: 'cover',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  highlightContainer: {
    gap: 12,
    marginBottom: 24,
  },
  card: {
    backgroundColor: Platform.select({ ios: '#00000010', android: '#00000010', web: '#00000010' }),
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  featuresContainer: {
    gap: 16,
    marginBottom: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 8,
  },
  featureText: {
    flex: 1,
    gap: 4,
  },
  ctaContainer: {
    gap: 8,
    marginBottom: 24,
    alignItems: 'center',
    padding: 16,
    backgroundColor: Platform.select({ ios: '#00000008', android: '#00000008', web: '#00000008' }),
    borderRadius: 12,
  },
});
