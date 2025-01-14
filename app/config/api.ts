const API_URL = 'https://oddsly-api-lovat.vercel.app/api';

interface CreatePaymentIntentOptions {
  trialPeriodDays?: number;
}

interface StripeSubscriptionResponse {
  subscriptionId: string;
  clientSecret: string;
}

interface PaymentIntentParams {
  amount: number;
  isTrialPeriod?: boolean;
  userId: string;
  email?: string;
  interval?: 'month' | 'year';
}

interface PaymentResponse {
  clientSecret: string;
  paymentIntentId: string;
}

export const createPaymentIntent = async (params: PaymentIntentParams): Promise<PaymentResponse> => {
  try {
    console.log('Creating payment intent with params:', params);
    
    const response = await fetch(`${API_URL}/create-payment-intent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    const data = await response.json();
    console.log('Payment intent response:', data);

    if (!response.ok) {
      throw new Error(data.message || 'Failed to create payment intent');
    }
    
    if (!data.clientSecret) {
      throw new Error('Invalid response: Missing client secret');
    }

    return data;
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw error;
  }
}; 