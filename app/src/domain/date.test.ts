import { describe, expect, it } from 'vitest';
import { chiaveGiorno, chiaveSettimana, dataDelGiorno, giornoSettimana, lunediDiSettimana, spostaSettimana } from './date';

describe('date', () => {
  it('giorno della settimana', () => {
    expect(giornoSettimana(new Date(2026, 9, 23))).toBe('ven'); // 23 ottobre 2026
    expect(giornoSettimana(new Date(2026, 9, 19))).toBe('lun');
    expect(giornoSettimana(new Date(2026, 9, 25))).toBe('dom');
  });
  it('chiave giorno', () => {
    expect(chiaveGiorno(new Date(2026, 0, 5))).toBe('2026-01-05');
  });
  it('chiave settimana ISO', () => {
    expect(chiaveSettimana(new Date(2026, 9, 23))).toBe('2026-W43');
    expect(chiaveSettimana(new Date(2026, 0, 1))).toBe('2026-W01');
    expect(chiaveSettimana(new Date(2021, 0, 3))).toBe('2020-W53'); // domenica, ancora ISO 2020
    expect(chiaveSettimana(new Date(2024, 11, 30))).toBe('2025-W01'); // lunedì
    expect(chiaveSettimana(new Date(2026, 11, 31))).toBe('2026-W53');
  });
  it('lunedì di una settimana e spostamenti', () => {
    expect(chiaveGiorno(lunediDiSettimana('2026-W43'))).toBe('2026-10-19');
    expect(chiaveGiorno(lunediDiSettimana('2025-W01'))).toBe('2024-12-30');
    expect(spostaSettimana('2026-W43', 1)).toBe('2026-W44');
    expect(spostaSettimana('2026-W01', -1)).toBe('2025-W52');
    expect(spostaSettimana('2026-W53', 1)).toBe('2027-W01');
  });
  it('data del giorno nella settimana', () => {
    expect(chiaveGiorno(dataDelGiorno('2026-W43', 'dom'))).toBe('2026-10-25');
    expect(chiaveGiorno(dataDelGiorno('2026-W43', 'lun'))).toBe('2026-10-19');
  });
  it('ora legale: il cambio di ottobre non sposta il giorno', () => {
    expect(chiaveSettimana(new Date(2026, 9, 25, 0, 30))).toBe('2026-W43');
    expect(chiaveGiorno(dataDelGiorno('2026-W43', 'dom'))).toBe('2026-10-25');
  });
});
