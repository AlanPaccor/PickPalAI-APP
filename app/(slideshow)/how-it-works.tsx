import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '../components/ThemedText';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const steps = [
  {
    icon: 'upload',
    text: 'Upload Your Bet - Scan or upload any bet slip'
  },
  {
    icon: 'robot-outline',
    text: 'AI Analysis - Get instant probability insights'
  },
  {
    icon: 'check-circle-outline',
    text: 'Make Smart Choices - Place winning bets'
  }
];

export function HowItWorks() {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <MaterialCommunityIcons
          name="information"
          size={80}
          color="#0A84FF"
        />
      </View>
      <ThemedText type="title" style={styles.title}>
        How It Works
      </ThemedText>
      <ThemedText style={styles.description}>
        Get started with smart betting in three easy steps
      </ThemedText>
      <View style={styles.stepsList}>
        {steps.map((step, idx) => (
          <View key={idx} style={styles.stepItem}>
            <View style={styles.stepIcon}>
              <MaterialCommunityIcons
                name={step.icon}
                size={24}
                color="#0A84FF"
              />
            </View>
            <ThemedText style={styles.stepText}>
              {step.text}
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
  stepsList: {
    width: '100%',
    paddingHorizontal: 16,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#FFFFFF08',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFFFFF10',
  },
  stepIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0A84FF15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  stepText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 20,
    opacity: 0.9,
  },
}); 