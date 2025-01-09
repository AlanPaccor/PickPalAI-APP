import { StyleSheet, TouchableOpacity, View, ScrollView, Alert } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { db, auth } from '../config/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useState } from 'react';

interface PlanFeature {
  icon: string;
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
}

export default function SubscriptionScreen() {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);

  const plans: SubscriptionPlan[] = [
    {
      name: 'Free Trial',
      price: '$0',
      interval: '2 days',
      features: [
        { icon: 'chart-line', text: 'Unlimited predictions' },
        { icon: 'robot-outline', text: 'Advanced AI analysis' },
        { icon: 'chart-timeline-variant', text: 'Full stats access' },
        { icon: 'bell-outline', text: 'Priority notifications' },
        { icon: 'star', text: 'Expert picks' },
        { icon: 'chart-bell-curve', text: 'Trend analysis' },
        { icon: 'information', text: 'Converts to $15/month after trial' },
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

      const now = new Date();
      const subscription: UserSubscription = {
        plan: plan.name === 'Free Trial' ? 'Monthly' : (plan.name as 'Monthly' | 'Annual'),
        startDate: now,
        trialEndDate: plan.name === 'Free Trial' ? new Date(now.getTime() + (2 * 24 * 60 * 60 * 1000)) : now,
        status: plan.name === 'Free Trial' ? 'trial' : 'active',
      };

      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        subscription,
      }, { merge: true });

      if (plan.name === 'Free Trial') {
        Alert.alert(
          'Trial Started',
          'Your 2-day free trial has started. It will automatically convert to a monthly plan ($15/month) unless cancelled.',
          [{ text: 'OK', onPress: () => router.replace('/(tabs)') }]
        );
      } else {
        Alert.alert(
          'Payment Required',
          'This would typically open a payment flow. For now, we\'ll proceed as if payment was successful.',
          [{ text: 'OK', onPress: () => router.replace('/(tabs)') }]
        );
      }
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to process request. Please try again.',
        [{ text: 'OK' }]
      );
      console.error('Subscription error:', error);
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
                  <ThemedText style={styles.popularText}>Save 15%</ThemedText>
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
    backgroundColor: '#00000010',
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