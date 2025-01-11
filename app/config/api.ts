const API_URL = 'https://oddsly-api-lovat.vercel.app';

interface CreatePaymentIntentOptions {
  trialPeriodDays?: number;
}

interface StripeSubscriptionResponse {
  subscriptionId: string;
  clientSecret: string;
}

export const createPaymentIntent = async (
  interval: 'month' | 'year',
  amount: number,
  options?: { trialPeriodDays?: number }
): Promise<StripeSubscriptionResponse> => {
  try {
    const requestData = {
      interval,
      amount,
      currency: 'usd',
      trialPeriodDays: options?.trialPeriodDays,
    };
    
    console.log('Sending request to create payment intent:', requestData);

    const response = await fetch(`${API_URL}/api/create-payment-intent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });

    console.log('Response status:', response.status);
    const data = await response.json();
    console.log('Response data:', data);

    if (!response.ok) {
      throw new Error(data.message || 'Failed to create payment intent');
    }

    if (!data.clientSecret || !data.subscriptionId) {
      console.error('Invalid response data:', data);
      throw new Error('Invalid response: Missing required fields');
    }

    return data;
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw error;
  }
}; 