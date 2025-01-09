import { View, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useColorScheme } from 'react-native';
import Colors from '@/constants/Colors';
import { router } from 'expo-router';
import { useState } from 'react';

interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
}

export default function LanguageScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  const languages: LanguageOption[] = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'es', name: 'Spanish', nativeName: 'Español' },
    { code: 'fr', name: 'French', nativeName: 'Français' },
    { code: 'de', name: 'German', nativeName: 'Deutsch' },
    { code: 'it', name: 'Italian', nativeName: 'Italiano' },
    { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
    { code: 'ja', name: 'Japanese', nativeName: '日本語' },
    { code: 'ko', name: 'Korean', nativeName: '한국어' },
    { code: 'zh', name: 'Chinese', nativeName: '中文' },
  ];

  const [selectedLanguage, setSelectedLanguage] = useState('en');

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
        <ThemedText type="title">Language</ThemedText>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Select Language
        </ThemedText>
        
        {languages.map((language) => (
          <TouchableOpacity
            key={language.code}
            style={[
              styles.languageItem,
              selectedLanguage === language.code && styles.selectedItem
            ]}
            onPress={() => setSelectedLanguage(language.code)}
          >
            <ThemedView style={styles.languageContent}>
              <ThemedText type="defaultSemiBold">
                {language.name}
              </ThemedText>
              <ThemedText style={styles.nativeName}>
                {language.nativeName}
              </ThemedText>
            </ThemedView>
            {selectedLanguage === language.code && (
              <MaterialCommunityIcons 
                name="check-circle" 
                size={24} 
                color="#4CAF50"
              />
            )}
          </TouchableOpacity>
        ))}
      </ThemedView>

      <ThemedText style={styles.footer}>
        Changes will be applied immediately
      </ThemedText>
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
  languageItem: {
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
  selectedItem: {
    borderColor: '#4CAF50',
    backgroundColor: '#4CAF5010',
  },
  languageContent: {
    flex: 1,
  },
  nativeName: {
    opacity: 0.7,
    fontSize: 14,
    marginTop: 4,
  },
  footer: {
    textAlign: 'center',
    opacity: 0.7,
    marginTop: 24,
    fontSize: 14,
  },
}); 