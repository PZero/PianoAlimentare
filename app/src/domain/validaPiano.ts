// Validatore del formato piano (versione 1, docs/IMPORT.md).
// Portato da scripts/valida-piano.mjs: tenere le due versioni allineate.
import type { Piano } from './tipi';

const GIORNI = ['lun', 'mar', 'mer', 'gio', 'ven', 'sab', 'dom'];
const TIPI_CELLA = ['piatto', 'scelta', 'libero', 'digiuno'];
const UNITA = ['g', 'mL', 'pezzo', 'fetta', 'cucchiaio', 'cucchiaino', 'vasetto', 'porzione', 'qb'];
const CANALI = ['amazon', 'fresco', 'base', 'esterno'];
const RE_ID = /^[a-z0-9]+(-[a-z0-9]+)*$/;

// Il JSON in ingresso non è tipizzato: lo si esplora in modo difensivo.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Obj = Record<string, any>;
const isObj = (v: unknown): v is Obj => v !== null && typeof v === 'object' && !Array.isArray(v);
const isNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);

export interface Riepilogo {
  pasti: number;
  piatti: number;
  gruppi: number;
  alimenti: number;
  alimentiPerCanale: Record<string, number>;
  note: number;
}
export interface EsitoValidazione { errori: string[]; riepilogo: Riepilogo }

export function validaPiano(p: unknown): EsitoValidazione {
  const errori: string[] = [];
  const err = (m: string) => { errori.push(m); };
  const vuoto: Riepilogo = { pasti: 0, piatti: 0, gruppi: 0, alimenti: 0, alimentiPerCanale: {}, note: 0 };

  if (!isObj(p)) return { errori: ['Il piano deve essere un oggetto JSON'], riepilogo: vuoto };
  if (p.versione !== 1) err('"versione" deve essere 1');
  if (typeof p.titolo !== 'string' || !p.titolo.trim()) err('"titolo" mancante');
  if (p.dataVisita !== undefined && !/^\d{4}-\d{2}-\d{2}$/.test(p.dataVisita)) {
    err('"dataVisita" deve essere nel formato AAAA-MM-GG');
  }

  const pasti = new Set<string>();
  if (!Array.isArray(p.pasti) || p.pasti.length === 0) err('"pasti" deve essere un array non vuoto');
  else {
    p.pasti.forEach((x: unknown, i: number) => {
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

  let piatti: Obj = {};
  if (isObj(p.piatti)) piatti = p.piatti; else err('"piatti" deve essere un oggetto');
  let alimenti: Obj = {};
  if (isObj(p.alimenti)) alimenti = p.alimenti; else err('"alimenti" deve essere un oggetto');
  let gruppiArr: unknown[] = [];
  if (Array.isArray(p.gruppi)) gruppiArr = p.gruppi;
  else if (p.gruppi !== undefined) err('"gruppi" deve essere un array');

  const perCanale: Record<string, number> = {};
  for (const [id, a] of Object.entries(alimenti)) {
    if (!RE_ID.test(id)) err(`alimenti.${id}: id non valido (minuscolo-con-trattini)`);
    if (!isObj(a)) { err(`alimenti.${id}: non è un oggetto`); continue; }
    if (typeof a.nome !== 'string' || !a.nome) err(`alimenti.${id}: nome mancante`);
    if (!CANALI.includes(a.canale)) err(`alimenti.${id}: canale non ammesso (${a.canale})`);
    else perCanale[a.canale] = (perCanale[a.canale] || 0) + 1;
    if (a.link !== undefined && typeof a.link !== 'string') err(`alimenti.${id}: link non valido`);
    if (a.tag !== undefined && !(Array.isArray(a.tag) && a.tag.every((t: unknown) => typeof t === 'string'))) {
      err(`alimenti.${id}: tag deve essere un array di stringhe`);
    }
  }

  const controllaPiatto = (d: unknown, ctx: string): void => {
    if (!isObj(d)) return err(`${ctx}: non è un oggetto`);
    if (typeof d.nome !== 'string' || !d.nome) err(`${ctx}: nome mancante`);
    if (!Array.isArray(d.componenti) || d.componenti.length === 0) {
      return err(`${ctx}: "componenti" deve essere un array non vuoto`);
    }
    d.componenti.forEach((c: unknown, i: number) => {
      const cc = `${ctx}.componenti[${i}]`;
      if (!isObj(c) || !Array.isArray(c.opzioni) || c.opzioni.length === 0) {
        return err(`${cc}: "opzioni" deve essere un array non vuoto`);
      }
      if (c.portata !== undefined && !(Number.isInteger(c.portata) && c.portata >= 1)) {
        err(`${cc}: "portata" deve essere un intero >= 1`);
      }
      c.opzioni.forEach((o: unknown, j: number) => {
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
      else d.varianti.forEach((v: unknown, i: number) => controllaPiatto(v, `${ctx}.varianti[${i}]`));
    }
  };
  for (const [id, d] of Object.entries(piatti)) {
    if (!RE_ID.test(id)) err(`piatti.${id}: id non valido`);
    controllaPiatto(d, `piatti.${id}`);
  }

  const gruppi = new Set<string>();
  gruppiArr.forEach((g, i) => {
    if (!isObj(g)) return err(`gruppi[${i}] non è un oggetto`);
    if (typeof g.id !== 'string' || !RE_ID.test(g.id)) err(`gruppi[${i}].id non valido`);
    else if (gruppi.has(g.id)) err(`gruppo duplicato: ${g.id}`);
    else gruppi.add(g.id);
    if (typeof g.nome !== 'string' || !g.nome) err(`gruppi[${i}].nome mancante`);
    if (!Array.isArray(g.piatti) || g.piatti.length === 0) err(`gruppi[${i}].piatti deve essere un array non vuoto`);
    else g.piatti.forEach((pid: string) => { if (!(pid in piatti)) err(`gruppi[${i}]: piatto "${pid}" inesistente`); });
  });

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
          else cella.gruppi.forEach((gid: string) => { if (!gruppi.has(gid)) err(`${cc}: gruppo "${gid}" inesistente`); });
        }
      }
    }
    GIORNI.forEach((g) => { if (!(g in (p.settimana as Obj))) err(`settimana: manca il giorno ${g}`); });
  }

  if (p.note !== undefined && !(Array.isArray(p.note) && p.note.every((n: unknown) => typeof n === 'string'))) {
    err('"note" deve essere un array di stringhe');
  }
  if (p.regole !== undefined) {
    if (!Array.isArray(p.regole)) err('"regole" deve essere un array');
    else p.regole.forEach((r: unknown, i: number) => {
      if (!isObj(r)) return err(`regole[${i}] non è un oggetto`);
      if (r.tipo === 'varieta') {
        if (!pasti.has(r.pasto)) err(`regole[${i}]: pasto "${r.pasto}" inesistente`);
        if (!isNum(r.minDiversi)) err(`regole[${i}]: minDiversi numerico richiesto`);
        if (!isNum(r.giorni)) err(`regole[${i}]: giorni numerico richiesto`);
      } else err(`regole[${i}]: tipo non supportato (${r.tipo})`);
    });
  }

  return {
    errori,
    riepilogo: {
      pasti: pasti.size,
      piatti: Object.keys(piatti).length,
      gruppi: gruppi.size,
      alimenti: Object.keys(alimenti).length,
      alimentiPerCanale: perCanale,
      note: Array.isArray(p.note) ? p.note.length : 0,
    },
  };
}

/** Punti da controllare a mano (non bloccanti) di un piano già valido. */
export function dubbiPiano(piano: Piano): string[] {
  const dubbi: string[] = [];
  for (const a of Object.values(piano.alimenti)) {
    if (a.canale === 'esterno' && !a.link) dubbi.push(`"${a.nome}" è un prodotto esterno senza link.`);
  }
  const senzaQuantita = new Set<string>();
  const visita = (d: Piano['piatti'][string]) => {
    for (const c of d.componenti) {
      for (const o of c.opzioni) {
        const a = piano.alimenti[o.alimento];
        if (o.unita === 'qb' && a && a.canale !== 'base') senzaQuantita.add(a.nome);
      }
    }
    d.varianti?.forEach(visita);
  };
  Object.values(piano.piatti).forEach(visita);
  for (const nome of senzaQuantita) dubbi.push(`"${nome}" è indicato "q.b." senza quantità.`);
  return dubbi;
}
