import { View, TouchableOpacity, StyleSheet, Platform, ScrollView, Switch } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useColorScheme } from 'react-native';
import Colors from '@/constants/Colors';
import { router } from 'expo-router';
import { useState } from 'react';

interface NotificationOption {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
}

export default function NotificationsScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  const [notifications, setNotifications] = useState<NotificationOption[]>([
    {
      id: 'predictions',
      title: 'Game Predictions',
      description: 'Get notified when new predictions are available',
      enabled: true,
    },
    {
      id: 'results',
      title: 'Game Results',
      description: 'Receive updates when games end',
      enabled: true,
    },
    {
      id: 'insights',
      title: 'AI Insights',
      description: 'Get AI-powered analysis and recommendations',
      enabled: true,
    },
    {
      id: 'news',
      title: 'Sports News',
      description: 'Stay updated with relevant sports news',
      enabled: false,
    },
    {
      id: 'promotions',
      title: 'Promotions',
      description: 'Receive special offers and updates',
      enabled: false,
    },
  ]);

  const toggleNotification = (id: string) => {
    setNotifications(notifications.map(notification => 
      notification.id === id 
        ? { ...notification, enabled: !notification.enabled }
        : notification
    ));
  };

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Header */}
      <ThemedView style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <MaterialCommunityIcons 
            name="arrow-left" 
            size={24} 
            color={theme.tint}
          />
        </TouchableOpacity>
        <ThemedText type="title">Notifications</ThemedText>
      </ThemedView>

      {/* Notification Options */}
      {notifications.map((notification, index) => (
        <ThemedView key={notification.id} style={styles.notificationItem}>
          <ThemedView style={styles.notificationContent}>
            <ThemedText type="defaultSemiBold">{notification.title}</ThemedText>
            <ThemedText style={styles.description}>{notification.description}</ThemedText>
          </ThemedView>
          <Switch
            value={notification.enabled}
            onValueChange={() => toggleNotification(notification.id)}
            trackColor={{ false: '#FFFFFF20', true: '#4CAF50' }}
            thumbColor={notification.enabled ? '#FFFFFF' : '#FFFFFF80'}
          />
        </ThemedView>
      ))}

      <ThemedText style={styles.footer}>
        You can change these settings at any time
      </ThemedText>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000010',
  },
  contentContainer: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    marginTop: 60,
    marginBottom: 24,
  },
  backButton: {
    marginRight: 16,
    padding: 4,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderWidth: 1,
    borderColor: '#FFFFFF20',
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: '#00000010',
  },
  notificationContent: {
    flex: 1,
    marginRight: 16,
  },
  description: {
    opacity: 0.7,
    marginTop: 4,
    fontSize: 14,
  },
  footer: {
    textAlign: 'center',
    opacity: 0.7,
    marginTop: 24,
    fontSize: 14,
  },
}); 