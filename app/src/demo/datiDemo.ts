// SOLO SVILUPPO: dati inventati per la modalità demo (?demo). Mai dati reali.
import esempio from '../../../docs/esempi/piano-esempio.json';
import { demoScrivi } from '../data/demoStore';
import { chiaveGiorno, chiaveSettimana, giornoSettimana } from '../domain/date';
import type { Piano, PianoSalvato, ProfiloUtente } from '../domain/tipi';

export const PIANO_ESEMPIO = esempio as unknown as Piano;

export const PROFILO_DEMO: ProfiloUtente = {
  uid: 'demo-admin', nome: 'Ada Rossi', email: 'ada@esempio.test', stato: 'approvato', ruolo: 'admin',
  intolleranze: ['Lattosio'], creatoIlMs: Date.now() - 30 * 86400000,
};

const PERSONE: ProfiloUtente[] = [
  PROFILO_DEMO,
  { uid: 'demo-1', nome: 'Bruno Verdi', email: 'bruno@esempio.test', stato: 'in_attesa', ruolo: 'utente', intolleranze: [], creatoIlMs: Date.now() - 86400000 },
  { uid: 'demo-2', nome: 'Carla Neri', email: 'carla@esempio.test', stato: 'in_attesa', ruolo: 'utente', intolleranze: [], creatoIlMs: Date.now() - 3 * 86400000 },
  { uid: 'demo-3', nome: 'Dario Bianchi', email: 'dario@esempio.test', stato: 'approvato', ruolo: 'utente', intolleranze: [], creatoIlMs: Date.now() - 12 * 86400000 },
];

/** Prepara l'archivio in memoria. `conAttivo`: piano attivo = esempio; per la demo dell'import ne manca qualche alimento. */
export function preparaDemo(modo: string): void {
  const attivo: Piano = JSON.parse(JSON.stringify(PIANO_ESEMPIO));
  if (modo === 'import') {
    for (const id of ['avocado', 'albume-liquido', 'frutta-secca', 'miele']) delete attivo.alimenti[id];
  }
  const salvato: PianoSalvato = { ...attivo, id: 'demo', attivo: true, importatoIlMs: Date.now() - 7 * 86400000 };
  demoScrivi('piano', salvato);
  demoScrivi('utenti', PERSONE);
  // La colazione di oggi è già segnata come fatta, così si vede l'avanzamento.
  const oggi = chiaveGiorno(new Date());
  demoScrivi(`diario/${oggi}`, { colazione: 'fatto' });
  const ora = new Date();
  demoScrivi(`scelte/${chiaveSettimana(ora)}`, { piatti: { [`${giornoSettimana(ora)}:colazione`]: 'yogurt-e-cereali' } });
}

/** Piano da controllare nella demo dell'import: con qualche q.b., un alimento senza canale e alimenti nuovi. */
export function pianoDaControllare(): Piano {
  const p: Piano = JSON.parse(JSON.stringify(PIANO_ESEMPIO));
  p.titolo = 'Piano di ottobre (esempio inventato)';
  const primo = Object.values(p.piatti)[0];
  primo.componenti[0].opzioni[0] = { alimento: primo.componenti[0].opzioni[0].alimento, unita: 'qb' };
  const idCanale = Object.keys(p.alimenti).find((id) => p.alimenti[id].canale === 'fresco');
  if (idCanale) delete (p.alimenti[idCanale] as { canale?: string }).canale;
  return p;
}
