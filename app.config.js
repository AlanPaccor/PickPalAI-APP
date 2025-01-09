import 'dotenv/config';

export default {
  expo: {
    name: "Oddsly",
    slug: "Oddsly",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "myapp",
    userInterfaceStyle: "dark",
    splash: {
      image: "./assets/images/splash.png",
      resizeMode: "contain",
      backgroundColor: "#1A1A1A"
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
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#1A1A1A"
      },
      userInterfaceStyle: "dark"
    },
    web: {
      favicon: "./assets/images/favicon.png"
    },
    extra: {
      GOOGLE_CLOUD_VISION_API_KEY: process.env.GOOGLE_CLOUD_VISION_API_KEY,
      OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    },
    plugins: [
      "expo-router"
    ]
  }
}; 