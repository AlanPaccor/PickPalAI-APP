import { AuthProvider } from './context/AuthContext';
import { StripeProvider } from '@stripe/stripe-react-native';
import { initializeStripe } from './config/stripe';
import { useEffect } from 'react';
import ENV from './config/env';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './i18n/en';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: en,
      },
    },
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

const Providers = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    initializeStripe();
  }, []);

  return (
    <StripeProvider
      publishableKey={ENV.STRIPE_PUBLISHABLE_KEY || ''}
      merchantIdentifier="merchant.com.sportsbetapp"
      urlScheme="sportsbetapp"
    >
      <AuthProvider>
        {children}
      </AuthProvider>
    </StripeProvider>
  );
};

export default Providers; 