// Sessione: login Google (popup), profilo utenti/{uid} e stato di approvazione.
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut, type User } from 'firebase/auth';
import { doc, getDocFromServer, onSnapshot, serverTimestamp, setDoc, type DocumentData } from 'firebase/firestore';
import { auth, db, firebaseConfigurato, providerGoogle } from './firebase';
import type { ProfiloUtente } from '../domain/tipi';

export type Sessione =
  | { fase: 'config-mancante' }
  | { fase: 'caricamento' }
  | { fase: 'fuori' }
  | { fase: 'dentro'; utente: User; profilo: ProfiloUtente | null; erroreProfilo: boolean };

interface ContestoSessione {
  sessione: Sessione;
  accedi: () => Promise<string | null>;
  esci: () => Promise<void>;
  ricontrolla: () => Promise<void>;
}

const Ctx = createContext<ContestoSessione | null>(null);

export function profiloDaDoc(uid: string, d: DocumentData): ProfiloUtente {
  return {
    uid,
    nome: typeof d.nome === 'string' ? d.nome : '',
    email: typeof d.email === 'string' ? d.email : '',
    stato: d.stato === 'approvato' || d.stato === 'bloccato' ? d.stato : 'in_attesa',
    ruolo: d.ruolo === 'admin' ? 'admin' : 'utente',
    intolleranze: Array.isArray(d.intolleranze) ? d.intolleranze.filter((x: unknown) => typeof x === 'string') : [],
    creatoIlMs: typeof d.creatoIl?.toMillis === 'function' ? d.creatoIl.toMillis() : null,
  };
}

function messaggioErroreLogin(e: unknown): string | null {
  const codice = (e as { code?: string })?.code ?? '';
  if (codice === 'auth/popup-closed-by-user' || codice === 'auth/cancelled-popup-request') return null;
  if (codice === 'auth/popup-blocked') return 'Il browser ha bloccato la finestra di accesso. Consenti i popup e riprova.';
  if (codice === 'auth/network-request-failed') return 'Connessione assente. Controlla la rete e riprova.';
  if (codice === 'auth/unauthorized-domain') return 'Questo indirizzo non è ancora autorizzato per l\'accesso. Avvisa l\'amministratore.';
  return 'Accesso non riuscito. Riprova tra poco.';
}

export function SessioneProvider({ children }: { children: ReactNode }) {
  const [sessione, setSessione] = useState<Sessione>(
    firebaseConfigurato ? { fase: 'caricamento' } : { fase: 'config-mancante' },
  );
  const creazioneInCorso = useRef<string | null>(null);

  useEffect(() => {
    if (!auth || !db) return;
    let annullaProfilo: (() => void) | undefined;
    const annullaAuth = onAuthStateChanged(auth, (utente) => {
      annullaProfilo?.();
      annullaProfilo = undefined;
      if (!utente) {
        creazioneInCorso.current = null;
        setSessione({ fase: 'fuori' });
        return;
      }
      setSessione({ fase: 'dentro', utente, profilo: null, erroreProfilo: false });
      const ref = doc(db!, 'utenti', utente.uid);
      annullaProfilo = onSnapshot(
        ref,
        (snap) => {
          if (snap.exists()) {
            setSessione({ fase: 'dentro', utente, profilo: profiloDaDoc(utente.uid, snap.data()), erroreProfilo: false });
          } else if (creazioneInCorso.current !== utente.uid) {
            // Primo accesso: esattamente i campi richiesti dalle regole Firestore.
            creazioneInCorso.current = utente.uid;
            setDoc(ref, {
              nome: utente.displayName || utente.email || 'Utente',
              email: utente.email || '',
              stato: 'in_attesa',
              ruolo: 'utente',
              creatoIl: serverTimestamp(),
              intolleranze: [],
            }).catch(() => {
              creazioneInCorso.current = null;
              setSessione({ fase: 'dentro', utente, profilo: null, erroreProfilo: true });
            });
          }
        },
        () => setSessione({ fase: 'dentro', utente, profilo: null, erroreProfilo: true }),
      );
    });
    return () => { annullaProfilo?.(); annullaAuth(); };
  }, []);

  const accedi = useCallback(async () => {
    if (!auth) return 'Configurazione mancante.';
    try {
      await signInWithPopup(auth, providerGoogle);
      return null;
    } catch (e) {
      return messaggioErroreLogin(e);
    }
  }, []);

  const esci = useCallback(async () => { if (auth) await signOut(auth); }, []);

  const ricontrolla = useCallback(async () => {
    if (!db || !auth?.currentUser) return;
    const u = auth.currentUser;
    try {
      const snap = await getDocFromServer(doc(db, 'utenti', u.uid));
      if (snap.exists()) setSessione({ fase: 'dentro', utente: u, profilo: profiloDaDoc(u.uid, snap.data()), erroreProfilo: false });
    } catch {
      setSessione({ fase: 'dentro', utente: u, profilo: null, erroreProfilo: true });
    }
  }, []);

  const valore = useMemo(() => ({ sessione, accedi, esci, ricontrolla }), [sessione, accedi, esci, ricontrolla]);
  return <Ctx.Provider value={valore}>{children}</Ctx.Provider>;
}

export function useSessione(): ContestoSessione {
  const c = useContext(Ctx);
  if (!c) throw new Error('useSessione fuori da SessioneProvider');
  return c;
}
