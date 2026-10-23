#!/usr/bin/env node
// Validatore del formato piano (versione 1, vedi docs/IMPORT.md). Nessuna dipendenza.
// Uso: node scripts/valida-piano.mjs <file.json>
// Esporta validaPiano(obj) -> { errori: string[], riepilogo: object }

const GIORNI = ['lun', 'mar', 'mer', 'gio', 'ven', 'sab', 'dom'];
const TIPI_CELLA = ['piatto', 'scelta', 'libero', 'digiuno'];
const UNITA = ['g', 'mL', 'pezzo', 'fetta', 'cucchiaio', 'cucchiaino', 'vasetto', 'porzione', 'qb'];
const CANALI = ['amazon', 'fresco', 'base', 'esterno'];
const RE_ID = /^[a-z0-9]+(-[a-z0-9]+)*$/;

const isObj = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const isNum = (v) => typeof v === 'number' && Number.isFinite(v);

export function validaPiano(p) {
  const errori = [];
  const err = (m) => errori.push(m);

  if (!isObj(p)) return { errori: ['Il piano deve essere un oggetto JSON'], riepilogo: {} };
  if (p.versione !== 1) err('"versione" deve essere 1');
  if (typeof p.titolo !== 'string' || !p.titolo.trim()) err('"titolo" mancante');
  if (p.dataVisita !== undefined && !/^\d{4}-\d{2}-\d{2}$/.test(p.dataVisita)) {
    err('"dataVisita" deve essere nel formato AAAA-MM-GG');
  }

  // Pasti
  const pasti = new Set();
  if (!Array.isArray(p.pasti) || p.pasti.length === 0) err('"pasti" deve essere un array non vuoto');
  else {
    p.pasti.forEach((x, i) => {
      if (!isObj(x)) return err(`pasti[${i}] non è un oggetto`);
      if (typeof x.id !== 'string' || !RE_ID.test(x.id)) err(`pasti[${i}].id non valido`);
      else if (pasti.has(x.id)) err(`pasto duplicato: ${x.id}`);
      else pasti.add(x.id);
      if (typeof x.nome !== 'string' || !x.nome) err(`pasti[${i}].nome mancante`);
      if (x.facoltativo !== undefined && typeof x.facoltativo !== 'boolean') {
        err(`pasti[${i}].facoltativo deve essere booleano`);
      }
    });
  }

  const piatti = isObj(p.piatti) ? p.piatti : (err('"piatti" deve essere un oggetto'), {});
  const alimenti = isObj(p.alimenti) ? p.alimenti : (err('"alimenti" deve essere un oggetto'), {});
  const gruppiArr = Array.isArray(p.gruppi) ? p.gruppi : (p.gruppi === undefined ? [] : (err('"gruppi" deve essere un array'), []));

  // Alimenti
  const perCanale = {};
  for (const [id, a] of Object.entries(alimenti)) {
    if (!RE_ID.test(id)) err(`alimenti.${id}: id non valido (minuscolo-con-trattini)`);
    if (!isObj(a)) { err(`alimenti.${id}: non è un oggetto`); continue; }
    if (typeof a.nome !== 'string' || !a.nome) err(`alimenti.${id}: nome mancante`);
    if (!CANALI.includes(a.canale)) err(`alimenti.${id}: canale non ammesso (${a.canale})`);
    else perCanale[a.canale] = (perCanale[a.canale] || 0) + 1;
    if (a.link !== undefined && typeof a.link !== 'string') err(`alimenti.${id}: link non valido`);
    if (a.tag !== undefined && !(Array.isArray(a.tag) && a.tag.every((t) => typeof t === 'string'))) {
      err(`alimenti.${id}: tag deve essere un array di stringhe`);
    }
  }

  // Piatti
  const controllaPiatto = (nome, d, ctx) => {
    if (!isObj(d)) return err(`${ctx}: non è un oggetto`);
    if (typeof d.nome !== 'string' || !d.nome) err(`${ctx}: nome mancante`);
    if (!Array.isArray(d.componenti) || d.componenti.length === 0) {
      return err(`${ctx}: "componenti" deve essere un array non vuoto`);
    }
    d.componenti.forEach((c, i) => {
      const cc = `${ctx}.componenti[${i}]`;
      if (!isObj(c) || !Array.isArray(c.opzioni) || c.opzioni.length === 0) {
        return err(`${cc}: "opzioni" deve essere un array non vuoto`);
      }
      if (c.portata !== undefined && !(Number.isInteger(c.portata) && c.portata >= 1)) {
        err(`${cc}: "portata" deve essere un intero >= 1`);
      }
      c.opzioni.forEach((o, j) => {
        const oc = `${cc}.opzioni[${j}]`;
        if (!isObj(o)) return err(`${oc}: non è un oggetto`);
        if (typeof o.alimento !== 'string' || !(o.alimento in alimenti)) {
          err(`${oc}: alimento "${o.alimento}" non presente in "alimenti"`);
        }
        if (!UNITA.includes(o.unita)) err(`${oc}: unità non ammessa (${o.unita})`);
        if (o.unita === 'qb') {
          if (o.quantita !== undefined && o.quantita !== null) err(`${oc}: con "qb" niente quantità`);
        } else {
          if (!isNum(o.quantita)) err(`${oc}: "quantita" deve essere numerica`);
          if (o.quantitaMin !== undefined) {
            if (!isNum(o.quantitaMin)) err(`${oc}: "quantitaMin" deve essere numerica`);
            else if (isNum(o.quantita) && o.quantitaMin > o.quantita) err(`${oc}: quantitaMin > quantita`);
          }
        }
      });
    });
    if (d.varianti !== undefined) {
      if (!Array.isArray(d.varianti)) err(`${ctx}: "varianti" deve essere un array`);
      else d.varianti.forEach((v, i) => controllaPiatto(null, v, `${ctx}.varianti[${i}]`));
    }
  };
  for (const [id, d] of Object.entries(piatti)) {
    if (!RE_ID.test(id)) err(`piatti.${id}: id non valido`);
    controllaPiatto(id, d, `piatti.${id}`);
  }

  // Gruppi
  const gruppi = new Set();
  gruppiArr.forEach((g, i) => {
    if (!isObj(g)) return err(`gruppi[${i}] non è un oggetto`);
    if (typeof g.id !== 'string' || !RE_ID.test(g.id)) err(`gruppi[${i}].id non valido`);
    else if (gruppi.has(g.id)) err(`gruppo duplicato: ${g.id}`);
    else gruppi.add(g.id);
    if (typeof g.nome !== 'string' || !g.nome) err(`gruppi[${i}].nome mancante`);
    if (!Array.isArray(g.piatti) || g.piatti.length === 0) err(`gruppi[${i}].piatti deve essere un array non vuoto`);
    else g.piatti.forEach((pid) => { if (!(pid in piatti)) err(`gruppi[${i}]: piatto "${pid}" inesistente`); });
  });

  // Settimana
  if (!isObj(p.settimana)) err('"settimana" deve essere un oggetto');
  else {
    for (const [g, pastiG] of Object.entries(p.settimana)) {
      if (!GIORNI.includes(g)) { err(`settimana: giorno non ammesso (${g})`); continue; }
      if (!isObj(pastiG)) { err(`settimana.${g}: non è un oggetto`); continue; }
      for (const [pid, cella] of Object.entries(pastiG)) {
        const cc = `settimana.${g}.${pid}`;
        if (!pasti.has(pid)) err(`${cc}: pasto non definito in "pasti"`);
        if (!isObj(cella) || !TIPI_CELLA.includes(cella.tipo)) { err(`${cc}: tipo cella non ammesso`); continue; }
        if (cella.tipo === 'piatto' && !(cella.piatto in piatti)) err(`${cc}: piatto "${cella.piatto}" inesistente`);
        if (cella.tipo === 'scelta') {
          if (!Array.isArray(cella.gruppi) || cella.gruppi.length === 0) err(`${cc}: "gruppi" mancante`);
          else cella.gruppi.forEach((gid) => { if (!gruppi.has(gid)) err(`${cc}: gruppo "${gid}" inesistente`); });
        }
      }
    }
    GIORNI.forEach((g) => { if (!(g in p.settimana)) err(`settimana: manca il giorno ${g}`); });
  }

  // Note e regole
  if (p.note !== undefined && !(Array.isArray(p.note) && p.note.every((n) => typeof n === 'string'))) {
    err('"note" deve essere un array di stringhe');
  }
  if (p.regole !== undefined) {
    if (!Array.isArray(p.regole)) err('"regole" deve essere un array');
    else p.regole.forEach((r, i) => {
      if (!isObj(r)) return err(`regole[${i}] non è un oggetto`);
      if (r.tipo === 'varieta') {
        if (!pasti.has(r.pasto)) err(`regole[${i}]: pasto "${r.pasto}" inesistente`);
        if (!isNum(r.minDiversi)) err(`regole[${i}]: minDiversi numerico richiesto`);
        if (!isNum(r.giorni)) err(`regole[${i}]: giorni numerico richiesto`);
      } else err(`regole[${i}]: tipo non supportato (${r.tipo})`);
    });
  }

  const riepilogo = {
    pasti: pasti.size,
    piatti: Object.keys(piatti).length,
    gruppi: gruppi.size,
    alimenti: Object.keys(alimenti).length,
    alimentiPerCanale: perCanale,
  };
  return { errori, riepilogo };
}

// Esecuzione da riga di comando
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  const file = process.argv[2];
  if (!file) { console.error('Uso: node scripts/valida-piano.mjs <file.json>'); process.exit(2); }
  let obj;
  try { obj = JSON.parse(readFileSync(file, 'utf8')); }
  catch (e) { console.error('JSON non leggibile: ' + e.message); process.exit(1); }
  const { errori, riepilogo } = validaPiano(obj);
  if (errori.length) {
    console.error(`Piano NON valido (${errori.length} errori):`);
    errori.forEach((e) => console.error(' - ' + e));
    process.exit(1);
  }
  console.log('Piano valido.');
  console.log(`Pasti: ${riepilogo.pasti} | Piatti: ${riepilogo.piatti} | Gruppi: ${riepilogo.gruppi} | Alimenti: ${riepilogo.alimenti}`);
  console.log('Alimenti per canale: ' + Object.entries(riepilogo.alimentiPerCanale).map(([c, n]) => `${c}=${n}`).join(', '));
}
