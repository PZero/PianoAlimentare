import { describe, expect, it } from 'vitest';
import {
  aggiornaIngrediente, aggiungiIngrediente, chiaveIngrediente, contaVariazioni, eliminaIngrediente, impostaPreparazione,
  ordinePiatti, puntiDaVerificare, rinominaPiatto, slug,
} from './modificaPiano';
import type { Piano } from './tipi';
import { validaPiano } from './validaPiano';

const base = (): Piano => ({
  versione: 1,
  titolo: 'Piano di prova (inventato)',
  pasti: [{ id: 'pranzo', nome: 'Pranzo' }, { id: 'cena', nome: 'Cena' }],
  settimana: Object.fromEntries(
    ['lun', 'mar', 'mer', 'gio', 'ven', 'sab', 'dom'].map((g) => [g, { pranzo: { tipo: 'piatto', piatto: 'p1' }, cena: { tipo: 'scelta', gruppi: ['g1'] } }]),
  ),
  gruppi: [{ id: 'g1', nome: 'Cene', piatti: ['p2', 'p3'] }],
  piatti: {
    p1: { nome: 'Riso e zucchine', componenti: [{ opzioni: [{ alimento: 'riso', quantita: 80, unita: 'g' }] }, { opzioni: [{ alimento: 'zucchine', unita: 'qb' }] }] },
    p2: { nome: 'Pesce', componenti: [{ opzioni: [{ alimento: 'merluzzo', quantita: 150, unita: 'g' }] }] },
    p3: { nome: 'Frittata', componenti: [{ opzioni: [{ alimento: 'uova', quantita: 2, unita: 'pezzo' }] }] },
    p4: { nome: 'Orfano', componenti: [{ opzioni: [{ alimento: 'olio', unita: 'qb' }] }] },
  },
  alimenti: {
    riso: { nome: 'Riso', canale: 'amazon' },
    zucchine: { nome: 'Zucchine', canale: 'fresco' },
    merluzzo: { nome: 'Merluzzo', canale: 'fresco' },
    uova: { nome: 'Uova', canale: 'fresco' },
    olio: { nome: 'Olio', canale: 'base' },
  },
});

describe('ordine e punti da verificare', () => {
  it('ordina i piatti dal menu e mette gli orfani in fondo', () => {
    expect(ordinePiatti(base())).toEqual([
      { id: 'p1', nonAssegnato: false }, { id: 'p2', nonAssegnato: false }, { id: 'p3', nonAssegnato: false }, { id: 'p4', nonAssegnato: true },
    ]);
  });
  it('conta q.b. (non di base), alimenti nuovi e senza canale', () => {
    const p = base();
    delete (p.alimenti.uova as Partial<typeof p.alimenti.uova>).canale;
    const punti = puntiDaVerificare(p, new Set(['riso', 'zucchine', 'merluzzo']));
    expect(punti.qb).toEqual([chiaveIngrediente('p1', 1, 0)]);
    expect(punti.nuovi).toEqual([chiaveIngrediente('p3', 0, 0), chiaveIngrediente('p4', 0, 0)]);
    expect(punti.senzaCanale).toEqual([chiaveIngrediente('p3', 0, 0)]);
  });
  it('senza piano precedente nessun alimento è nuovo', () => {
    expect(puntiDaVerificare(base()).nuovi).toEqual([]);
  });
});

describe('modifiche', () => {
  it('imposta la quantità e toglie il q.b.', () => {
    const p = aggiornaIngrediente(base(), 'p1', 1, 0, { nome: 'Zucchine', quantita: 200, unita: 'g' });
    expect(p.piatti.p1.componenti[1].opzioni[0]).toEqual({ alimento: 'zucchine', quantita: 200, unita: 'g' });
    expect(puntiDaVerificare(p).qb).toEqual([]);
    expect(validaPiano(p).errori).toEqual([]);
  });
  it('passando a q.b. toglie la quantità; non muta l\'originale', () => {
    const originale = base();
    const p = aggiornaIngrediente(originale, 'p1', 0, 0, { nome: 'Riso', quantita: null, unita: 'qb' });
    expect(p.piatti.p1.componenti[0].opzioni[0].quantita).toBeUndefined();
    expect(originale.piatti.p1.componenti[0].opzioni[0].quantita).toBe(80);
  });
  it('rinominare e cambiare canale agiscono sull\'alimento', () => {
    const p = aggiornaIngrediente(base(), 'p1', 0, 0, { nome: 'Riso integrale', quantita: 80, unita: 'g', canale: 'esterno' });
    expect(p.alimenti.riso).toEqual({ nome: 'Riso integrale', canale: 'esterno' });
  });
  it('un nome già noto riusa l\'alimento esistente', () => {
    const p = aggiornaIngrediente(base(), 'p1', 0, 0, { nome: 'zucchine', quantita: 80, unita: 'g' });
    expect(p.piatti.p1.componenti[0].opzioni[0].alimento).toBe('zucchine');
  });
  it('elimina l\'opzione e il componente rimasto vuoto', () => {
    const p = eliminaIngrediente(base(), 'p1', 1, 0);
    expect(p.piatti.p1.componenti).toHaveLength(1);
  });
  it('aggiunge un ingrediente nuovo con id univoco e una alternativa', () => {
    let p = aggiungiIngrediente(base(), 'p2', { nome: 'Limone', quantita: 1, unita: 'pezzo', canale: 'fresco' });
    expect(p.alimenti.limone).toEqual({ nome: 'Limone', canale: 'fresco' });
    expect(p.piatti.p2.componenti).toHaveLength(2);
    p = aggiungiIngrediente(p, 'p2', { nome: 'Orata', quantita: 150, unita: 'g', canale: 'fresco' }, 0);
    expect(p.piatti.p2.componenti[0].opzioni).toHaveLength(2);
    expect(validaPiano(p).errori).toEqual([]);
  });
  it('rinomina il piatto e imposta la preparazione', () => {
    let p = rinominaPiatto(base(), 'p1', '  Riso al limone ');
    p = impostaPreparazione(p, 'p1', 'Lessare il riso.');
    expect(p.piatti.p1.nome).toBe('Riso al limone');
    expect(p.piatti.p1.preparazione).toBe('Lessare il riso.');
    expect(impostaPreparazione(p, 'p1', ' ').piatti.p1.preparazione).toBeUndefined();
  });
  it('conta le variazioni', () => {
    const a = base();
    const b = rinominaPiatto(aggiornaIngrediente(a, 'p1', 1, 0, { nome: 'Zucchine', quantita: 200, unita: 'g' }), 'p2', 'Merluzzo al forno');
    expect(contaVariazioni(a, a)).toBe(0);
    expect(contaVariazioni(a, b)).toBe(2);
  });
  it('slug senza accenti', () => {
    expect(slug('Caffè d\'orzo!')).toBe('caffe-d-orzo');
  });
});
