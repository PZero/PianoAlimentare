import { GIORNI, type Giorno } from './tipi';

const due = (n: number) => String(n).padStart(2, '0');

/** Giorno della settimana (lun..dom) di una data locale. */
export function giornoSettimana(d: Date): Giorno {
  return GIORNI[(d.getDay() + 6) % 7];
}

/** Chiave del giorno aaaa-mm-gg (data locale). */
export function chiaveGiorno(d: Date): string {
  return `${d.getFullYear()}-${due(d.getMonth() + 1)}-${due(d.getDate())}`;
}

/** Chiave della settimana ISO 8601, es. 2026-W43. */
export function chiaveSettimana(d: Date): string {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const giorno = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - giorno); // giovedì della settimana
  const anno = t.getUTCFullYear();
  const inizio = Date.UTC(anno, 0, 1);
  const sett = Math.ceil(((t.getTime() - inizio) / 86400000 + 1) / 7);
  return `${anno}-W${due(sett)}`;
}

/** Lunedì (data locale, ore 12 per evitare problemi di ora legale) di una chiave settimana. */
export function lunediDiSettimana(chiave: string): Date {
  const m = /^(\d{4})-W(\d{2})$/.exec(chiave);
  if (!m) throw new Error(`Chiave settimana non valida: ${chiave}`);
  const anno = Number(m[1]);
  const sett = Number(m[2]);
  const quattroGen = new Date(anno, 0, 4, 12);
  const lunPrima = new Date(anno, 0, 4 - ((quattroGen.getDay() + 6) % 7), 12);
  return new Date(lunPrima.getFullYear(), lunPrima.getMonth(), lunPrima.getDate() + (sett - 1) * 7, 12);
}

/** Chiave della settimana spostata di n settimane. */
export function spostaSettimana(chiave: string, n: number): string {
  const l = lunediDiSettimana(chiave);
  return chiaveSettimana(new Date(l.getFullYear(), l.getMonth(), l.getDate() + n * 7, 12));
}

/** Data del giorno (lun..dom) dentro la settimana indicata. */
export function dataDelGiorno(chiave: string, giorno: Giorno): Date {
  const l = lunediDiSettimana(chiave);
  return new Date(l.getFullYear(), l.getMonth(), l.getDate() + GIORNI.indexOf(giorno), 12);
}

const MESI = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'];
export const nomeMese = (d: Date) => MESI[d.getMonth()];
