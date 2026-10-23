// Scelta deterministica dell'illustrazione di un piatto (docs/DESIGN.md, sezione 4).
import type { Alimento, Piatto, Unita } from '../domain/tipi';
import type { Accento } from './Illu';
import { ACCENTO_SALVIA, CATEGORIE_PRINCIPALI, PAROLE_CHIAVE, PAROLE_ZUPPA, type NomeIllustrazione } from './paroleChiave';

export interface Scelta { nome: NomeIllustrazione; accento: Accento }

/** Peso approssimativo in grammi, per confrontare ingredienti con unità diverse. */
const GRAMMI: Record<Unita, number> = {
  g: 1, mL: 1, pezzo: 50, fetta: 30, cucchiaio: 15, cucchiaino: 5, vasetto: 125, porzione: 100, qb: 0,
};

function trova(testo: string): NomeIllustrazione | undefined {
  const t = testo.toLowerCase();
  return PAROLE_CHIAVE.find((k) => k.parole.some((p) => t.includes(p)))?.illustrazione;
}
const con = (nome: NomeIllustrazione): Scelta => ({ nome, accento: ACCENTO_SALVIA.includes(nome) ? 'salvia' : 'terracotta' });

/**
 * Illustrazione di un piatto. `pastoId` serve solo per la colazione (Tazza).
 * Tipi di cella libero/digiuno si gestiscono con illustrazioneCella().
 */
export function illustrazionePiatto(
  piatto: Piatto, alimenti: Record<string, Alimento>, pastoId?: string,
): Scelta {
  const nomeP = piatto.nome.toLowerCase();
  const voci = piatto.componenti.map((c) => {
    const o = c.opzioni[0];
    const a = alimenti[o.alimento];
    const testo = `${a?.nome ?? o.alimento} ${(a?.tag ?? []).join(' ')}`;
    return { illu: trova(testo), grammi: (o.quantita ?? 0) * GRAMMI[o.unita] };
  });

  // 1) Parole forti nel nome del piatto
  if (PAROLE_ZUPPA.some((p) => nomeP.includes(p)) || (piatto.componenti.length > 4 && /zupp|minestr/.test(nomeP))) return con('Ciotola');
  if (/smoothie|frullato|shake/.test(nomeP)) return con('Frullato');
  if (/insalata/.test(nomeP)) return con('Insalata');

  // 2) Alimento principale: più grammi fra proteine/cereali/legumi, a pari merito il primo
  let migliore: { illu: NomeIllustrazione; grammi: number } | undefined;
  for (const v of voci) {
    if (!v.illu || !CATEGORIE_PRINCIPALI.includes(v.illu)) continue;
    if (!migliore || v.grammi > migliore.grammi) migliore = { illu: v.illu, grammi: v.grammi };
  }
  if (migliore) return con(migliore.illu);

  // 3) Altre categorie, in ordine di priorità della tabella
  const presenti = new Set(voci.map((v) => v.illu).filter(Boolean));
  const altra = PAROLE_CHIAVE.map((k) => k.illustrazione).find((n) => presenti.has(n));
  if (altra) return con(altra);

  // 4) Nome del piatto
  const dalNome = trova(nomeP);
  if (dalNome) return con(dalNome);

  // 5) Colazione senza riscontri, altrimenti piatto generico
  if (pastoId && /colazione/.test(pastoId)) return con('Tazza');
  return con('Piatto');
}

/** Illustrazione di un pasto che non ha un piatto (libero / digiuno). */
export function illustrazioneCella(tipo: 'libero' | 'digiuno'): Scelta {
  return con(tipo === 'libero' ? 'Libero' : 'Digiuno');
}
