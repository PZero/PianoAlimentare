// Tipi del piano (formato versione 1, vedi docs/IMPORT.md) e dei dati collegati.

export const GIORNI = ['lun', 'mar', 'mer', 'gio', 'ven', 'sab', 'dom'] as const;
export type Giorno = (typeof GIORNI)[number];

export const NOMI_GIORNO: Record<Giorno, string> = {
  lun: 'Lunedì', mar: 'Martedì', mer: 'Mercoledì', gio: 'Giovedì', ven: 'Venerdì', sab: 'Sabato', dom: 'Domenica',
};

export type Unita = 'g' | 'mL' | 'pezzo' | 'fetta' | 'cucchiaio' | 'cucchiaino' | 'vasetto' | 'porzione' | 'qb';
export type Canale = 'amazon' | 'fresco' | 'base' | 'esterno';

export interface Opzione {
  alimento: string;
  quantita?: number | null;
  quantitaMin?: number;
  unita: Unita;
}
export interface Componente { opzioni: Opzione[]; /** intero >=1, assente = 1 */ portata?: number }
export interface Piatto {
  nome: string;
  componenti: Componente[];
  preparazione?: string;
  varianti?: Piatto[];
}
export interface PastoDef { id: string; nome: string; facoltativo?: boolean }
export interface Gruppo { id: string; nome: string; piatti: string[] }
export interface Alimento { nome: string; canale: Canale; link?: string; tag?: string[] }

export type Cella =
  | { tipo: 'piatto'; piatto: string }
  | { tipo: 'scelta'; gruppi: string[] }
  | { tipo: 'libero' }
  | { tipo: 'digiuno' };

export interface RegolaVarieta {
  tipo: 'varieta';
  pasto: string;
  minDiversi: number;
  giorni: number;
  testo?: string;
}

export interface Piano {
  versione: 1;
  titolo: string;
  dataVisita?: string;
  pasti: PastoDef[];
  settimana: Partial<Record<Giorno, Record<string, Cella>>>;
  gruppi?: Gruppo[];
  piatti: Record<string, Piatto>;
  alimenti: Record<string, Alimento>;
  note?: string[];
  regole?: RegolaVarieta[];
}

/** Piano come salvato in utenti/{uid}/piani/{id} */
export interface PianoSalvato extends Piano {
  id: string;
  attivo: boolean;
  /** millisecondi; null finché il server non ha confermato il timestamp */
  importatoIlMs: number | null;
}

/** Scelte della settimana: utenti/{uid}/settimane/{aaaa-Www} */
export interface ScelteSettimana {
  /** chiave componente (vedi chiaveComponente) -> indice dell'opzione scelta */
  componenti?: Record<string, number>;
  /** chiave pasto (vedi chiavePasto) -> id del piatto scelto nei pasti di tipo "scelta" */
  piatti?: Record<string, string>;
}

export type StatoPasto = 'fatto' | 'sostituito' | 'saltato';
/** Diario del giorno: utenti/{uid}/diario/{aaaa-mm-gg} = { idPasto: stato } */
export type Diario = Record<string, StatoPasto>;

export type StatoUtente = 'in_attesa' | 'approvato' | 'bloccato';
export interface ProfiloUtente {
  uid: string;
  nome: string;
  email: string;
  stato: StatoUtente;
  ruolo: 'utente' | 'admin';
  intolleranze: string[];
  creatoIlMs: number | null;
}
