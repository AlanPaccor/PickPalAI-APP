import { View, TouchableOpacity, StyleSheet, Platform, ScrollView, Switch, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useColorScheme } from 'react-native';
import Colors from '@/constants/Colors';
import { router } from 'expo-router';
import { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';

interface NotificationPreference {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
}

export default function NotificationsScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  const [notifications, setNotifications] = useState<NotificationPreference[]>([
    {
      id: 'predictions',
      title: 'Game Predictions',
      description: 'Get notified when new predictions are available',
      enabled: true,
    },
    {
      id: 'expert_picks',
      title: 'Expert Picks',
      description: 'Get notified based on expert picks',
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
      enabled: true,
    },
    {
      id: 'promotions',
      title: 'Promotions',
      description: 'Receive special offers and updates',
      enabled: true,
    },
  ]);

  // Load user's notification preferences
  useEffect(() => {
    const loadPreferences = async () => {
      if (!user) return;

      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          if (userData.notificationPreferences) {
            setNotifications(prev => prev.map(notification => ({
              ...notification,
              enabled: userData.notificationPreferences[notification.id] ?? true
            })));
          } else {
            const allEnabledPreferences = notifications.reduce((acc, curr) => ({
              ...acc,
              [curr.id]: true
            }), {});

            await updateDoc(doc(db, 'users', user.uid), {
              notificationPreferences: allEnabledPreferences
            });
          }
        }
      } catch (error) {
        console.error('Error loading notification preferences:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPreferences();
  }, [user]);

  const toggleNotification = async (id: string) => {
    if (!user) return;

    const updatedNotifications = notifications.map(notification => 
      notification.id === id 
        ? { ...notification, enabled: !notification.enabled }
        : notification
    );
    
    setNotifications(updatedNotifications);

    try {
      // Convert notifications array to object for storage
      const preferencesObject = updatedNotifications.reduce((acc, curr) => ({
        ...acc,
        [curr.id]: curr.enabled
      }), {});

      await updateDoc(doc(db, 'users', user.uid), {
        notificationPreferences: preferencesObject
      });
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      // Revert on error
      setNotifications(notifications);
    }
  };

  if (loading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1E90FF" />
      </ThemedView>
    );
  }

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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000010',
  },
}); 