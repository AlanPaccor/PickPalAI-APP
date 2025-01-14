import { stripe } from '../config/stripe';
import type { VercelRequest, VercelResponse } from '@vercel/node';

interface PaymentRequestBody {
  amount: number;
  isTrialPeriod?: boolean;
  userId: string;
  email?: string;
  interval?: 'month' | 'year';
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { amount, isTrialPeriod, userId, email, interval }: PaymentRequestBody = req.body;

    if (!amount || !userId) {
      throw new Error('Amount and userId are required');
    }

    // Create a customer
    const customer = await stripe.customers.create({
      email: email || undefined
    });

    // Create a product
    const product = await stripe.products.create({
      name: isTrialPeriod ? '2-Day Access' : `Oddsly ${interval || ''} Plan`,
      type: 'service',
    });

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      customer: customer.id,
      payment_method_types: ['card'],
      metadata: {
        userId,
        type: isTrialPeriod ? 'trial' : 'subscription',
        productId: product.id,
        interval: interval || undefined,
        email: email || undefined
      }
    });

    return res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });

  } catch (error) {
    console.error('Error details:', error);
    return res.status(500).json({
      message: error instanceof Error ? error.message : 'Internal server error'
    });
  }
}
