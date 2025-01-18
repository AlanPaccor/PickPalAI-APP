import { StyleSheet, TouchableOpacity, View, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { ThemedText } from './components/ThemedText';
import { ThemedView } from './components/ThemedView';
import { router } from 'expo-router';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Video, ResizeMode } from 'expo-av';
import * as Notifications from 'expo-notifications';

export default function WelcomeScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const handleGetStarted = () => {
    router.push('/(slideshow)');
  };

  const schedulePushNotification = async () => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Welcome! 👋",
        body: "Thanks for using our app!",
        data: { data: 'goes here' },
      },
      trigger: { seconds: 2 },
    });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <ThemedView style={styles.container}>
          <Animated.View 
            style={styles.headerSection}
          >
            <Video
              source={require('../assets/app/landingIcon.mp4')}
              style={styles.video}
              shouldPlay
              isLooping
              resizeMode={ResizeMode.CONTAIN}
            />
            <View style={styles.titleWrapper}>
              <ThemedText type="title" style={styles.title}>
                {t('PickPal')} <ThemedText type="title" style={styles.aiText}>AI</ThemedText>
              </ThemedText>
              <ThemedText style={styles.subtitle}>
                {t('Your Intelligent Betting Companion')}
              </ThemedText>
            </View>
          </Animated.View>

          <Animated.View 
            entering={FadeIn.duration(1000).delay(400)}
            style={[styles.buttonSection, { marginBottom: insets.bottom }]}
          >
            <TouchableOpacity 
              style={styles.registerButton}
              onPress={handleGetStarted}
            >
              <ThemedText style={styles.buttonText}>
                {t('Get Started')}
              </ThemedText>
            </TouchableOpacity>
          </Animated.View>
        </ThemedView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000010',
    paddingHorizontal: 24,
  },
  headerSection: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 32,
    paddingTop: 150,
  },
  video: {
    width: 200,
    height: 200,
    backgroundColor: '#000010',
  },
  titleWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  title: {
    fontSize: 44,
    fontWeight: '700',
    textAlign: 'center',
    color: '#FFFFFF',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(30, 144, 255, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  aiText: {
    color: '#1E90FF',
    fontWeight: '800',
    textShadowColor: '#1E90FF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 25,
  },
  subtitle: {
    fontSize: 17,
    color: '#FFFFFF80',
    textAlign: 'center',
    marginTop: 4,
  },
  buttonSection: {
    marginTop: 60,
    alignItems: 'center',
    backgroundColor: '#000010',
    color: '#000010',
  },
  registerButton: {
    color: '#000010',
    borderColor: '#1E90FF',
    backgroundColor: '#000010',
    borderWidth: 1,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#1E90FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    width: '100%',
    maxWidth: 400,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 18,
  },
}); 