import { Stack } from 'expo-router';
import { AuthProvider } from './context/AuthContext';
import { useColorScheme, StatusBar } from 'react-native';
import Colors from '@/constants/Colors';
import { View } from 'react-native';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  return (
    <View style={{ flex: 1, backgroundColor: '#0A0A0A' }}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />
      <AuthProvider>
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
          <Stack.Screen name="auth" />
        </Stack>
      </AuthProvider>
    </View>
  );
}
