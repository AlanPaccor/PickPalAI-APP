const API_URL = 'https://oddsly-api-lovat.vercel.app/api';

export const createPaymentIntent = async (amount: number): Promise<string> => {
  try {
    const response = await fetch(`${API_URL}/create-payment-intent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount,
        currency: 'usd'
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.details || 'Failed to create payment intent');
    }

    const { clientSecret } = await response.json();
    return clientSecret;
  } catch (error) {
    console.error('Create payment intent error:', error);
    throw error;
  }
}; 