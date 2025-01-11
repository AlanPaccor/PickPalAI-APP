import { stripe } from '../config/stripe';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { amount, interval, isTrialPeriod } = req.body;
    console.log('Request params:', { amount, interval, isTrialPeriod });

    // Validate input
    if (!amount || !interval) {
      throw new Error('Amount and interval are required');
    }

    // Create a customer
    const customer = await stripe.customers.create();

    // Create a product
    const product = await stripe.products.create({
      name: 'Oddsly Subscription',
      type: 'service',
    });

    // For trial period, create two prices: trial price and regular price
    if (isTrialPeriod) {
      // Create the trial price (90% off)
      const trialPrice = await stripe.prices.create({
        product: product.id,
        unit_amount: 150, // $1.50 in cents
        currency: 'usd',
        recurring: {
          interval: 'day',
          interval_count: 3, // 3-day trial period
        },
      });

      // Create the regular price
      const regularPrice = await stripe.prices.create({
        product: product.id,
        unit_amount: amount,
        currency: 'usd',
        recurring: {
          interval: interval as 'month' | 'year',
        },
      });

      // Create subscription with scheduled updates
      const subscription = await stripe.subscriptions.create({
        customer: customer.id,
        items: [{ price: trialPrice.id }],
        payment_behavior: 'default_incomplete',
        collection_method: 'charge_automatically',
        payment_settings: {
          payment_method_types: ['card'],
          save_default_payment_method: 'on_subscription',
        },
        expand: ['latest_invoice.payment_intent'],
        metadata: {
          regularPriceId: regularPrice.id // Store for later use
        }
      });

      // Schedule the price update after 3 days
      await stripe.subscriptionSchedules.create({
        from_subscription: subscription.id,
        phases: [
          {
            start_date: 'now',
            items: [{ price: trialPrice.id }],
            iterations: 1
          },
          {
            items: [{ price: regularPrice.id }],
            iterations: null // Continue indefinitely
          }
        ]
      });

      const invoice = subscription.latest_invoice as any;
      if (!invoice?.payment_intent?.client_secret) {
        throw new Error('No client secret found in subscription');
      }

      return res.status(200).json({
        subscriptionId: subscription.id,
        clientSecret: invoice.payment_intent.client_secret,
      });
    }

    // Regular subscription without trial
    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: amount,
      currency: 'usd',
      recurring: {
        interval: interval as 'month' | 'year',
      },
    });

    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: price.id }],
      payment_behavior: 'default_incomplete',
      collection_method: 'charge_automatically',
      payment_settings: {
        payment_method_types: ['card'],
        save_default_payment_method: 'on_subscription',
      },
      expand: ['latest_invoice.payment_intent'],
    });

    const invoice = subscription.latest_invoice as any;
    if (!invoice?.payment_intent?.client_secret) {
      throw new Error('No client secret found in subscription');
    }

    return res.status(200).json({
      subscriptionId: subscription.id,
      clientSecret: invoice.payment_intent.client_secret,
    });

  } catch (error) {
    console.error('Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });

    if (error instanceof stripe.errors.StripeError) {
      console.error('Stripe error:', {
        type: error.type,
        code: error.code,
        param: error.param,
      });
    }

    return res.status(500).json({
      message: error instanceof Error ? error.message : 'Internal server error',
      type: error instanceof stripe.errors.StripeError ? error.type : undefined,
    });
  }
}
