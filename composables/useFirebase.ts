import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getDatabase, type Database } from "firebase/database";
import { getFirestore, type Firestore } from "firebase/firestore";

let app: FirebaseApp | undefined;
let db: Database | undefined;
let firestore: Firestore | undefined;

export const useFirebase = () => {
  const config = useRuntimeConfig();

  if (!getApps().length) {
    app = initializeApp({
      apiKey: config.public.firebaseApiKey,
      authDomain: config.public.firebaseAuthDomain,
      databaseURL: config.public.firebaseDatabaseURL,
      projectId: config.public.firebaseProjectId,
      storageBucket: config.public.firebaseStorageBucket,
      messagingSenderId: config.public.firebaseMessagingSenderId,
      appId: config.public.firebaseAppId,
    });
  } else {
    app = getApps()[0];
  }

  if (!db) {
    db = getDatabase(app);
  }

  if (!firestore) {
    firestore = getFirestore(app);
  }

  return { app, db, firestore };
};
