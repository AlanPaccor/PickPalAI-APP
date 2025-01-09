import { View, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useColorScheme } from 'react-native';
import Colors from '@/constants/Colors';
import { router } from 'expo-router';
import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import Slider from '@react-native-community/slider';

interface AIPreferences {
  communicationStyle: 'professional' | 'casual' | 'direct';
  detailLevel: 'basic' | 'detailed' | 'comprehensive';
  analysisStyle: 'conservative' | 'balanced' | 'aggressive';
  confidenceThreshold: 'high' | 'medium' | 'low';
  considerationFactors: string[];
}

export default function BettingPreferencesScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const { user } = useAuth();

  const [preferences, setPreferences] = useState<AIPreferences>({
    communicationStyle: 'professional',
    detailLevel: 'detailed',
    analysisStyle: 'balanced',
    confidenceThreshold: 'medium',
    considerationFactors: ['form', 'history', 'weather', 'injuries', 'travel', 'momentum', 'public'],
  });

  // Calculate risk tolerance based on other preferences
  const calculateRiskTolerance = (prefs: AIPreferences): number => {
    let score = 50; // Start at balanced

    // Analysis Style Impact
    if (prefs.analysisStyle === 'aggressive') score += 25;
    if (prefs.analysisStyle === 'conservative') score -= 25;

    // Confidence Threshold Impact
    if (prefs.confidenceThreshold === 'low') score += 15;
    if (prefs.confidenceThreshold === 'high') score -= 15;

    // Detail Level Impact
    if (prefs.detailLevel === 'comprehensive') score -= 5;
    if (prefs.detailLevel === 'basic') score += 5;

    // Ensure score stays within 0-100
    return Math.max(0, Math.min(100, score));
  };

  const analysisStyles = [
    { value: 'conservative', label: 'Conservative', description: 'Focus on safer bets with higher probability' },
    { value: 'balanced', label: 'Balanced', description: 'Mix of safe and value opportunities' },
    { value: 'aggressive', label: 'Aggressive', description: 'Seek high-value opportunities with higher risk' },
  ];

  const confidenceThresholds = [
    { value: 'high', label: 'High Confidence Only', description: 'Only suggest bets with strong indicators (>70%)' },
    { value: 'medium', label: 'Balanced Confidence', description: 'Consider moderate-confidence opportunities (>55%)' },
    { value: 'low', label: 'Include Speculative', description: 'Include higher-risk opportunities with potential value' },
  ];

  const considerationFactors = [
    { id: 'form', name: 'Recent Form', description: 'Team/Player performance in recent games' },
    { id: 'history', name: 'Historical Matchups', description: 'Past performance against specific opponents' },
    { id: 'weather', name: 'Weather Conditions', description: 'Impact of weather on game outcomes' },
    { id: 'injuries', name: 'Injury Impact', description: 'Effect of player injuries/availability' },
    { id: 'travel', name: 'Travel Fatigue', description: 'Impact of travel and rest days' },
    { id: 'momentum', name: 'Team Momentum', description: 'Current winning/losing streaks' },
    { id: 'public', name: 'Public Sentiment', description: 'Market movements and public betting' },
  ];

  const communicationStyles = [
    { value: 'professional', label: 'Professional', description: 'Formal and analytical approach' },
    { value: 'casual', label: 'Casual', description: 'Friendly and conversational' },
    { value: 'direct', label: 'Direct', description: 'Straight to the point' },
  ];

  const detailLevels = [
    { value: 'basic', label: 'Basic', description: 'Essential information only' },
    { value: 'detailed', label: 'Detailed', description: 'Balanced analysis with key stats' },
    { value: 'comprehensive', label: 'Comprehensive', description: 'In-depth analysis with all available data' },
  ];

  useEffect(() => {
    const loadPreferences = async () => {
      if (!user) return;
      
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists() && userDoc.data().aiPreferences) {
          setPreferences(userDoc.data().aiPreferences);
        }
      } catch (error) {
        console.error('Error loading preferences:', error);
      }
    };

    loadPreferences();
  }, [user]);

  const savePreferences = async () => {
    if (!user) return;
    
    try {
      await setDoc(doc(db, 'users', user.uid), {
        aiPreferences: preferences
      }, { merge: true });
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  };

  const toggleFactor = (factorId: string) => {
    setPreferences(prev => ({
      ...prev,
      considerationFactors: prev.considerationFactors?.includes(factorId)
        ? prev.considerationFactors.filter(id => id !== factorId)
        : [...(prev.considerationFactors || []), factorId]
    }));
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <ThemedView style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => {
            savePreferences();
            router.back();
          }}
        >
          <MaterialCommunityIcons 
            name="arrow-left" 
            size={24} 
            color={theme.tint}
          />
        </TouchableOpacity>
        <ThemedText type="title">AI Behavior Settings</ThemedText>
      </ThemedView>

      {/* Warning Message */}
      <ThemedView style={styles.warningContainer}>
        <MaterialCommunityIcons 
          name="alert-circle-outline" 
          size={24} 
          color="#FFA726"
        />
        <ThemedText style={styles.warningText}>
          Changing these settings will affect how the AI analyzes and presents betting recommendations. This could impact the type of advice you receive.
        </ThemedText>
      </ThemedView>

      {/* Risk Tolerance Display (Read-only) */}
      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>Current Risk Profile</ThemedText>
        <ThemedView style={styles.sliderContainer}>
          <Slider
            style={styles.slider}
            value={calculateRiskTolerance(preferences)}
            enabled={false}
            minimumValue={0}
            maximumValue={100}
            minimumTrackTintColor="#4CAF50"
            maximumTrackTintColor="#FFFFFF20"
            thumbTintColor="#4CAF50"
          />
          <ThemedView style={styles.sliderLabels}>
            <ThemedText>Conservative</ThemedText>
            <ThemedText>Balanced</ThemedText>
            <ThemedText>Aggressive</ThemedText>
          </ThemedView>
        </ThemedView>
      </ThemedView>

      {/* Analysis Style */}
      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>Analysis Approach</ThemedText>
        {analysisStyles.map(style => (
          <TouchableOpacity
            key={style.value}
            style={[
              styles.optionItem,
              preferences.analysisStyle === style.value && styles.selectedOption
            ]}
            onPress={() => setPreferences(prev => ({ ...prev, analysisStyle: style.value as any }))}
          >
            <ThemedView style={styles.optionContent}>
              <ThemedText type="defaultSemiBold">{style.label}</ThemedText>
              <ThemedText style={styles.description}>{style.description}</ThemedText>
            </ThemedView>
            {preferences.analysisStyle === style.value && (
              <MaterialCommunityIcons name="check" size={24} color="#4CAF50" />
            )}
          </TouchableOpacity>
        ))}
      </ThemedView>

      {/* Confidence Threshold */}
      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>Confidence Threshold</ThemedText>
        {confidenceThresholds.map(threshold => (
          <TouchableOpacity
            key={threshold.value}
            style={[
              styles.optionItem,
              preferences.confidenceThreshold === threshold.value && styles.selectedOption
            ]}
            onPress={() => setPreferences(prev => ({ ...prev, confidenceThreshold: threshold.value as any }))}
          >
            <ThemedView style={styles.optionContent}>
              <ThemedText type="defaultSemiBold">{threshold.label}</ThemedText>
              <ThemedText style={styles.description}>{threshold.description}</ThemedText>
            </ThemedView>
            {preferences.confidenceThreshold === threshold.value && (
              <MaterialCommunityIcons name="check" size={24} color="#4CAF50" />
            )}
          </TouchableOpacity>
        ))}
      </ThemedView>

      {/* Communication Style */}
      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>Communication Style</ThemedText>
        {communicationStyles.map(style => (
          <TouchableOpacity
            key={style.value}
            style={[
              styles.optionItem,
              preferences.communicationStyle === style.value && styles.selectedOption
            ]}
            onPress={() => setPreferences(prev => ({ ...prev, communicationStyle: style.value as any }))}
          >
            <ThemedView style={styles.optionContent}>
              <ThemedText type="defaultSemiBold">{style.label}</ThemedText>
              <ThemedText style={styles.description}>{style.description}</ThemedText>
            </ThemedView>
            {preferences.communicationStyle === style.value && (
              <MaterialCommunityIcons name="check" size={24} color="#4CAF50" />
            )}
          </TouchableOpacity>
        ))}
      </ThemedView>

      {/* Detail Level */}
      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>Analysis Detail Level</ThemedText>
        {detailLevels.map(level => (
          <TouchableOpacity
            key={level.value}
            style={[
              styles.optionItem,
              preferences.detailLevel === level.value && styles.selectedOption
            ]}
            onPress={() => setPreferences(prev => ({ ...prev, detailLevel: level.value as any }))}
          >
            <ThemedView style={styles.optionContent}>
              <ThemedText type="defaultSemiBold">{level.label}</ThemedText>
              <ThemedText style={styles.description}>{level.description}</ThemedText>
            </ThemedView>
            {preferences.detailLevel === level.value && (
              <MaterialCommunityIcons name="check" size={24} color="#4CAF50" />
            )}
          </TouchableOpacity>
        ))}
      </ThemedView>

      {/* Consideration Factors */}
      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>Analysis Factors</ThemedText>
        <ThemedText style={styles.sectionDescription}>
          Select factors for the AI to consider in its analysis
        </ThemedText>
        {considerationFactors.map(factor => (
          <TouchableOpacity
            key={factor.id}
            style={[
              styles.optionItem,
              preferences.considerationFactors?.includes(factor.id) && styles.selectedOption
            ]}
            onPress={() => toggleFactor(factor.id)}
          >
            <ThemedView style={styles.optionContent}>
              <ThemedText type="defaultSemiBold">{factor.name}</ThemedText>
              <ThemedText style={styles.description}>{factor.description}</ThemedText>
            </ThemedView>
            {preferences.considerationFactors?.includes(factor.id) && (
              <MaterialCommunityIcons name="check" size={24} color="#4CAF50" />
            )}
          </TouchableOpacity>
        ))}
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
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFA72620',
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#FFA72640',
  },
  warningText: {
    flex: 1,
    marginLeft: 12,
    color: '#FFA726',
    fontSize: 14,
    lineHeight: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  sliderContainer: {
    padding: 16,
    borderWidth: 1,
    borderColor: '#FFFFFF20',
    borderRadius: 12,
    backgroundColor: '#00000010',
  },
  slider: {
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  optionItem: {
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
  selectedOption: {
    borderColor: '#4CAF50',
  },
  optionContent: {
    flex: 1,
    marginRight: 16,
  },
  description: {
    opacity: 0.7,
    marginTop: 4,
    fontSize: 14,
  },
  sectionDescription: {
    opacity: 0.7,
    marginBottom: 12,
    fontSize: 14,
    lineHeight: 20,
  },
}); 