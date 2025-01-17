import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { ThemedText } from '../components/ThemedText';
import { ThemedView } from '../components/ThemedView';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import { HowItWorks } from '../(slideshow)/how-it-works';
import { AIAnalytics } from '../(slideshow)/ai-analytics';
import { Compatibility } from '../(slideshow)/compatibility';
import { StartFree } from '../(slideshow)/start-free';

const slides = [
  {
    component: HowItWorks,
    title: 'How It Works',
  },
  {
    component: AIAnalytics,
    title: 'AI-Driven Analytics',
  },
  {
    component: Compatibility,
    title: 'Works Everywhere',
  },
  {
    component: StartFree,
    title: 'Start Free Today',
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

  const CurrentSlideComponent = slides[currentSlide].component;

  return (
    <ThemedView style={styles.container}>
      <TouchableOpacity style={styles.skipButton} onPress={skipToRegister}>
        <ThemedText style={styles.skipText}>{t('Skip')}</ThemedText>
      </TouchableOpacity>

      <Animated.View 
        entering={FadeIn}
        key={currentSlide}
        style={styles.slideContainer}
      >
        <CurrentSlideComponent />
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
  slideContainer: {
    flex: 1,
  },
  skipButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 1,
    padding: 8,
  },
  skipText: {
    color: '#0A84FF',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    padding: 20,
    paddingBottom: 50,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
  },
  paginationDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFFFFF20',
    marginHorizontal: 6,
  },
  paginationDotActive: {
    backgroundColor: '#0A84FF',
    transform: [{scale: 1.2}],
  },
  nextButton: {
    backgroundColor: '#000010',
    borderColor: '#1E90FF',
    borderWidth: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#0A84FF',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 18,
    letterSpacing: 0.5,
  },
}); 