import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { pianoMinimo } from './__fixtures__/pianoMinimo';
import { dubbiPiano, validaPiano } from './validaPiano';
import type { Piano } from './tipi';

const copia = (): Piano => JSON.parse(JSON.stringify(pianoMinimo));

describe('validaPiano', () => {
  it('accetta la fixture minima', () => {
    const { errori, riepilogo } = validaPiano(pianoMinimo);
    expect(errori).toEqual([]);
    expect(riepilogo).toMatchObject({ pasti: 3, piatti: 4, gruppi: 1, alimenti: 8, note: 1 });
    expect(riepilogo.alimentiPerCanale).toEqual({ amazon: 4, fresco: 2, base: 1, esterno: 1 });
  });

  it('accetta il piano di esempio del repository (inventato)', () => {
    const url = new URL('../../../docs/esempi/piano-esempio.json', import.meta.url);
    const { errori } = validaPiano(JSON.parse(readFileSync(url, 'utf8')));
    expect(errori).toEqual([]);
  });

  it('rifiuta ciò che non è un oggetto', () => {
    expect(validaPiano(null).errori).toHaveLength(1);
    expect(validaPiano([]).errori).toHaveLength(1);
  });

  it('segnala riferimenti inesistenti', () => {
    const p = copia();
    p.settimana.lun!.pranzo = { tipo: 'piatto', piatto: 'non-esiste' };
    p.piatti.zuppa.componenti[0].opzioni[0].alimento = 'fantasma';
    const { errori } = validaPiano(p);
    expect(errori.some((e) => e.includes('"non-esiste" inesistente'))).toBe(true);
    expect(errori.some((e) => e.includes('"fantasma" non presente'))).toBe(true);
  });

  it('segnala unità, canali e intervalli errati', () => {
    const p = copia();
    (p.piatti.zuppa.componenti[0].opzioni[0] as { unita: string }).unita = 'litro';
    (p.alimenti.olio as { canale: string }).canale = 'mercato';
    p.piatti.insalata.componenti[0].opzioni[0].quantitaMin = 500;
    const { errori } = validaPiano(p);
    expect(errori.some((e) => e.includes('unità non ammessa'))).toBe(true);
    expect(errori.some((e) => e.includes('canale non ammesso'))).toBe(true);
    expect(errori.some((e) => e.includes('quantitaMin > quantita'))).toBe(true);
  });

  it('richiede tutti i giorni e versione 1', () => {
    const p = copia();
    delete p.settimana.mer;
    (p as { versione: number }).versione = 2;
    const { errori } = validaPiano(p);
    expect(errori).toContain('settimana: manca il giorno mer');
    expect(errori).toContain('"versione" deve essere 1');
  });

  it('portata: intero >= 1', () => {
    const p = copia();
    p.piatti.zuppa.componenti[0].portata = 2;
    expect(validaPiano(p).errori).toEqual([]);
    p.piatti.zuppa.componenti[0].portata = 0;
    expect(validaPiano(p).errori.some((e) => e.includes('portata'))).toBe(true);
  });

  it('qb non ammette quantità', () => {
    const p = copia();
    p.piatti.zuppa.componenti[0].opzioni[0] = { alimento: 'olio', unita: 'qb', quantita: 3 };
    expect(validaPiano(p).errori.some((e) => e.includes('niente quantità'))).toBe(true);
  });
});

describe('dubbiPiano', () => {
  it('segnala esterni senza link e q.b. fuori dai base', () => {
    const p = copia();
    p.piatti.zuppa.componenti.push({ opzioni: [{ alimento: 'verdure-miste', unita: 'qb' }, { alimento: 'olio', unita: 'qb' }] });
    const dubbi = dubbiPiano(p);
    expect(dubbi).toContain('"Integratore X" è un prodotto esterno senza link.');
    expect(dubbi).toContain('"Verdure miste" è indicato "q.b." senza quantità.');
    expect(dubbi.some((d) => d.includes('Olio'))).toBe(false);
  });
});
