import type { AppProps } from 'next/app';
import { AuthProvider } from '../hooks/useAuth';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <Elements stripe={stripePromise}>
        <Component {...pageProps} />
      </Elements>
    </AuthProvider>
  );
}

export default MyApp; 