import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';

export const useBetCount = () => {
  const [betCount, setBetCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchBetCount = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          setBetCount(userDoc.data().betsAnalyzed || 0);
        }
      } catch (error) {
        console.error('Error fetching bet count:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBetCount();
  }, [user]);

  return { betCount, isLoading };
}; 