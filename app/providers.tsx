import { AuthProvider } from './context/AuthContext';
import { StripeProvider } from '@stripe/stripe-react-native';
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
  return (
    <StripeProvider
      publishableKey={ENV.STRIPE_PUBLISHABLE_KEY}
      merchantIdentifier="merchant.com.oddsly"
    >
      {children}
    </StripeProvider>
  );
};

export default Providers; 