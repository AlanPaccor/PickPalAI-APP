import { Tabs } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { View, StyleSheet, Pressable } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';

const AnimatedView = Animated.createAnimatedComponent(View);

function AssistantIcon({ color, focused }: { color: string, focused: boolean }) {
  const animatedStyles = useAnimatedStyle(() => {
    return {
      backgroundColor: withTiming(focused ? '#1E90FF' : '#151718', {
        duration: 200,
      }),
    };
  });

  const iconColor = useAnimatedStyle(() => {
    return {
      color: withTiming(focused ? 'white' : '#1E90FF', {
        duration: 200,
      }),
    };
  });

  return (
    <AnimatedView style={[
      styles.assistantIconContainer,
      {
        borderWidth: 2,
        borderColor: '#1E90FF',
      },
      animatedStyles
    ]}>
      <MaterialIcons 
        name="chat" 
        size={32} 
        color={focused ? 'white' : '#1E90FF'}
      />
    </AnimatedView>
  );
}

export default function TabLayout() {
  return (
    <Tabs screenOptions={{
      tabBarActiveTintColor: '#1E90FF',
      tabBarInactiveTintColor: '#8E8E93',
      tabBarStyle: {
        borderTopColor: 'rgba(0, 0, 0, 0.1)',
        height: 60,
        paddingBottom: 5,
      },
      tabBarButton: (props) => (
        <Pressable {...props} android_ripple={{ color: 'transparent' }} />
      ),
    }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <MaterialIcons name="home" size={24} color={color} />,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color }) => <MaterialIcons name="explore" size={24} color={color} />,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="assistant"
        options={{
          title: '',
          tabBarIcon: ({ color, focused }) => <AssistantIcon color={color} focused={focused} />,
          tabBarItemStyle: {
            marginTop: 0,
          },
          headerShown: false,
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
