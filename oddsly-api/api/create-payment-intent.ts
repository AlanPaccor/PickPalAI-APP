import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { stripe } from '../config/stripe';
import { config } from '../config/env';

const getProductId = (interval: string, isTrial: boolean): string => {
  if (!config.STRIPE_PRODUCT_ID_TRIAL || !config.STRIPE_PRODUCT_ID_ANNUAL || !config.STRIPE_PRODUCT_ID_MONTHLY) {
    throw new Error('Missing required Stripe product IDs in environment variables');
  }

  if (isTrial) {
    return config.STRIPE_PRODUCT_ID_TRIAL;
  }
  return interval === 'year' 
    ? config.STRIPE_PRODUCT_ID_ANNUAL 
    : config.STRIPE_PRODUCT_ID_MONTHLY;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { amount, currency = 'usd', interval, trialPeriodDays } = req.body;

    if (!amount) {
      return res.status(400).json({ message: 'Amount is required' });
    }

    // Create a customer first
    const customer = await stripe.customers.create();
    console.log('Created customer:', customer.id);

    // For trial subscriptions, we'll use the monthly price
    const priceData: Stripe.PriceCreateParams = {
      currency,
      product: getProductId(interval, !!trialPeriodDays),
      unit_amount: trialPeriodDays ? 1500 : amount, // Use monthly price for trials
      recurring: {
        interval: 'month', // Always monthly for trials
      },
    };

    // Create the price
    const price = await stripe.prices.create(priceData);
    console.log('Created price:', price.id);

    // Create the subscription
    const subscriptionData: Stripe.SubscriptionCreateParams = {
      customer: customer.id,
      items: [{ price: price.id }],
      payment_behavior: 'default_incomplete',
      payment_settings: {
        payment_method_types: ['card'],
        save_default_payment_method: 'on_subscription',
      },
      trial_period_days: trialPeriodDays,
      expand: ['latest_invoice.payment_intent'],
      // Add trial end behavior
      trial_settings: trialPeriodDays ? {
        end_behavior: {
          missing_payment_method: 'cancel',
        },
      } : undefined,
      // Collect payment method even during trial
      collection_method: 'charge_automatically',
    };

    console.log('Creating subscription with data:', {
      priceId: price.id,
      customerId: customer.id,
      trialPeriodDays,
    });

    const subscription = await stripe.subscriptions.create(subscriptionData);
    console.log('Created subscription:', subscription.id);

    // Get the client secret
    const invoice = subscription.latest_invoice as Stripe.Invoice;
    const paymentIntent = invoice.payment_intent as Stripe.PaymentIntent;

    if (!paymentIntent?.client_secret) {
      console.error('Missing client secret in subscription:', {
        subscriptionId: subscription.id,
        invoiceId: invoice.id,
        paymentIntentId: paymentIntent?.id,
      });
      throw new Error('No client secret found in payment intent');
    }

    // Return the subscription ID and client secret
    return res.status(200).json({
      subscriptionId: subscription.id,
      clientSecret: paymentIntent.client_secret,
    });

  } catch (error) {
    console.error('❌ Error creating subscription:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return res.status(500).json({ message: errorMessage });
  }
}