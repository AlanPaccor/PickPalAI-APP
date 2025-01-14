import { useContext, createContext, useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../config/firebase';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';

interface UserPlan {
  startDate: Date;
  endDate: Date;
  status: 'active' | 'expired';
  type: 'trial' | 'month' | 'year';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  plan: UserPlan | null;
}

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  loading: true, 
  plan: null
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState<UserPlan | null>(null);

  const fetchUserPlan = async (uid: string) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      const userData = userDoc.data();
      
      if (userData?.plan) {
        setPlan({
          ...userData.plan,
          startDate: userData.plan.startDate.toDate(),
          endDate: userData.plan.endDate.toDate()
        });
      } else {
        setPlan(null);
      }
    } catch (error) {
      console.error('Error fetching user plan:', error);
      setPlan(null);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        await fetchUserPlan(user.uid);
      } else {
        setPlan(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, plan }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext); 