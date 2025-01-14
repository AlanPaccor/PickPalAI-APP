import { buffer } from 'micro';
import Stripe from 'stripe';
import { db } from '../../config/firebase';
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-08-16',
});

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  const buf = await buffer(req);
  const sig = req.headers['stripe-signature']!;

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      buf,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('Webhook error:', err);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    const userId = paymentIntent.metadata.userId;
    const type = paymentIntent.metadata.type;
    const interval = paymentIntent.metadata.interval;

    try {
      // Get existing user data
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      const userData = userDoc.data() || {};

      // Calculate plan duration based on type
      const startDate = new Date();
      const endDate = new Date();
      
      if (type === 'trial') {
        endDate.setDate(endDate.getDate() + 2); // 2-day trial
      } else {
        // Regular plans
        if (interval === 'month') {
          endDate.setMonth(endDate.getMonth() + 1);
        } else if (interval === 'year') {
          endDate.setFullYear(endDate.getFullYear() + 1);
        }
      }

      // Update user document with plan information
      await setDoc(userRef, {
        ...userData,
        email: paymentIntent.receipt_email,
        plan: {
          type: type === 'trial' ? 'trial' : interval,
          status: 'active',
          startDate: serverTimestamp(),
          endDate: endDate,
          paymentId: paymentIntent.id,
          amount: paymentIntent.amount,
        },
        payments: [
          ...(userData.payments || []),
          {
            id: paymentIntent.id,
            amount: paymentIntent.amount,
            date: serverTimestamp(),
            type: type === 'trial' ? 'trial' : interval,
            status: 'succeeded'
          }
        ],
        subscription: {
          history: [
            ...(userData.subscription?.history || []),
            {
              type: type === 'trial' ? 'trial' : interval,
              startDate: serverTimestamp(),
              endDate: endDate,
              status: 'active',
              paymentId: paymentIntent.id,
              amount: paymentIntent.amount
            }
          ],
          current: {
            type: type === 'trial' ? 'trial' : interval,
            startDate: serverTimestamp(),
            endDate: endDate,
            status: 'active',
            paymentId: paymentIntent.id,
            amount: paymentIntent.amount
          }
        },
        updatedAt: serverTimestamp()
      }, { merge: true });

      console.log(`Successfully updated user ${userId} with new plan details`);

    } catch (error) {
      console.error('Error updating user data:', error);
      // Still return 200 to Stripe but log the error
      console.error(`Failed to update user ${userId} in Firestore:`, error);
    }
  }

  res.json({ received: true });
} 