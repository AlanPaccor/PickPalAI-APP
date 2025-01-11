import { View, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useColorScheme } from 'react-native';
import Colors from '@/constants/Colors';
import { router } from 'expo-router';
import { useSubscription } from '../hooks/useSubscription';
import { Alert, ActivityIndicator } from 'react-native';
import { format } from 'date-fns';

export default function BillingScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const { 
    subscription, 
    billingHistory, 
    loading,
    changePlan,
    cancelSubscription 
  } = useSubscription();

  const handleChangePlan = async () => {
    try {
      // Navigate to plan selection screen
      router.push('/auth/subscription');
    } catch (error) {
      Alert.alert('Error', 'Failed to change plan. Please try again.');
    }
  };

  const handleCancelSubscription = async () => {
    Alert.alert(
      'Cancel Subscription',
      'Are you sure you want to cancel your subscription? You\'ll still have access until the end of your billing period.',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              await cancelSubscription();
              Alert.alert('Success', 'Your subscription has been cancelled.');
            } catch (error) {
              Alert.alert('Error', 'Failed to cancel subscription. Please try again.');
            }
          },
        },
      ]
    );
  };

  const formatDate = (timestamp: number | undefined) => {
    if (!timestamp) return 'N/A';
    try {
      return format(timestamp * 1000, 'MMMM d, yyyy');
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'N/A';
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={theme.tint} />
      </View>
    );
  }

  // Update the return statement to use subscription data
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
            <ThemedText type="defaultSemiBold">
              {subscription?.planName || 'No active plan'}
            </ThemedText>
            <ThemedView style={[
              styles.statusBadge,
              { backgroundColor: subscription?.status === 'active' ? '#4CAF50' : '#FF3B30' }
            ]}>
              <ThemedText style={styles.statusText}>
                {subscription?.status === 'active' ? 'Active' : 'Inactive'}
              </ThemedText>
            </ThemedView>
          </ThemedView>
          <ThemedText style={styles.price}>
            ${subscription?.price || 0}/month
          </ThemedText>
          <ThemedText style={styles.renewalInfo}>
            {subscription?.cancelAtPeriodEnd 
              ? `Access until ${formatDate(subscription.currentPeriodEnd)}`
              : `Next billing date: ${formatDate(subscription?.currentPeriodEnd)}`
            }
          </ThemedText>
        </ThemedView>
      </ThemedView>

      {/* Billing History */}
      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>Billing History</ThemedText>
        <ThemedView style={styles.historyCard}>
          {billingHistory.map((item) => (
            <ThemedView key={item.id} style={styles.historyItem}>
              <ThemedView>
                <ThemedText type="defaultSemiBold">{item.description}</ThemedText>
                <ThemedText style={styles.historyDate}>
                  {formatDate(item.created)}
                </ThemedText>
              </ThemedView>
              <ThemedText type="defaultSemiBold">${item.amount}</ThemedText>
            </ThemedView>
          ))}
          {billingHistory.length === 0 && (
            <ThemedView style={styles.emptyState}>
              <ThemedText>No billing history available</ThemedText>
            </ThemedView>
          )}
        </ThemedView>
      </ThemedView>

      {/* Actions */}
      <ThemedView style={styles.section}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={handleChangePlan}
        >
          <ThemedText style={styles.actionButtonText}>Change Plan</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionButton, styles.cancelButton]}
          onPress={handleCancelSubscription}
        >
          <ThemedText style={styles.cancelButtonText}>
            {subscription?.cancelAtPeriodEnd ? 'Subscription Cancelled' : 'Cancel Subscription'}
          </ThemedText>
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
    backgroundColor: '#000010',
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
    backgroundColor: '#000010',
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
    backgroundColor: '#000010',
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
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    padding: 16,
    alignItems: 'center',
  },
}); 