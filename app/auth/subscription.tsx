import { StyleSheet, TouchableOpacity, View, ScrollView, Alert } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { db, auth } from '../config/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useState } from 'react';
import { useStripe } from '@stripe/stripe-react-native';
import { createPaymentIntent } from '../config/api';

type AllowedIcons = 'chart-line' | 'robot-outline' | 'chart-timeline-variant' | 
  'bell-outline' | 'star' | 'chart-bell-curve' | 'information' | 'percent';

interface PlanFeature {
  icon: AllowedIcons;
  text: string;
}

interface SubscriptionPlan {
  name: string;
  price: string;
  originalPrice?: string;
  interval: string;
  features: PlanFeature[];
  popular?: boolean;
  trial?: string;
}

interface UserSubscription {
  plan: 'Monthly' | 'Annual';
  startDate: Date;
  trialEndDate: Date;
  status: 'trial' | 'active' | 'cancelled' | 'expired';
  stripeSubscriptionId?: string;
}

interface StripeSubscriptionResponse {
  subscriptionId: string;
  clientSecret: string;
}

export default function SubscriptionScreen() {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  const stripe = useStripe();

  const plans: SubscriptionPlan[] = [
    {
      name: 'Trial Plan',
      price: '$1.50',
      interval: '2 days',
      popular: true,
      features: [
        { icon: 'percent', text: 'Special trial offer - 90% off!' },
        { icon: 'chart-line', text: 'Unlimited predictions' },
        { icon: 'robot-outline', text: 'Advanced AI analysis' },
        { icon: 'chart-timeline-variant', text: 'Full stats access' },
        { icon: 'bell-outline', text: 'Priority notifications' },
        { icon: 'star', text: 'Expert picks' },
        { icon: 'chart-bell-curve', text: 'Trend analysis' },
      ],
    },
    {
      name: 'Monthly',
      price: '$15',
      interval: 'month',
      features: [
        { icon: 'chart-line', text: 'Unlimited predictions' },
        { icon: 'robot-outline', text: 'Advanced AI analysis' },
        { icon: 'chart-timeline-variant', text: 'Full stats access' },
        { icon: 'bell-outline', text: 'Priority notifications' },
        { icon: 'star', text: 'Expert picks' },
        { icon: 'chart-bell-curve', text: 'Trend analysis' },
      ],
    },
    {
      name: 'Annual',
      price: '$153',
      originalPrice: '$180',
      interval: 'year',
      popular: true,
      features: [
        { icon: 'percent', text: '15% discount' },
        { icon: 'chart-line', text: 'Unlimited predictions' },
        { icon: 'robot-outline', text: 'Advanced AI analysis' },
        { icon: 'chart-timeline-variant', text: 'Full stats access' },
        { icon: 'bell-outline', text: 'Priority notifications' },
        { icon: 'star', text: 'Expert picks' },
        { icon: 'chart-bell-curve', text: 'Trend analysis' },
      ],
    },
  ];

  const handleSelectPlan = async (plan: SubscriptionPlan) => {
    if (loading) return;
    setLoading(true);

    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('No user found');
      }

      if (plan.name === 'Trial Plan') {
        try {
          console.log('Creating trial payment...');
          const response = await createPaymentIntent({
            amount: 150, // $1.50 in cents
            isTrialPeriod: true,
            userId: user.uid,
            email: user.email
          });
          
          if (!response?.clientSecret) {
            throw new Error('Failed to create payment: Missing client secret');
          }

          // Initialize payment sheet
          const { error: initError } = await stripe.initPaymentSheet({
            paymentIntentClientSecret: response.clientSecret,
            merchantDisplayName: 'Oddsly',
            defaultBillingDetails: {
              email: user.email || undefined,
            },
            style: 'automatic'
          });

          if (initError) {
            console.error('Payment sheet init error:', initError);
            throw new Error(initError.message);
          }

          // Present payment sheet
          const { error: presentError } = await stripe.presentPaymentSheet();
          
          if (presentError) {
            if (presentError.code === 'Canceled') {
              return; // Just return if user cancelled
            }
            throw new Error(presentError.message);
          }

          // Add the plan details directly after successful payment
          try {
            const endDate = new Date();
            if (plan.name === 'Trial Plan') {
              endDate.setDate(endDate.getDate() + 2);
            } else if (plan.name === 'Monthly') {
              endDate.setMonth(endDate.getMonth() + 1);
            } else {
              endDate.setFullYear(endDate.getFullYear() + 1);
            }

            const now = new Date();
            const timestamp = now.toISOString();

            await setDoc(doc(db, 'users', user.uid), {
              email: user.email,
              plan: {
                type: plan.name === 'Trial Plan' ? 'trial' : plan.name.toLowerCase(),
                status: 'active',
                startDate: timestamp,
                endDate: endDate.toISOString(),
                paymentId: response.paymentIntentId,
                amount: 150
              },
              payments: [{
                id: response.paymentIntentId,
                amount: 150,
                date: timestamp,
                type: plan.name === 'Trial Plan' ? 'trial' : plan.name.toLowerCase(),
                status: 'succeeded'
              }],
              subscription: {
                history: [{
                  type: plan.name === 'Trial Plan' ? 'trial' : plan.name.toLowerCase(),
                  startDate: timestamp,
                  endDate: endDate.toISOString(),
                  status: 'active',
                  paymentId: response.paymentIntentId,
                  amount: 150
                }],
                current: {
                  type: plan.name === 'Trial Plan' ? 'trial' : plan.name.toLowerCase(),
                  startDate: timestamp,
                  endDate: endDate.toISOString(),
                  status: 'active',
                  paymentId: response.paymentIntentId,
                  amount: 150
                }
              },
              updatedAt: timestamp
            }, { merge: true });

            Alert.alert(
              plan.name === 'Trial Plan' ? 'Access Granted!' : 'Thank You!',
              plan.name === 'Trial Plan' 
                ? 'Your 2-day access has been activated. Enjoy using Oddsly!'
                : `Welcome to Oddsly ${plan.name} Plan! Your payment was successful.`,
              [{ text: 'Start Using Oddsly', onPress: () => router.replace('/(tabs)') }]
            );

          } catch (error) {
            console.error('Error updating user data:', error);
            Alert.alert(
              'Error',
              'Payment successful but failed to activate plan. Please contact support.'
            );
          }

        } catch (error) {
          console.error('Payment error:', error);
          Alert.alert(
            'Payment Failed',
            error instanceof Error ? error.message : 'Failed to process payment'
          );
        }
      } else {
        // Regular paid plans
        const amount = plan.name === 'Monthly' ? 1500 : 15300;
        const interval = plan.name === 'Annual' ? 'year' : 'month';
        
        try {
          console.log('Creating regular payment...');
          const response = await createPaymentIntent({
            amount,
            interval,
            userId: user.uid,
            email: user.email
          });
          
          if (!response?.clientSecret) {
            throw new Error('Failed to create payment: Missing client secret');
          }

          // Initialize payment sheet
          const { error: initError } = await stripe.initPaymentSheet({
            paymentIntentClientSecret: response.clientSecret,
            merchantDisplayName: 'Oddsly',
            defaultBillingDetails: {
              email: user.email || undefined,
            },
            style: 'automatic'
          });

          if (initError) {
            console.error('Payment sheet init error:', initError);
            throw new Error(initError.message);
          }

          // Present payment sheet
          const { error: presentError } = await stripe.presentPaymentSheet();
          
          if (presentError) {
            if (presentError.code === 'Canceled') {
              return; // Just return if user cancelled
            }
            throw new Error(presentError.message);
          }

          // Add the plan details directly after successful payment
          try {
            const endDate = new Date();
            if (plan.name === 'Trial Plan') {
              endDate.setDate(endDate.getDate() + 2);
            } else if (plan.name === 'Monthly') {
              endDate.setMonth(endDate.getMonth() + 1);
            } else {
              endDate.setFullYear(endDate.getFullYear() + 1);
            }

            const now = new Date();
            const timestamp = now.toISOString();

            await setDoc(doc(db, 'users', user.uid), {
              email: user.email,
              plan: {
                type: plan.name === 'Trial Plan' ? 'trial' : plan.name.toLowerCase(),
                status: 'active',
                startDate: timestamp,
                endDate: endDate.toISOString(),
                paymentId: response.paymentId || response.paymentIntentId,
                amount: amount
              },
              payments: [{
                id: response.paymentId || response.paymentIntentId,
                amount: amount,
                date: timestamp,
                type: plan.name === 'Trial Plan' ? 'trial' : plan.name.toLowerCase(),
                status: 'succeeded'
              }],
              subscription: {
                history: [{
                  type: plan.name === 'Trial Plan' ? 'trial' : plan.name.toLowerCase(),
                  startDate: timestamp,
                  endDate: endDate.toISOString(),
                  status: 'active',
                  paymentId: response.paymentId || response.paymentIntentId,
                  amount: amount
                }],
                current: {
                  type: plan.name === 'Trial Plan' ? 'trial' : plan.name.toLowerCase(),
                  startDate: timestamp,
                  endDate: endDate.toISOString(),
                  status: 'active',
                  paymentId: response.paymentId || response.paymentIntentId,
                  amount: amount
                }
              },
              updatedAt: timestamp
            }, { merge: true });

            Alert.alert(
              'Thank You!',
              `Welcome to Oddsly ${plan.name} Plan! Your subscription will automatically renew ${
                plan.name === 'Monthly' ? 'monthly' : 'yearly'
              } until cancelled.`,
              [{ text: 'Start Using Oddsly', onPress: () => router.replace('/(tabs)') }]
            );

          } catch (error) {
            console.error('Error updating user data:', error);
            Alert.alert(
              'Error',
              'Payment successful but failed to activate plan. Please contact support.'
            );
          }

        } catch (error) {
          console.error('Payment error:', error);
          Alert.alert(
            'Payment Failed',
            error instanceof Error ? error.message : 'Failed to process payment'
          );
        }
      }

    } catch (error) {
      console.error('Subscription error:', error);
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'An error occurred'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 20 }
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View 
          style={styles.content}
          entering={FadeIn.duration(500)}
        >
          <ThemedText type="title" style={styles.title}>
            Choose Your Plan
          </ThemedText>
          
          <ThemedText style={styles.subtitle}>
            Select the plan that best fits your needs
          </ThemedText>

          {plans.map((plan, index) => (
            <Animated.View
              key={plan.name}
              entering={FadeIn.delay(300 + index * 200)}
              style={[
                styles.planCard,
                plan.popular && styles.popularCard
              ]}
            >
              {plan.popular && (
                <View style={styles.popularBadge}>
                  <ThemedText style={styles.popularText}>
                    {plan.name === 'Trial Plan' ? '90% Off' : 'Save 15%'}
                  </ThemedText>
                </View>
              )}

              <ThemedText type="subtitle" style={styles.planName}>
                {plan.name}
              </ThemedText>
              
              <View style={styles.priceContainer}>
                <ThemedText style={styles.price}>{plan.price}</ThemedText>
                <ThemedText style={styles.interval}>/{plan.interval}</ThemedText>
              </View>

              {plan.originalPrice && (
                <ThemedText style={styles.originalPrice}>
                  Original price: {plan.originalPrice}
                </ThemedText>
              )}

              {plan.trial && (
                <ThemedText style={styles.trialText}>
                  {plan.trial} free trial
                </ThemedText>
              )}

              <View style={styles.featuresContainer}>
                {plan.features.map((feature, idx) => (
                  <View key={idx} style={styles.featureItem}>
                    <MaterialCommunityIcons
                      name={feature.icon}
                      size={20}
                      color="#0A84FF"
                    />
                    <ThemedText style={styles.featureText}>
                      {feature.text}
                    </ThemedText>
                  </View>
                ))}
              </View>

              <TouchableOpacity
                style={[
                  styles.selectButton,
                  plan.popular && styles.popularButton,
                  loading && styles.buttonDisabled
                ]}
                onPress={() => handleSelectPlan(plan)}
                disabled={loading}
              >
                <ThemedText style={styles.buttonText}>
                  {loading ? 'Processing...' : `Select ${plan.name}`}
                </ThemedText>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </Animated.View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000010',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 32,
  },
  content: {
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: 32,
  },
  planCard: {
    borderWidth: 1,
    borderColor: '#FFFFFF20',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    backgroundColor: '#000010',
  },
  popularCard: {
    borderColor: '#0A84FF',
    backgroundColor: '#0A84FF10',
  },
  popularBadge: {
    position: 'absolute',
    top: -12,
    right: 24,
    backgroundColor: '#0A84FF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  planName: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 24,
  },
  price: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  interval: {
    fontSize: 16,
    opacity: 0.7,
  },
  featuresContainer: {
    gap: 16,
    marginBottom: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureText: {
    opacity: 0.9,
  },
  selectButton: {
    backgroundColor: '#FFFFFF20',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  popularButton: {
    backgroundColor: '#0A84FF',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  originalPrice: {
    fontSize: 14,
    opacity: 0.7,
    textDecorationLine: 'line-through',
    marginBottom: 8,
  },
  trialText: {
    fontSize: 14,
    color: '#0A84FF',
    fontWeight: '600',
    marginBottom: 16,
  },
}); 