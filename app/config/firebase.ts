import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAj1peF-gMx4V5vheCmCSgQCjFE-677ikI",
  authDomain: "oddsly-df955.firebaseapp.com",
  projectId: "oddsly-df955",
  storageBucket: "oddsly-df955.firebasestorage.app",
  messagingSenderId: "127408998098",
  appId: "1:127408998098:web:768da625a252d6a6180f0b",
  measurementId: "G-WPLML57TT3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with AsyncStorage persistence
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

export const db = getFirestore(app);

export default app;