import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-08-16',
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { userId, amount } = req.body;

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product: process.env.STRIPE_PRODUCT_ID_TRIAL,
            unit_amount: amount, // $1.50 in cents
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/subscription`,
      metadata: {
        userId,
        type: 'trial',
        productId: process.env.STRIPE_PRODUCT_ID_TRIAL
      },
    });

    res.status(200).json({ sessionId: session.id });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Error creating checkout session' });
  }
} 