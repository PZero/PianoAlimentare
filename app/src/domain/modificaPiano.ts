// Controllo e modifica di un piano (anteprima dell'import e "Modifica piano"). Funzioni pure.
import { GIORNI, type Alimento, type Canale, type Piano, type Unita } from './tipi';

export type Categoria = 'qb' | 'nuovi' | 'senzaCanale';

/** Identifica un'opzione (ingrediente) di un piatto: indice del componente e dell'opzione. */
export const chiaveIngrediente = (piattoId: string, componente: number, opzione: number) => `${piattoId}.${componente}.${opzione}`;

/** Id dei piatti nell'ordine in cui compaiono nel menu (giorno per giorno), poi quelli non assegnati. */
export function ordinePiatti(piano: Piano): { id: string; nonAssegnato: boolean }[] {
  const visti = new Set<string>();
  const out: { id: string; nonAssegnato: boolean }[] = [];
  const aggiungi = (id: string, nonAssegnato = false) => {
    if (visti.has(id) || !piano.piatti[id]) return;
    visti.add(id);
    out.push({ id, nonAssegnato });
  };
  for (const g of GIORNI) {
    const celle = piano.settimana[g] ?? {};
    for (const def of piano.pasti) {
      const c = celle[def.id];
      if (!c) continue;
      if (c.tipo === 'piatto') aggiungi(c.piatto);
      else if (c.tipo === 'scelta') {
        for (const gid of c.gruppi) piano.gruppi?.find((x) => x.id === gid)?.piatti.forEach((p) => aggiungi(p));
      }
    }
  }
  Object.keys(piano.piatti).forEach((id) => aggiungi(id, true));
  return out;
}

export interface Punti {
  qb: string[];
  nuovi: string[];
  senzaCanale: string[];
}

/** Ingredienti da verificare, per categoria, nell'ordine del menu. `alimentiNoti`: id già presenti in un piano precedente. */
export function puntiDaVerificare(piano: Piano, alimentiNoti?: ReadonlySet<string>): Punti {
  const punti: Punti = { qb: [], nuovi: [], senzaCanale: [] };
  for (const { id } of ordinePiatti(piano)) {
    piano.piatti[id].componenti.forEach((c, ci) => c.opzioni.forEach((o, oi) => {
      const a = piano.alimenti[o.alimento];
      const k = chiaveIngrediente(id, ci, oi);
      if (o.unita === 'qb' && a && a.canale !== 'base') punti.qb.push(k);
      if (alimentiNoti && !alimentiNoti.has(o.alimento)) punti.nuovi.push(k);
      if (a && !a.canale) punti.senzaCanale.push(k);
    }));
  }
  return punti;
}

export const slug = (testo: string) =>
  testo.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'alimento';

const copia = <T,>(v: T): T => JSON.parse(JSON.stringify(v)) as T;

export interface DatiIngrediente {
  nome: string;
  quantita: number | null;
  unita: Unita;
  canale?: Canale;
}

/** Id di un alimento con questo nome (senza distinzione di maiuscole), se esiste. */
function trovaAlimento(piano: Piano, nome: string): string | undefined {
  const n = nome.trim().toLowerCase();
  return Object.entries(piano.alimenti).find(([, a]) => a.nome.trim().toLowerCase() === n)?.[0];
}
function idLibero(piano: Piano, base: string): string {
  let id = base;
  for (let i = 2; id in piano.alimenti; i++) id = `${base}-${i}`;
  return id;
}

/** Aggiorna un'opzione. Il nome e il canale appartengono all'alimento (valgono dovunque compaia). */
export function aggiornaIngrediente(piano: Piano, piattoId: string, ci: number, oi: number, dati: DatiIngrediente): Piano {
  const p = copia(piano);
  const o = p.piatti[piattoId]?.componenti[ci]?.opzioni[oi];
  if (!o) return piano;
  const nome = dati.nome.trim();
  const esistente = trovaAlimento(p, nome);
  let id = o.alimento;
  if (esistente && esistente !== id) {
    id = esistente; // il nome coincide con un alimento già noto: lo si riusa
  } else {
    p.alimenti[id] = { ...p.alimenti[id], nome };
  }
  if (dati.canale) p.alimenti[id] = { ...p.alimenti[id], canale: dati.canale };
  o.alimento = id;
  o.unita = dati.unita;
  if (dati.unita === 'qb') { delete o.quantita; delete o.quantitaMin; }
  else {
    o.quantita = dati.quantita;
    if (o.quantitaMin != null && dati.quantita != null && o.quantitaMin > dati.quantita) delete o.quantitaMin;
  }
  return p;
}

export function eliminaIngrediente(piano: Piano, piattoId: string, ci: number, oi: number): Piano {
  const p = copia(piano);
  const c = p.piatti[piattoId]?.componenti[ci];
  if (!c) return piano;
  c.opzioni.splice(oi, 1);
  if (c.opzioni.length === 0) p.piatti[piattoId].componenti.splice(ci, 1);
  return p;
}

/** Aggiunge un ingrediente. Con `alternativaDi` diventa un'opzione alternativa di quel componente. */
export function aggiungiIngrediente(piano: Piano, piattoId: string, dati: DatiIngrediente, alternativaDi?: number): Piano {
  const p = copia(piano);
  const piatto = p.piatti[piattoId];
  if (!piatto) return piano;
  const nome = dati.nome.trim();
  let id = trovaAlimento(p, nome);
  if (!id) {
    id = idLibero(p, slug(nome));
    const nuovo: Partial<Alimento> = { nome };
    if (dati.canale) nuovo.canale = dati.canale;
    p.alimenti[id] = nuovo as Alimento;
  } else if (dati.canale) {
    p.alimenti[id] = { ...p.alimenti[id], canale: dati.canale };
  }
  const opzione = dati.unita === 'qb'
    ? { alimento: id, unita: dati.unita }
    : { alimento: id, quantita: dati.quantita, unita: dati.unita };
  if (alternativaDi !== undefined && piatto.componenti[alternativaDi]) piatto.componenti[alternativaDi].opzioni.push(opzione);
  else piatto.componenti.push({ opzioni: [opzione] });
  return p;
}

export function rinominaPiatto(piano: Piano, piattoId: string, nome: string): Piano {
  const p = copia(piano);
  if (!p.piatti[piattoId]) return piano;
  p.piatti[piattoId].nome = nome.trim();
  return p;
}

export function impostaPreparazione(piano: Piano, piattoId: string, testo: string): Piano {
  const p = copia(piano);
  if (!p.piatti[piattoId]) return piano;
  const t = testo.trim();
  if (t) p.piatti[piattoId].preparazione = t; else delete p.piatti[piattoId].preparazione;
  return p;
}

/** Quanti piatti e alimenti sono cambiati fra due versioni del piano. */
export function contaVariazioni(prima: Piano, dopo: Piano): number {
  const diverso = (a: unknown, b: unknown) => JSON.stringify(a) !== JSON.stringify(b);
  let n = 0;
  for (const id of new Set([...Object.keys(prima.piatti), ...Object.keys(dopo.piatti)])) {
    if (diverso(prima.piatti[id], dopo.piatti[id])) n++;
  }
  for (const id of new Set([...Object.keys(prima.alimenti), ...Object.keys(dopo.alimenti)])) {
    if (diverso(prima.alimenti[id], dopo.alimenti[id])) n++;
  }
  return n;
}
