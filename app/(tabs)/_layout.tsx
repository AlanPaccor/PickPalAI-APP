import { Tabs } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { View, StyleSheet, Pressable, useColorScheme, GestureResponderEvent } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { useAuth } from '../context/AuthContext';
import { Redirect } from 'expo-router';
import Colors from '@/constants/Colors';
import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';

// Add type for the AssistantIcon props
interface AssistantIconProps {
  color: string;
  focused: boolean;
}

function AssistantIcon({ color, focused }: AssistantIconProps) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  const animatedStyles = useAnimatedStyle(() => {
    return {
      backgroundColor: withTiming(focused ? theme.tint : theme.background, {
        duration: 200,
      }),
    };
  });

  return (
    <Animated.View style={[
      styles.assistantIconContainer,
      {
        borderWidth: 2,
        borderColor: theme.tint,
      },
      animatedStyles
    ]}>
      <MaterialIcons 
        name="chat" 
        size={32} 
        color={focused ? '#FFFFFF' : theme.tint}
      />
    </Animated.View>
  );
}

// Update the TabBarButton component to use BottomTabBarButtonProps
export default function TabLayout() {
  const { user, loading } = useAuth();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  if (loading) return null;
  if (!user) return <Redirect href="/auth/login" />;

  return (
    <View style={{ flex: 1, backgroundColor: '#0A0A0A' }}>
      <Tabs 
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            borderTopWidth: 0,
            height: 60,
            paddingBottom: 5,
            backgroundColor: '#0A0A0A',
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: -2,
            },
            shadowOpacity: 0.1,
            shadowRadius: 3,
            elevation: 10,
          },
          tabBarActiveTintColor: theme.tint,
          tabBarInactiveTintColor: theme.tabIconDefault,
          tabBarItemStyle: {
            backgroundColor: 'transparent',
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => <MaterialIcons name="home" size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="explore"
          options={{
            title: 'Explore',
            tabBarIcon: ({ color }) => <MaterialIcons name="explore" size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="assistant"
          options={{
            title: 'Assistant',
            tabBarIcon: ({ color }) => (
              <MaterialIcons name="chat" size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="scan"
          options={{
            title: 'Scan',
            tabBarIcon: ({ color }) => <MaterialIcons name="qr-code-scanner" size={24} color={color} />,
            headerShown: false,
          }}
        />
        <Tabs.Screen
          name="account"
          options={{
            title: 'Account',
            tabBarIcon: ({ color }) => <MaterialIcons name="person" size={24} color={color} />,
            headerShown: false,
          }}
        />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  assistantIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
    // Add shadow for iOS
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    // Add elevation for Android
    elevation: 5,
  },
});
