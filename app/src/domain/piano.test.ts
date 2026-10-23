import { describe, expect, it } from 'vitest';
import { pianoMinimo as piano } from './__fixtures__/pianoMinimo';
import {
  chiaveComponente, chiavePasto, pastiDelGiorno, prossimoPasto, progressoGiorno, raggruppaPortate, sceltePrevisteSettimana, verificaVarieta,
} from './piano';

describe('pastiDelGiorno', () => {
  it('rispetta l ordine del piano e i tipi di cella', () => {
    const p = pastiDelGiorno(piano, 'lun');
    expect(p.map((x) => x.pastoId)).toEqual(['colazione', 'pranzo', 'cena']);
    expect(p.map((x) => x.tipo)).toEqual(['scelta', 'piatto', 'piatto']);
  });
  it('libero e digiuno', () => {
    expect(pastiDelGiorno(piano, 'sab')[2].tipo).toBe('libero');
    expect(pastiDelGiorno(piano, 'dom')[2].tipo).toBe('digiuno');
  });
  it('senza scelte: prima opzione di default, ma "da scegliere"', () => {
    const pranzo = pastiDelGiorno(piano, 'lun')[1];
    if (pranzo.tipo !== 'piatto') throw new Error('atteso piatto');
    const c = pranzo.piatto.componenti[0];
    expect(c.conAlternative).toBe(true);
    expect(c.daScegliere).toBe(true);
    expect(c.opzione.alimento).toBe('ceci-cotti');
    expect(pranzo.piatto.componenti[1].conAlternative).toBe(false);
    expect(pranzo.piatto.componenti[1].daScegliere).toBe(false);
  });
  it('applica la scelta della settimana al componente', () => {
    const scelte = { componenti: { [chiaveComponente('lun', 'pranzo', 'insalata', 0)]: 1 } };
    const pranzo = pastiDelGiorno(piano, 'lun', scelte)[1];
    if (pranzo.tipo !== 'piatto') throw new Error('atteso piatto');
    expect(pranzo.piatto.componenti[0].opzione.alimento).toBe('lenticchie-cotte');
    expect(pranzo.piatto.componenti[0].daScegliere).toBe(false);
    // un altro giorno non è toccato
    const mar = pastiDelGiorno(piano, 'mar', scelte)[1];
    if (mar.tipo !== 'piatto') throw new Error('atteso piatto');
    expect(mar.piatto.componenti[0].opzione.alimento).toBe('ceci-cotti');
  });
  it('ignora indici di scelta non validi', () => {
    const scelte = { componenti: { [chiaveComponente('lun', 'pranzo', 'insalata', 0)]: 9 } };
    const pranzo = pastiDelGiorno(piano, 'lun', scelte)[1];
    if (pranzo.tipo !== 'piatto') throw new Error('atteso piatto');
    expect(pranzo.piatto.componenti[0].scelta).toBe(0);
    expect(pranzo.piatto.componenti[0].daScegliere).toBe(true);
  });
  it('pasto di tipo scelta: gruppi e piatto scelto', () => {
    const senza = pastiDelGiorno(piano, 'lun')[0];
    if (senza.tipo !== 'scelta') throw new Error('atteso scelta');
    expect(senza.daScegliere).toBe(true);
    expect(senza.gruppi[0].piatti.map((x) => x.id)).toEqual(['yogurt', 'toast']);
    const con = pastiDelGiorno(piano, 'lun', { piatti: { [chiavePasto('lun', 'colazione')]: 'toast' } })[0];
    if (con.tipo !== 'scelta') throw new Error('atteso scelta');
    expect(con.daScegliere).toBe(false);
    expect(con.piatto?.piatto.nome).toBe('Toast');
    expect(con.piatto?.componenti[0].daScegliere).toBe(true);
  });
  it('scelta di un piatto fuori dai gruppi viene ignorata', () => {
    const p = pastiDelGiorno(piano, 'lun', { piatti: { [chiavePasto('lun', 'colazione')]: 'zuppa' } })[0];
    if (p.tipo !== 'scelta') throw new Error('atteso scelta');
    expect(p.piatto).toBeUndefined();
  });
});

describe('prossimo pasto e progresso', () => {
  const pasti = pastiDelGiorno(piano, 'lun');
  it('primo non segnato', () => {
    expect(prossimoPasto(pasti, {})?.pastoId).toBe('colazione');
    expect(prossimoPasto(pasti, { colazione: 'fatto' })?.pastoId).toBe('pranzo');
    expect(prossimoPasto(pasti, { colazione: 'saltato', pranzo: 'sostituito' })?.pastoId).toBe('cena');
  });
  it('salta i pasti già segnati anche fuori ordine', () => {
    expect(prossimoPasto(pasti, { pranzo: 'fatto' })?.pastoId).toBe('colazione');
  });
  it('giornata completata', () => {
    expect(prossimoPasto(pasti, { colazione: 'fatto', pranzo: 'fatto', cena: 'fatto' })).toBeUndefined();
  });
  it('progresso', () => {
    expect(progressoGiorno(pasti, { colazione: 'fatto', cena: 'saltato' })).toEqual({ segnati: 2, totale: 3 });
  });
});

describe('scelte della settimana', () => {
  it('elenca componenti e piatti da scegliere', () => {
    const { voci, daFare } = sceltePrevisteSettimana(piano);
    expect(voci.filter((v) => v.tipo === 'piatto')).toHaveLength(7);
    expect(voci.filter((v) => v.tipo === 'componente')).toHaveLength(7);
    expect(daFare).toBe(14);
  });
  it('il contatore scende con le scelte', () => {
    const scelte = {
      componenti: { [chiaveComponente('lun', 'pranzo', 'insalata', 0)]: 0 },
      piatti: { [chiavePasto('lun', 'colazione')]: 'yogurt' },
    };
    expect(sceltePrevisteSettimana(piano, scelte).daFare).toBe(12);
  });
  it('un piatto scelto con alternative aggiunge le sue voci', () => {
    const scelte = { piatti: { [chiavePasto('lun', 'colazione')]: 'toast' } };
    expect(sceltePrevisteSettimana(piano, scelte).voci.filter((v) => v.tipo === 'componente')).toHaveLength(8);
  });
});

describe('regola di varietà', () => {
  const regola = piano.regole![0];
  it('conta i piatti diversi scelti nella settimana', () => {
    expect(verificaVarieta(piano, regola)).toMatchObject({ diversi: 0, richiesti: 2, soddisfatta: false });
    const scelte = { piatti: { [chiavePasto('lun', 'colazione')]: 'yogurt', [chiavePasto('mar', 'colazione')]: 'toast' } };
    expect(verificaVarieta(piano, regola, scelte)).toMatchObject({ diversi: 2, soddisfatta: true });
  });
});

describe('portate', () => {
  it('raggruppa per portata, assente = 1', () => {
    const p = JSON.parse(JSON.stringify(piano));
    p.piatti.zuppa.componenti = [
      { portata: 2, opzioni: [{ alimento: 'verdure-miste', quantita: 200, unita: 'g' }] },
      { opzioni: [{ alimento: 'pane', quantita: 1, unita: 'fetta' }] },
    ];
    const pasto = pastiDelGiorno(p, 'lun')[2];
    if (pasto.tipo !== 'piatto') throw new Error('atteso piatto');
    const g = raggruppaPortate(pasto.piatto.componenti);
    expect(g.map((x) => x.portata)).toEqual([1, 2]);
    expect(g[0].componenti).toHaveLength(1);
  });
});
