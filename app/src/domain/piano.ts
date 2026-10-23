// Risoluzione del piano: da piano + scelte della settimana ai pasti concreti di un giorno.
import {
  GIORNI, type Diario, type Giorno, type Opzione, type Piano, type Piatto, type RegolaVarieta, type ScelteSettimana,
} from './tipi';

export const chiavePasto = (giorno: Giorno, pastoId: string) => `${giorno}:${pastoId}`;
export const chiaveComponente = (giorno: Giorno, pastoId: string, piattoId: string, indice: number) =>
  `${giorno}:${pastoId}:${piattoId}:${indice}`;

export interface ComponenteRisolto {
  chiave: string;
  indice: number;
  /** portata (1 se assente) */
  portata: number;
  opzioni: Opzione[];
  /** indice dell'opzione effettiva (se non scelta, la prima) */
  scelta: number;
  opzione: Opzione;
  conAlternative: boolean;
  /** true se ci sono alternative e la scelta della settimana non è stata fatta */
  daScegliere: boolean;
}
export interface PiattoRisolto {
  id: string;
  piatto: Piatto;
  componenti: ComponenteRisolto[];
}
export interface GruppoRisolto {
  id: string;
  nome: string;
  piatti: { id: string; nome: string }[];
}

interface Base { pastoId: string; nome: string; facoltativo: boolean; giorno: Giorno }
export type PastoRisolto =
  | (Base & { tipo: 'piatto'; piatto: PiattoRisolto })
  | (Base & { tipo: 'scelta'; gruppi: GruppoRisolto[]; piatto?: PiattoRisolto; daScegliere: boolean })
  | (Base & { tipo: 'libero' })
  | (Base & { tipo: 'digiuno' });

function risolviPiatto(
  piano: Piano, giorno: Giorno, pastoId: string, piattoId: string, scelte: ScelteSettimana,
): PiattoRisolto | undefined {
  const piatto = piano.piatti[piattoId];
  if (!piatto) return undefined;
  const componenti = piatto.componenti.map((c, indice): ComponenteRisolto => {
    const chiave = chiaveComponente(giorno, pastoId, piattoId, indice);
    const salvata = scelte.componenti?.[chiave];
    const valida = typeof salvata === 'number' && salvata >= 0 && salvata < c.opzioni.length;
    const scelta = valida ? salvata : 0;
    const conAlternative = c.opzioni.length > 1;
    return { chiave, indice, portata: c.portata ?? 1, opzioni: c.opzioni, scelta, opzione: c.opzioni[scelta], conAlternative, daScegliere: conAlternative && !valida };
  });
  return { id: piattoId, piatto, componenti };
}

/** Pasti del giorno, nell'ordine del piano, con le scelte della settimana applicate. */
export function pastiDelGiorno(piano: Piano, giorno: Giorno, scelte: ScelteSettimana = {}): PastoRisolto[] {
  const celle = piano.settimana[giorno] ?? {};
  const out: PastoRisolto[] = [];
  for (const def of piano.pasti) {
    const cella = celle[def.id];
    if (!cella) continue;
    const base: Base = { pastoId: def.id, nome: def.nome, facoltativo: !!def.facoltativo, giorno };
    if (cella.tipo === 'libero' || cella.tipo === 'digiuno') {
      out.push({ ...base, tipo: cella.tipo });
    } else if (cella.tipo === 'piatto') {
      const piatto = risolviPiatto(piano, giorno, def.id, cella.piatto, scelte);
      if (piatto) out.push({ ...base, tipo: 'piatto', piatto });
    } else {
      const gruppi: GruppoRisolto[] = cella.gruppi.flatMap((gid) => {
        const g = piano.gruppi?.find((x) => x.id === gid);
        if (!g) return [];
        return [{
          id: g.id, nome: g.nome,
          piatti: g.piatti.filter((p) => piano.piatti[p]).map((p) => ({ id: p, nome: piano.piatti[p].nome })),
        }];
      });
      const scelto = scelte.piatti?.[chiavePasto(giorno, def.id)];
      const ammesso = !!scelto && gruppi.some((g) => g.piatti.some((p) => p.id === scelto));
      const piatto = ammesso ? risolviPiatto(piano, giorno, def.id, scelto!, scelte) : undefined;
      out.push({ ...base, tipo: 'scelta', gruppi, piatto, daScegliere: !piatto });
    }
  }
  return out;
}

/** Il piatto "attivo" di un pasto (fisso o scelto), se c'è. */
export function piattoDelPasto(p: PastoRisolto): PiattoRisolto | undefined {
  if (p.tipo === 'piatto') return p.piatto;
  if (p.tipo === 'scelta') return p.piatto;
  return undefined;
}

/** Primo pasto del giorno non ancora segnato nel diario. */
export function prossimoPasto(pasti: PastoRisolto[], diario: Diario): PastoRisolto | undefined {
  return pasti.find((p) => !diario[p.pastoId]);
}

export function progressoGiorno(pasti: PastoRisolto[], diario: Diario): { segnati: number; totale: number } {
  return { segnati: pasti.filter((p) => !!diario[p.pastoId]).length, totale: pasti.length };
}

/** Elemento della sezione "Scelte della settimana". */
export type SceltaSettimana =
  | { tipo: 'componente'; giorno: Giorno; pastoId: string; pastoNome: string; piattoNome: string; componente: ComponenteRisolto }
  | { tipo: 'piatto'; giorno: Giorno; pastoId: string; pastoNome: string; pasto: Extract<PastoRisolto, { tipo: 'scelta' }> };

export function sceltePrevisteSettimana(piano: Piano, scelte: ScelteSettimana = {}): { voci: SceltaSettimana[]; daFare: number } {
  const voci: SceltaSettimana[] = [];
  for (const giorno of GIORNI) {
    for (const p of pastiDelGiorno(piano, giorno, scelte)) {
      if (p.tipo === 'scelta') voci.push({ tipo: 'piatto', giorno, pastoId: p.pastoId, pastoNome: p.nome, pasto: p });
      const piatto = piattoDelPasto(p);
      if (!piatto) continue;
      for (const c of piatto.componenti) {
        if (c.conAlternative) {
          voci.push({ tipo: 'componente', giorno, pastoId: p.pastoId, pastoNome: p.nome, piattoNome: piatto.piatto.nome, componente: c });
        }
      }
    }
  }
  const daFare = voci.filter((v) => (v.tipo === 'piatto' ? v.pasto.daScegliere : v.componente.daScegliere)).length;
  return { voci, daFare };
}

/** Indicatore di una regola di varietà: piatti diversi del pasto nella settimana. */
export function verificaVarieta(
  piano: Piano, regola: RegolaVarieta, scelte: ScelteSettimana = {},
): { diversi: number; richiesti: number; soddisfatta: boolean } {
  const visti = new Set<string>();
  for (const giorno of GIORNI) {
    const p = pastiDelGiorno(piano, giorno, scelte).find((x) => x.pastoId === regola.pasto);
    const piatto = p && piattoDelPasto(p);
    if (piatto) visti.add(piatto.id);
  }
  return { diversi: visti.size, richiesti: regola.minDiversi, soddisfatta: visti.size >= regola.minDiversi };
}

/** Raggruppa i componenti per portata (ordinate). Una sola portata -> un solo gruppo. */
export function raggruppaPortate(componenti: ComponenteRisolto[]): { portata: number; componenti: ComponenteRisolto[] }[] {
  const mappa = new Map<number, ComponenteRisolto[]>();
  for (const c of componenti) mappa.set(c.portata, [...(mappa.get(c.portata) ?? []), c]);
  return [...mappa.entries()].sort((a, b) => a[0] - b[0]).map(([portata, comp]) => ({ portata, componenti: comp }));
}
