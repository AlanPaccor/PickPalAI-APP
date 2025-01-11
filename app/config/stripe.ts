import { PaymentConfiguration } from '@stripe/stripe-react-native';
import ENV from './env';

export const initializeStripe = async () => {
  try {
    await PaymentConfiguration.init({
      publishableKey: ENV.STRIPE_PUBLISHABLE_KEY,
    });
  } catch (error) {
    console.error('Failed to initialize Stripe:', error);
  }
}; 