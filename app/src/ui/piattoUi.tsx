// Pezzi editoriali del piatto, condivisi da Oggi e Settimana (docs/DESIGN.md, sezione 5).
import { useState, type ReactNode } from 'react';
import {
  chiavePasto, raggruppaPortate, type ComponenteRisolto, type PastoRisolto, type PiattoRisolto,
} from '../domain/piano';
import { formatQuantita } from '../domain/quantita';
import type { Piano, Piatto, StatoPasto } from '../domain/tipi';
import {
  Illustrazione, illustrazioneCella, illustrazionePiatto, type Scelta,
} from '../illustrazioni';
import { SheetOpzioni, Stato, type VoceOpzione } from './Comuni';

export const nomeAlimento = (piano: Piano, id: string) => piano.alimenti[id]?.nome ?? id;

export interface PropsScelte {
  onComponente: (chiave: string, indice: number) => void;
  onPiatto: (chiavePasto: string, piattoId: string) => void;
}

/** Illustrazione di un piatto del piano. */
export function illuDiPiatto(piano: Piano, piatto: Piatto, pastoId?: string): Scelta {
  return illustrazionePiatto(piatto, piano.alimenti, pastoId);
}

/** Illustrazione di un pasto risolto (piatto scelto, libero, digiuno o ancora da scegliere). */
export function illuDiPasto(p: PastoRisolto, piano: Piano): Scelta {
  if (p.tipo === 'libero' || p.tipo === 'digiuno') return illustrazioneCella(p.tipo);
  if (p.tipo === 'piatto') return illuDiPiatto(piano, p.piatto.piatto, p.pastoId);
  if (p.piatto) return illuDiPiatto(piano, p.piatto.piatto, p.pastoId);
  return { nome: 'Piatto', accento: 'terracotta' };
}

export function titoloPasto(p: PastoRisolto): string {
  if (p.tipo === 'piatto') return p.piatto.piatto.nome;
  if (p.tipo === 'scelta') return p.piatto ? p.piatto.piatto.nome : 'Da scegliere';
  return p.tipo === 'libero' ? 'Pasto libero: goditelo' : 'Pausa dal cibo';
}

export function sottotitoloPasto(p: PastoRisolto, piano: Piano): string | undefined {
  const r = p.tipo === 'piatto' ? p.piatto : p.tipo === 'scelta' ? p.piatto : undefined;
  if (!r) return undefined;
  const n = new Set(r.componenti.map((c) => c.opzione.alimento)).size;
  const canali = r.componenti.map((c) => piano.alimenti[c.opzione.alimento]?.canale).filter((c) => c && c !== 'base');
  const conteggio: Record<string, number> = {};
  canali.forEach((c) => { conteggio[c!] = (conteggio[c!] ?? 0) + 1; });
  const principale = Object.entries(conteggio).sort((a, b) => b[1] - a[1])[0]?.[0];
  const nomiCanale: Record<string, string> = { amazon: 'Amazon', fresco: 'fresco', esterno: 'esterno' };
  return `${n} ${n === 1 ? 'alimento' : 'alimenti'}${principale ? ` · soprattutto ${nomiCanale[principale]}` : ''}`;
}


// ---------- Ingredienti ----------
function Riga({ c, piano, onComponente }: { c: ComponenteRisolto; piano: Piano; onComponente: PropsScelte['onComponente'] }) {
  const [aperto, setAperto] = useState(false);
  const o = c.opzione;
  return (
    <li className="ing">
      <span className="ing-nome">
        {nomeAlimento(piano, o.alimento)}
        {c.daScegliere && <button className="da-scegliere" onClick={() => setAperto(true)}>· da scegliere</button>}
        {c.conAlternative && !c.daScegliere && <button className="cambia" onClick={() => setAperto(true)}>· cambia</button>}
      </span>
      <span className="ing-qta num">{c.daScegliere ? '' : formatQuantita(o)}</span>
      {c.conAlternative && (
        <SheetOpzioni
          aperto={aperto} titolo={`Che cosa preferisci?`} onChiudi={() => setAperto(false)}
          opzioni={c.opzioni.map((x, i) => ({ id: String(i), etichetta: nomeAlimento(piano, x.alimento), dettaglio: formatQuantita(x) }))}
          valore={c.daScegliere ? undefined : String(c.scelta)}
          onConferma={(id) => { onComponente(c.chiave, Number(id)); setAperto(false); }}
        />
      )}
    </li>
  );
}

export function Ingredienti({ r, piano, onComponente }: { r: PiattoRisolto; piano: Piano; onComponente: PropsScelte['onComponente'] }) {
  const portate = raggruppaPortate(r.componenti);
  return (
    <>
      {portate.map((p) => (
        <div key={p.portata}>
          {portate.length > 1 && <p className="occhiello portata">{p.portata}ª portata</p>}
          <ul className="ingredienti">
            {p.componenti.map((c) => <Riga key={c.chiave} c={c} piano={piano} onComponente={onComponente} />)}
          </ul>
        </div>
      ))}
    </>
  );
}

export function Preparazione({ testo }: { testo?: string }) {
  if (!testo) return null;
  return (
    <details className="preparazione">
      <summary>Come si prepara</summary>
      <p>{testo}</p>
    </details>
  );
}

export function InAlternativa({ varianti, piano }: { varianti?: Piatto[]; piano: Piano }) {
  if (!varianti || varianti.length === 0) return null;
  return (
    <section className="in-alternativa" aria-label="In alternativa">
      <p className="occhiello">In alternativa</p>
      {varianti.map((v, i) => (
        <div key={i}>
          <p className="nome-piatto">{v.nome}</p>
          <ul className="ingredienti">
            {v.componenti.map((c, j) => (
              <li key={j} className="ing">
                <span className="ing-nome">{c.opzioni.map((o) => nomeAlimento(piano, o.alimento)).join(' o ')}</span>
                <span className="ing-qta num">{formatQuantita(c.opzioni[0])}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}

// ---------- Scelta del piatto (pasti di tipo "scelta") ----------
export function opzioniPiatti(pasto: Extract<PastoRisolto, { tipo: 'scelta' }>, piano: Piano): VoceOpzione[] {
  return pasto.gruppi.flatMap((g) => g.piatti.map((p) => ({
    id: p.id, etichetta: p.nome, sezione: pasto.gruppi.length > 1 ? g.nome : undefined,
    illustrazione: illuDiPiatto(piano, piano.piatti[p.id], pasto.pastoId),
  })));
}

function ScegliPiatto({ pasto, piano, onPiatto }: { pasto: Extract<PastoRisolto, { tipo: 'scelta' }>; piano: Piano; onPiatto: PropsScelte['onPiatto'] }) {
  const sezioni = pasto.gruppi;
  return (
    <div>
      {sezioni.map((g) => (
        <div key={g.id}>
          <p className="occhiello occhiello-sezione">{g.nome}</p>
          {g.piatti.map((p) => {
            const illu = illuDiPiatto(piano, piano.piatti[p.id], pasto.pastoId);
            return (
              <button key={p.id} className="opzione" onClick={() => onPiatto(chiavePasto(pasto.giorno, pasto.pastoId), p.id)}>
                <span className="opzione-illu"><Illustrazione nome={illu.nome} accento={illu.accento} misura="s" /></span>
                <span className="opzione-nome">{p.nome}</span>
                <span className="cerchio" aria-hidden="true" />
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}

// ---------- Dettaglio completo di un pasto ----------
interface PropsDettaglio extends PropsScelte {
  pasto: PastoRisolto;
  piano: Piano;
  stato?: StatoPasto;
  /** pulsanti sotto (Fatto / Sostituito / Saltato) */
  azioni?: ReactNode;
  grande?: boolean;
}

export function DettaglioPasto({ pasto, piano, stato, azioni, grande = true, onComponente, onPiatto }: PropsDettaglio) {
  const [cambia, setCambia] = useState(false);
  const illu = illuDiPasto(pasto, piano);
  const r = pasto.tipo === 'piatto' ? pasto.piatto : pasto.tipo === 'scelta' ? pasto.piatto : undefined;
  const daScegliere = pasto.tipo === 'scelta' && !pasto.piatto;
  const sotto = sottotitoloPasto(pasto, piano);

  return (
    <article aria-label={pasto.nome}>
      <div className="piatto-vetrina">
        <Illustrazione nome={illu.nome} accento={illu.accento} misura={grande ? 'l' : 'm'} />
        <h3 className="nome-piatto">{titoloPasto(pasto)}</h3>
        {sotto && <p className="sottotitolo">{sotto}</p>}
        {(stato || pasto.tipo === 'libero' || pasto.tipo === 'digiuno') && (
          <p className="stato-riga">
            <Stato tipo={stato ?? (pasto.tipo as 'libero' | 'digiuno')} />
          </p>
        )}
      </div>

      {pasto.tipo === 'scelta' && daScegliere && (
        <>
          <p className="occhiello occhiello-sezione centrato">Scegli il piatto</p>
          <ScegliPiatto pasto={pasto} piano={piano} onPiatto={onPiatto} />
        </>
      )}
      {r && (
        <>
          <Ingredienti r={r} piano={piano} onComponente={onComponente} />
          {pasto.tipo === 'scelta' && (
            <>
              <button className="cambia" style={{ marginTop: 8, minHeight: 44 }} onClick={() => setCambia(true)}>· cambia piatto</button>
              <SheetOpzioni
                aperto={cambia} titolo={`${pasto.nome}`} onChiudi={() => setCambia(false)}
                opzioni={opzioniPiatti(pasto, piano)} valore={pasto.piatto?.id}
                onConferma={(id) => { onPiatto(chiavePasto(pasto.giorno, pasto.pastoId), id); setCambia(false); }}
              />
            </>
          )}
          <Preparazione testo={r.piatto.preparazione} />
          <InAlternativa varianti={r.piatto.varianti} piano={piano} />
        </>
      )}
      {azioni}
    </article>
  );
}
