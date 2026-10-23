// Inizializzazione Firebase (SDK modulare). Configurazione solo da variabili VITE_FIREBASE_* (.env nella radice).
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import {
  getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager,
} from 'firebase/firestore';

const env = import.meta.env;
const config = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
};

/** false se manca la configurazione: l'interfaccia mostra un avviso invece di rompersi. */
export const firebaseConfigurato = Boolean(config.apiKey && config.projectId && config.appId);

const app = firebaseConfigurato ? initializeApp(config) : undefined;

export const auth = app ? getAuth(app) : undefined;
export const providerGoogle = new GoogleAuthProvider();
providerGoogle.setCustomParameters({ prompt: 'select_account' });

function creaDb() {
  if (!app) return undefined;
  try {
    // Cache offline: i dati già letti restano leggibili senza rete.
    return initializeFirestore(app, { localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }) });
  } catch {
    return getFirestore(app);
  }
}
export const db = creaDb();
