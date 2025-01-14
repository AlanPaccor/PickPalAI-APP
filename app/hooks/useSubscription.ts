import { useState, useEffect } from 'react';
import { db, auth } from '../config/firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { cancelSubscriptionAPI } from '../config/api';

export const useSubscription = () => {
  const [subscription, setSubscription] = useState<any>(null);
  const [billingHistory, setBillingHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubscriptionData();
  }, []);

  const fetchSubscriptionData = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        console.log('No user found in fetchSubscriptionData');
        return;
      }

      console.log('Fetching subscription data for user:', user.uid);
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.data();

      console.log('Fetched user data:', userData);

      if (userData) {
        console.log('Setting subscription:', userData.subscription?.current);
        setSubscription(userData.subscription?.current);
        console.log('Setting billing history:', userData.payments);
        setBillingHistory(userData.payments || []);
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const cancelSubscription = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        console.log('No user found in cancelSubscription');
        throw new Error('No user found');
      }

      console.log('Calling cancelSubscriptionAPI for user:', user.uid);
      const response = await cancelSubscriptionAPI(user.uid);
      console.log('Cancel subscription API response:', response);

      if (!response.message) {
        throw new Error('Invalid response from server');
      }

      console.log('Updating Firestore subscription status');
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        'subscription.current.status': 'cancelled',
        'subscription.current.autoRenew': false,
        'plan.status': 'cancelled',
        'plan.autoRenew': false,
        updatedAt: new Date().toISOString()
      });
      console.log('Firestore update completed');

      console.log('Refreshing subscription data');
      await fetchSubscriptionData();
      console.log('Subscription data refreshed');

      return true;
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      throw error;
    }
  };

  return {
    subscription,
    billingHistory,
    loading,
    cancelSubscription,
    refreshSubscription: fetchSubscriptionData
  };
}; 