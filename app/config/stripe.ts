import { initStripe } from '@stripe/stripe-react-native';

const STRIPE_PUBLISHABLE_KEY = process.env.STRIPE_PUBLISHABLE_KEY!;

export const initializeStripe = async () => {
  await initStripe({
    publishableKey: STRIPE_PUBLISHABLE_KEY,
    merchantIdentifier: 'merchant.com.sportsbetapp',
    urlScheme: 'sportsbetapp',
  });
}; 