import Constants from 'expo-constants';

const extra = Constants.expoConfig?.extra ?? {};

// OpenAI
export const OPENAI_API_KEY = extra.OPENAI_API_KEY as string;

// Firebase
export const FIREBASE_CONFIG = {
  apiKey: extra.FIREBASE_API_KEY as string,
  authDomain: extra.FIREBASE_AUTH_DOMAIN as string,
  projectId: extra.FIREBASE_PROJECT_ID as string,
  storageBucket: extra.FIREBASE_STORAGE_BUCKET as string,
  messagingSenderId: extra.FIREBASE_MESSAGING_SENDER_ID as string,
  appId: extra.FIREBASE_APP_ID as string,
  measurementId: extra.FIREBASE_MEASUREMENT_ID as string,
};

// Stripe
export const STRIPE_PUBLISHABLE_KEY = 'pk_test_51QfVCFAYEunyQBWeY8QhYyyrynJt4bsCQ3abUD4OigwVcLmgf4gkWwFDpQeLwoaAQGK8PXy3vdvA2kWHWuARmgd800O6fdJvkp';
export const STRIPE_SECRET_KEY = 'sk_test_51QfVCFAYEunyQBWeaybAlqQZD5irnAXYvXeRnyN5jA62BZGnHcy5cBj6qzrebi16tvbckbcpF2awTL4Fj0lOKvYI002x7DwUO3';

// Google Cloud Vision
export const GOOGLE_CLOUD_VISION_API_KEY = extra.GOOGLE_CLOUD_VISION_API_KEY as string;

// Default export for Expo Router
export default {
  OPENAI_API_KEY,
  FIREBASE_CONFIG,
  STRIPE_PUBLISHABLE_KEY,
  STRIPE_SECRET_KEY,
  GOOGLE_CLOUD_VISION_API_KEY,
}; 