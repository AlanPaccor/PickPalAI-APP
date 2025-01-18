import { Stack } from 'expo-router';
import { useColorScheme, StatusBar, View, Platform } from 'react-native';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import Colors from '@/constants/Colors';
import Providers from './providers';
import { useAuth } from './context/AuthContext';
import AuthProvider from './context/AuthContext';
import { StripeProvider } from '@stripe/stripe-react-native';
import { STRIPE_PUBLISHABLE_KEY } from './config/env';
import { NotificationsProvider } from './context/NotificationsContext';
import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

function RootLayoutNav() {
  const { isAuthenticated, isLoading } = useAuth();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  console.log('RootLayoutNav state:', { isAuthenticated, isLoading });

  if (isLoading) {
    console.log('Still loading...');
    return (
      <View style={{ 
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#000',
      }}>
        <StatusBar
          barStyle="light-content"
          backgroundColor="transparent"
          translucent
        />
        <Video
          source={require('../assets/app/splash.mp4')}
          rate={1.0}
          volume={1.0}
          isMuted={false}
          resizeMode={ResizeMode.COVER}
          shouldPlay
          isLooping={false}
          style={{ 
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1
          }}
          onPlaybackStatusUpdate={(status: AVPlaybackStatus) => {
            if ('isLoaded' in status && status.isLoaded && status.didJustFinish) {
              console.log('Splash video finished');
            }
          }}
        />
      </View>
    );
  }

  if (!isAuthenticated) {
    console.log('Not authenticated, showing auth screens');
    return (
      <View style={{ flex: 1, backgroundColor: '#0A0A0A' }}>
        <StatusBar
          barStyle="light-content"
          backgroundColor="transparent"
          translucent
        />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: {
              backgroundColor: '#0A0A0A',
            },
            animation: 'fade',
          }}
        >
          <Stack.Screen 
            name="index" 
            options={{ 
              headerShown: false 
            }} 
          />
          <Stack.Screen name="welcome" />
          <Stack.Screen name="auth" />
        </Stack>
      </View>
    );
  }

  console.log('User authenticated, showing main app');
  return (
    <View style={{ flex: 1, backgroundColor: '#0A0A0A' }}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: '#0A0A0A',
          },
          animation: 'fade',
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="account/betting-preferences" />
        <Stack.Screen name="account/currency-settings" />
        <Stack.Screen name="account/edit-plan" />
        <Stack.Screen name="account/language" />
        <Stack.Screen name="account/notifications" />
        <Stack.Screen name="account/privacy" />
      </Stack>
    </View>
  );
}

export default function RootLayout() {
  useEffect(() => {
    registerForPushNotificationsAsync();
  }, []);

  async function registerForPushNotificationsAsync() {
    let token;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!');
      return;
    }

    token = (await Notifications.getExpoPushTokenAsync({
      projectId: 'your-project-id', // Get this from your project on expo.dev
    })).data;

    console.log(token);
    // Here you would typically send this token to your backend
  }

  return (
    <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY}>
      <Providers>
        <AuthProvider>
          <NotificationsProvider>
            <RootLayoutNav />
          </NotificationsProvider>
        </AuthProvider>
      </Providers>
    </StripeProvider>
  );
}
