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
  paymentIntentId?: string;
  subscriptionId?: string;
  paymentId?: string;
  customerId: string;
}

export const createPaymentIntent = async (params: PaymentIntentParams): Promise<PaymentResponse> => {
  try {
    console.log('Creating payment intent with params:', params);
    
    const url = `${API_URL}/create-payment-intent`;
    console.log('Making request to:', url);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(params),
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    const data = await response.json();
    console.log('Payment intent response:', data);

    if (data.error) {
      const errorMessage = typeof data.error === 'object' 
        ? data.error.message || 'Payment creation failed'
        : data.error;
      throw new Error(errorMessage);
    }
    
    if (!data.clientSecret) {
      throw new Error('Invalid response: Missing client secret');
    }

    return {
      clientSecret: data.clientSecret,
      paymentIntentId: data.paymentIntentId,
      subscriptionId: data.subscriptionId,
      paymentId: data.paymentId,
      customerId: data.customerId
    };
  } catch (error) {
    console.error('Error creating payment intent:', error);
    if (error instanceof Error) {
      throw new Error(`Payment creation failed: ${error.message}`);
    }
    throw error;
  }
};

export const cancelSubscriptionAPI = async (userId: string) => {
  try {
    console.log('Making cancel subscription API request for user:', userId);
    const response = await fetch(`${API_URL}/cancel-subscription`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });

    console.log('Cancel subscription API response status:', response.status);
    
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Invalid response format from server');
    }

    const data = await response.json();
    console.log('Cancel subscription API response data:', data);

    if (!response.ok) {
      throw new Error(data.error || 'Failed to cancel subscription');
    }

    return data;
  } catch (error) {
    console.error('Error in cancelSubscriptionAPI:', error);
    if (error instanceof SyntaxError) {
      throw new Error('Invalid response from server');
    }
    throw error;
  }
}; 