import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '../components/ThemedText';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const platforms = [
  {
    icon: 'check-decagram',
    text: 'Works with PrizePicks, FanDuel, DraftKings & more'
  },
  {
    icon: 'camera',
    text: 'Scan screenshots from any betting platform'
  },
  {
    icon: 'database',
    text: 'All your bets organized in one place'
  }
] as const;

export function Compatibility() {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <MaterialCommunityIcons
          name="apps"
          size={80}
          color="#0A84FF"
        />
      </View>
      <ThemedText type="title" style={styles.title}>
        Works Everywhere
      </ThemedText>
      <ThemedText style={styles.description}>
        Compatible with all major betting platforms
      </ThemedText>
      <View style={styles.platformsList}>
        {platforms.map((platform, idx) => (
          <View key={idx} style={styles.platformItem}>
            <View style={styles.platformIcon}>
              <MaterialCommunityIcons
                name={platform.icon}
                size={24}
                color="#0A84FF"
              />
            </View>
            <ThemedText style={styles.platformText}>
              {platform.text}
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
  platformsList: {
    width: '100%',
    paddingHorizontal: 16,
  },
  platformItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#FFFFFF08',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFFFFF10',
  },
  platformIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0A84FF15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  platformText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 20,
    opacity: 0.9,
  },
}); 