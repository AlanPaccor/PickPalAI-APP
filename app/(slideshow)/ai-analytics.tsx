import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '../components/ThemedText';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const features = [
  {
    icon: 'chart-line',
    text: 'Real-time probability analysis and predictions'
  },
  {
    icon: 'trending-up',
    text: 'Performance tracking and historical insights'
  },
  {
    icon: 'bell-outline',
    text: 'Smart alerts for best betting opportunities'
  }
] as const;

export function AIAnalytics() {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <MaterialCommunityIcons
          name="brain"
          size={80}
          color="#0A84FF"
        />
      </View>
      <ThemedText type="title" style={styles.title}>
        AI-Driven Analytics
      </ThemedText>
      <ThemedText style={styles.description}>
        Our advanced AI analyzes past performance, trends, and probabilities to give you real-time insights
      </ThemedText>
      <View style={styles.featuresList}>
        {features.map((feature, idx) => (
          <View key={idx} style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <MaterialCommunityIcons
                name={feature.icon}
                size={24}
                color="#0A84FF"
              />
            </View>
            <ThemedText style={styles.featureText}>
              {feature.text}
            </ThemedText>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  iconContainer: {
    backgroundColor: '#0A84FF15',
    padding: 20,
    borderRadius: 25,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#0A84FF30',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.9,
    lineHeight: 24,
    marginBottom: 24,
    maxWidth: '90%',
  },
  featuresList: {
    width: '100%',
    paddingHorizontal: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#FFFFFF08',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFFFFF10',
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0A84FF15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  featureText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 20,
    opacity: 0.9,
  },
}); 