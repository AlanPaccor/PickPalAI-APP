import { View, TouchableOpacity, StyleSheet, Platform, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useColorScheme } from 'react-native';
import Colors from '@/constants/Colors';
import { router } from 'expo-router';

interface PlanOption {
  name: string;
  price: string;
  features: string[];
  current?: boolean;
}

export default function EditPlanScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  const plans: PlanOption[] = [
    {
      name: 'Free',
      price: '$0/month',
      features: [
        '5 predictions per day',
        'Basic stats analysis',
        'Limited chat support',
      ],
      current: true,
    },
    {
      name: 'Pro',
      price: '$9.99/month',
      features: [
        'Unlimited predictions',
        'Advanced statistics',
        'Priority support',
        'Historical data access',
        'Custom alerts',
      ],
    },
    {
      name: 'Premium',
      price: '$19.99/month',
      features: [
        'Everything in Pro',
        'AI-powered insights',
        'Real-time updates',
        'Expert consultations',
        'Performance tracking',
        'Exclusive content',
      ],
    },
  ];

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Header */}
      <ThemedView style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <MaterialCommunityIcons 
            name="arrow-left" 
            size={24} 
            color={theme.tint}
          />
        </TouchableOpacity>
        <ThemedText type="title">Edit Plan</ThemedText>
      </ThemedView>

      {/* Current Plan Status */}
      <ThemedView style={styles.statusContainer}>
        <ThemedText type="defaultSemiBold">Current Plan: Free</ThemedText>
        <ThemedText style={styles.statusText}>
          Next billing date: N/A
        </ThemedText>
      </ThemedView>

      {/* Plan Options */}
      {plans.map((plan, index) => (
        <ThemedView key={index} style={styles.planContainer}>
          <ThemedView style={styles.planHeader}>
            <ThemedView>
              <ThemedText type="subtitle">{plan.name}</ThemedText>
              <ThemedText type="defaultSemiBold">{plan.price}</ThemedText>
            </ThemedView>
            {plan.current && (
              <ThemedView style={styles.currentPlanBadge}>
                <ThemedText style={styles.currentPlanText}>Current</ThemedText>
              </ThemedView>
            )}
          </ThemedView>

          <ThemedView style={styles.featuresList}>
            {plan.features.map((feature, featureIndex) => (
              <ThemedView key={featureIndex} style={styles.featureItem}>
                <MaterialCommunityIcons 
                  name="check-circle" 
                  size={20} 
                  color="#4CAF50"
                />
                <ThemedText>{feature}</ThemedText>
              </ThemedView>
            ))}
          </ThemedView>

          <TouchableOpacity 
            style={[
              styles.selectButton,
              plan.current ? styles.currentButton : null
            ]}
            disabled={plan.current}
          >
            <ThemedText style={styles.buttonText}>
              {plan.current ? 'Current Plan' : 'Select Plan'}
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000010',
  },
  contentContainer: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    marginTop: 60,
    marginBottom: 24,
  },
  backButton: {
    marginRight: 16,
    padding: 4,
  },
  statusContainer: {
    borderWidth: 1,
    borderColor: '#FFFFFF20',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    backgroundColor: '#00000010',
  },
  statusText: {
    opacity: 0.7,
    marginTop: 4,
  },
  planContainer: {
    borderWidth: 1,
    borderColor: '#FFFFFF20',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    backgroundColor: '#00000010',
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  currentPlanBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  currentPlanText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  featuresList: {
    gap: 12,
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  selectButton: {
    backgroundColor: '#0A84FF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  currentButton: {
    backgroundColor: '#4CAF50',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
}); 