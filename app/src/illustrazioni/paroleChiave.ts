// Tabella parole chiave -> illustrazione. Unico punto da modificare per aggiungere alimenti.
// L'ordine è la priorità (docs/DESIGN.md, sezione 4).
export type NomeIllustrazione =
  | 'Piatto' | 'Ciotola' | 'Insalata' | 'Legumi' | 'Pesce' | 'Carne' | 'Uova' | 'Formaggio' | 'Pane' | 'Cereali'
  | 'Frutta' | 'Verdura' | 'Frullato' | 'Yogurt' | 'Tazza' | 'Libero' | 'Digiuno' | 'Carrello' | 'Bilancia'
  | 'Germoglio' | 'Orologio' | 'Cloche';

export const PAROLE_CHIAVE: { illustrazione: NomeIllustrazione; parole: string[] }[] = [
  { illustrazione: 'Pesce', parole: ['pesce', 'tonno', 'salmone', 'merluzzo', 'orata', 'branzino', 'gamber', 'sgombro', 'spigola'] },
  { illustrazione: 'Carne', parole: ['pollo', 'tacchino', 'manzo', 'vitello', 'maiale', 'prosciutto', 'bresaola', 'carne', 'fesa', 'hamburger'] },
  { illustrazione: 'Uova', parole: ['uov', 'albume', 'omelette', 'frittata'] },
  { illustrazione: 'Legumi', parole: ['ceci', 'lenticchie', 'fagioli', 'piselli', 'legumi', 'fave'] },
  { illustrazione: 'Formaggio', parole: ['formaggio', 'ricotta', 'mozzarella', 'parmigiano', 'feta', 'grana', 'scamorza'] },
  { illustrazione: 'Cereali', parole: ['riso', 'pasta', 'orzo', 'farro', 'avena', 'cereali', 'quinoa', 'couscous', 'porridge', 'muesli'] },
  { illustrazione: 'Pane', parole: ['pane', 'fett', 'gallette', 'crackers', 'toast', 'piadina', 'cracker'] },
  { illustrazione: 'Yogurt', parole: ['yogurt', 'skyr', 'kefir'] },
  { illustrazione: 'Frullato', parole: ['frullato', 'shake', 'smoothie', 'latte'] },
  { illustrazione: 'Frutta', parole: ['frutta', 'mela', 'pera', 'banana', 'arancia', 'kiwi', 'fragol', 'frutti', 'ananas', 'pesca', 'uva', 'mirtill', 'albicocc'] },
  { illustrazione: 'Insalata', parole: ['insalata', 'rucola', 'lattuga', 'valeriana'] },
  { illustrazione: 'Verdura', parole: ['verdura', 'zucchine', 'spinaci', 'carote', 'broccoli', 'pomodor', 'melanzane', 'peperoni', 'finocchi', 'cavol', 'asparagi', 'fagiolini', 'cetriol'] },
];

/** Illustrazioni "principali": proteine, cereali, legumi (si sceglie quella con più grammi). */
export const CATEGORIE_PRINCIPALI: NomeIllustrazione[] = ['Pesce', 'Carne', 'Uova', 'Legumi', 'Formaggio', 'Cereali', 'Pane', 'Yogurt'];

/** Accento di default: salvia per verdure, frutta e legumi; terracotta per il resto. */
export const ACCENTO_SALVIA: NomeIllustrazione[] = ['Legumi', 'Frutta', 'Verdura', 'Insalata', 'Germoglio'];

export const PAROLE_ZUPPA = ['zuppa', 'minestra', 'minestrone', 'vellutata', 'brodo'];
