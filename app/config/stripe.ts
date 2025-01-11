import { loadStripe } from '@stripe/stripe-js';
import Constants from 'expo-constants';

let stripePromise: Promise<any> | null = null;

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(Constants.expoConfig?.extra?.stripePublishableKey);
  }
  return stripePromise;
}; 