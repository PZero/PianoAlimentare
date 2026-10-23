import { describe, expect, it } from 'vitest';
import type { Alimento, Piatto } from '../domain/tipi';
import { illustrazioneCella, illustrazionePiatto } from './scelta';

const alimenti: Record<string, Alimento> = {
  salmone: { nome: 'Salmone', canale: 'fresco' },
  riso: { nome: 'Riso basmati', canale: 'amazon' },
  zucchine: { nome: 'Zucchine', canale: 'fresco', tag: ['verdura'] },
  ceci: { nome: 'Ceci lessati', canale: 'amazon' },
  mela: { nome: 'Mela', canale: 'fresco', tag: ['frutta'] },
  caffe: { nome: 'Caffè', canale: 'base' },
  olio: { nome: 'Olio', canale: 'base' },
  pane: { nome: 'Pane integrale', canale: 'amazon' },
  uovo: { nome: 'Uova', canale: 'fresco' },
};
const p = (nome: string, ...comp: [string, number, 'g' | 'pezzo' | 'fetta' | 'qb'][]): Piatto => ({
  nome,
  componenti: comp.map(([alimento, quantita, unita]) => ({ opzioni: [{ alimento, quantita: unita === 'qb' ? null : quantita, unita }] })),
});

describe('illustrazionePiatto', () => {
  it('sceglie la proteina o il cereale con più grammi', () => {
    expect(illustrazionePiatto(p('Cena', ['salmone', 150, 'g'], ['riso', 60, 'g'], ['zucchine', 200, 'g']), alimenti).nome).toBe('Pesce');
    expect(illustrazionePiatto(p('Pranzo', ['salmone', 50, 'g'], ['riso', 90, 'g']), alimenti).nome).toBe('Cereali');
  });
  it('a pari grammi vince il primo dell\'elenco', () => {
    expect(illustrazionePiatto(p('Mix', ['riso', 80, 'g'], ['ceci', 80, 'g']), alimenti).nome).toBe('Cereali');
  });
  it('conta i pezzi con un peso approssimativo', () => {
    expect(illustrazionePiatto(p('Colazione', ['uovo', 2, 'pezzo'], ['pane', 1, 'fetta']), alimenti).nome).toBe('Uova');
  });
  it('usa salvia per legumi, frutta e verdura', () => {
    expect(illustrazionePiatto(p('Legumi', ['ceci', 120, 'g']), alimenti).accento).toBe('salvia');
    expect(illustrazionePiatto(p('Spuntino', ['mela', 1, 'pezzo']), alimenti)).toEqual({ nome: 'Frutta', accento: 'salvia' });
    expect(illustrazionePiatto(p('Pesce', ['salmone', 150, 'g']), alimenti).accento).toBe('terracotta');
  });
  it('senza proteine ricade su verdura', () => {
    expect(illustrazionePiatto(p('Contorno', ['zucchine', 200, 'g'], ['olio', 0, 'qb']), alimenti).nome).toBe('Verdura');
  });
  it('riconosce zuppe, frullati e insalate dal nome del piatto', () => {
    expect(illustrazionePiatto(p('Minestrone di verdure', ['zucchine', 200, 'g']), alimenti).nome).toBe('Ciotola');
    expect(illustrazionePiatto(p('Smoothie verde', ['mela', 1, 'pezzo']), alimenti).nome).toBe('Frullato');
    expect(illustrazionePiatto(p('Insalata mista', ['olio', 0, 'qb']), alimenti).nome).toBe('Insalata');
  });
  it('colazione senza riscontri -> Tazza, altrimenti Piatto', () => {
    expect(illustrazionePiatto(p('Caffè', ['caffe', 1, 'pezzo']), alimenti, 'colazione').nome).toBe('Tazza');
    expect(illustrazionePiatto(p('Qualcosa', ['olio', 1, 'pezzo']), alimenti, 'cena').nome).toBe('Piatto');
  });
  it('celle libero e digiuno', () => {
    expect(illustrazioneCella('libero').nome).toBe('Libero');
    expect(illustrazioneCella('digiuno').nome).toBe('Digiuno');
  });
});
