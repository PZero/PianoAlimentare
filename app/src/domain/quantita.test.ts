import { describe, expect, it } from 'vitest';
import { formatQuantita } from './quantita';

describe('formatQuantita', () => {
  it('grammi e millilitri', () => {
    expect(formatQuantita({ quantita: 180, unita: 'g' })).toBe('180 g');
    expect(formatQuantita({ quantita: 250, unita: 'mL' })).toBe('250 mL');
  });
  it('intervalli', () => {
    expect(formatQuantita({ quantitaMin: 100, quantita: 130, unita: 'g' })).toBe('100-130 g');
    expect(formatQuantita({ quantitaMin: 3, quantita: 4, unita: 'fetta' })).toBe('3-4 fette');
  });
  it('unità a conteggio con singolare e plurale', () => {
    expect(formatQuantita({ quantita: 1, unita: 'cucchiaio' })).toBe('1 cucchiaio');
    expect(formatQuantita({ quantita: 2, unita: 'cucchiaio' })).toBe('2 cucchiai');
    expect(formatQuantita({ quantita: 1.5, unita: 'porzione' })).toBe('1,5 porzioni');
  });
  it('quanto basta', () => {
    expect(formatQuantita({ unita: 'qb' })).toBe('q.b.');
  });
});
