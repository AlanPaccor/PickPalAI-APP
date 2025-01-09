import { View, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useColorScheme } from 'react-native';
import Colors from '@/constants/Colors';
import { router } from 'expo-router';

export default function BillingScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

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
        <ThemedText type="title">Billing & Payments</ThemedText>
      </ThemedView>

      {/* Current Plan */}
      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>Current Plan</ThemedText>
        <ThemedView style={styles.planCard}>
          <ThemedView style={styles.planHeader}>
            <ThemedText type="defaultSemiBold">Premium Plan</ThemedText>
            <ThemedView style={styles.statusBadge}>
              <ThemedText style={styles.statusText}>Active</ThemedText>
            </ThemedView>
          </ThemedView>
          <ThemedText style={styles.price}>$19.99/month</ThemedText>
          <ThemedText style={styles.renewalInfo}>
            Next billing date: March 15, 2024
          </ThemedText>
        </ThemedView>
      </ThemedView>

      {/* Payment Method */}
      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>Payment Method</ThemedText>
        <ThemedView style={styles.paymentCard}>
          <ThemedView style={styles.paymentMethod}>
            <MaterialCommunityIcons name="credit-card" size={24} color={theme.tint} />
            <ThemedView style={styles.cardInfo}>
              <ThemedText type="defaultSemiBold">•••• 4242</ThemedText>
              <ThemedText style={styles.expiryDate}>Expires 12/24</ThemedText>
            </ThemedView>
          </ThemedView>
          <TouchableOpacity style={styles.updateButton}>
            <ThemedText style={styles.buttonText}>Update</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ThemedView>

      {/* Billing History */}
      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>Billing History</ThemedText>
        <ThemedView style={styles.historyCard}>
          <ThemedView style={styles.historyItem}>
            <ThemedView>
              <ThemedText type="defaultSemiBold">Premium Plan</ThemedText>
              <ThemedText style={styles.historyDate}>Feb 15, 2024</ThemedText>
            </ThemedView>
            <ThemedText type="defaultSemiBold">$19.99</ThemedText>
          </ThemedView>
          <ThemedView style={styles.historyItem}>
            <ThemedView>
              <ThemedText type="defaultSemiBold">Premium Plan</ThemedText>
              <ThemedText style={styles.historyDate}>Jan 15, 2024</ThemedText>
            </ThemedView>
            <ThemedText type="defaultSemiBold">$19.99</ThemedText>
          </ThemedView>
        </ThemedView>
      </ThemedView>

      {/* Actions */}
      <ThemedView style={styles.section}>
        <TouchableOpacity style={styles.actionButton}>
          <ThemedText style={styles.actionButtonText}>Change Plan</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.cancelButton]}>
          <ThemedText style={styles.cancelButtonText}>Cancel Subscription</ThemedText>
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
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  planCard: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#00000010',
    borderWidth: 1,
    borderColor: '#FFFFFF20',
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  renewalInfo: {
    opacity: 0.7,
  },
  paymentCard: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#00000010',
    borderWidth: 1,
    borderColor: '#FFFFFF20',
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardInfo: {
    marginLeft: 16,
  },
  expiryDate: {
    opacity: 0.7,
    fontSize: 14,
    marginTop: 4,
  },
  updateButton: {
    backgroundColor: '#0A84FF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  historyCard: {
    borderRadius: 12,
    backgroundColor: '#00000010',
    borderWidth: 1,
    borderColor: '#FFFFFF20',
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#FFFFFF10',
  },
  historyDate: {
    opacity: 0.7,
    fontSize: 14,
    marginTop: 4,
  },
  actionButton: {
    backgroundColor: '#0A84FF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  cancelButtonText: {
    color: '#FF3B30',
    fontWeight: '600',
    fontSize: 16,
  },
}); 