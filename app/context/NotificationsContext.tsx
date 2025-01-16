import { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../config/firebase';
import { collection, query, getDocs } from 'firebase/firestore';
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
      // Get user's dismissed notifications
      const userDoc = await db.collection('users').doc(user.uid).get();
      const dismissedNotifications = userDoc.data()?.dismissedNotifications || [];

      // Get all notifications
      const notificationsSnap = await getDocs(collection(db, 'notifications'));
      
      // Count notifications that haven't been dismissed
      const count = notificationsSnap.docs.filter(
        doc => !dismissedNotifications.includes(doc.id)
      ).length;

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