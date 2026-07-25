import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Firebase Web Configuration
// These can be replaced with your actual keys from Firebase Console > Project Settings > General > Your Apps (Web)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyFakeKey_replace_this_with_yours",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "sneprofficial26.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "sneprofficial26",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "sneprofficial26.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "860014944083",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:860014944083:web:fakeappid",
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { app, auth, googleProvider };
