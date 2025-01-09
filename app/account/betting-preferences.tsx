import { View, TouchableOpacity, StyleSheet, ScrollView, Switch } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useColorScheme } from 'react-native';
import Colors from '@/constants/Colors';
import { router } from 'expo-router';
import { useState } from 'react';

interface SportPreference {
  id: string;
  name: string;
  enabled: boolean;
}

export default function BettingPreferencesScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  const [sports, setSports] = useState<SportPreference[]>([
    { id: 'basketball', name: 'Basketball', enabled: true },
    { id: 'football', name: 'Football', enabled: true },
    { id: 'baseball', name: 'Baseball', enabled: false },
    { id: 'hockey', name: 'Hockey', enabled: false },
    { id: 'soccer', name: 'Soccer', enabled: true },
  ]);

  const [settings, setSettings] = useState({
    autoAnalyze: true,
    showProbability: true,
    expertPicks: false,
    trendAlerts: true,
  });

  const toggleSport = (id: string) => {
    setSports(sports.map(sport => 
      sport.id === id ? { ...sport, enabled: !sport.enabled } : sport
    ));
  };

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <ThemedView style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <MaterialCommunityIcons 
            name="arrow-left" 
            size={24} 
            color={theme.tint}
          />
        </TouchableOpacity>
        <ThemedText type="title">Betting Preferences</ThemedText>
      </ThemedView>

      {/* Sports Section */}
      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Sports
        </ThemedText>
        {sports.map((sport) => (
          <ThemedView key={sport.id} style={styles.settingItem}>
            <ThemedView style={styles.settingContent}>
              <ThemedText type="defaultSemiBold">{sport.name}</ThemedText>
              <ThemedText style={styles.description}>
                Show predictions for {sport.name}
              </ThemedText>
            </ThemedView>
            <Switch
              value={sport.enabled}
              onValueChange={() => toggleSport(sport.id)}
              trackColor={{ false: '#FFFFFF20', true: '#4CAF50' }}
              thumbColor={sport.enabled ? '#FFFFFF' : '#FFFFFF80'}
            />
          </ThemedView>
        ))}
      </ThemedView>

      {/* Analysis Settings */}
      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Analysis Settings
        </ThemedText>
        
        <ThemedView style={styles.settingItem}>
          <ThemedView style={styles.settingContent}>
            <ThemedText type="defaultSemiBold">Auto-Analyze Games</ThemedText>
            <ThemedText style={styles.description}>
              Automatically analyze new games
            </ThemedText>
          </ThemedView>
          <Switch
            value={settings.autoAnalyze}
            onValueChange={(value) => setSettings({...settings, autoAnalyze: value})}
            trackColor={{ false: '#FFFFFF20', true: '#4CAF50' }}
            thumbColor={settings.autoAnalyze ? '#FFFFFF' : '#FFFFFF80'}
          />
        </ThemedView>

        <ThemedView style={styles.settingItem}>
          <ThemedView style={styles.settingContent}>
            <ThemedText type="defaultSemiBold">Show Probability</ThemedText>
            <ThemedText style={styles.description}>
              Display win probability percentage
            </ThemedText>
          </ThemedView>
          <Switch
            value={settings.showProbability}
            onValueChange={(value) => setSettings({...settings, showProbability: value})}
            trackColor={{ false: '#FFFFFF20', true: '#4CAF50' }}
            thumbColor={settings.showProbability ? '#FFFFFF' : '#FFFFFF80'}
          />
        </ThemedView>

        <ThemedView style={styles.settingItem}>
          <ThemedView style={styles.settingContent}>
            <ThemedText type="defaultSemiBold">Expert Picks</ThemedText>
            <ThemedText style={styles.description}>
              Include expert analysis in predictions
            </ThemedText>
          </ThemedView>
          <Switch
            value={settings.expertPicks}
            onValueChange={(value) => setSettings({...settings, expertPicks: value})}
            trackColor={{ false: '#FFFFFF20', true: '#4CAF50' }}
            thumbColor={settings.expertPicks ? '#FFFFFF' : '#FFFFFF80'}
          />
        </ThemedView>

        <ThemedView style={styles.settingItem}>
          <ThemedView style={styles.settingContent}>
            <ThemedText type="defaultSemiBold">Trend Alerts</ThemedText>
            <ThemedText style={styles.description}>
              Get notified of significant trends
            </ThemedText>
          </ThemedView>
          <Switch
            value={settings.trendAlerts}
            onValueChange={(value) => setSettings({...settings, trendAlerts: value})}
            trackColor={{ false: '#FFFFFF20', true: '#4CAF50' }}
            thumbColor={settings.trendAlerts ? '#FFFFFF' : '#FFFFFF80'}
          />
        </ThemedView>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000010',
  },
  contentContainer: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    marginTop: 60,
    marginBottom: 24,
  },
  backButton: {
    marginRight: 16,
    padding: 4,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderWidth: 1,
    borderColor: '#FFFFFF20',
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: '#00000010',
  },
  settingContent: {
    flex: 1,
    marginRight: 16,
  },
  description: {
    opacity: 0.7,
    marginTop: 4,
    fontSize: 14,
  },
}); 