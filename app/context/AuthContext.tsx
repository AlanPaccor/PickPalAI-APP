import { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../config/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  subscription: UserSubscription | null;
  needsSubscription: boolean;
}

interface UserSubscription {
  plan: 'Free' | 'Pro';
  startDate: Date;
  status: 'active' | 'cancelled' | 'expired';
}

const AuthContextInternal = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  subscription: null,
  needsSubscription: false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [needsSubscription, setNeedsSubscription] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('Auth state changed:', user?.email);
      
      // Keep loading true until we've checked everything
      setIsLoading(true);
      
      if (!user) {
        console.log('No user logged in');
        setUser(null);
        setSubscription(null);
        setNeedsSubscription(false);
        setIsLoading(false);
        return;
      }

      setUser(user);

      try {
        console.log('Checking subscription for user:', user.uid);
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        console.log('User doc exists:', userDoc.exists());
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          console.log('User data:', userData);
          
          if (userData.subscription) {
            console.log('Found subscription:', userData.subscription);
            setSubscription(userData.subscription);
            setNeedsSubscription(false);
          } else {
            console.log('No subscription found in user data');
            setSubscription(null);
            setNeedsSubscription(true);
          }
        } else {
          console.log('No user document found');
          setSubscription(null);
          setNeedsSubscription(true);
        }
      } catch (error) {
        console.error('Error fetching subscription:', error);
        setSubscription(null);
        setNeedsSubscription(true);
      } finally {
        setIsLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    subscription,
    needsSubscription,
  };

  console.log('Auth context state:', {
    isAuthenticated: !!user,
    isLoading,
    hasSubscription: !!subscription,
    needsSubscription,
  });

  return (
    <AuthContextInternal.Provider value={value}>
      {children}
    </AuthContextInternal.Provider>
  );
}

export const useAuth = () => {
  return useContext(AuthContextInternal);
};

export default function AuthContextComponent() {
  return null;
} 