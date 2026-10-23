// Card pasto: usata in Oggi (in evidenza / compatta) e nel dettaglio della Settimana.
import { useState, type ReactNode } from 'react';
import { raggruppaPortate, chiavePasto, type ComponenteRisolto, type PastoRisolto, type PiattoRisolto } from '../domain/piano';
import { formatQuantita } from '../domain/quantita';
import type { Piano, Piatto, StatoPasto } from '../domain/tipi';
import { Badge } from './Comuni';
import { SheetOpzioni } from './Comuni';

export interface PropsScelte {
  onComponente: (chiave: string, indice: number) => void;
  onPiatto: (chiavePasto: string, piattoId: string) => void;
}

const nomeAlimento = (piano: Piano, id: string) => piano.alimenti[id]?.nome ?? id;

function RigaComponente({ c, piano, onComponente }: { c: ComponenteRisolto; piano: Piano; onComponente: PropsScelte['onComponente'] }) {
  const [aperto, setAperto] = useState(false);
  const o = c.opzione;
  return (
    <li className="ingrediente">
      <span className="ing-nome">
        {nomeAlimento(piano, o.alimento)}
        {c.daScegliere && (
          <button className="btn-testo" onClick={() => setAperto(true)}><Badge tipo="scelta" /></button>
        )}
        {c.conAlternative && !c.daScegliere && (
          <button className="btn-testo" onClick={() => setAperto(true)}>cambia</button>
        )}
      </span>
      <span className="ing-qta num">{formatQuantita(o)}</span>
      {c.conAlternative && (
        <SheetOpzioni
          aperto={aperto} titolo="Scegli per la settimana" onChiudi={() => setAperto(false)}
          opzioni={c.opzioni.map((x, i) => ({ id: String(i), etichetta: nomeAlimento(piano, x.alimento), dettaglio: formatQuantita(x) }))}
          valore={c.daScegliere ? undefined : String(c.scelta)}
          onConferma={(id) => { onComponente(c.chiave, Number(id)); setAperto(false); }}
        />
      )}
    </li>
  );
}

function ElencoPiatto({ r, piano, onComponente }: { r: PiattoRisolto; piano: Piano; onComponente: PropsScelte['onComponente'] }) {
  const portate = raggruppaPortate(r.componenti);
  const piu = portate.length > 1;
  return (
    <>
      {portate.map((p) => (
        <div key={p.portata}>
          {piu && <h4 className="portata">{p.portata}ª portata</h4>}
          <ul className="ingredienti">
            {p.componenti.map((c) => <RigaComponente key={c.chiave} c={c} piano={piano} onComponente={onComponente} />)}
          </ul>
        </div>
      ))}
      {r.piatto.preparazione && (
        <details className="preparazione">
          <summary>Preparazione</summary>
          <p>{r.piatto.preparazione}</p>
        </details>
      )}
      {r.piatto.varianti && r.piatto.varianti.length > 0 && <Varianti varianti={r.piatto.varianti} piano={piano} />}
    </>
  );
}

function Varianti({ varianti, piano }: { varianti: Piatto[]; piano: Piano }) {
  return (
    <div className="varianti">
      <h4 className="portata">In alternativa</h4>
      {varianti.map((v, i) => (
        <div key={i} className="variante">
          <strong>{v.nome}</strong>
          <ul className="ingredienti">
            {v.componenti.map((c, j) => (
              <li key={j} className="ingrediente">
                <span className="ing-nome">{c.opzioni.map((o) => nomeAlimento(piano, o.alimento)).join(' o ')}</span>
                <span className="ing-qta num">{formatQuantita(c.opzioni[0])}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

const TESTO_STATO: Record<StatoPasto, 'fatto' | 'sostituito' | 'saltato'> = { fatto: 'fatto', sostituito: 'sostituito', saltato: 'saltato' };

interface Props extends PropsScelte {
  pasto: PastoRisolto;
  piano: Piano;
  stato?: StatoPasto;
  evidenza?: boolean;
  azioni?: ReactNode;
  /** compatta: nasconde il corpo finché non si tocca */
  compatta?: boolean;
}

export function CardPasto({ pasto, piano, stato, evidenza, azioni, compatta, onComponente, onPiatto }: Props) {
  const [espansa, setEspansa] = useState(false);
  const [sheetPiatto, setSheetPiatto] = useState(false);
  const mostraCorpo = !compatta || espansa;
  const tinta = pasto.tipo === 'libero' || pasto.tipo === 'digiuno' ? ` card-${pasto.tipo}` : '';

  let titolo = '';
  if (pasto.tipo === 'piatto') titolo = pasto.piatto.piatto.nome;
  else if (pasto.tipo === 'scelta') titolo = pasto.piatto ? pasto.piatto.piatto.nome : 'Scegli il piatto';
  else titolo = pasto.tipo === 'libero' ? 'Pasto libero: goditelo' : 'Pausa dal cibo';

  const badge = stato ? <Badge tipo={TESTO_STATO[stato]} /> : pasto.tipo === 'libero' || pasto.tipo === 'digiuno' ? <Badge tipo={pasto.tipo} /> : null;

  const opzioniPiatti = pasto.tipo === 'scelta'
    ? pasto.gruppi.flatMap((g) => g.piatti.map((p) => ({ id: p.id, etichetta: p.nome, sezione: pasto.gruppi.length > 1 ? g.nome : undefined })))
    : [];
  const unicoGruppo = pasto.tipo === 'scelta' && pasto.gruppi.length === 1 ? pasto.gruppi[0].nome : undefined;

  return (
    <article className={`card${evidenza ? ' card-evidenza' : ''}${tinta}${stato ? ' card-segnato' : ''}`} aria-label={pasto.nome}>
      <header className="card-testa">
        <span className="pasto-nome">{pasto.nome}{pasto.facoltativo ? ' · facoltativo' : ''}</span>
        {badge}
      </header>
      {compatta ? (
        <button className="card-titolo-btn" aria-expanded={espansa} onClick={() => setEspansa(!espansa)}>
          <span className="card-titolo">{titolo}</span>
        </button>
      ) : (
        <h3 className="card-titolo">{titolo}</h3>
      )}

      {mostraCorpo && pasto.tipo === 'scelta' && (
        <div className="scelta-piatto">
          {unicoGruppo && <p className="tenue">{unicoGruppo}</p>}
          <button className="btn btn-secondario btn-piccolo" onClick={() => setSheetPiatto(true)}>
            {pasto.piatto ? 'Cambia piatto' : 'Scegli il piatto'}
          </button>
          <SheetOpzioni
            aperto={sheetPiatto} titolo={`Scegli: ${pasto.nome}`} onChiudi={() => setSheetPiatto(false)}
            opzioni={opzioniPiatti} valore={pasto.piatto?.id}
            onConferma={(id) => { onPiatto(chiavePasto(pasto.giorno, pasto.pastoId), id); setSheetPiatto(false); }}
          />
        </div>
      )}
      {mostraCorpo && (pasto.tipo === 'piatto' || (pasto.tipo === 'scelta' && pasto.piatto)) && (
        <ElencoPiatto r={(pasto.tipo === 'piatto' ? pasto.piatto : pasto.piatto)!} piano={piano} onComponente={onComponente} />
      )}
      {mostraCorpo && azioni}
    </article>
  );
}
