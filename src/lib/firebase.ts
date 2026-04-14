import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getDatabase, type Database } from 'firebase/database';

// Env vars di-embed oleh Next.js untuk client bundle
const DB_URL = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL;

const firebaseConfig = {
  apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  databaseURL:       DB_URL,
};

// Prevent re-initializing on hot reload
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const db = getFirestore(app);

// Inisialisasi RTDB dengan URL eksplisit agar tidak bergantung pada inference region
let rtdb: Database | null = null;
if (DB_URL) {
  rtdb = getDatabase(app, DB_URL);
}
export { rtdb };
