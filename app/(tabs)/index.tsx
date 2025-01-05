import { StyleSheet, Platform, TouchableOpacity, ScrollView, StatusBar, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useColorScheme } from 'react-native';
import Colors from '@/constants/Colors';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAuth } from '../context/AuthContext';
import { router } from 'expo-router';
import { useState } from 'react';

const TABS = [
  { id: 'active', label: 'Active Analysis' },
  { id: 'history', label: 'History' },
  { id: 'insights', label: 'AI Insights' },
];

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('active');

  const handleStartAnalysis = () => {
    router.push('/explore');
  };

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <ThemedView style={styles.header}>
        <TouchableOpacity>
          <MaterialCommunityIcons name="menu" size={24} color="white" />
        </TouchableOpacity>
        <ThemedView style={styles.logoContainer}>
          <ThemedText style={styles.logoText}>SPORTS</ThemedText>
          <ThemedText style={[styles.logoText, { color: theme.tint }]}>AI</ThemedText>
        </ThemedView>
        <ThemedView style={styles.statsContainer}>
          <ThemedText style={styles.statsText}>Accuracy: 68%</ThemedText>
        </ThemedView>
      </ThemedView>

      {/* Profile Section */}
      <ThemedView style={styles.profileSection}>
        <ThemedText style={styles.profileName}>{user?.email?.split('@')[0] || 'User'}</ThemedText>
        <ThemedText style={styles.joinDate}>AI-Powered Betting Assistant</ThemedText>
      </ThemedView>

      {/* Tabs */}
      <ThemedView style={styles.tabsContainer}>
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.tab,
              activeTab === tab.id && styles.activeTab
            ]}
            onPress={() => setActiveTab(tab.id)}
          >
            <ThemedText style={[
              styles.tabText,
              activeTab === tab.id && styles.activeTabText
            ]}>
              {tab.label}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </ThemedView>

      {/* Empty State */}
      <ThemedView style={styles.emptyState}>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1518133910546-b6c2fb7d79e3?q=80&w=2675&auto=format&fit=crop' }}
          style={styles.emptyStateImage}
        />
        <ThemedText style={styles.emptyStateTitle}>Ready to Get Started?</ThemedText>
        <ThemedText style={styles.emptyStateSubtitle}>
          Use our AI-powered analysis to make{'\n'}
          smarter betting decisions.
        </ThemedText>
        
        <TouchableOpacity style={styles.startButton} onPress={handleStartAnalysis}>
          <ThemedText style={styles.startButtonText}>Start New Analysis</ThemedText>
        </TouchableOpacity>

        <ThemedView style={styles.featuresContainer}>
          <ThemedView style={styles.featureItem}>
            <MaterialCommunityIcons name="robot" size={24} color={theme.tint} />
            <ThemedText style={styles.featureText}>AI-Powered Predictions</ThemedText>
          </ThemedView>
          <ThemedView style={styles.featureItem}>
            <MaterialCommunityIcons name="chart-line" size={24} color={theme.tint} />
            <ThemedText style={styles.featureText}>Advanced Statistics</ThemedText>
          </ThemedView>
          <ThemedView style={styles.featureItem}>
            <MaterialCommunityIcons name="history" size={24} color={theme.tint} />
            <ThemedText style={styles.featureText}>Historical Analysis</ThemedText>
          </ThemedView>
        </ThemedView>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 47 : StatusBar.currentHeight || 0,
    paddingBottom: 16,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  logoText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  balanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#1E1E1E',
    padding: 8,
    borderRadius: 20,
  },
  balanceText: {
    color: 'white',
    fontWeight: '600',
  },
  profileSection: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  profileName: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  joinDate: {
    color: '#FFFFFF80',
    fontSize: 14,
    marginTop: 4,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    marginRight: 8,
    backgroundColor: '#1E1E1E',
  },
  activeTab: {
    backgroundColor: '#1E90FF20',
  },
  tabText: {
    color: '#FFFFFF80',
    fontSize: 14,
    fontWeight: '600',
  },
  activeTabText: {
    color: '#1E90FF',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyStateImage: {
    width: 120,
    height: 120,
    marginBottom: 24,
    opacity: 0.7,
    borderRadius: 16,
  },
  emptyStateTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  emptyStateSubtitle: {
    color: '#FFFFFF80',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
  },
  startButton: {
    backgroundColor: '#1E90FF',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 24,
    width: '100%',
  },
  startButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  statsContainer: {
    backgroundColor: '#1E1E1E',
    padding: 8,
    borderRadius: 20,
  },
  statsText: {
    color: '#4CAF50',
    fontWeight: '600',
    fontSize: 12,
  },
  featuresContainer: {
    width: '100%',
    marginTop: 32,
    gap: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#1E1E1E',
    padding: 16,
    borderRadius: 12,
  },
  featureText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
});
