import { View, TouchableOpacity, StyleSheet, Platform, ScrollView, Switch } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useColorScheme } from 'react-native';
import Colors from '@/constants/Colors';
import { router } from 'expo-router';
import { useState } from 'react';

export default function PrivacyScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const [twoFactor, setTwoFactor] = useState(false);
  const [biometric, setBiometric] = useState(false);
  const [dataSharing, setDataSharing] = useState(true);

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Header */}
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
        <ThemedText type="title">Privacy & Security</ThemedText>
      </ThemedView>

      {/* Security Section */}
      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>Security</ThemedText>
        
        <ThemedView style={styles.settingItem}>
          <ThemedView style={styles.settingContent}>
            <ThemedText type="defaultSemiBold">Two-Factor Authentication</ThemedText>
            <ThemedText style={styles.description}>Add an extra layer of security</ThemedText>
          </ThemedView>
          <Switch
            value={twoFactor}
            onValueChange={setTwoFactor}
            trackColor={{ false: '#FFFFFF20', true: '#4CAF50' }}
            thumbColor={twoFactor ? '#FFFFFF' : '#FFFFFF80'}
          />
        </ThemedView>

        <ThemedView style={styles.settingItem}>
          <ThemedView style={styles.settingContent}>
            <ThemedText type="defaultSemiBold">Biometric Login</ThemedText>
            <ThemedText style={styles.description}>Use Face ID or fingerprint</ThemedText>
          </ThemedView>
          <Switch
            value={biometric}
            onValueChange={setBiometric}
            trackColor={{ false: '#FFFFFF20', true: '#4CAF50' }}
            thumbColor={biometric ? '#FFFFFF' : '#FFFFFF80'}
          />
        </ThemedView>
      </ThemedView>

      {/* Privacy Section */}
      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>Privacy</ThemedText>
        
        <ThemedView style={styles.settingItem}>
          <ThemedView style={styles.settingContent}>
            <ThemedText type="defaultSemiBold">Data Sharing</ThemedText>
            <ThemedText style={styles.description}>Share analytics to improve service</ThemedText>
          </ThemedView>
          <Switch
            value={dataSharing}
            onValueChange={setDataSharing}
            trackColor={{ false: '#FFFFFF20', true: '#4CAF50' }}
            thumbColor={dataSharing ? '#FFFFFF' : '#FFFFFF80'}
          />
        </ThemedView>

        <TouchableOpacity style={styles.button}>
          <ThemedText style={styles.buttonText}>Delete Account</ThemedText>
        </TouchableOpacity>
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
  button: {
    backgroundColor: '#FF3B30',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
}); 