import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        header: () => null,
        navigationBarHidden: true,
      }}
    >
      <Stack.Screen 
        name="login"
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="register"
        options={{ headerShown: false }}
      />
    </Stack>
  );
} 