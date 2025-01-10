import { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';

console.log('Initializing create-payment-intent endpoint');

if (!process.env.STRIPE_SECRET_KEY) {
  console.error('STRIPE_SECRET_KEY is not defined');
  throw new Error('STRIPE_SECRET_KEY is not defined');
}

// Initialize Stripe outside the handler to avoid re-initialization
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
  timeout: 5000 // 5 second timeout for Stripe requests
});

console.log('Stripe initialized successfully');

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('Payment Intent Handler - Request received:', {
    method: req.method,
    headers: req.headers,
    body: req.body
  });

  if (req.method !== 'POST') {
    console.log('Invalid method:', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { amount, currency } = req.body;
    console.log('Received request parameters:', { amount, currency });

    if (!amount || !currency) {
      console.log('Missing parameters:', { amount, currency });
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    console.log('Creating payment intent with params:', { amount, currency });
    
    const startTime = Date.now();
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      automatic_payment_methods: {
        enabled: true
      }
    });
    const duration = Date.now() - startTime;
    
    console.log('Payment intent created successfully:', {
      id: paymentIntent.id,
      duration: `${duration}ms`,
      status: paymentIntent.status
    });

    console.log('Preparing response with client secret:', {
      hasClientSecret: !!paymentIntent.client_secret,
      clientSecretLength: paymentIntent.client_secret?.length
    });

    const response = { clientSecret: paymentIntent.client_secret };
    console.log('Sending response:', {
      statusCode: 200,
      responseBody: response
    });

    return res.status(200).json(response);
  } catch (error) {
    console.error('Payment Intent Error:', {
      error: error instanceof Error ? {
        message: error.message,
        name: error.name,
        stack: error.stack
      } : 'Unknown error',
      timestamp: new Date().toISOString()
    });

    const errorResponse = { 
      error: 'Error creating payment intent',
      details: error instanceof Error ? error.message : 'Unknown error'
    };
    console.log('Sending error response:', {
      statusCode: 500,
      responseBody: errorResponse
    });

    return res.status(500).json(errorResponse);
  }
}