// Accesso ai dati Firestore, solo secondo docs/MODELLO-DATI.md.
import { useCallback, useEffect, useState } from 'react';
import {
  addDoc, collection, deleteField, doc, getDocs, onSnapshot, orderBy, query, serverTimestamp, setDoc, updateDoc, where,
  writeBatch, type DocumentData,
} from 'firebase/firestore';
import { db } from './firebase';
import { profiloDaDoc } from './sessione';
import type {
  Diario, Piano, PianoSalvato, ProfiloUtente, ScelteSettimana, StatoPasto, StatoUtente,
} from '../domain/tipi';

function basedati() {
  if (!db) throw new Error('Firestore non configurato');
  return db;
}

export interface Flusso<T> {
  dati: T;
  caricamento: boolean;
  errore: boolean;
  riprova: () => void;
}

/** Sottoscrizione generica con stato di caricamento/errore e "riprova". */
function useFlusso<T>(iniziale: T, avvia: ((ok: (v: T) => void, ko: () => void) => (() => void) | undefined) | null, chiave: string): Flusso<T> {
  const [stato, setStato] = useState<{ dati: T; caricamento: boolean; errore: boolean }>({ dati: iniziale, caricamento: !!avvia, errore: false });
  const [tentativo, setTentativo] = useState(0);
  useEffect(() => {
    if (!avvia) { setStato({ dati: iniziale, caricamento: false, errore: false }); return; }
    setStato((s) => ({ ...s, caricamento: true, errore: false }));
    return avvia(
      (dati) => setStato({ dati, caricamento: false, errore: false }),
      () => setStato((s) => ({ ...s, caricamento: false, errore: true })),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chiave, tentativo]);
  const riprova = useCallback(() => setTentativo((t) => t + 1), []);
  return { ...stato, riprova };
}

// ---------- Piani ----------

function pianoDaDoc(id: string, d: DocumentData): PianoSalvato {
  const ts = d.importatoIl;
  return {
    ...(d as Piano),
    id,
    attivo: d.attivo === true,
    importatoIlMs: typeof ts?.toMillis === 'function' ? ts.toMillis() : null,
  };
}
/** Più recente per primo; il timestamp non ancora confermato (null) conta come il più recente. */
const piuRecentePrima = (a: PianoSalvato, b: PianoSalvato) =>
  (b.importatoIlMs ?? Number.MAX_SAFE_INTEGER) - (a.importatoIlMs ?? Number.MAX_SAFE_INTEGER);

/** Piano attivo: il più recente con attivo==true. Gli altri attivi vengono disattivati. */
export function usePianoAttivo(uid: string | null): Flusso<PianoSalvato | null> {
  const f = useFlusso<PianoSalvato | null>(
    null,
    uid
      ? (ok, ko) => onSnapshot(
        query(collection(basedati(), 'utenti', uid, 'piani'), where('attivo', '==', true)),
        (snap) => {
          const piani = snap.docs.map((d) => pianoDaDoc(d.id, d.data())).sort(piuRecentePrima);
          ok(piani[0] ?? null);
          // Ripulisce eventuali piani attivi in più (es. importati dall'admin).
          if (piani.length > 1 && !snap.metadata.hasPendingWrites) {
            piani.slice(1).forEach((p) => {
              updateDoc(doc(basedati(), 'utenti', uid, 'piani', p.id), { attivo: false }).catch(() => undefined);
            });
          }
        },
        ko,
      )
      : null,
    uid ?? '',
  );
  return f;
}

/** Storico di tutti i piani (per Profilo). */
export async function elencoPiani(uid: string): Promise<PianoSalvato[]> {
  const snap = await getDocs(query(collection(basedati(), 'utenti', uid, 'piani'), orderBy('importatoIl', 'desc')));
  return snap.docs.map((d) => pianoDaDoc(d.id, d.data()));
}

/** Importa un piano. Per sé: salva come attivo e disattiva i precedenti. Per altri (admin): solo creazione. */
export async function importaPiano(
  destinatarioUid: string, proprioUid: string, piano: Piano, attiviPrecedenti: PianoSalvato[],
): Promise<void> {
  const d = basedati();
  const col = collection(d, 'utenti', destinatarioUid, 'piani');
  const dati = { ...piano, attivo: true, importatoIl: serverTimestamp() };
  if (destinatarioUid !== proprioUid) {
    await addDoc(col, dati);
    return;
  }
  const batch = writeBatch(d);
  batch.set(doc(col), dati);
  attiviPrecedenti.forEach((p) => batch.update(doc(col, p.id), { attivo: false }));
  await batch.commit();
}

// ---------- Scelte della settimana ----------

export function useScelte(uid: string, chiaveSett: string): Flusso<ScelteSettimana> {
  return useFlusso<ScelteSettimana>(
    {},
    (ok, ko) => onSnapshot(doc(basedati(), 'utenti', uid, 'settimane', chiaveSett), (s) => ok((s.data() ?? {}) as ScelteSettimana), ko),
    `${uid}/${chiaveSett}`,
  );
}

export function salvaSceltaComponente(uid: string, chiaveSett: string, chiaveComp: string, indice: number) {
  return setDoc(doc(basedati(), 'utenti', uid, 'settimane', chiaveSett), { componenti: { [chiaveComp]: indice } }, { merge: true });
}
export function salvaSceltaPiatto(uid: string, chiaveSett: string, chiavePasto: string, piattoId: string) {
  return setDoc(doc(basedati(), 'utenti', uid, 'settimane', chiaveSett), { piatti: { [chiavePasto]: piattoId } }, { merge: true });
}

// ---------- Diario ----------

export function useDiario(uid: string, giorno: string): Flusso<Diario> {
  return useFlusso<Diario>(
    {},
    (ok, ko) => onSnapshot(doc(basedati(), 'utenti', uid, 'diario', giorno), (s) => ok((s.data() ?? {}) as Diario), ko),
    `${uid}/${giorno}`,
  );
}

export function segnaPasto(uid: string, giorno: string, pastoId: string, stato: StatoPasto) {
  return setDoc(doc(basedati(), 'utenti', uid, 'diario', giorno), { [pastoId]: stato }, { merge: true });
}
/** Ripristina lo stato precedente (o toglie il segno se non c'era). */
export function annullaPasto(uid: string, giorno: string, pastoId: string, precedente: StatoPasto | undefined) {
  const ref = doc(basedati(), 'utenti', uid, 'diario', giorno);
  return precedente
    ? setDoc(ref, { [pastoId]: precedente }, { merge: true })
    : updateDoc(ref, { [pastoId]: deleteField() });
}

// ---------- Profilo e utenti ----------

export function salvaProfilo(uid: string, dati: { nome: string; intolleranze: string[] }) {
  return updateDoc(doc(basedati(), 'utenti', uid), { nome: dati.nome, intolleranze: dati.intolleranze });
}

/** Elenco utenti (solo admin: le regole lo consentono solo a lui). */
export function useUtenti(attivo: boolean): Flusso<ProfiloUtente[]> {
  return useFlusso<ProfiloUtente[]>(
    [],
    attivo
      ? (ok, ko) => onSnapshot(
        collection(basedati(), 'utenti'),
        (snap) => ok(snap.docs.map((d) => profiloDaDoc(d.id, d.data())).sort((a, b) => (b.creatoIlMs ?? Infinity) - (a.creatoIlMs ?? Infinity))),
        ko,
      )
      : null,
    attivo ? 'admin' : '',
  );
}

/** L'admin modifica solo il campo stato (le regole non consentono altro). */
export function impostaStatoUtente(uid: string, stato: StatoUtente) {
  return updateDoc(doc(basedati(), 'utenti', uid), { stato });
}

/** Salva le correzioni al contenuto di un piano (solo il proprietario: le regole non lo consentono all'admin). */
export function salvaModifichePiano(uid: string, pianoId: string, piano: Piano) {
  const contenuto = JSON.parse(JSON.stringify(piano)) as Piano; // toglie eventuali undefined
  return updateDoc(doc(basedati(), 'utenti', uid, 'piani', pianoId), { ...contenuto });
}

/** Diari di più giorni (per la griglia della Settimana). */
export function useDiariGiorni(uid: string, giorni: string[]): Flusso<Record<string, Diario>> {
  return useFlusso<Record<string, Diario>>(
    {},
    (ok, ko) => {
      const acc: Record<string, Diario> = {};
      const annulla = giorni.map((g) => onSnapshot(
        doc(basedati(), 'utenti', uid, 'diario', g),
        (s) => { acc[g] = (s.data() ?? {}) as Diario; ok({ ...acc }); },
        ko,
      ));
      return () => annulla.forEach((a) => a());
    },
    `${uid}/${giorni.join(',')}`,
  );
}
