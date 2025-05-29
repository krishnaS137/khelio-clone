// src/lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";
import { firebaseConfig } from "./firebaseConfig";

// Initialize Firebase app once
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Firestore instance
export const db = getFirestore(app);

// Auth instance and Google provider
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();

// Analytics (browser-only)
let analytics: ReturnType<typeof getAnalytics> | null = null;
isSupported().then((supported) => {
  if (supported) {
    analytics = getAnalytics(app);
  }
});

export { app, analytics };
