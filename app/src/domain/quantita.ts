import type { Opzione, Unita } from './tipi';

const PLURALI: Partial<Record<Unita, string>> = {
  pezzo: 'pezzi', fetta: 'fette', cucchiaio: 'cucchiai', cucchiaino: 'cucchiaini', vasetto: 'vasetti', porzione: 'porzioni',
};

const num = (n: number) => new Intl.NumberFormat('it-IT', { maximumFractionDigits: 2 }).format(n);

function unita(u: Unita, q: number): string {
  if (u === 'g' || u === 'mL') return u;
  return q === 1 ? u : (PLURALI[u] ?? u);
}

/** Testo della quantità: "180 g", "100-130 g", "2 fette", "q.b.". */
export function formatQuantita(o: Pick<Opzione, 'quantita' | 'quantitaMin' | 'unita'>): string {
  if (o.unita === 'qb' || o.quantita == null) return 'q.b.';
  if (o.quantitaMin != null && o.quantitaMin !== o.quantita) {
    return `${num(o.quantitaMin)}-${num(o.quantita)} ${unita(o.unita, o.quantita)}`;
  }
  return `${num(o.quantita)} ${unita(o.unita, o.quantita)}`;
}
