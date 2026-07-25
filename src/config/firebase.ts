import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Firebase Web Configuration
// These can be replaced with your actual keys from Firebase Console > Project Settings > General > Your Apps (Web)
const firebaseConfig = {
  apiKey: "AIzaSyDlYDbj6qHdFbVftvz5SOW4KYe1rUaEqFM",
  authDomain: "sneprofficial26.firebaseapp.com",
  projectId: "sneprofficial26",
  storageBucket: "sneprofficial26.firebasestorage.app",
  messagingSenderId: "860014944083",
  appId: "1:860014944083:web:5e7281c92eeaa7afcd4ba6",
  measurementId: "G-3F11GR7Z1F"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { app, auth, googleProvider };
