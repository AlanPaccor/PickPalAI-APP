import { View, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useColorScheme } from 'react-native';
import Colors from '@/constants/Colors';
import { router } from 'expo-router';
import { useState } from 'react';

interface CurrencyOption {
  code: string;
  name: string;
  symbol: string;
}

export default function CurrencySettingsScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  const currencies: CurrencyOption[] = [
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  ];

  const [selectedCurrency, setSelectedCurrency] = useState('USD');

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
        <ThemedText type="title">Currency Settings</ThemedText>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Select Currency
        </ThemedText>
        
        {currencies.map((currency) => (
          <TouchableOpacity
            key={currency.code}
            style={[
              styles.currencyItem,
              selectedCurrency === currency.code && styles.selectedItem
            ]}
            onPress={() => setSelectedCurrency(currency.code)}
          >
            <ThemedView style={styles.currencyContent}>
              <ThemedView style={styles.currencyHeader}>
                <ThemedText type="defaultSemiBold">
                  {currency.name}
                </ThemedText>
                <ThemedText style={styles.currencySymbol}>
                  {currency.symbol}
                </ThemedText>
              </ThemedView>
              <ThemedText style={styles.currencyCode}>
                {currency.code}
              </ThemedText>
            </ThemedView>
            {selectedCurrency === currency.code && (
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
        Currency will be used for all predictions and analysis
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
  currencyItem: {
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
  currencyContent: {
    flex: 1,
  },
  currencyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  currencySymbol: {
    fontSize: 18,
    opacity: 0.8,
  },
  currencyCode: {
    opacity: 0.7,
    fontSize: 14,
  },
  footer: {
    textAlign: 'center',
    opacity: 0.7,
    marginTop: 24,
    fontSize: 14,
  },
}); 