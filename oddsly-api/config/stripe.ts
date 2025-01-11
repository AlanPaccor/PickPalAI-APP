import Stripe from 'stripe';
import { config } from './env';

// Make sure we're using the secret key, not the publishable key
export const stripe = new Stripe(config.STRIPE_SECRET_KEY, {
  apiVersion: '2023-08-16', // Change back to supported version
});

// Verify Stripe configuration on startup
stripe.customers.list({ limit: 1 }).then(() => {
  console.log('Stripe configuration verified successfully');
}).catch((error) => {
  console.error('Stripe configuration error:', error);
});

export const ensureProduct = async () => {
  try {
    console.log('Checking for existing products...');
    const existingProducts = await stripe.products.list({ 
      limit: 1, 
      active: true 
    });
    
    if (existingProducts.data.length > 0) {
      const product = existingProducts.data[0];
      console.log('Using existing product:', { id: product.id, name: product.name });
      return product.id;
    }
    
    console.log('No existing product found, creating new one...');
    const product = await stripe.products.create({
      name: 'Oddsly Subscription',
      description: 'Access to Oddsly premium features',
      active: true,
    });
    console.log('Created new product:', { id: product.id, name: product.name });
    return product.id;
  } catch (error) {
    console.error('Error in ensureProduct:', error);
    throw error;
  }
}; 