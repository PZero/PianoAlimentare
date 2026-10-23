import { useEffect, useRef, useState } from 'react';
import { annullaPasto, salvaSceltaComponente, salvaSceltaPiatto, segnaPasto, useDiario, useScelte } from '../data/archivio';
import { chiaveGiorno, chiaveSettimana, giornoSettimana, nomeMese } from '../domain/date';
import { pastiDelGiorno, progressoGiorno, prossimoPasto, verificaVarieta, type PastoRisolto } from '../domain/piano';
import { NOMI_GIORNO, type Piano, type StatoPasto } from '../domain/tipi';
import { Illustrazione } from '../illustrazioni';
import { Errore, Scheletri, Stato, Testata, Vuoto, useToast } from './Comuni';
import { DettaglioPasto, illuDiPasto, titoloPasto } from './piattoUi';
import { useApp } from './contesto';
import { vai } from './router';

/** "Oggi a pranzo", "Oggi a cena"... */
export function titoloOggi(nomePasto: string): string {
  const n = nomePasto.toLowerCase();
  if (/colazione|pranzo|cena/.test(n)) return `Oggi a ${n}`;
  return `Oggi: ${n.replace(/-/g, '‑')}`;
}

function Compatto({ pasto, piano, stato, onRimuovi, ...scelte }: {
  pasto: PastoRisolto; piano: Piano; stato?: StatoPasto; onRimuovi: () => void;
  onComponente: (c: string, i: number) => void; onPiatto: (k: string, p: string) => void;
}) {
  const [aperto, setAperto] = useState(false);
  const illu = illuDiPasto(pasto, piano);
  return (
    <li className="compatto">
      <button className="compatto-riga" aria-expanded={aperto} onClick={() => setAperto(!aperto)}>
        <Illustrazione nome={illu.nome} accento={illu.accento} misura="s" />
        <span className="compatto-testo">
          <span className="occhiello">{pasto.nome}{pasto.facoltativo ? ' · facoltativo' : ''}</span>
          <span className="nome-piatto" style={{ display: 'block' }}>{titoloPasto(pasto)}</span>
        </span>
        {stato ? <Stato tipo={stato} /> : pasto.tipo === 'scelta' && pasto.daScegliere ? <Stato tipo="scelta" /> : <span className="stato stato-vuoto"><span className="puntino" aria-hidden="true" /><span className="solo-lettori">Da fare</span></span>}
      </button>
      {aperto && (
        <div className="compatto-corpo">
          <DettaglioPasto pasto={pasto} piano={piano} stato={stato} grande={false} {...scelte}
            azioni={stato ? <div className="azioni azioni-centro" style={{ marginTop: 20 }}><button className="btn-link" onClick={onRimuovi}>Rimuovi il segno</button></div> : undefined} />
        </div>
      )}
    </li>
  );
}

export function Oggi() {
  const { uid, piano, caricamentoPiano, errorePiano, riprovaPiano, profilo } = useApp();
  const mostraToast = useToast();
  const oggi = useRef(new Date()).current;
  const giorno = giornoSettimana(oggi);
  const chiaveG = chiaveGiorno(oggi);
  const chiaveS = chiaveSettimana(oggi);
  const diario = useDiario(uid, chiaveG);
  const scelte = useScelte(uid, chiaveS);

  useEffect(() => { document.title = 'Oggi · PianoAlimentare'; }, []);

  const occhiello = `${NOMI_GIORNO[giorno]} ${oggi.getDate()} ${nomeMese(oggi)}`;
  const testata = (titolo = 'Oggi', sotto?: string) => <Testata occhiello={occhiello} titolo={titolo} sottotitolo={sotto} />;

  if (caricamentoPiano) return <>{testata()}<Scheletri /></>;
  if (errorePiano) return <>{testata()}<Errore onRiprova={riprovaPiano} /></>;
  if (!piano) {
    return (
      <>
        {testata()}
        <Vuoto
          illustrazione="Piatto" titolo="Il tuo menu non c'è ancora"
          testo={profilo.ruolo === 'admin' ? 'Importa il tuo piano alimentare per cominciare.' : 'Importa il tuo piano, oppure attendi che l\'amministratore lo carichi per te.'}
          azione={<button className="btn btn-pieno" onClick={() => vai('/importa')}>Importa il piano</button>}
        />
      </>
    );
  }
  if (diario.errore || scelte.errore) return <>{testata()}<Errore onRiprova={() => { diario.riprova(); scelte.riprova(); }} /></>;
  if (diario.caricamento || scelte.caricamento) return <>{testata()}<Scheletri /></>;

  const pasti = pastiDelGiorno(piano, giorno, scelte.dati);
  if (pasti.length === 0) {
    return <>{testata()}<Vuoto illustrazione="Tazza" titolo="Nessun pasto previsto oggi" testo="Il piano non ha pasti per questo giorno." /></>;
  }
  const prossimo = prossimoPasto(pasti, diario.dati);
  const { segnati, totale } = progressoGiorno(pasti, diario.dati);
  const altri = pasti.filter((p) => p.pastoId !== prossimo?.pastoId);

  const errSalva = () => mostraToast('Non sono riuscito a salvare. Riprova.');
  const segna = (pastoId: string, stato: StatoPasto, nome: string) => {
    const precedente = diario.dati[pastoId];
    segnaPasto(uid, chiaveG, pastoId, stato).catch(errSalva);
    const testo = stato === 'fatto' ? 'segnato come fatto' : stato === 'sostituito' ? 'segnato come sostituito' : 'segnato come saltato';
    mostraToast(`${nome}: ${testo}`, () => { annullaPasto(uid, chiaveG, pastoId, precedente).catch(() => undefined); });
  };
  const handler = {
    onComponente: (chiave: string, indice: number) => { salvaSceltaComponente(uid, chiaveS, chiave, indice).catch(errSalva); },
    onPiatto: (chiave: string, piattoId: string) => { salvaSceltaPiatto(uid, chiaveS, chiave, piattoId).catch(errSalva); },
  };
  const regole = (piano.regole ?? []).filter((r) => r.tipo === 'varieta');
  const nomeDi = (id: string) => piano.pasti.find((p) => p.id === id)?.nome ?? id;

  const sottotitolo = `${segnati} di ${totale} ${totale === 1 ? 'pasto' : 'pasti'}`;

  return (
    <>
      {prossimo ? testata(titoloOggi(prossimo.nome), sottotitolo) : testata('Giornata completata', sottotitolo)}

      {prossimo ? (() => {
        const bloccato = prossimo.tipo === 'scelta' && prossimo.daScegliere;
        const libero = prossimo.tipo === 'libero';
        const digiuno = prossimo.tipo === 'digiuno';
        return (
          <section aria-label="Prossimo pasto" key={prossimo.pastoId} style={{ animation: 'dissolvi .2s ease-out' }}>
            <DettaglioPasto
              pasto={prossimo} piano={piano} {...handler}
              azioni={bloccato ? (
                <p className="avviso-scelta">Scegli il piatto per poter segnare il pasto.</p>
              ) : (
                <div className="pillole-azione">
                  <button className={`btn btn-pieno${libero ? ' solo' : ''}`} onClick={() => segna(prossimo.pastoId, 'fatto', prossimo.nome)}>
                    <Icona16 /> Fatto
                  </button>
                  {!libero && !digiuno && (
                    <button className="btn btn-contorno" onClick={() => segna(prossimo.pastoId, 'sostituito', prossimo.nome)}>Sostituito</button>
                  )}
                  {!libero && (
                    <button className="btn-link" onClick={() => segna(prossimo.pastoId, 'saltato', prossimo.nome)}>Saltato</button>
                  )}
                </div>
              )}
            />
          </section>
        );
      })() : (
        <div className="vuoto" role="status">
          <Illustrazione nome="Germoglio" accento="salvia" misura="l" />
          <h2 className="titolo-sezione">Tutto fatto per oggi</h2>
          <p className="testo-2">
            {pasti.filter((p) => diario.dati[p.pastoId] === 'fatto').length} fatti,{' '}
            {pasti.filter((p) => diario.dati[p.pastoId] === 'sostituito').length} sostituiti,{' '}
            {pasti.filter((p) => diario.dati[p.pastoId] === 'saltato').length} saltati. Buona serata.
          </p>
        </div>
      )}

      {altri.length > 0 && (
        <section className="piu-tardi" aria-label="Gli altri pasti di oggi">
          <p className="occhiello" style={{ marginBottom: 4 }}>{prossimo ? 'Più tardi oggi' : 'La giornata'}</p>
          <ul style={{ borderTop: '1px solid var(--c-filetto)' }}>
            {altri.map((p) => (
              <Compatto
                key={p.pastoId} pasto={p} piano={piano} stato={diario.dati[p.pastoId]} {...handler}
                onRimuovi={() => { annullaPasto(uid, chiaveG, p.pastoId, undefined).catch(errSalva); }}
              />
            ))}
          </ul>
        </section>
      )}

      {((piano.note && piano.note.length > 0) || regole.length > 0) && (
        <section className="promemoria" aria-label="Promemoria">
          {piano.note && piano.note.length > 0 && (
            <ul>{piano.note.map((n, i) => <li key={i}>{n}</li>)}</ul>
          )}
          {regole.length > 0 && (
            <ul className="indicatori">
              {regole.map((r, i) => {
                const v = verificaVarieta(piano, r, scelte.dati);
                return (
                  <li key={i} className={v.soddisfatta ? 'ok' : undefined}>
                    {nomeDi(r.pasto)} diverse: {v.diversi} di {v.richiesti}{v.soddisfatta ? ' · fatto' : ''}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      )}
    </>
  );
}

function Icona16() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  );
}
