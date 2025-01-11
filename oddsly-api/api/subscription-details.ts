import { stripe } from '../config/stripe';
import { auth } from '../config/firebase-admin';
import { Request, Response } from 'express';
import Stripe from 'stripe';

interface SubscriptionRequest extends Request {
  body: {
    subscriptionId: string;
  };
}

export default async function handler(req: SubscriptionRequest, res: Response) {
  try {
    // Verify Firebase auth token
    const token = req.headers.authorization?.split('Bearer ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const decodedToken = await auth.verifyIdToken(token);
    const userId = decodedToken.uid;

    const { subscriptionId } = req.body;

    // Get subscription details from Stripe
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    
    // Get billing history
    const charges = await stripe.charges.list({
      customer: subscription.customer as string,
      limit: 10,
    });

    // Format subscription data
    const subscriptionData = {
      status: subscription.status,
      planId: subscription.items.data[0]?.price.product,
      planName: subscription.items.data[0]?.price.nickname,
      currentPeriodEnd: subscription.current_period_end,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      priceId: subscription.items.data[0]?.price.id,
      price: subscription.items.data[0]?.price.unit_amount ? 
        subscription.items.data[0].price.unit_amount / 100 : 0,
    };

    // Format billing history
    const history = charges.data.map(charge => ({
      id: charge.id,
      amount: charge.amount / 100,
      created: charge.created,
      status: charge.status,
      description: charge.description,
    }));

    res.status(200).json({
      subscription: subscriptionData,
      history,
    });
  } catch (error) {
    console.error('Error fetching subscription details:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
} 