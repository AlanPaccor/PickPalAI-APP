import { Request, Response } from 'express';
import { db } from '../config/firebase-admin';
import { stripe } from '../config/stripe';

export default async function handler(req: Request, res: Response) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Request body:', req.body);
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    // Get user document
    const userDoc = await db.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = userDoc.data();
    console.log('User data:', userData);

    if (!userData?.subscription?.current?.subscriptionId) {
      return res.status(400).json({ error: 'No active subscription found' });
    }

    const stripeSubId = userData.subscription.current.subscriptionId;

    try {
      await stripe.subscriptions.update(stripeSubId, {
        cancel_at_period_end: true,
      });
    } catch (stripeError) {
      console.error('Stripe error:', stripeError);
      return res.status(500).json({ 
        error: 'Failed to cancel Stripe subscription',
        details: stripeError instanceof Error ? stripeError.message : 'Unknown error'
      });
    }

    try {
      await userDoc.ref.update({
        'subscription.current.status': 'cancelled',
        'subscription.current.autoRenew': false,
        'plan.status': 'cancelled',
        'plan.autoRenew': false,
        updatedAt: new Date().toISOString()
      });
    } catch (firestoreError) {
      console.error('Firestore error:', firestoreError);
      return res.status(500).json({ 
        error: 'Failed to update subscription status in database',
        details: firestoreError instanceof Error ? firestoreError.message : 'Unknown error'
      });
    }

    return res.status(200).json({ 
      message: 'Subscription cancelled successfully',
      endDate: userData.subscription.current.endDate
    });

  } catch (error) {
    console.error('Error in cancel-subscription handler:', error);
    return res.status(500).json({ 
      error: 'Failed to cancel subscription',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 