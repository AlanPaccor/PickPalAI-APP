import { AuthProvider } from './context/AuthContext';
import { StripeProvider } from '@stripe/stripe-react-native';
import { initializeStripe } from './config/stripe';
import { useEffect } from 'react';
import ENV from './config/env';

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