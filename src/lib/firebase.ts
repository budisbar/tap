import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, UserCredential } from 'firebase/auth';

// ----------------------------------------------------------------------
// IMPORTANT: Replace the empty strings below with your Firebase Config keys!
// You can find these in your Firebase Console -> Project Settings -> General -> Your Apps
// ----------------------------------------------------------------------
const firebaseConfig = {
  apiKey: "AIzaSyCC8fnTa1GrgbOpj_ZXR9M5zp1mShZr3HU",
  authDomain: "tapncon.firebaseapp.com",
  projectId: "tapncon",
  storageBucket: "tapncon.firebasestorage.app",
  messagingSenderId: "64571782446",
  appId: "1:64571782446:web:830247f2ae98eb185ef6bf",
  measurementId: "G-P0ZZ5J0E03"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async (): Promise<UserCredential> => {
  return signInWithPopup(auth, googleProvider);
};


