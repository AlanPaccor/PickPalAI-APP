import Constants from 'expo-constants';

const ENV = {
  FIREBASE_API_KEY: Constants.expoConfig?.extra?.FIREBASE_API_KEY,
  FIREBASE_AUTH_DOMAIN: Constants.expoConfig?.extra?.FIREBASE_AUTH_DOMAIN,
  FIREBASE_PROJECT_ID: Constants.expoConfig?.extra?.FIREBASE_PROJECT_ID,
  FIREBASE_STORAGE_BUCKET: Constants.expoConfig?.extra?.FIREBASE_STORAGE_BUCKET,
  FIREBASE_MESSAGING_SENDER_ID: Constants.expoConfig?.extra?.FIREBASE_MESSAGING_SENDER_ID,
  FIREBASE_APP_ID: Constants.expoConfig?.extra?.FIREBASE_APP_ID,
  FIREBASE_MEASUREMENT_ID: Constants.expoConfig?.extra?.FIREBASE_MEASUREMENT_ID,
  STRIPE_PUBLISHABLE_KEY: Constants.expoConfig?.extra?.STRIPE_PUBLISHABLE_KEY,
};

export default ENV; 