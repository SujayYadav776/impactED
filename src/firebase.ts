import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

let app;
let auth;
let db;
let isFirebaseAvailable = false;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  // Custom firestore database ID must be passed
  db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
  isFirebaseAvailable = true;
  console.log("Firebase initialized successfully with custom Firestore database.");
} catch (error) {
  console.error("Firebase failed to initialize, falling back to local simulation:", error);
}

export { app, auth, db, isFirebaseAvailable };
