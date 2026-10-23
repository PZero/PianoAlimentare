import { readFileSync } from 'node:fs';
import { describe, it, beforeAll, afterAll, beforeEach } from 'vitest';
import {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
} from '@firebase/rules-unit-testing';
import { doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, collection } from 'firebase/firestore';

let env;

beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId: 'demo-piano',
    firestore: { rules: readFileSync(new URL('../firestore.rules', import.meta.url), 'utf8') },
  });
});
afterAll(() => env.cleanup());

// Dati inventati
const profilo = (stato, ruolo = 'utente') => ({ nome: 'Test', email: 'x@example.test', stato, ruolo });
const piano = { versione: 1, titolo: 'Piano di prova' };

beforeEach(async () => {
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore();
    await setDoc(doc(db, 'utenti/admin1'), profilo('approvato', 'admin'));
    await setDoc(doc(db, 'utenti/ann'), profilo('approvato'));
    await setDoc(doc(db, 'utenti/bob'), profilo('approvato'));
    await setDoc(doc(db, 'utenti/att'), profilo('in_attesa'));
    await setDoc(doc(db, 'utenti/blk'), profilo('bloccato'));
    await setDoc(doc(db, 'utenti/ann/diario/2026-01-01'), { colazione: 'fatto' });
    await setDoc(doc(db, 'utenti/ann/peso/2026-01-01'), { kg: 70 });
    await setDoc(doc(db, 'utenti/ann/piani/p1'), piano);
    await setDoc(doc(db, 'utenti/att/diario/2026-01-01'), { colazione: 'fatto' });
  });
});

const db = (uid) => env.authenticatedContext(uid).firestore();

describe('creazione utente', () => {
  it('crea il proprio documento in attesa', async () => {
    await assertSucceeds(setDoc(doc(db('nuovo'), 'utenti/nuovo'), profilo('in_attesa')));
  });
  it('non crea approvato o admin', async () => {
    await assertFails(setDoc(doc(db('nuovo'), 'utenti/nuovo'), profilo('approvato')));
    await assertFails(setDoc(doc(db('nuovo'), 'utenti/nuovo'), profilo('in_attesa', 'admin')));
  });
  it('non crea il documento di un altro', async () => {
    await assertFails(setDoc(doc(db('nuovo'), 'utenti/altro'), profilo('in_attesa')));
  });
  it('non crea campi non ammessi', async () => {
    await assertFails(setDoc(doc(db('nuovo'), 'utenti/nuovo'), { ...profilo('in_attesa'), extra: 1 }));
  });
  it('anonimo non scrive', async () => {
    await assertFails(setDoc(doc(env.unauthenticatedContext().firestore(), 'utenti/nuovo'), profilo('in_attesa')));
  });
});

describe('profilo: auto-promozione', () => {
  it('in attesa non si auto-approva', async () => {
    await assertFails(updateDoc(doc(db('att'), 'utenti/att'), { stato: 'approvato' }));
  });
  it('utente non diventa admin', async () => {
    await assertFails(updateDoc(doc(db('ann'), 'utenti/ann'), { ruolo: 'admin' }));
  });
  it('bloccato non si sblocca', async () => {
    await assertFails(updateDoc(doc(db('blk'), 'utenti/blk'), { stato: 'approvato' }));
  });
  it('modifica nome, intolleranze e obiettivo', async () => {
    await assertSucceeds(updateDoc(doc(db('ann'), 'utenti/ann'), {
      nome: 'Nuovo', intolleranze: ['glutine'], obiettivoPeso: 65,
    }));
  });
  it('legge il proprio ma non quello altrui', async () => {
    await assertSucceeds(getDoc(doc(db('ann'), 'utenti/ann')));
    await assertFails(getDoc(doc(db('ann'), 'utenti/bob')));
    await assertFails(getDocs(collection(db('ann'), 'utenti')));
  });
});

describe('admin', () => {
  it('legge ed elenca gli utenti', async () => {
    await assertSucceeds(getDoc(doc(db('admin1'), 'utenti/ann')));
    await assertSucceeds(getDocs(collection(db('admin1'), 'utenti')));
  });
  it('approva e blocca cambiando solo lo stato', async () => {
    await assertSucceeds(updateDoc(doc(db('admin1'), 'utenti/att'), { stato: 'approvato' }));
    await assertSucceeds(updateDoc(doc(db('admin1'), 'utenti/ann'), { stato: 'bloccato' }));
  });
  it('non cambia ruolo, nome o stato non valido', async () => {
    await assertFails(updateDoc(doc(db('admin1'), 'utenti/att'), { ruolo: 'admin' }));
    await assertFails(updateDoc(doc(db('admin1'), 'utenti/att'), { nome: 'X' }));
    await assertFails(updateDoc(doc(db('admin1'), 'utenti/att'), { stato: 'boh' }));
  });
  it('un admin in attesa o un utente non ha poteri', async () => {
    await env.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), 'utenti/falso'), profilo('in_attesa', 'admin'));
    });
    await assertFails(updateDoc(doc(db('falso'), 'utenti/att'), { stato: 'approvato' }));
    await assertFails(updateDoc(doc(db('ann'), 'utenti/att'), { stato: 'approvato' }));
  });
  it('crea un piano per un altro utente ma non lo legge ne aggiorna ne cancella', async () => {
    await assertSucceeds(setDoc(doc(db('admin1'), 'utenti/bob/piani/p9'), piano));
    await assertFails(getDoc(doc(db('admin1'), 'utenti/bob/piani/p9')));
    await assertFails(getDocs(collection(db('admin1'), 'utenti/bob/piani')));
    await assertFails(updateDoc(doc(db('admin1'), 'utenti/bob/piani/p9'), { titolo: 'x' }));
    await assertFails(deleteDoc(doc(db('admin1'), 'utenti/bob/piani/p9')));
  });
  it('non crea piani invalidi', async () => {
    await assertFails(setDoc(doc(db('admin1'), 'utenti/bob/piani/p9'), { versione: 2, titolo: 'x' }));
  });
  it('non legge diario, peso e altro altrui', async () => {
    await assertFails(getDoc(doc(db('admin1'), 'utenti/ann/diario/2026-01-01')));
    await assertFails(getDoc(doc(db('admin1'), 'utenti/ann/peso/2026-01-01')));
    await assertFails(setDoc(doc(db('admin1'), 'utenti/ann/diario/2026-01-02'), { colazione: 'fatto' }));
  });
  it('un utente normale non crea piani per altri', async () => {
    await assertFails(setDoc(doc(db('ann'), 'utenti/bob/piani/p9'), piano));
  });
});

describe('sottoraccolte', () => {
  it('utente in attesa o bloccato non legge ne scrive', async () => {
    await assertFails(getDoc(doc(db('att'), 'utenti/att/diario/2026-01-01')));
    await assertFails(setDoc(doc(db('att'), 'utenti/att/peso/2026-01-02'), { kg: 70 }));
    await assertFails(setDoc(doc(db('att'), 'utenti/att/piani/p1'), piano));
    await assertFails(setDoc(doc(db('blk'), 'utenti/blk/settimane/2026-W01'), { a: 1 }));
  });
  it('utente approvato legge e scrive le proprie', async () => {
    const a = db('ann');
    await assertSucceeds(getDoc(doc(a, 'utenti/ann/diario/2026-01-01')));
    await assertSucceeds(setDoc(doc(a, 'utenti/ann/diario/2026-01-02'), { colazione: 'saltato', cena: 'sostituito' }));
    await assertSucceeds(setDoc(doc(a, 'utenti/ann/peso/2026-01-02'), { kg: 69.5 }));
    await assertSucceeds(setDoc(doc(a, 'utenti/ann/piani/p2'), piano));
    await assertSucceeds(setDoc(doc(a, 'utenti/ann/settimane/2026-W01'), { scelte: {} }));
    await assertSucceeds(setDoc(doc(a, 'utenti/ann/prodotti/ceci'), { asin: 'X' }));
    await assertSucceeds(setDoc(doc(a, 'utenti/ann/spese/s1'), { righe: [] }));
    await assertSucceeds(deleteDoc(doc(a, 'utenti/ann/peso/2026-01-01')));
  });
  it('non tocca quelle altrui', async () => {
    const b = db('bob');
    await assertFails(getDoc(doc(b, 'utenti/ann/diario/2026-01-01')));
    await assertFails(getDoc(doc(b, 'utenti/ann/piani/p1')));
    await assertFails(setDoc(doc(b, 'utenti/ann/peso/2026-01-02'), { kg: 70 }));
    await assertFails(deleteDoc(doc(b, 'utenti/ann/peso/2026-01-01')));
  });
  it('validazioni: peso, diario, piano', async () => {
    const a = db('ann');
    await assertFails(setDoc(doc(a, 'utenti/ann/peso/2026-01-03'), { kg: 10 }));
    await assertFails(setDoc(doc(a, 'utenti/ann/peso/2026-01-03'), { kg: 500 }));
    await assertFails(setDoc(doc(a, 'utenti/ann/peso/2026-01-03'), { kg: '70' }));
    await assertFails(setDoc(doc(a, 'utenti/ann/diario/2026-01-03'), { colazione: 'mangiato' }));
    await assertFails(setDoc(doc(a, 'utenti/ann/piani/p3'), { versione: 2, titolo: 'x' }));
    await assertFails(setDoc(doc(a, 'utenti/ann/piani/p3'), { versione: 1, titolo: 5 }));
  });
  it('raccolte sconosciute negate', async () => {
    await assertFails(setDoc(doc(db('ann'), 'utenti/ann/altro/x'), { a: 1 }));
    await assertFails(setDoc(doc(db('ann'), 'qualcosa/x'), { a: 1 }));
  });
});
