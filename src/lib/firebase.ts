import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, UserCredential } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCC8fnTa1GrgbOpj_ZXR9M5zp1mShZr3HU",
  authDomain: "tapncon.firebaseapp.com",
  projectId: "tapncon",
  storageBucket: "tapncon.firebasestorage.app",
  messagingSenderId: "64571782446",
  appId: "1:64571782446:web:830247f2ae98eb185ef6bf",
  measurementId: "G-P0ZZ5J0E03"
};

// Initialize Firebase safely
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const firestore = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async (): Promise<UserCredential> => {
  return signInWithPopup(auth, googleProvider);
};
