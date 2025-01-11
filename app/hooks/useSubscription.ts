import React, { useEffect, useState } from 'react';
import { auth } from '../config/firebase';
import { getFirestore, doc, getDoc, onSnapshot } from 'firebase/firestore';
import { getStripe } from '../config/stripe';

export interface SubscriptionData {
  status: 'active' | 'canceled' | 'past_due' | 'unpaid';
  planId: string;
  planName: string;
  currentPeriodEnd: number;
  cancelAtPeriodEnd: boolean;
  priceId: string;
  price: number;
}

export interface BillingHistory {
  id: string;
  amount: number;
  created: number;
  status: string;
  description: string;
}

export function useSubscription() {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [billingHistory, setBillingHistory] = useState<BillingHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const db = getFirestore();
    const unsubscribe = onSnapshot(
      doc(db, 'users', user.uid),
      async (snapshot) => {
        const userData = snapshot.data();
        if (userData?.stripeSubscriptionId) {
          // Get subscription details from Stripe
          const stripe = await getStripe();
          const { subscription, history } = await fetch('/api/subscription-details', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              subscriptionId: userData.stripeSubscriptionId 
            }),
          }).then(res => res.json());

          setSubscription(subscription);
          setBillingHistory(history);
        }
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const changePlan = async (newPriceId: string) => {
    const user = auth.currentUser;
    if (!user) throw new Error('Not authenticated');

    const response = await fetch('/api/change-subscription', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        priceId: newPriceId,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to change plan');
    }
  };

  const cancelSubscription = async () => {
    const user = auth.currentUser;
    if (!user) throw new Error('Not authenticated');

    const response = await fetch('/api/cancel-subscription', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      throw new Error('Failed to cancel subscription');
    }
  };

  return { 
    subscription, 
    billingHistory, 
    loading,
    changePlan,
    cancelSubscription
  };
} 