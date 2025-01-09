import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAj1peF-gMx4V5vheCmCSgQCjFE-677ikI",
  authDomain: "oddsly-df955.firebaseapp.com",
  projectId: "oddsly-df955",
  storageBucket: "oddsly-df955.firebasestorage.app",
  messagingSenderId: "127408998098",
  appId: "1:127408998098:web:768da625a252d6a6180f0b",
  measurementId: "G-WPLML57TT3"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;