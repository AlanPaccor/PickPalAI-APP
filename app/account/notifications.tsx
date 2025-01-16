import { View, TouchableOpacity, StyleSheet, Platform, ScrollView, Switch, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useColorScheme } from 'react-native';
import Colors from '@/constants/Colors';
import { router } from 'expo-router';
import { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc, collection, query, getDocs, where, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationsContext';

interface NotificationPreference {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
}

interface SystemNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  link?: string;
  createdAt: string;
  sentTo: number;
}

// Add this helper function at the top level
const interpolateMessage = (message: string, userData: any) => {
  return message.replace(/\{([^}]+)\}/g, (match, key) => {
    const value = key.split('.').reduce((obj: any, k: string) => obj?.[k], userData);
    return value || match;
  });
};

export default function NotificationsScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [systemNotifications, setSystemNotifications] = useState<SystemNotification[]>([]);
  const { refreshUnreadCount } = useNotifications();

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

  // Add this useEffect to load system notifications
  useEffect(() => {
    const loadSystemNotifications = async () => {
      if (!user) return;

      try {
        // First get the user's dismissed notifications and preferences
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const userData = userDoc.data();
        const dismissedNotifications = userData?.dismissedNotifications || [];
        const notificationPreferences = userData?.notificationPreferences || {};

        console.log('Loading notifications with preferences:', notificationPreferences);

        // Then get all notifications
        const notificationsRef = collection(db, 'notifications');
        const notificationsSnap = await getDocs(notificationsRef);
        
        const activeNotifications = notificationsSnap.docs
          .filter(doc => {
            const notification = doc.data();
            const notificationType = notification.type;
            
            // Check if notification type is enabled
            const isTypeEnabled = notificationPreferences[notificationType] !== false;
            
            // Check if notification hasn't been dismissed
            const isNotDismissed = !dismissedNotifications.includes(doc.id);

            console.log('Filtering notification:', {
              id: doc.id,
              type: notificationType,
              isTypeEnabled,
              isNotDismissed,
              willShow: isTypeEnabled && isNotDismissed
            });

            return isTypeEnabled && isNotDismissed;
          })
          .map(doc => ({
            id: doc.id,
            ...doc.data(),
            message: interpolateMessage(doc.data().message, {
              user: userData,
              auth: {
                user: {
                  displayName: user.displayName,
                  email: user.email,
                }
              }
            })
          })) as SystemNotification[];

        console.log('Active notifications:', activeNotifications);
        setSystemNotifications(activeNotifications);
      } catch (error) {
        console.error('Error loading system notifications:', error);
      }
    };

    loadSystemNotifications();
  }, [user]);

  const dismissNotification = async (notificationId: string) => {
    if (!user) return;

    try {
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      const dismissedNotifications = userDoc.data()?.dismissedNotifications || [];

      await updateDoc(userRef, {
        dismissedNotifications: [...dismissedNotifications, notificationId]
      });

      setSystemNotifications(prev => 
        prev.filter(notification => notification.id !== notificationId)
      );
      
      await refreshUnreadCount();
    } catch (error) {
      console.error('Error dismissing notification:', error);
    }
  };

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

      {/* System Notifications */}
      <ThemedText type="title" style={styles.sectionTitle}>System Messages</ThemedText>
      {systemNotifications.length === 0 ? (
        <ThemedView style={styles.emptyState}>
          <ThemedText style={styles.emptyStateText}>No new notifications</ThemedText>
        </ThemedView>
      ) : (
        systemNotifications.map((notification) => (
          <ThemedView key={notification.id} style={styles.systemNotification}>
            <View style={styles.notificationHeader}>
              <View style={styles.notificationMeta}>
                <ThemedText type="defaultSemiBold" style={styles.notificationTitle}>
                  {notification.title}
                </ThemedText>
                <ThemedText style={styles.timestamp}>
                  {new Date(notification.createdAt).toLocaleDateString()}
                </ThemedText>
              </View>
              <TouchableOpacity 
                onPress={() => dismissNotification(notification.id)}
                style={styles.dismissButton}
              >
                <MaterialCommunityIcons 
                  name="close" 
                  size={20} 
                  color={theme.tint}
                />
              </TouchableOpacity>
            </View>
            
            <ThemedText style={styles.notificationMessage}>
              {notification.message}
            </ThemedText>
            
            {notification.link && (
              <TouchableOpacity 
                onPress={() => router.push(notification.link as any)}
                style={styles.linkButton}
              >
                <ThemedText style={styles.linkText}>View Details</ThemedText>
                <MaterialCommunityIcons 
                  name="arrow-right" 
                  size={16} 
                  color="#1E90FF"
                />
              </TouchableOpacity>
            )}

            <View style={styles.notificationFooter}>
              <View style={[styles.typeBadge, { backgroundColor: getTypeColor(notification.type) }]}>
                <ThemedText style={styles.typeText}>{notification.type}</ThemedText>
              </View>
            </View>
          </ThemedView>
        ))
      )}

      {/* Notification Settings section */}
      <ThemedText type="title" style={[styles.sectionTitle, { marginTop: 24 }]}>
        Notification Settings
      </ThemedText>
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

// Add this helper function to get colors for different notification types
const getTypeColor = (type: string): string => {
  const colors: { [key: string]: string } = {
    news: '#1E90FF',
    promotions: '#4CAF50',
    insights: '#9C27B0',
    predictions: '#FF9800',
    expert_picks: '#FF5722',
    default: '#757575'
  };
  return colors[type] || colors.default;
};

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
    backgroundColor: '#000010',
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
  sectionTitle: {
    marginBottom: 16,
    fontSize: 20,
  },
  systemNotification: {
    padding: 16,
    borderWidth: 1,
    borderColor: '#FFFFFF20',
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: '#000020',
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  notificationMeta: {
    flex: 1,
    marginRight: 12,
  },
  notificationTitle: {
    fontSize: 16,
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 12,
    opacity: 0.7,
  },
  notificationMessage: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.9,
    marginBottom: 12,
  },
  dismissButton: {
    padding: 4,
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  linkText: {
    color: '#1E90FF',
    fontSize: 14,
    marginRight: 4,
  },
  notificationFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 8,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    opacity: 0.8,
  },
  typeText: {
    color: '#FFFFFF',
    fontSize: 12,
    textTransform: 'capitalize',
  },
  emptyState: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FFFFFF20',
    borderRadius: 12,
    backgroundColor: '#000020',
  },
  emptyStateText: {
    opacity: 0.7,
    fontSize: 14,
  },
}); 