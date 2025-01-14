import type { VercelRequest, VercelResponse } from '@vercel/node';
import { stripe } from '../config/stripe';

interface PaymentRequestBody {
  amount: number;
  isTrialPeriod?: boolean;
  userId: string;
  email?: string;
  interval?: 'month' | 'year';
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('API endpoint hit:', {
    method: req.method,
    url: req.url,
    headers: req.headers,
  });

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json'); // Explicitly set response type

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(200).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Request body:', req.body);
    const { amount, isTrialPeriod, userId, email, interval }: PaymentRequestBody = req.body;

    if (!amount || !userId) {
      return res.status(200).json({ error: 'Amount and userId are required' });
    }

    // Create a customer
    const customer = await stripe.customers.create({
      email: email || undefined
    });

    if (isTrialPeriod) {
      // One-time payment for trial
      const product = await stripe.products.create({
        name: '2-Day Access',
        type: 'service',
      });

      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency: 'usd',
        customer: customer.id,
        payment_method_types: ['card'],
        metadata: {
          userId,
          type: 'trial',
          productId: product.id,
          email: email || undefined
        }
      });

      return res.status(200).json({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        customerId: customer.id
      });

    } else {
      // Create recurring subscription for monthly/annual plans
      const product = await stripe.products.create({
        name: `Oddsly ${interval} Plan`,
        type: 'service',
      });

      // Create the price for recurring billing
      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: amount,
        currency: 'usd',
        recurring: {
          interval: interval as 'month' | 'year'
        }
      });

      // Create the subscription
      const subscription = await stripe.subscriptions.create({
        customer: customer.id,
        items: [{ price: price.id }],
        payment_behavior: 'default_incomplete',
        payment_settings: {
          payment_method_types: ['card'],
          save_default_payment_method: 'on_subscription'
        },
        metadata: {
          userId,
          type: 'subscription',
          interval,
          email: email || undefined
        },
        expand: ['latest_invoice.payment_intent']
      });

      const invoice = subscription.latest_invoice as any;

      return res.status(200).json({
        subscriptionId: subscription.id,
        clientSecret: invoice.payment_intent.client_secret,
        paymentId: invoice.payment_intent.id,
        customerId: customer.id
      });
    }

  } catch (error) {
    console.error('Error details:', error);
    return res.status(200).json({
      error: 'Failed to create payment',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
