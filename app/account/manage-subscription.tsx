import { useState, useEffect } from 'react';
import { StyleSheet, View, Alert } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { db, auth } from '../config/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

export default function ManageSubscription() {
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubscription();
  }, []);

  const loadSubscription = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.data();
      setSubscription(userData?.subscription);
    } catch (error) {
      console.error('Error loading subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const cancelSubscription = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      await updateDoc(doc(db, 'users', user.uid), {
        'subscription.status': 'cancelled',
      });

      Alert.alert(
        'Subscription Cancelled',
        'Your subscription will end at the end of the trial period.',
        [{ text: 'OK' }]
      );

      loadSubscription();
    } catch (error) {
      Alert.alert('Error', 'Failed to cancel subscription');
      console.error('Error cancelling subscription:', error);
    }
  };

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Loading...</ThemedText>
      </ThemedView>
    );
  }

  const trialEndDate = subscription?.trialEndDate?.toDate();
  const isTrialActive = subscription?.status === 'trial';
  const daysLeft = trialEndDate ? 
    Math.ceil((trialEndDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 
    0;

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        Subscription Status
      </ThemedText>

      <View style={styles.infoContainer}>
        <ThemedText style={styles.planText}>
          Plan: {subscription?.plan}
        </ThemedText>
        
        {isTrialActive && (
          <ThemedText style={styles.trialText}>
            Trial ends in {daysLeft} days
          </ThemedText>
        )}

        <ThemedText style={styles.statusText}>
          Status: {subscription?.status}
        </ThemedText>
      </View>

      {isTrialActive && (
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => {
            Alert.alert(
              'Cancel Subscription',
              'Are you sure you want to cancel? Your subscription will end after the trial period.',
              [
                { text: 'No', style: 'cancel' },
                { text: 'Yes', onPress: cancelSubscription },
              ]
            );
          }}
        >
          <ThemedText style={styles.cancelButtonText}>
            Cancel Subscription
          </ThemedText>
        </TouchableOpacity>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  infoContainer: {
    backgroundColor: '#00000020',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  planText: {
    fontSize: 18,
    marginBottom: 10,
  },
  trialText: {
    fontSize: 16,
    color: '#0A84FF',
    marginBottom: 10,
  },
  statusText: {
    fontSize: 16,
    opacity: 0.8,
  },
  cancelButton: {
    backgroundColor: '#FF3B30',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
}); 