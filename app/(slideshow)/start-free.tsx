import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '../components/ThemedText';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const benefits = [
  {
    icon: 'clock-outline',
    text: '2-day free trial with full access to all features'
  },
  {
    icon: 'cash',
    text: 'Then just $15/month for unlimited insights'
  },
  {
    icon: 'shield-check',
    text: 'Cancel anytime - no hidden fees or commitments'
  }
] as const;

export function StartFree() {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <MaterialCommunityIcons
          name="star"
          size={80}
          color="#0A84FF"
        />
      </View>
      <ThemedText type="title" style={styles.title}>
        Start Your Trial Today
      </ThemedText>
      <ThemedText style={styles.description}>
        Try all premium features with no commitment
      </ThemedText>
      <View style={styles.benefitsList}>
        {benefits.map((benefit, idx) => (
          <View key={idx} style={styles.benefitItem}>
            <View style={styles.benefitIcon}>
              <MaterialCommunityIcons
                name={benefit.icon}
                size={24}
                color="#0A84FF"
              />
            </View>
            <ThemedText style={styles.benefitText}>
              {benefit.text}
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
  benefitsList: {
    width: '100%',
    paddingHorizontal: 16,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#FFFFFF08',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFFFFF10',
  },
  benefitIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0A84FF15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  benefitText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 20,
    opacity: 0.9,
  },
}); 