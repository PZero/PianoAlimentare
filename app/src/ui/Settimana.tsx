import { useEffect, useMemo, useState } from 'react';
import { salvaSceltaComponente, salvaSceltaPiatto, useDiariGiorni, useScelte } from '../data/archivio';
import { chiaveGiorno, chiaveSettimana, dataDelGiorno, lunediDiSettimana, nomeMese, spostaSettimana } from '../domain/date';
import {
  chiavePasto, pastiDelGiorno, sceltePrevisteSettimana, verificaVarieta, type SceltaSettimana,
} from '../domain/piano';
import { formatQuantita } from '../domain/quantita';
import { GIORNI, NOMI_GIORNO, type Giorno } from '../domain/tipi';
import { Illustrazione } from '../illustrazioni';
import { Errore, Scheletri, Sheet, SheetOpzioni, Stato, Testata, Vuoto, useToast } from './Comuni';
import { Icona } from './Icone';
import { DettaglioPasto, illuDiPasto, nomeAlimento, opzioniPiatti, titoloPasto } from './piattoUi';
import { useApp } from './contesto';
import { vai } from './router';

const INIZIALI = ['L', 'M', 'M', 'G', 'V', 'S', 'D'];
const etichettaVoce = (v: SceltaSettimana) => `${v.pastoNome} · ${NOMI_GIORNO[v.giorno]}`;

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
  const [elencoScelte, setElencoScelte] = useState(false);
  const [voce, setVoce] = useState<SceltaSettimana | null>(null);

  useEffect(() => { document.title = 'Settimana · PianoAlimentare'; }, []);

  const lun = lunediDiSettimana(chiave);
  const dom = dataDelGiorno(chiave, 'dom');
  const intervallo = `${lun.getDate()}${lun.getMonth() === dom.getMonth() ? '' : ' ' + nomeMese(lun)} – ${dom.getDate()} ${nomeMese(dom)}`;
  const numero = Number(chiave.split('-W')[1]);

  const testata = (
    <Testata occhiello={`Settimana ${numero}`} titolo="Il menu della settimana">
      <div className="cambia-sett">
        <button className="btn-icona" aria-label="Settimana precedente" onClick={() => setChiave(spostaSettimana(chiave, -1))}><Icona nome="sinistra" /></button>
        <span className="testo-2 num" style={{ minWidth: '9ch', textAlign: 'center' }}>{intervallo}</span>
        <button className="btn-icona" aria-label="Settimana successiva" onClick={() => setChiave(spostaSettimana(chiave, 1))}><Icona nome="destra" /></button>
      </div>
    </Testata>
  );

  if (caricamentoPiano) return <>{testata}<Scheletri /></>;
  if (errorePiano) return <>{testata}<Errore onRiprova={riprovaPiano} /></>;
  if (!piano) {
    return (
      <>
        {testata}
        <Vuoto illustrazione="Piatto" titolo="Il tuo menu non c'è ancora" testo="Importa un piano per vedere la settimana."
          azione={<button className="btn btn-pieno" onClick={() => vai('/importa')}>Importa il piano</button>} />
      </>
    );
  }
  if (scelte.errore || diari.errore) return <>{testata}<Errore onRiprova={() => { scelte.riprova(); diari.riprova(); }} /></>;
  if (scelte.caricamento) return <>{testata}<Scheletri /></>;

  const errSalva = () => mostraToast('Non sono riuscito a salvare. Riprova.');
  const salvaComp = (k: string, i: number) => { salvaSceltaComponente(uid, chiave, k, i).catch(errSalva); };
  const salvaPiatto = (k: string, p: string) => { salvaSceltaPiatto(uid, chiave, k, p).catch(errSalva); };
  const { voci, daFare } = sceltePrevisteSettimana(piano, scelte.dati);
  const daFareVoci = voci.filter((v) => (v.tipo === 'piatto' ? v.pasto.daScegliere : v.componente.daScegliere));
  const regole = (piano.regole ?? []).filter((r) => r.tipo === 'varieta');
  const sel = dettaglio && pastiDelGiorno(piano, dettaglio.giorno, scelte.dati).find((p) => p.pastoId === dettaglio.pastoId);
  const chiaveOggiG = chiaveGiorno(oggi);

  const vaiA = (g: Giorno) => document.getElementById(`giorno-${g}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  return (
    <>
      {testata}

      {regole.length > 0 && (
        <ul className="indicatori" style={{ marginTop: 0 }}>
          {regole.map((r, i) => {
            const v = verificaVarieta(piano, r, scelte.dati);
            const nomePasto = piano.pasti.find((p) => p.id === r.pasto)?.nome ?? r.pasto;
            return <li key={i} className={v.soddisfatta ? 'ok' : undefined}>{nomePasto} diverse: {v.diversi} di {v.richiesti}</li>;
          })}
        </ul>
      )}

      {daFare > 0 && (
        <button className="striscia-scelte" onClick={() => setElencoScelte(true)}>
          <span>Da scegliere: {daFare}</span>
          <Icona nome="destra" dim={18} />
        </button>
      )}

      <nav className="indice-giorni" aria-label="Giorni della settimana">
        {GIORNI.map((g, i) => (
          <button key={g} aria-label={NOMI_GIORNO[g]} className={giorniChiavi[i] === chiaveOggiG ? 'oggi' : ''} onClick={() => vaiA(g)}>
            {INIZIALI[i]}
          </button>
        ))}
      </nav>

      {GIORNI.map((g, gi) => {
        const pasti = pastiDelGiorno(piano, g, scelte.dati);
        const eOggi = giorniChiavi[gi] === chiaveOggiG;
        const diario = diari.dati[giorniChiavi[gi]] ?? {};
        return (
          <section key={g} id={`giorno-${g}`} className="capitolo" aria-label={NOMI_GIORNO[g]}>
            <div className="capitolo-titolo">
              <h2 className="titolo-sezione">{NOMI_GIORNO[g]} {dataDelGiorno(chiave, g).getDate()}</h2>
              {eOggi && <span className="occhiello occhiello-terra">Oggi</span>}
            </div>
            <div className="filetto-doppio" />
            {pasti.length === 0 && <p className="testo-2" style={{ padding: '16px 0' }}>Nessun pasto previsto.</p>}
            {pasti.map((p) => {
              const stato = diario[p.pastoId];
              const illu = illuDiPasto(p, piano);
              return (
                <button key={p.pastoId} className="riga-pasto" onClick={() => setDettaglio({ giorno: g, pastoId: p.pastoId })}>
                  <span className="riga-pasto-testo">
                    <span className="occhiello">{p.nome}{p.facoltativo ? ' · facoltativo' : ''}</span>
                    <span className="nome-piatto" style={{ display: 'block' }}>{titoloPasto(p)}</span>
                    {(stato || (p.tipo === 'scelta' && p.daScegliere)) && (
                      <span className="riga-pasto-stato" style={{ display: 'block' }}>
                        <Stato tipo={stato ?? 'scelta'} />
                      </span>
                    )}
                  </span>
                  <Illustrazione nome={illu.nome} accento={illu.accento} misura="s" />
                </button>
              );
            })}
          </section>
        );
      })}

      <Sheet aperto={!!sel} titolo={sel ? `${NOMI_GIORNO[sel.giorno]} · ${sel.nome}` : ''} occhiello="Dettaglio" onChiudi={() => setDettaglio(null)} pieno>
        {sel && (
          <DettaglioPasto
            pasto={sel} piano={piano} stato={diari.dati[giorniChiavi[GIORNI.indexOf(sel.giorno)]]?.[sel.pastoId]}
            onComponente={salvaComp} onPiatto={salvaPiatto}
          />
        )}
      </Sheet>

      <Sheet aperto={elencoScelte && !voce} titolo="Le scelte della settimana" occhiello="Da scegliere" onChiudi={() => setElencoScelte(false)}>
        {daFareVoci.map((v, i) => (
          <button key={i} className="riga-pasto" style={{ minHeight: 64 }} onClick={() => setVoce(v)}>
            <span className="riga-pasto-testo">
              <span className="occhiello">{etichettaVoce(v)}</span>
              <span className="nome-piatto" style={{ display: 'block', fontSize: '1.0625rem', fontWeight: 500 }}>
                {v.tipo === 'componente' ? v.piattoNome : 'Il piatto del giorno'}
              </span>
            </span>
            <Icona nome="destra" dim={18} />
          </button>
        ))}
        {daFareVoci.length === 0 && <p className="testo-2">Hai fatto tutte le scelte.</p>}
      </Sheet>

      {voce && voce.tipo === 'componente' && (
        <SheetOpzioni
          aperto titolo={voce.piattoNome} occhiello={etichettaVoce(voce)} onChiudi={() => setVoce(null)}
          opzioni={voce.componente.opzioni.map((x, i) => ({ id: String(i), etichetta: nomeAlimento(piano, x.alimento), dettaglio: formatQuantita(x) }))}
          valore={voce.componente.daScegliere ? undefined : String(voce.componente.scelta)}
          onConferma={(id) => { salvaComp(voce.componente.chiave, Number(id)); setVoce(null); }}
        />
      )}
      {voce && voce.tipo === 'piatto' && (
        <SheetOpzioni
          aperto titolo={voce.pastoNome} occhiello={`Scegli · ${NOMI_GIORNO[voce.giorno]}`} onChiudi={() => setVoce(null)}
          opzioni={opzioniPiatti(voce.pasto, piano)} valore={voce.pasto.piatto?.id}
          onConferma={(id) => { salvaPiatto(chiavePasto(voce.giorno, voce.pastoId), id); setVoce(null); }}
        />
      )}
    </>
  );
}
