// Piano INVENTATO e minimo, solo per i test (nessun dato reale).
import type { Cella, Giorno, Piano } from '../tipi';
import { GIORNI } from '../tipi';

const giornoTipo: Record<string, Cella> = {
  colazione: { tipo: 'scelta', gruppi: ['colazioni'] },
  pranzo: { tipo: 'piatto', piatto: 'insalata' },
  cena: { tipo: 'piatto', piatto: 'zuppa' },
};

const settimana: Piano['settimana'] = {};
for (const g of GIORNI) settimana[g as Giorno] = { ...giornoTipo };
settimana.sab = { ...giornoTipo, cena: { tipo: 'libero' } };
settimana.dom = { colazione: giornoTipo.colazione, pranzo: giornoTipo.pranzo, cena: { tipo: 'digiuno' } };

export const pianoMinimo: Piano = {
  versione: 1,
  titolo: 'Piano di prova (inventato)',
  dataVisita: '2026-01-10',
  pasti: [
    { id: 'colazione', nome: 'Colazione' },
    { id: 'pranzo', nome: 'Pranzo' },
    { id: 'cena', nome: 'Cena' },
  ],
  settimana,
  gruppi: [{ id: 'colazioni', nome: 'Colazioni di prova', piatti: ['yogurt', 'toast'] }],
  piatti: {
    yogurt: { nome: 'Yogurt e frutta', componenti: [{ opzioni: [{ alimento: 'yogurt-soia', quantita: 125, unita: 'g' }] }] },
    toast: {
      nome: 'Toast',
      componenti: [{ opzioni: [{ alimento: 'pane', quantita: 2, unita: 'fetta' }, { alimento: 'gallette', quantita: 3, unita: 'pezzo' }] }],
    },
    insalata: {
      nome: 'Insalata di legumi',
      componenti: [
        { opzioni: [
          { alimento: 'ceci-cotti', quantitaMin: 100, quantita: 130, unita: 'g' },
          { alimento: 'lenticchie-cotte', quantitaMin: 100, quantita: 130, unita: 'g' },
        ] },
        { opzioni: [{ alimento: 'olio', quantita: 1, unita: 'cucchiaio' }] },
      ],
      preparazione: 'Mescola tutto.',
      varianti: [{ nome: 'Piatto alternativo', componenti: [{ opzioni: [{ alimento: 'ceci-cotti', quantita: 150, unita: 'g' }] }] }],
    },
    zuppa: { nome: 'Zuppa di verdure', componenti: [{ opzioni: [{ alimento: 'verdure-miste', quantita: 300, unita: 'g' }] }] },
  },
  alimenti: {
    'yogurt-soia': { nome: 'Yogurt di soia', canale: 'amazon' },
    pane: { nome: 'Pane', canale: 'fresco' },
    gallette: { nome: 'Gallette', canale: 'amazon' },
    'ceci-cotti': { nome: 'Ceci cotti', canale: 'amazon' },
    'lenticchie-cotte': { nome: 'Lenticchie cotte', canale: 'amazon' },
    olio: { nome: 'Olio', canale: 'base' },
    'verdure-miste': { nome: 'Verdure miste', canale: 'fresco' },
    'integratore-x': { nome: 'Integratore X', canale: 'esterno' },
  },
  note: ['Bevi acqua durante la giornata.'],
  regole: [{ tipo: 'varieta', pasto: 'colazione', minDiversi: 2, giorni: 7, testo: 'Almeno 2 colazioni diverse.' }],
};
