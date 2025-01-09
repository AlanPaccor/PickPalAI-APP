import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';

const resources = {
  en: {
    translation: {
      // General
      back: 'Back',
      cancel: 'Cancel',
      confirm: 'Confirm',
      save: 'Save',
      delete: 'Delete',
      
      // Account
      accountSettings: 'Account Settings',
      billingAndPayments: 'Billing & Payments',
      bettingPreferences: 'Betting Preferences',
      notifications: 'Notifications',
      preferencesAndPrivacy: 'Preferences & Privacy',
      
      // Stats
      betsAnalyzed: 'Bets Analyzed',
      winRate: 'Win Rate',
      totalProfit: 'Total Profit',
      
      // Auth
      login: 'Login',
      register: 'Register',
      email: 'Email',
      password: 'Password',
      noAccount: "Don't have an account?",
      
      // Language
      language: 'Language',
      selectLanguage: 'Select Language',
      languageChangeNote: 'Changes will be applied immediately',
      
      // Welcome Screen
      welcomeTitle: 'Welcome to PredictPro',
      createAccount: 'Create Account',
      alreadyHaveAccount: 'Already have an account? Login',
      featureAIPredictions: 'Get AI-powered sports predictions',
      featureTracking: 'Track performance in real-time',
      featureAIChat: 'Chat with our AI assistant',
      featureNotifications: 'Receive instant notifications',
      
      // Scan Screen
      uploadTicket: 'Upload Ticket',
      uploadSubtitle: 'Upload a screenshot of your betting ticket to get instant analysis',
      tapToUpload: 'Tap to Upload Screenshot',
      supportedFormats: 'Supports PNG, JPG formats',
      howItWorks: 'How it works:',
      step1: 'Take a screenshot of your betting ticket',
      step2: 'Upload the screenshot here',
      step3: 'Get instant analysis and insights',
      processing: 'Processing...',
      
      // Game Details
      gameDetails: 'Game Details',
      predictionDetails: 'Prediction Details',
      gameInformation: 'Game Information',
      aiConfidence: 'AI Confidence: {{percent}}%',
      gameTime: 'Game Time',
      matchup: 'Matchup',
      getAIAnalysis: 'Get AI Analysis',
      
      // Navigation
      home: 'Home',
      explore: 'Explore',
      scan: 'Scan',
      account: 'Account',
      
      // Search
      searchPlaceholder: 'Search players, teams...',
      
      // Home Tab
      recentBets: 'Recent Bets',
      topPicks: 'Top Picks',
      trendingBets: 'Trending Bets',
      viewAll: 'View All',
      todaysPicks: "Today's Picks",
      
      // Explore Tab
      popular: 'Popular 🔥',
      trending: 'Trending 📈',
      bestValue: 'Best Value 💎',
      passingYards: 'Passing Yards 🏈',
      receivingYards: 'Receiving Yards 🏃',
      rushingYards: 'Rushing Yards 🏃',
      points: 'Points 🏀',
      rebounds: 'Rebounds 🏀',
      assists: 'Assists 🏀',
      goals: 'Goals ⚽',
      shots: 'Shots on Goal 🥅',
      hits: 'Hits ⚾',
      strikeouts: 'Strikeouts ⚾',
      noResults: 'No results found',
      loading: 'Loading...',
      noGames: 'No games available',
      
      // Assistant/Chat Tab
      chatPlaceholder: 'Type your message...',
      analyzing: 'Analyzing...',
      aiTyping: 'AI is typing...',
      sendMessage: 'Send Message',
      
      // Scan Tab
      scanTicket: 'Scan Ticket',
      uploadFromGallery: 'Upload from Gallery',
      takeNewPhoto: 'Take New Photo',
      processingImage: 'Processing image...',
      
      // Sports
      nfl: 'NFL',
      nba: 'NBA',
      mlb: 'MLB',
      nhl: 'NHL',
      soccer: 'Soccer',
    }
  },
  es: {
    translation: {
      // General
      back: 'Volver',
      cancel: 'Cancelar',
      confirm: 'Confirmar',
      save: 'Guardar',
      delete: 'Eliminar',
      
      // Account
      accountSettings: 'Ajustes de Cuenta',
      billingAndPayments: 'Facturación y Pagos',
      bettingPreferences: 'Preferencias de Apuestas',
      notifications: 'Notificaciones',
      preferencesAndPrivacy: 'Preferencias y Privacidad',
      
      // Stats
      betsAnalyzed: 'Apuestas Analizadas',
      winRate: 'Tasa de Victoria',
      totalProfit: 'Beneficio Total',
      
      // Auth
      login: 'Iniciar Sesión',
      register: 'Registrarse',
      email: 'Correo',
      password: 'Contraseña',
      noAccount: '¿No tienes cuenta?',
      
      // Language
      language: 'Idioma',
      selectLanguage: 'Seleccionar Idioma',
      languageChangeNote: 'Los cambios se aplicarán inmediatamente',
    }
  }
};

const LANGUAGE_PERSISTENCE_KEY = 'user-language';

export const initializeI18n = async () => {
  const savedLanguage = await AsyncStorage.getItem(LANGUAGE_PERSISTENCE_KEY);
  
  await i18n
    .use(initReactI18next)
    .init({
      resources,
      lng: savedLanguage || Localization.locale.split('-')[0] || 'en',
      fallbackLng: 'en',
      interpolation: {
        escapeValue: false
      },
    });

  return i18n;
};

export const changeLanguage = async (language: string) => {
  await AsyncStorage.setItem(LANGUAGE_PERSISTENCE_KEY, language);
  await i18n.changeLanguage(language);
};

export default i18n; 