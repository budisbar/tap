import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, UserCredential } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAI, GoogleAIBackend } from 'firebase/ai';
import { initializeAppCheck, ReCaptchaEnterpriseProvider, AppCheck } from 'firebase/app-check';

// ---------------------------------------------------------------------------
// AI CONFIGURATION
// Fastest stable Gemini Flash-Lite model on the Gemini Developer API free tier
// ---------------------------------------------------------------------------
export const GEMINI_MODEL_NAME = 'gemini-3.5-flash-lite';

// ---------------------------------------------------------------------------
// APP CHECK CONFIGURATION
// Google reCAPTCHA Enterprise site key
// ---------------------------------------------------------------------------
export const RECAPTCHA_ENTERPRISE_SITE_KEY = '6Lc_9SMuAAAAAFHocQiSg5hgZ3l-WC8Dd8GWynAP';

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

// App Check initialization with debug token support on localhost
let appCheckInstance: AppCheck | null = null;
if (typeof window !== 'undefined') {
  const isLocalhost =
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname.endsWith('.localhost');

  if (isLocalhost) {
    (self as any).FIREBASE_APPCHECK_DEBUG_TOKEN = true;
  }

  try {
    if (RECAPTCHA_ENTERPRISE_SITE_KEY) {
      appCheckInstance = initializeAppCheck(app, {
        provider: new ReCaptchaEnterpriseProvider(RECAPTCHA_ENTERPRISE_SITE_KEY),
        isTokenAutoRefreshEnabled: true,
      });
    }
  } catch (err) {
    console.warn('Firebase App Check initialization skipped:', err);
  }
}
export const appCheck = appCheckInstance;

// Firebase AI Logic SDK with Gemini Developer API backend
export const ai = getAI(app, { backend: new GoogleAIBackend() });

export const signInWithGoogle = async (): Promise<UserCredential> => {
  return signInWithPopup(auth, googleProvider);
};
