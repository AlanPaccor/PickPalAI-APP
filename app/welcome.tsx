import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from './components/ThemedText';
import { ThemedView } from './components/ThemedView';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { MaterialCommunityIcons as IconType } from '@expo/vector-icons';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { OnboardingSlideshow } from './components/OnboardingSlideshow';

export default function WelcomeScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const handleGetStarted = () => {
    router.push('/(slideshow)');
  };

  return (
    <ThemedView style={styles.container}>
      <Animated.View style={styles.headerSection}>
        <MaterialCommunityIcons name="chart-line" size={80} color="#0A84FF" />
        <ThemedText type="title" style={styles.title}>
          {t('Your Sports Betting Assistant')}
        </ThemedText>
      </Animated.View>

      <Animated.View style={styles.featuresSection}>
        <FeatureItem 
          icon="chart-bell-curve" 
          text={t('AI-Powered Predictions & Analysis')}
        />
        <FeatureItem 
          icon="chart-timeline-variant" 
          text={t('Track Your Betting Performance')}
        />
        <FeatureItem 
          icon="robot-outline" 
          text={t('24/7 AI Betting Assistant')}
        />
        <FeatureItem 
          icon="bell-outline" 
          text={t('Real-time Betting Alerts')}
        />
      </Animated.View>

      <Animated.View style={[styles.buttonSection, { marginBottom: insets.bottom }]}>
        <TouchableOpacity 
          style={styles.registerButton}
          onPress={handleGetStarted}
        >
          <ThemedText style={styles.buttonText}>
            {t('Get Started Free')}
          </ThemedText>
        </TouchableOpacity>
      </Animated.View>
    </ThemedView>
  );
}

function FeatureItem({ icon, text }: { 
  icon: keyof typeof IconType.glyphMap, 
  text: string 
}) {
  return (
    <View style={styles.featureItem}>
      <MaterialCommunityIcons 
        name={icon} 
        size={24} 
        color="#0A84FF" 
      />
      <ThemedText style={styles.featureText}>
        {text}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000010',
    paddingHorizontal: 20,
  },
  headerSection: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    paddingTop: 140,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  featuresSection: {
    justifyContent: 'center',
    gap: 20,
    marginTop: 30,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: '#000010',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFFFFF20',
  },
  featureText: {
    fontSize: 16,
    opacity: 0.9,
  },
  buttonSection: {
    gap: 16,
    marginTop: 'auto',
    paddingVertical: 20,
  },
  registerButton: {
    backgroundColor: '#0A84FF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  loginButton: {
    alignItems: 'center',
  },
  loginText: {
    color: '#0A84FF',
    fontSize: 16,
  },
}); 