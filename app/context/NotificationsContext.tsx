import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { db } from '../config/firebase';
import { collection, query, getDocs, getDoc, doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { useAuth } from './AuthContext';

interface NotificationsContextType {
  unreadCount: number;
  refreshUnreadCount: () => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextType>({
  unreadCount: 0,
  refreshUnreadCount: async () => {},
});

export const useNotifications = () => useContext(NotificationsContext);

const getUnreadCount = async (userId: string) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    const userData = userDoc.data();
    const dismissedNotifications = userData?.dismissedNotifications || [];
    const lastCheck = userData?.lastNotificationCheck?.toDate() || new Date(0);

    // Get all notifications
    const notificationsRef = collection(db, 'notifications');
    const notificationsSnap = await getDocs(notificationsRef);
    
    // Count notifications that:
    // 1. Haven't been dismissed
    // 2. Were created after the user's last check
    const count = notificationsSnap.docs.reduce((acc, doc) => {
      const notification = doc.data();
      // Safely handle the date conversion
      let notificationDate: Date | null = null;
      
      if (notification.createdAt) {
        // Handle both Timestamp and Date objects
        notificationDate = notification.createdAt.toDate 
          ? notification.createdAt.toDate() 
          : new Date(notification.createdAt);
      }
      
      if (
        !dismissedNotifications.includes(doc.id) && 
        notificationDate && 
        notificationDate > lastCheck
      ) {
        return acc + 1;
      }
      return acc;
    }, 0);

    return count;
  } catch (error) {
    console.error('Error getting unread count:', error);
    return 0;
  }
};

export const NotificationsProvider = ({ children }: { children: React.ReactNode }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth();

  const refreshUnreadCount = useCallback(async () => {
    if (!user) {
      setUnreadCount(0);
      return;
    }
    const count = await getUnreadCount(user.uid);
    setUnreadCount(count);
  }, [user]);

  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      return;
    }

    refreshUnreadCount();

    // Set up real-time listener for notifications
    const notificationsRef = collection(db, 'notifications');
    const unsubscribe = onSnapshot(notificationsRef, () => {
      refreshUnreadCount();
    });

    return () => unsubscribe();
  }, [user, refreshUnreadCount]);

  return (
    <NotificationsContext.Provider value={{ unreadCount, refreshUnreadCount }}>
      {children}
    </NotificationsContext.Provider>
  );
}; 