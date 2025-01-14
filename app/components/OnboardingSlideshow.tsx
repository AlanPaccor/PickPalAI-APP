import React, { useState } from 'react';
import { StyleSheet, View, Dimensions, TouchableOpacity } from 'react-native';
import { ThemedText } from '../components/ThemedText';
import { ThemedView } from '../components/ThemedView';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');

const slides: Array<{
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
  description: string;
}> = [
  {
    icon: 'chart-line',
    title: 'Smart Predictions',
    description: 'Get AI-powered insights and predictions for your sports bets',
  },
  {
    icon: 'trending-up',
    title: 'Track Performance',
    description: 'Monitor your betting history and improve your success rate',
  },
  {
    icon: 'robot',
    title: 'AI Assistant',
    description: '24/7 AI betting assistant to help with your betting strategy',
  },
  {
    icon: 'bell',
    title: 'Stay Updated',
    description: 'Receive real-time alerts for the best betting opportunities',
  },
];

export function OnboardingSlideshow() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { t } = useTranslation();

  const goToNextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      router.push('/auth/register');
    }
  };

  const skipToRegister = () => {
    router.push('/auth/register');
  };

  return (
    <ThemedView style={styles.container}>
      <TouchableOpacity style={styles.skipButton} onPress={skipToRegister}>
        <ThemedText style={styles.skipText}>{t('Skip')}</ThemedText>
      </TouchableOpacity>

      <Animated.View 
        entering={FadeIn}
        key={currentSlide}
        style={styles.slideContent}
      >
        <MaterialCommunityIcons
          name={slides[currentSlide].icon}
          size={80}
          color="#0A84FF"
        />
        <ThemedText type="title" style={styles.title}>
          {t(slides[currentSlide].title)}
        </ThemedText>
        <ThemedText style={styles.description}>
          {t(slides[currentSlide].description)}
        </ThemedText>
      </Animated.View>

      <View style={styles.footer}>
        <View style={styles.pagination}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.paginationDot,
                currentSlide === index && styles.paginationDotActive,
              ]}
            />
          ))}
        </View>

        <TouchableOpacity style={styles.nextButton} onPress={goToNextSlide}>
          <ThemedText style={styles.nextButtonText}>
            {currentSlide === slides.length - 1 ? t('Get Started') : t('Next')}
          </ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000010',
  },
  skipButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1,
  },
  skipText: {
    color: '#0A84FF',
    fontSize: 16,
  },
  slideContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 40,
    marginBottom: 20,
  },
  description: {
    fontSize: 18,
    textAlign: 'center',
    opacity: 0.8,
  },
  footer: {
    padding: 20,
    paddingBottom: 40,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF40',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: '#0A84FF',
  },
  nextButton: {
    backgroundColor: '#0A84FF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
}); 