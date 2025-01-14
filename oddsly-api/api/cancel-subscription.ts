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

    // Check for subscription or payment ID
    const subscriptionId = userData?.subscription?.current?.subscriptionId;
    const paymentId = userData?.subscription?.current?.paymentId;
    const customerId = userData?.subscription?.current?.customerId;

    console.log('IDs found:', { subscriptionId, paymentId, customerId });

    if (!subscriptionId && !paymentId && !customerId) {
      return res.status(400).json({ error: 'No active subscription or payment found' });
    }

    try {
      if (subscriptionId) {
        // Cancel subscription
        await stripe.subscriptions.update(subscriptionId, {
          cancel_at_period_end: true,
        });
      } else if (customerId) {
        // Find and cancel subscription through customer
        const subscriptions = await stripe.subscriptions.list({
          customer: customerId,
          limit: 1,
          status: 'active'
        });

        if (subscriptions.data.length > 0) {
          await stripe.subscriptions.update(subscriptions.data[0].id, {
            cancel_at_period_end: true,
          });
        }
      }
      // If only paymentId exists, it's likely a one-time payment (trial)
      // which doesn't need cancellation in Stripe
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
      console.log('Updated Firestore document');
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