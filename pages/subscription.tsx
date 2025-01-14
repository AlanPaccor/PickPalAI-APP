import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { useAuth } from '../hooks/useAuth';

// Make sure you have this environment variable set
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

interface CheckoutFormProps {
  // Add any props if needed
}

const CheckoutForm: React.FC<CheckoutFormProps> = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!user) {
      setError('Please sign in to continue');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/create-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.uid,
          amount: 150, // $1.50 in cents
          productId: process.env.STRIPE_PRODUCT_ID_TRIAL
        }),
      });

      const { sessionId } = await response.json();
      const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
      await stripe?.redirectToCheckout({ sessionId });
    } catch (err) {
      setError('An error occurred while processing your payment.');
      console.error('Payment error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">2-Day Trial Access</h2>
      <p className="mb-2">Get 2 days of full access for just $1.50</p>
      <p className="mb-4">One-time payment, no recurring charges</p>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">
          Card Details
        </label>
        <div className="p-3 border rounded-md">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
              },
            }}
          />
        </div>
      </div>

      {error && (
        <div className="text-red-500 mb-4">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {loading ? 'Processing...' : 'Start Trial ($1.50)'}
      </button>
    </form>
  );
};

const Subscription: React.FC = () => {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm />
    </Elements>
  );
};

export default Subscription; 