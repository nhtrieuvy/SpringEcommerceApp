// Firebase configuration and initialization
import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator, enableNetwork } from 'firebase/firestore';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
// Import the functions you need from the SDKs you need
import { getAnalytics } from "firebase/analytics";

// Firebase configuration object
const firebaseConfig = {
  apiKey: "AIzaSyBN0r3rCAXTlGNCw5RTGHvitN_2SueUJgc",
  authDomain: "ecommerceweb-9e280.firebaseapp.com",
  projectId: "ecommerceweb-9e280",
  storageBucket: "ecommerceweb-9e280.appspot.com", // Corrected storage bucket URL
  messagingSenderId: "1030587785100",
  appId: "1:1030587785100:web:ec0175a21f56667da380a9",
  measurementId: "G-8GPVD91RYG"
};

console.log('[firebase.js] Initializing Firebase with config:', firebaseConfig);

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services with error handling
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);


let isAuthInitialized = false;

const initializeFirebaseAuth = async () => {
  if (isAuthInitialized) return;
  
  try {
    // Check if user is already signed in
    if (!auth.currentUser) {
      console.log('Signing in anonymously to Firebase...');
      await signInAnonymously(auth);
      console.log('Firebase anonymous authentication successful');
    }
    isAuthInitialized = true;
  } catch (error) {
    console.error('Firebase authentication failed:', error);
    throw error;
  }
};

// Monitor auth state changes
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log('Firebase Auth user:', user.isAnonymous ? 'Anonymous' : user.email);
    isAuthInitialized = true;
  } else {
    console.log('Firebase Auth user signed out');
    isAuthInitialized = false;
  }
});

// Auto-initialize auth when Firebase is imported
initializeFirebaseAuth();

// Export the auth initialization function for manual use
export { initializeFirebaseAuth };

// Enable network for Firestore
enableNetwork(db).catch((error) => {
  console.warn('Failed to enable Firestore network:', error);
});

export default app;
