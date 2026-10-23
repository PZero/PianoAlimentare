import { useEffect, useRef } from 'react';
import { annullaPasto, salvaSceltaComponente, salvaSceltaPiatto, segnaPasto, useDiario, useScelte } from '../data/archivio';
import { chiaveGiorno, chiaveSettimana, giornoSettimana, nomeMese } from '../domain/date';
import { pastiDelGiorno, progressoGiorno, prossimoPasto } from '../domain/piano';
import { NOMI_GIORNO, type StatoPasto } from '../domain/tipi';
import { CardPasto } from './CardPasto';
import { Errore, Scheletri, Vuoto, useToast } from './Comuni';
import { Icona } from './Icone';
import { useApp } from './contesto';
import { vai } from './router';

function usaOggi(): Date {
  // Aggiorna la data a mezzanotte senza ricaricare.
  const ref = useRef(new Date());
  return ref.current;
}

export function Oggi() {
  const { uid, piano, caricamentoPiano, errorePiano, riprovaPiano, profilo } = useApp();
  const mostraToast = useToast();
  const oggi = usaOggi();
  const giorno = giornoSettimana(oggi);
  const chiaveG = chiaveGiorno(oggi);
  const chiaveS = chiaveSettimana(oggi);
  const diario = useDiario(uid, chiaveG);
  const scelte = useScelte(uid, chiaveS);

  useEffect(() => { document.title = 'Oggi · PianoAlimentare'; }, []);

  const intestazione = (progresso?: string) => (
    <div className="intestazione">
      <h1>{NOMI_GIORNO[giorno]} {oggi.getDate()} {nomeMese(oggi)}</h1>
      {progresso && <p className="tenue">{progresso}</p>}
    </div>
  );

  if (caricamentoPiano) return <>{intestazione()}<Scheletri n={2} /></>;
  if (errorePiano) return <>{intestazione()}<Errore onRiprova={riprovaPiano} /></>;
  if (!piano) {
    return (
      <>
        {intestazione()}
        <Vuoto
          titolo="Nessun piano attivo"
          testo={profilo.ruolo === 'admin' ? 'Importa il tuo piano alimentare.' : 'Importa il tuo piano, oppure attendi che l\'amministratore lo carichi per te.'}
          azione={<button className="btn btn-primario" onClick={() => vai('/importa')}>Importa il tuo piano</button>}
        />
      </>
    );
  }
  if (diario.errore || scelte.errore) return <>{intestazione()}<Errore onRiprova={() => { diario.riprova(); scelte.riprova(); }} /></>;
  if (diario.caricamento || scelte.caricamento) return <>{intestazione()}<Scheletri n={2} /></>;

  const pasti = pastiDelGiorno(piano, giorno, scelte.dati);
  const prossimo = prossimoPasto(pasti, diario.dati);
  const { segnati, totale } = progressoGiorno(pasti, diario.dati);
  const altri = pasti.filter((p) => p !== prossimo && p.pastoId !== prossimo?.pastoId);

  const segna = (pastoId: string, stato: StatoPasto, nome: string) => {
    const precedente = diario.dati[pastoId];
    segnaPasto(uid, chiaveG, pastoId, stato).catch(() => mostraToast('Non sono riuscito a salvare. Riprova.'));
    const testo = stato === 'fatto' ? 'segnato come fatto' : stato === 'sostituito' ? 'segnato come sostituito' : 'segnato come saltato';
    mostraToast(`${nome}: ${testo}`, () => { annullaPasto(uid, chiaveG, pastoId, precedente).catch(() => undefined); });
  };
  const errSalva = () => mostraToast('Non sono riuscito a salvare. Riprova.');
  const handler = {
    onComponente: (chiave: string, indice: number) => { salvaSceltaComponente(uid, chiaveS, chiave, indice).catch(errSalva); },
    onPiatto: (chiave: string, piattoId: string) => { salvaSceltaPiatto(uid, chiaveS, chiave, piattoId).catch(errSalva); },
  };

  if (pasti.length === 0) {
    return <>{intestazione()}<Vuoto titolo="Nessun pasto previsto oggi" testo="Il piano non ha pasti per questo giorno." /></>;
  }

  return (
    <>
      {intestazione(`${segnati} di ${totale} pasti`)}

      {piano.note && piano.note.length > 0 && (
        <details className="note-striscia">
          <summary>Promemoria del nutrizionista</summary>
          <ul>{piano.note.map((n, i) => <li key={i}>{n}</li>)}</ul>
        </details>
      )}

      {prossimo ? (
        <section aria-label="Prossimo pasto">
          <h2 className="sezione-titolo">Prossimo pasto</h2>
          <CardPasto
            pasto={prossimo} piano={piano} evidenza {...handler}
            azioni={(() => {
              const bloccato = prossimo.tipo === 'scelta' && prossimo.daScegliere;
              const liberoODigiuno = prossimo.tipo === 'libero' || prossimo.tipo === 'digiuno';
              return (
                <div className="azioni">
                  {bloccato && <p className="tenue">Scegli prima il piatto per segnare il pasto.</p>}
                  <button className="btn btn-primario" disabled={bloccato} onClick={() => segna(prossimo.pastoId, 'fatto', prossimo.nome)}>
                    <Icona nome="fatto" /> Fatto
                  </button>
                  {!liberoODigiuno && (
                    <button className="btn btn-secondario" disabled={bloccato} onClick={() => segna(prossimo.pastoId, 'sostituito', prossimo.nome)}>
                      <Icona nome="sostituito" /> Sostituito
                    </button>
                  )}
                  {prossimo.tipo !== 'libero' && (
                    <button className="btn btn-secondario" onClick={() => segna(prossimo.pastoId, 'saltato', prossimo.nome)}>
                      <Icona nome="saltato" /> Saltato
                    </button>
                  )}
                </div>
              );
            })()}
          />
        </section>
      ) : (
        <div className="card card-completata" role="status">
          <Icona nome="fatto" dim={28} />
          <h2>Giornata completata</h2>
          <p className="tenue">
            {pasti.filter((p) => diario.dati[p.pastoId] === 'fatto').length} fatti,{' '}
            {pasti.filter((p) => diario.dati[p.pastoId] === 'sostituito').length} sostituiti,{' '}
            {pasti.filter((p) => diario.dati[p.pastoId] === 'saltato').length} saltati. Buona serata.
          </p>
        </div>
      )}

      {altri.length > 0 && (
        <section aria-label="Altri pasti del giorno">
          <h2 className="sezione-titolo">Altri pasti del giorno</h2>
          {altri.map((p) => (
            <CardPasto
              key={p.pastoId} pasto={p} piano={piano} stato={diario.dati[p.pastoId]} compatta {...handler}
              azioni={diario.dati[p.pastoId] ? (
                <div className="azioni">
                  <button
                    className="btn btn-testo-pieno"
                    onClick={() => { annullaPasto(uid, chiaveG, p.pastoId, undefined).catch(errSalva); }}
                  >
                    Rimuovi il segno
                  </button>
                </div>
              ) : undefined}
            />
          ))}
        </section>
      )}
    </>
  );
}
