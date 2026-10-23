// MODALITÀ DEMO (solo sviluppo): archivio in memoria al posto di Firestore, con dati inventati.
// Attiva solo con import.meta.env.DEV e "?demo" nell'URL: in produzione DEMO è false e il codice viene eliminato.
export const DEMO: boolean = import.meta.env.DEV && typeof location !== 'undefined' && new URLSearchParams(location.search).has('demo');

type Ascoltatore = (v: unknown) => void;

const valori = new Map<string, unknown>();
const ascoltatori = new Map<string, Set<Ascoltatore>>();

export function demoLeggi<T>(chiave: string, predefinito: T): T {
  return (valori.has(chiave) ? valori.get(chiave) : predefinito) as T;
}

export function demoScrivi(chiave: string, valore: unknown): void {
  valori.set(chiave, valore);
  ascoltatori.get(chiave)?.forEach((f) => f(valore));
}

/** Unisce campi in un oggetto (come setDoc con merge). */
export function demoUnisci(chiave: string, parziale: Record<string, unknown>): void {
  demoScrivi(chiave, { ...demoLeggi<Record<string, unknown>>(chiave, {}), ...parziale });
}

export function demoSottoscrivi<T>(chiave: string, predefinito: T, ok: (v: T) => void): () => void {
  const set = ascoltatori.get(chiave) ?? new Set<Ascoltatore>();
  ascoltatori.set(chiave, set);
  const f: Ascoltatore = (v) => ok(v as T);
  set.add(f);
  queueMicrotask(() => ok(demoLeggi(chiave, predefinito)));
  return () => { set.delete(f); };
}
