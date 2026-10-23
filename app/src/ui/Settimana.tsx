import { useEffect, useMemo, useState } from 'react';
import { salvaSceltaComponente, salvaSceltaPiatto, useDiariGiorni, useScelte } from '../data/archivio';
import { chiaveGiorno, chiaveSettimana, dataDelGiorno, lunediDiSettimana, nomeMese, spostaSettimana } from '../domain/date';
import {
  chiavePasto, pastiDelGiorno, sceltePrevisteSettimana, verificaVarieta, type SceltaSettimana,
} from '../domain/piano';
import { GIORNI, NOMI_GIORNO, type Giorno, type Piano } from '../domain/tipi';
import { CardPasto } from './CardPasto';
import { Badge, Errore, Scheletri, Segmented, Sheet, SheetOpzioni, Vuoto, useToast } from './Comuni';
import { Icona } from './Icone';
import { useApp } from './contesto';
import { vai } from './router';

const nomeAl = (piano: Piano, id: string) => piano.alimenti[id]?.nome ?? id;

export function Settimana() {
  const { uid, piano, caricamentoPiano, errorePiano, riprovaPiano } = useApp();
  const mostraToast = useToast();
  const oggi = useMemo(() => new Date(), []);
  const chiaveOggi = chiaveSettimana(oggi);
  const [chiave, setChiave] = useState(chiaveOggi);
  const scelte = useScelte(uid, chiave);
  const giorniChiavi = useMemo(() => GIORNI.map((g) => chiaveGiorno(dataDelGiorno(chiave, g))), [chiave]);
  const diari = useDiariGiorni(uid, giorniChiavi);
  const [dettaglio, setDettaglio] = useState<{ giorno: Giorno; pastoId: string } | null>(null);
  const [sheetPiatto, setSheetPiatto] = useState<Extract<SceltaSettimana, { tipo: 'piatto' }> | null>(null);

  useEffect(() => { document.title = 'Settimana · PianoAlimentare'; }, []);

  const lun = lunediDiSettimana(chiave);
  const dom = dataDelGiorno(chiave, 'dom');
  const intervallo = `${lun.getDate()} ${lun.getMonth() === dom.getMonth() ? '' : nomeMese(lun) + ' '}- ${dom.getDate()} ${nomeMese(dom)}`;
  const numero = Number(chiave.split('-W')[1]);

  const selettore = (
    <div className="selettore-sett">
      <button className="btn-icona" aria-label="Settimana precedente" onClick={() => setChiave(spostaSettimana(chiave, -1))}><Icona nome="sinistra" /></button>
      <div className="selettore-testo">
        <strong>Settimana {numero}</strong>
        <span className="tenue">{intervallo}</span>
      </div>
      <button className="btn-icona" aria-label="Settimana successiva" onClick={() => setChiave(spostaSettimana(chiave, 1))}><Icona nome="destra" /></button>
    </div>
  );

  const intestazione = <div className="intestazione"><h1>Settimana</h1>{selettore}</div>;

  if (caricamentoPiano) return <>{intestazione}<Scheletri n={3} /></>;
  if (errorePiano) return <>{intestazione}<Errore onRiprova={riprovaPiano} /></>;
  if (!piano) {
    return (
      <>
        {intestazione}
        <Vuoto titolo="Nessun piano attivo" testo="Importa un piano per vedere la settimana."
          azione={<button className="btn btn-primario" onClick={() => vai('/importa')}>Importa il tuo piano</button>} />
      </>
    );
  }
  if (scelte.errore || diari.errore) return <>{intestazione}<Errore onRiprova={() => { scelte.riprova(); diari.riprova(); }} /></>;
  if (scelte.caricamento) return <>{intestazione}<Scheletri n={3} /></>;

  const errSalva = () => mostraToast('Non sono riuscito a salvare. Riprova.');
  const salvaComp = (k: string, i: number) => { salvaSceltaComponente(uid, chiave, k, i).catch(errSalva); };
  const salvaPiatto = (k: string, p: string) => { salvaSceltaPiatto(uid, chiave, k, p).catch(errSalva); };
  const { voci, daFare } = sceltePrevisteSettimana(piano, scelte.dati);
  const regole = (piano.regole ?? []).filter((r) => r.tipo === 'varieta');

  const sel = dettaglio && pastiDelGiorno(piano, dettaglio.giorno, scelte.dati).find((p) => p.pastoId === dettaglio.pastoId);

  return (
    <>
      {intestazione}

      {regole.length > 0 && (
        <ul className="regole">
          {regole.map((r, i) => {
            const v = verificaVarieta(piano, r, scelte.dati);
            const nomePasto = piano.pasti.find((p) => p.id === r.pasto)?.nome ?? r.pasto;
            return (
              <li key={i}>
                <Icona nome={v.soddisfatta ? 'fatto' : 'avviso'} dim={16} />
                <span>{nomePasto}: {v.diversi} di {v.richiesti} piatti diversi{r.testo ? ` · ${r.testo}` : ''}</span>
              </li>
            );
          })}
        </ul>
      )}

      {voci.length > 0 && (
        <section aria-label="Scelte della settimana">
          <h2 className="sezione-titolo">
            Scelte della settimana{' '}
            {daFare > 0 ? <Badge tipo="scelta" testo={`${daFare} da fare`} /> : <Badge tipo="fatto" testo="Tutte fatte" />}
          </h2>
          <div className="card">
            <ul className="scelte-lista">
              {voci.map((v, i) => (
                <li key={i} className="scelta-riga">
                  <div className="scelta-testa">
                    <span className="scelta-titolo">{v.pastoNome} · {NOMI_GIORNO[v.giorno].slice(0, 3).toLowerCase()}</span>
                    <span className="tenue">{v.tipo === 'componente' ? v.piattoNome : 'Piatto del giorno'}</span>
                  </div>
                  {v.tipo === 'componente' ? (
                    <Segmented
                      etichetta={`${v.pastoNome} ${v.giorno}`}
                      opzioni={v.componente.opzioni.map((o, k) => ({ valore: k, testo: nomeAl(piano, o.alimento) }))}
                      valore={v.componente.daScegliere ? undefined : v.componente.scelta}
                      onCambia={(k) => salvaComp(v.componente.chiave, k)}
                    />
                  ) : (
                    <button className="btn btn-secondario btn-piccolo" onClick={() => setSheetPiatto(v)}>
                      {v.pasto.piatto ? v.pasto.piatto.piatto.nome : 'Scegli il piatto'}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <section aria-label="Pasti della settimana">
        <h2 className="sezione-titolo">Pasti</h2>
        {GIORNI.map((g, gi) => {
          const pasti = pastiDelGiorno(piano, g, scelte.dati);
          const oggiQui = chiave === chiaveOggi && chiaveGiorno(oggi) === giorniChiavi[gi];
          const diario = diari.dati[giorniChiavi[gi]] ?? {};
          return (
            <div key={g} className={`card giorno${oggiQui ? ' giorno-oggi' : ''}`}>
              <h3 className="giorno-testa">
                {NOMI_GIORNO[g]} <span className="tenue">{dataDelGiorno(chiave, g).getDate()}</span>
                {oggiQui && <span className="oggi-tag">Oggi</span>}
              </h3>
              {pasti.length === 0 && <p className="tenue">Nessun pasto previsto.</p>}
              <ul className="giorno-pasti">
                {pasti.map((p) => {
                  const stato = diario[p.pastoId];
                  const nome = p.tipo === 'piatto' ? p.piatto.piatto.nome
                    : p.tipo === 'scelta' ? (p.piatto ? p.piatto.piatto.nome : 'Da scegliere')
                      : p.tipo === 'libero' ? 'Libero' : 'Digiuno';
                  return (
                    <li key={p.pastoId}>
                      <button className="pasto-riga" onClick={() => setDettaglio({ giorno: g, pastoId: p.pastoId })}>
                        <span className="pasto-riga-nome">{p.nome}</span>
                        <span className="pasto-riga-piatto">{nome}</span>
                        <span className={`pallino ${stato ?? 'nessuno'}`} role="img" aria-label={stato ?? 'non segnato'}>
                          {stato === 'fatto' ? '✓' : stato === 'sostituito' ? '⇄' : stato === 'saltato' ? '–' : ''}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </section>

      <Sheet aperto={!!sel} titolo={sel ? `${NOMI_GIORNO[sel.giorno]} · ${sel.nome}` : ''} onChiudi={() => setDettaglio(null)} pieno>
        {sel && (
          <CardPasto
            pasto={sel} piano={piano} stato={diari.dati[giorniChiavi[GIORNI.indexOf(sel.giorno)]]?.[sel.pastoId]}
            onComponente={salvaComp} onPiatto={salvaPiatto}
          />
        )}
      </Sheet>

      {sheetPiatto && (
        <SheetOpzioni
          aperto titolo={`Scegli: ${sheetPiatto.pastoNome} ${sheetPiatto.giorno}`} onChiudi={() => setSheetPiatto(null)}
          opzioni={sheetPiatto.pasto.gruppi.flatMap((g) => g.piatti.map((p) => ({
            id: p.id, etichetta: p.nome, sezione: sheetPiatto.pasto.gruppi.length > 1 ? g.nome : undefined,
          })))}
          valore={sheetPiatto.pasto.piatto?.id}
          onConferma={(id) => { salvaPiatto(chiavePasto(sheetPiatto.giorno, sheetPiatto.pastoId), id); setSheetPiatto(null); }}
        />
      )}
    </>
  );
}
