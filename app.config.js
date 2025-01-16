import 'dotenv/config';

export default {
  expo: {
    name: "BetSenseAI",
    slug: "BetSenseAI",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/app/icon.png",
    scheme: "myapp",
    userInterfaceStyle: "dark",
    splash: {
      image: "./assets/app/icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true,
      userInterfaceStyle: "dark"
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/app/icon.png",
        backgroundColor: "#1A1A1A"
      },
      userInterfaceStyle: "dark",
      package: "com.betsenseai.app",
      compileSdkVersion: 34,
      targetSdkVersion: 34,
      buildToolsVersion: "34.0.0"
    },
    web: {
      favicon: "./assets/images/favicon.png"
    },
    extra: {
      OPENAI_API_KEY: process.env.OPENAI_API_KEY ?? null,
      FIREBASE_API_KEY: process.env.FIREBASE_API_KEY,
      FIREBASE_AUTH_DOMAIN: process.env.FIREBASE_AUTH_DOMAIN,
      FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
      FIREBASE_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET,
      FIREBASE_MESSAGING_SENDER_ID: process.env.FIREBASE_MESSAGING_SENDER_ID,
      FIREBASE_APP_ID: process.env.FIREBASE_APP_ID,
      FIREBASE_MEASUREMENT_ID: process.env.FIREBASE_MEASUREMENT_ID,
      STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY,
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
      GOOGLE_CLOUD_VISION_API_KEY: process.env.GOOGLE_CLOUD_VISION_API_KEY ?? null,
      firebaseApiKey: process.env.FIREBASE_API_KEY,
      firebaseAuthDomain: process.env.FIREBASE_AUTH_DOMAIN,
      firebaseProjectId: process.env.FIREBASE_PROJECT_ID,
      firebaseStorageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      firebaseMessagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
      firebaseAppId: process.env.FIREBASE_APP_ID,
      stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
      eas: {
        projectId: "94ab4d25-a270-4cba-97eb-3fc1bfd720ff"
      }
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          enabled: true
        }
      ]
    ],
    sdkVersion: "52.0.0"
  }
}; 