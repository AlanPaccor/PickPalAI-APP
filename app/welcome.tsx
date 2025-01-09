import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();

  return (
    <ThemedView style={styles.container}>
      {/* Logo and Title Section */}
      <Animated.View 
        style={styles.headerSection}
        entering={FadeIn.delay(200).duration(1000)}
      >
        <MaterialCommunityIcons 
          name="chart-line" 
          size={80} 
          color="#0A84FF" 
        />
        <ThemedText type="title" style={styles.title}>
          Welcome to PredictPro
        </ThemedText>
      </Animated.View>

      {/* Features Section */}
      <Animated.View 
        style={styles.featuresSection}
        entering={FadeIn.delay(400).duration(1000)}
      >
        <FeatureItem 
          icon="chart-bell-curve" 
          text="Get AI-powered sports predictions"
        />
        <FeatureItem 
          icon="chart-timeline-variant" 
          text="Track performance in real-time"
        />
        <FeatureItem 
          icon="robot-outline" 
          text="Chat with our AI assistant"
        />
        <FeatureItem 
          icon="bell-outline" 
          text="Receive instant notifications"
        />
      </Animated.View>

      {/* Buttons Section */}
      <Animated.View 
        style={[
          styles.buttonSection,
          { paddingBottom: insets.bottom + 20 }
        ]}
        entering={SlideInDown.delay(600).duration(800)}
      >
        <TouchableOpacity 
          style={styles.registerButton}
          onPress={() => router.push('/auth/register')}
        >
          <ThemedText style={styles.buttonText}>
            Create Account
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.loginButton}
          onPress={() => router.push('/auth/login')}
        >
          <ThemedText style={styles.loginText}>
            Already have an account? Login
          </ThemedText>
        </TouchableOpacity>
      </Animated.View>
    </ThemedView>
  );
}

function FeatureItem({ icon, text }: { icon: string, text: string }) {
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
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  featuresSection: {
    flex: 1,
    justifyContent: 'center',
    gap: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: '#00000010',
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
    marginTop: 32,
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