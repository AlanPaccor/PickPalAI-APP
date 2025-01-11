import { Stack } from 'expo-router';
import { useColorScheme, StatusBar, View } from 'react-native';
import Colors from '@/constants/Colors';
import Providers from './providers';
import { useAuth } from './context/AuthContext';
import AuthProvider from './context/AuthContext';
import { StripeProvider } from '@stripe/stripe-react-native';
import { STRIPE_PUBLISHABLE_KEY } from './config/env';

function RootLayoutNav() {
  const { isAuthenticated, isLoading } = useAuth();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  console.log('RootLayoutNav state:', { isAuthenticated, isLoading });

  if (isLoading) {
    console.log('Still loading...');
    return null;
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
          <Stack.Screen name="index" options={{ href: null }} />
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
  return (
    <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY}>
      <Providers>
        <AuthProvider>
          <RootLayoutNav />
        </AuthProvider>
      </Providers>
    </StripeProvider>
  );
}
