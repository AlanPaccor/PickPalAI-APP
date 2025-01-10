import { Tabs } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { View, StyleSheet, Pressable, useColorScheme, GestureResponderEvent } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { useAuth } from '../../app/context/AuthContext';
import { Redirect } from 'expo-router';
import Colors from '@/constants/Colors';
import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { useTranslation } from 'react-i18next';

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
      backgroundColor: withTiming(focused ? '#1E90FF20' : '#000010', {
        duration: 200,
      }),
    };
  });

  return (
    <Animated.View style={[
      styles.assistantIconContainer,
      {
        borderWidth: 2,
        borderColor: '#1E90FF20',
      },
      animatedStyles
    ]}>
      <MaterialIcons 
        name="chat" 
        size={32} 
        color={focused ? '#FFFFFF' : '#1E90FF'}
      />
    </Animated.View>
  );
}

// Update the TabBarButton component to use BottomTabBarButtonProps
export default function TabLayout() {
  const { user, isLoading } = useAuth();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const { t } = useTranslation();

  if (isLoading) return null;
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
            backgroundColor: '#000010',
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
            title: t('home'),
            tabBarIcon: ({ color }) => <MaterialIcons name="home" size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="explore"
          options={{
            title: t('explore'),
            tabBarIcon: ({ color }) => <MaterialIcons name="explore" size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="assistant"
          options={{
            title: '',
            tabBarIcon: ({ color, focused }) => (
              <AssistantIcon color={color} focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="scan"
          options={{
            title: t('scan'),
            tabBarIcon: ({ color }) => <MaterialIcons name="qr-code-scanner" size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="account"
          options={{
            title: t('account'),
            tabBarIcon: ({ color }) => <MaterialIcons name="person" size={24} color={color} />,
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
    backgroundColor: '#000010',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
