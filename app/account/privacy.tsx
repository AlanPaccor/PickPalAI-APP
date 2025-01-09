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

      {/* Privacy Notice */}
      <ThemedView style={styles.noticeContainer}>
        <MaterialCommunityIcons 
          name="shield-check" 
          size={32} 
          color="#4CAF50"
        />
        <ThemedText style={styles.noticeTitle}>Privacy Notice</ThemedText>
        <ThemedText style={styles.noticeText}>
          By using this app, you agree to our privacy policy. We encrypt and securely store your betting data and personal information. We never share your individual data with third parties without your explicit consent.
        </ThemedText>
        <TouchableOpacity 
          style={styles.privacyLink}
          onPress={() => router.push('/account/privacy-policy')}
        >
          <ThemedText style={styles.linkText}>View Privacy Policy</ThemedText>
        </TouchableOpacity>
      </ThemedView>

      {/* Privacy Settings */}
      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>Privacy Settings</ThemedText>
        
        <ThemedView style={styles.settingItem}>
          <ThemedView style={styles.settingContent}>
            <ThemedText type="defaultSemiBold">Data Sharing</ThemedText>
            <ThemedText style={styles.description}>Share anonymous analytics to improve service</ThemedText>
          </ThemedView>
          <Switch
            value={dataSharing}
            onValueChange={setDataSharing}
            trackColor={{ false: '#FFFFFF20', true: '#4CAF50' }}
            thumbColor={dataSharing ? '#FFFFFF' : '#FFFFFF80'}
          />
        </ThemedView>
      </ThemedView>

      {/* Account Actions */}
      <ThemedView style={styles.section}>
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
  noticeContainer: {
    padding: 20,
    borderRadius: 12,
    backgroundColor: '#000010',
    borderWidth: 1,
    borderColor: '#4CAF5040',
    alignItems: 'center',
    marginBottom: 24,
  },
  noticeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginVertical: 12,
  },
  noticeText: {
    textAlign: 'center',
    lineHeight: 22,
    opacity: 0.8,
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
  privacyLink: {
    marginTop: 12,
    padding: 8,
  },
  linkText: {
    color: '#1E90FF',
    fontSize: 14,
    fontWeight: '600',
  },
}); 