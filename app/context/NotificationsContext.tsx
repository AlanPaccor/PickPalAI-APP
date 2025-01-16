import { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../config/firebase';
import { collection, query, getDocs, doc, getDoc } from 'firebase/firestore';
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

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth();

  const refreshUnreadCount = async () => {
    if (!user) {
      setUnreadCount(0);
      return;
    }

    try {
      // Get user's dismissed notifications and preferences
      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);
      const userData = userDocSnap.data();
      const dismissedNotifications = userData?.dismissedNotifications || [];
      const notificationPreferences = userData?.notificationPreferences || {};

      console.log('User notification preferences:', notificationPreferences);

      // Get all notifications
      const notificationsRef = collection(db, 'notifications');
      const notificationsSnap = await getDocs(notificationsRef);
      
      console.log('All notifications:', notificationsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      // Count notifications that:
      // 1. Haven't been dismissed AND
      // 2. Match user's notification preferences
      const count = notificationsSnap.docs.filter(doc => {
        const notification = doc.data();
        const notificationType = notification.type;
        
        // Check if notification type is enabled (default to true if preference doesn't exist)
        const isTypeEnabled = notificationPreferences[notificationType] !== false;
        
        // Check if notification hasn't been dismissed
        const isNotDismissed = !dismissedNotifications.includes(doc.id);

        console.log('Notification filtering:', {
          id: doc.id,
          type: notificationType,
          isTypeEnabled,
          isNotDismissed,
          willShow: isTypeEnabled && isNotDismissed
        });

        return isTypeEnabled && isNotDismissed;
      }).length;

      console.log('Final unread count:', count);
      setUnreadCount(count);
    } catch (error) {
      console.error('Error loading notification count:', error);
    }
  };

  useEffect(() => {
    refreshUnreadCount();
  }, [user]);

  return (
    <NotificationsContext.Provider value={{ unreadCount, refreshUnreadCount }}>
      {children}
    </NotificationsContext.Provider>
  );
} 