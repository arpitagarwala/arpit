import { getApps, initializeApp } from 'firebase/app';
import { connectAuthEmulator, getAuth } from 'firebase/auth';
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore';

import {firebaseConfig} from './account-config';

const {apiKey, authDomain, projectId, appId} = firebaseConfig;
const emulator = process.env.NODE_ENV === 'development' &&
  process.env.NEXT_PUBLIC_FIREBASE_EMULATOR === '1';

export function accountFirebase() {
  if (!apiKey || !authDomain || !projectId || !appId) {
    throw new Error('Account sign-in is unavailable.');
  }

  const existing = getApps().find(app => app.name === 'site-account');
  const app = existing ?? initializeApp({apiKey, authDomain, projectId, appId}, 'site-account');
  const auth = getAuth(app);
  const db = getFirestore(app);
  if (emulator && !existing) {
    connectAuthEmulator(auth, 'http://127.0.0.1:9099', {disableWarnings: true});
    connectFirestoreEmulator(db, '127.0.0.1', 8080);
  }

  return {auth, db};
}
