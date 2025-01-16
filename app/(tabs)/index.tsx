import { StyleSheet, Platform, TouchableOpacity, ScrollView, StatusBar, View, LayoutChangeEvent, ActivityIndicator, Modal } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useColorScheme } from 'react-native';
import Colors from '@/constants/Colors';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAuth } from '../context/AuthContext';
import { router } from 'expo-router';
import { useState, useRef, useEffect } from 'react';
import Animated, { 
  useSharedValue,
  withRepeat,
  withTiming,
  cancelAnimation,
  useAnimatedStyle,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { doc, getDoc, updateDoc, onSnapshot, serverTimestamp, getDocs, query, orderBy, limit, collection } from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import { useBetCount } from '../hooks/useBetCount';
import { useTranslation } from 'react-i18next';
import { useNotifications } from '../context/NotificationsContext';
import { SystemNotification } from '../types/SystemNotification';

interface Notification {
  id: string;
  title: string;
  message: string;
  time: Date;
  read: boolean;
  link?: string;
  type?: 'predictions' | 'results' | 'insights' | 'news' | 'promotions';
}

const tempNotifications: Notification[] = [
  {
    id: '1',
    title: 'New AI Prediction Available',
    message: "Check out our latest prediction for tonight's NBA games",
    time: new Date(),
    read: false,
  },
  {
    id: '2',
    title: 'Winning Streak! 🔥',
    message: 'Your last 5 bets were successful. Keep it up!',
    time: new Date(),
    read: false,
  },
  {
    id: '3',
    title: 'Market Update',
    message: 'New betting opportunities detected in MLB props',
    time: new Date(),
    read: true,
  },
];

interface RecentWinner {
  team: string;
  score: string;
  opponent: string;
  league: string;
}

interface HotPick {
  player: string;
  stat: string;
  confidence: number;
}

interface DailyInsights {
  aiReport: {
    title: string;
    insights: string[];
  };
  hotPicks: HotPick[];
  recentWinners: RecentWinner[];
  createdAt: string;
}

const interpolateMessage = (message: string, userData: any) => {
  return message.replace(/\{([^}]+)\}/g, (match, key) => {
    const value = key.split('.').reduce((obj: any, k: string) => obj?.[k], userData);
    return value || match;
  });
};

const getNotificationTypeColor = (type: string): string => {
  const colors: { [key: string]: string } = {
    news: '#1E90FF15',
    promotions: '#4CAF5015',
    insights: '#9C27B015',
    predictions: '#FF980015',
    expert_picks: '#FF572215',
    default: '#00000015'
  };
  return colors[type] || colors.default;
};

const NotificationsModal = ({ 
  visible, 
  onClose, 
  loading
}: { 
  visible: boolean;
  onClose: () => void;
  loading: boolean;
}) => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const translateY = useSharedValue(1000);
  const opacity = useSharedValue(0);
  const [isRendered, setIsRendered] = useState(false);
  const { user } = useAuth();
  const [systemNotifications, setSystemNotifications] = useState<SystemNotification[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(true);
  const { refreshUnreadCount } = useNotifications();

  useEffect(() => {
    const loadSystemNotifications = async () => {
      if (!user) return;

      setNotificationsLoading(true);
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const userData = userDoc.data();
        const dismissedNotifications = userData?.dismissedNotifications || [];
        const notificationPreferences = userData?.notificationPreferences || {};

        const notificationsRef = collection(db, 'notifications');
        const notificationsSnap = await getDocs(notificationsRef);
        
        const activeNotifications = notificationsSnap.docs
          .filter(doc => {
            const notification = doc.data();
            const notificationType = notification.type;
            const isTypeEnabled = notificationPreferences[notificationType] !== false;
            const isNotDismissed = !dismissedNotifications.includes(doc.id);
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

        setSystemNotifications(activeNotifications);
      } catch (error) {
        console.error('Error loading system notifications:', error);
      } finally {
        setNotificationsLoading(false);
      }
    };

    if (visible) {
      loadSystemNotifications();
    }
  }, [user, visible]);

  const dismissNotification = async (notificationId: string) => {
    if (!user) return;

    try {
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      const dismissedNotifications = userDoc.data()?.dismissedNotifications || [];

      await updateDoc(userRef, {
        dismissedNotifications: [...dismissedNotifications, notificationId],
        lastNotificationCheck: serverTimestamp()
      });

      setSystemNotifications(prev => 
        prev.filter(notification => notification.id !== notificationId)
      );

      await refreshUnreadCount();
    } catch (error) {
      console.error('Error dismissing notification:', error);
    }
  };

  useEffect(() => {
    if (visible) {
      setIsRendered(true);
      opacity.value = withTiming(1, { duration: 200 });
      translateY.value = withTiming(0, {
        duration: 300,
        easing: Easing.bezier(0.33, 1, 0.68, 1),
      });
    } else {
      opacity.value = withTiming(0, { duration: 200 });
      translateY.value = withTiming(1000, {
        duration: 200,
        easing: Easing.bezier(0.33, 1, 0.68, 1),
      }, () => {
        // Only hide the modal after animation completes
        runOnJS(setIsRendered)(false);
      });
    }
  }, [visible]);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const modalStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  if (!isRendered) return null;

  return (
    <View style={StyleSheet.absoluteFill}>
      <Animated.View style={[styles.modalOverlay, overlayStyle]}>
        <TouchableOpacity 
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onClose}
        />
      </Animated.View>
      
      <Animated.View style={[styles.modalContainer, modalStyle]}>
        <ThemedView style={styles.notificationModal}>
          <View style={styles.notificationHandle} />
          <ThemedView style={styles.notificationHeader}>
            <ThemedText type="title">Notifications</ThemedText>
            <TouchableOpacity 
              onPress={onClose}
              style={styles.closeButton}
            >
              <MaterialCommunityIcons 
                name="close" 
                size={24} 
                color={theme.tint}
              />
            </TouchableOpacity>
          </ThemedView>

          <ScrollView 
            style={styles.notificationList}
            contentContainerStyle={styles.notificationListContent}
            showsVerticalScrollIndicator={false}
          >
            {notificationsLoading ? (
              <ActivityIndicator size="large" color="#1E90FF" style={{ marginTop: 20 }} />
            ) : systemNotifications.length === 0 ? (
              <ThemedView style={styles.emptyState}>
                <ThemedText style={styles.emptyStateText}>No notifications yet</ThemedText>
              </ThemedView>
            ) : (
              systemNotifications.map((notification) => (
                <ThemedView key={notification.id} style={[
                  styles.notificationItem,
                  { backgroundColor: getNotificationTypeColor(notification.type) }
                ]}>
                  <View style={styles.notificationHeader}>
                    <View style={styles.notificationMeta}>
                      <View style={styles.titleRow}>
                        <ThemedText type="defaultSemiBold" style={styles.notificationTitle}>
                          {notification.title}
                        </ThemedText>
                        <ThemedView style={styles.typeTag}>
                          <ThemedText style={styles.typeText}>
                            {notification.type}
                          </ThemedText>
                        </ThemedView>
                      </View>
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
                      onPress={() => {
                        router.push(notification.link as any);
                        onClose();
                      }}
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
                </ThemedView>
              ))
            )}
          </ScrollView>
        </ThemedView>
      </Animated.View>
    </View>
  );
};

const useDailyInsights = () => {
  const [insights, setInsights] = useState<DailyInsights | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        // Get the most recent document from dailyInsights collection
        const querySnapshot = await getDocs(
          query(
            collection(db, 'dailyInsights'), 
            orderBy('createdAt', 'desc'), 
            limit(1)
          )
        );

        if (!querySnapshot.empty) {
          const doc = querySnapshot.docs[0];
          setInsights(doc.data() as DailyInsights);
        }
      } catch (error) {
        console.error('Error fetching daily insights:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, []);

  return { insights, loading };
};

const RecentWinners = ({ winners }: { winners: RecentWinner[] }) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const [contentWidth, setContentWidth] = useState(0);
  const translateX = useSharedValue(0);

  const startScrolling = () => {
    translateX.value = 0;
    translateX.value = withRepeat(
      withTiming(-contentWidth/2, {
        duration: 15000,
        easing: Easing.linear
      }),
      -1,
      false
    );
  };

  const onContentLayout = (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    setContentWidth(width);
  };

  useEffect(() => {
    if (contentWidth > 0) {
      startScrolling();
    }
  }, [contentWidth]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const repeatedWinners = [...winners, ...winners, ...winners];

  return (
    <ThemedView style={styles.section}>
      <ThemedText style={styles.sectionTitle}>Recent Winners 🏆</ThemedText>
      <ThemedView style={styles.marqueeContainer}>
        <Animated.View 
          style={[styles.marqueeContent, animatedStyle]}
          onLayout={onContentLayout}
        >
          {repeatedWinners.map((win, index) => (
            <ThemedView key={index} style={styles.winCard}>
              <ThemedView style={styles.leagueTag}>
                <ThemedText style={styles.leagueText}>{win.league}</ThemedText>
              </ThemedView>
              <ThemedText 
                style={styles.teamName}
                numberOfLines={1}
              >
                {win.team}
              </ThemedText>
              <ThemedText style={styles.scoreText}>{win.score}</ThemedText>
              <ThemedText 
                style={styles.opponentText}
                numberOfLines={1}
              >
                vs {win.opponent}
              </ThemedText>
            </ThemedView>
          ))}
        </Animated.View>
      </ThemedView>
    </ThemedView>
  );
};

const useLocalNotifications = (userId: string | undefined) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [preferences, setPreferences] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const userRef = doc(db, 'users', userId);
    const unsubscribe = onSnapshot(
      userRef,
      (doc) => {
        if (doc.exists()) {
          const userData = doc.data();
          const notificationsData = userData.notifications || [];
          const userPreferences = userData.notificationPreferences || {};
          setPreferences(userPreferences);
          
          // Filter notifications based on preferences
          const filteredNotifications = notificationsData
            .filter((notification: any) => {
              // If no preference is set for this type, show the notification
              if (!notification.type) return true;
              return userPreferences[notification.type] !== false;
            })
            .map((notification: any) => ({
              ...notification,
              time: notification.time?.toDate() || new Date(),
            }))
            .sort((a: Notification, b: Notification) => b.time.getTime() - a.time.getTime());

          setNotifications(filteredNotifications);
        }
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching notifications:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  const markAsRead = async (notificationId: string) => {
    if (!userId) return;

    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const updatedNotifications = (userData.notifications || []).map((notification: any) => {
          if (notification.id === notificationId) {
            return { ...notification, read: true };
          }
          return notification;
        });

        await updateDoc(userRef, {
          notifications: updatedNotifications
        });
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  return { notifications, loading, markAsRead };
};

export default function IndexScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const { betCount } = useBetCount();
  const { t } = useTranslation();
  const [showNotifications, setShowNotifications] = useState(false);
  const { notifications, loading: notificationsLoading, markAsRead } = useLocalNotifications(user?.uid);
  const [checkingSubscription, setCheckingSubscription] = useState(false);
  const { insights, loading: insightsLoading } = useDailyInsights();
  const { unreadCount } = useNotifications();

  useEffect(() => {
    const checkAccess = async () => {
      if (!user) {
        router.replace('/auth/subscription');
        return;
      }
      
      try {
        setIsLoading(true);
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const userData = userDoc.data();
        
        // If no plan exists at all, redirect to subscription
        if (!userData?.plan) {
          router.replace('/auth/subscription');
          return;
        }

        // Check if plan has expired
        const endDate = new Date(userData.plan.endDate);
        const now = new Date();

        // Allow access if:
        // 1. Plan is active OR
        // 2. Plan is cancelled but hasn't expired yet
        if (
          userData.plan.status === 'active' || 
          (userData.plan.status === 'cancelled' && now <= endDate)
        ) {
          // User can access the app
          return;
        }

        // If we get here, the plan is either expired or cancelled and expired
        router.replace('/auth/subscription');

      } catch (error) {
        console.error('Error checking user data:', error);
        router.replace('/auth/subscription');
      } finally {
        setIsLoading(false);
      }
    };

    checkAccess();
  }, [user]);

  useEffect(() => {
    checkSubscriptionStatus();
  }, []);

  const checkSubscriptionStatus = async () => {
    setCheckingSubscription(true);
    try {
      const user = auth.currentUser;
      if (!user) return;

      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.data();
      
      if (!userData?.subscription?.current) return;

      const { current } = userData.subscription;
      const endDate = new Date(current.endDate);
      const now = new Date();

      // Check if subscription is active but past end date
      if (current.status === 'active' && endDate < now) {
        console.log('Subscription needs renewal update');

        // Calculate new end date based on plan type
        const newEndDate = new Date();
        if (current.type === 'monthly') {
          newEndDate.setMonth(newEndDate.getMonth() + 1);
        } else if (current.type === 'annual') {
          newEndDate.setFullYear(newEndDate.getFullYear() + 1);
        } else {
          // Trial plans should not auto-renew
          return;
        }

        const timestamp = now.toISOString();

        // Create history entry for the previous period
        const historyEntry = {
          ...current,
          endDate: endDate.toISOString(),
        };

        // Update subscription with new period
        const updatedSubscription = {
          ...current,
          startDate: timestamp,
          endDate: newEndDate.toISOString(),
        };

        await updateDoc(doc(db, 'users', user.uid), {
          'subscription.history': [
            ...(userData.subscription.history || []),
            historyEntry
          ],
          'subscription.current': updatedSubscription,
          'plan.startDate': timestamp,
          'plan.endDate': newEndDate.toISOString(),
          payments: [
            ...(userData.payments || []),
            {
              id: `renewal_${timestamp}`,
              amount: current.amount,
              date: timestamp,
              type: current.type,
              status: 'succeeded'
            }
          ],
          updatedAt: timestamp
        });

        console.log('Subscription renewed:', {
          type: current.type,
          newEndDate: newEndDate.toISOString()
        });
      }
    } catch (error) {
      console.error('Error checking subscription status:', error);
    } finally {
      setCheckingSubscription(false);
    }
  };

  const handleNotificationPress = async (notificationId: string) => {
    const notification = notifications.find(n => n.id === notificationId);
    if (!notification) return;

    await markAsRead(notificationId);
    
    if (notification.link) {
      router.push(notification.link);
    }
    setShowNotifications(false);
  };

  if (checkingSubscription) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.tint} />
      </View>
    );
  }

  if (isLoading || insightsLoading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1E90FF" />
      </ThemedView>
    );
  }

  return (
    <>
      <ScrollView style={styles.container}>
        {/* Header */}
        <ThemedView style={styles.header}>
          <ThemedView style={styles.logoContainer}>
            <MaterialCommunityIcons name="trophy" size={32} color="#1E90FF" />
            <ThemedText style={styles.logoText}>BetSenseAI</ThemedText>
          </ThemedView>
          
          <TouchableOpacity 
            style={styles.notificationButton}
            onPress={() => setShowNotifications(true)}
          >
            <MaterialCommunityIcons 
              name="bell-outline" 
              size={24} 
              color="#FFFFFF" 
            />
            {unreadCount > 0 && (
              <ThemedView style={styles.notificationBadge}>
                <ThemedText style={styles.notificationBadgeText}>
                  {unreadCount}
                </ThemedText>
              </ThemedView>
            )}
          </TouchableOpacity>
        </ThemedView>

        {/* Profile Section */}
        <ThemedView style={styles.profileSection}>
          <ThemedText style={styles.profileName}>Welcome!</ThemedText>
        </ThemedView>

        {/* Quick Stats Section */}
        <ThemedView style={styles.statsContainer}>
          <ThemedView style={styles.statCard}>
            <ThemedText style={styles.statValue}>87%</ThemedText>
            <ThemedText style={styles.statLabel}>AI Accuracy</ThemedText>
          </ThemedView>
        </ThemedView>

        {/* Recent Winners */}
        {insights?.recentWinners && (
          <RecentWinners winners={insights.recentWinners} />
        )}

        {/* Today's Hot Picks */}
        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>🔥 Today's Hot Picks</ThemedText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.picksScroll}>
            {insights?.hotPicks.map((pick, index) => (
              <ThemedView key={index} style={styles.pickCard}>
                <ThemedText style={styles.pickPlayer}>{pick.player}</ThemedText>
                <ThemedText style={styles.pickStat}>{pick.stat}</ThemedText>
                <ThemedView style={styles.confidenceBar}>
                  <ThemedText style={styles.pickConfidence}>{pick.confidence}% Confident</ThemedText>
                </ThemedView>
              </ThemedView>
            ))}
          </ScrollView>
        </ThemedView>

        {/* AI Insights */}
        <ThemedView style={styles.insightsContainer}>
          <ThemedText style={styles.insightTitle}>{insights?.aiReport.title}</ThemedText>
          <ThemedText style={styles.insightText}>
            {insights?.aiReport.insights.join('\n')}
          </ThemedText>
        </ThemedView>
      </ScrollView>

      <NotificationsModal
        visible={showNotifications}
        onClose={() => setShowNotifications(false)}
        loading={false}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000010',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 100 : StatusBar.currentHeight || 0,
    paddingBottom: 16,
    backgroundColor: '#000010',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#000010',
  },
  logoText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  profileSection: {
    padding: 16,
    backgroundColor: '#000010',
  },
  profileName: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 16,
    backgroundColor: '#000010',
  },
  statCard: {
    flex: 1,
    backgroundColor: '#000010',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFFFFF20',
  },
  statValue: {
    color: '#1E90FF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    color: '#666',
    fontSize: 12,
    marginTop: 4,
  },
  section: {
    padding: 16,
    backgroundColor: '#000010',
    marginTop: 8,
  },
  sectionTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  winnersScroll: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  winCard: {
    backgroundColor: '#000010',
    padding: 16,
    borderRadius: 12,
    width: 160,
    borderWidth: 1,
    borderColor: '#FFFFFF20',
    marginRight: 12,
    flex: 0,
  },
  leagueTag: {
    backgroundColor: '#FFFFFF10',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  leagueText: {
    color: '#1E90FF',
    fontSize: 12,
    fontWeight: '600',
  },
  teamName: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    numberOfLines: 1,
    ellipsizeMode: 'tail',
  },
  scoreText: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  opponentText: {
    color: '#666',
    fontSize: 14,
    numberOfLines: 1,
    ellipsizeMode: 'tail',
  },
  winAmount: {
    color: '#4CAF50',
    fontSize: 20,
    fontWeight: 'bold',
  },
  winType: {
    color: '#FFFFFF',
    fontSize: 14,
    marginTop: 4,
  },
  winDate: {
    color: '#666',
    fontSize: 12,
    marginTop: 4,
  },
  picksScroll: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  pickCard: {
    backgroundColor: '#000010',
    padding: 16,
    borderRadius: 12,
    marginRight: 12,
    width: 200,
    borderWidth: 1,
    borderColor: '#FFFFFF20',
  },
  pickPlayer: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  pickStat: {
    color: '#1E90FF',
    fontSize: 14,
    marginTop: 4,
  },
  confidenceBar: {
    marginTop: 8,
    backgroundColor: '#1E90FF20',
    padding: 8,
    borderRadius: 6,
  },
  pickConfidence: {
    color: '#1E90FF',
    fontSize: 12,
    fontWeight: '600',
  },
  insightsContainer: {
    margin: 16,
    padding: 16,
    backgroundColor: '#000010',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFFFFF20',
  },
  insightTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  insightText: {
    color: '#666',
    fontSize: 14,
    lineHeight: 20,
  },
  startButton: {
    backgroundColor: '#1E90FF',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 24,
    marginTop: 24,
    width: '100%',
  },
  startButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  marqueeContainer: {
    height: 160,
    overflow: 'hidden',
    backgroundColor: '#000010',
    borderRadius: 12,
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  marqueeContent: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 12,
  },
  winnerRow: {
    flexDirection: 'row',
    gap: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000010',
  },
  notificationButton: {
    padding: 8,
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    right: -6,
    top: -3,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  notificationBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: '90%',
  },
  notificationModal: {
    backgroundColor: '#000015',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '100%',
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: '#FFFFFF20',
  },
  notificationHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#FFFFFF30',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  closeButton: {
    padding: 8,
  },
  notificationList: {
    flex: 1,
    padding: 16,
  },
  notificationItem: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#FFFFFF15',
  },
  unreadNotification: {
    backgroundColor: '#FFFFFF08',
    borderColor: '#FFFFFF20',
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  notificationMessage: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.9,
    marginBottom: 12,
  },
  notificationTime: {
    fontSize: 12,
    opacity: 0.6,
  },
  emptyState: {
    padding: 20,
    alignItems: 'center',
  },
  emptyStateText: {
    opacity: 0.6,
  },
  notificationListContent: {
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
  },
  notificationMeta: {
    flex: 1,
    marginRight: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  typeTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#FFFFFF10',
  },
  typeText: {
    fontSize: 12,
    color: '#FFFFFF90',
    textTransform: 'capitalize',
  },
  timestamp: {
    fontSize: 12,
    opacity: 0.6,
    marginBottom: 8,
  },
  dismissButton: {
    padding: 4,
    backgroundColor: '#FFFFFF10',
    borderRadius: 12,
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E90FF20',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 4,
  },
  linkText: {
    color: '#1E90FF',
    fontSize: 14,
    marginRight: 4,
    fontWeight: '600',
  },
});
