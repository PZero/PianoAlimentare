import { useEffect, useMemo, useRef, useState } from 'react';
import { importaPiano, useUtenti } from '../data/archivio';
import type { Piano } from '../domain/tipi';
import { validaPiano } from '../domain/validaPiano';
import { Germoglio } from '../illustrazioni';
import { Errore, Sheet, Testata } from './Comuni';
import { ControllaPiano } from './ControllaPiano';
import { useApp } from './contesto';
import { vai } from './router';

const MAX_BYTE = 900 * 1024; // un documento Firestore arriva a 1 MiB

export function Importa({ destinatarioIniziale, pianoDemo }: { destinatarioIniziale?: string; pianoDemo?: Piano }) {
  const { uid, profilo, piano: pianoAttivo } = useApp();
  const admin = profilo.ruolo === 'admin';
  const utenti = useUtenti(admin);
  const [nomeFile, setNomeFile] = useState('');
  const [bozza, setBozza] = useState<Piano | null>(pianoDemo ?? null);
  const [erroriFile, setErroriFile] = useState<string[]>([]);
  const [erroriAperti, setErroriAperti] = useState(false);
  const [destinatario, setDestinatario] = useState(destinatarioIniziale && admin ? destinatarioIniziale : uid);
  const [invio, setInvio] = useState<'no' | 'in_corso' | 'ok' | 'errore'>('no');
  const [trascina, setTrascina] = useState(false);
  const inputFile = useRef<HTMLInputElement>(null);

  useEffect(() => { document.title = 'Importa piano · PianoAlimentare'; }, []);

  async function leggi(file: File | undefined) {
    if (!file) return;
    setInvio('no'); setBozza(null); setErroriFile([]); setNomeFile(file.name);
    if (file.size > MAX_BYTE) { setErroriFile(['Il file è troppo grande (massimo 900 KB).']); return; }
    let json: unknown;
    try { json = JSON.parse(await file.text()); }
    catch { setErroriFile(['Il file non è un JSON leggibile.']); return; }
    const { errori } = validaPiano(json);
    if (errori.length) { setErroriFile(errori); setErroriAperti(true); return; }
    setBozza(json as Piano);
  }

  const destinatari = utenti.dati.filter((u) => u.stato === 'approvato' && u.uid !== uid);
  const perAltri = destinatario !== uid;
  const nomeDest = !perAltri ? 'te' : (destinatari.find((u) => u.uid === destinatario)?.nome ?? 'la persona scelta');
  const alimentiNoti = useMemo(
    () => (!perAltri && pianoAttivo ? new Set(Object.keys(pianoAttivo.alimenti)) : undefined),
    [perAltri, pianoAttivo],
  );

  async function conferma() {
    if (!bozza || validaPiano(bozza).errori.length) return;
    setInvio('in_corso');
    try {
      await importaPiano(destinatario, uid, bozza, pianoAttivo ? [pianoAttivo] : []);
      setInvio('ok');
    } catch {
      setInvio('errore');
    }
  }

  // 3 di 3 · fatto
  if (invio === 'ok') {
    return (
      <>
        <Testata occhiello="3 di 3" titolo="Piano importato" />
        <div className="successo" role="status">
          <Germoglio accento="salvia" misura="l" />
          <p className="testo-2">{perAltri ? `Il piano è stato caricato per ${nomeDest}.` : 'Il piano è attivo: è ora di mangiare bene.'}</p>
          <div className="azioni azioni-centro" style={{ width: '100%' }}>
            <button className="btn btn-pieno btn-largo" onClick={() => vai(perAltri ? '/admin' : '/oggi')}>
              {perAltri ? 'Torna alle persone' : 'Vai a Oggi'}
            </button>
          </div>
        </div>
      </>
    );
  }

  // 2 di 3 · controlla il piano
  if (bozza) {
    return (
      <>
        <div style={{ paddingTop: 'calc(12px + env(safe-area-inset-top))', marginBottom: -36 }}>
          <button className="btn-link" onClick={() => { setBozza(null); setNomeFile(''); }}>‹ Scegli un altro file</button>
        </div>
        <ControllaPiano
          modalita="importa" piano={bozza} onChange={setBozza} alimentiNoti={alimentiNoti}
          per={perAltri ? nomeDest : undefined}
          avviso={!perAltri && pianoAttivo
            ? `Sostituisce il piano attivo «${pianoAttivo.titolo}», che resta nello storico.`
            : perAltri ? 'Dopo il salvataggio non potrai più vedere né modificare questo piano: lo vedrà solo la persona scelta.' : undefined}
          salvataggio={invio === 'in_corso'} erroreSalvataggio={invio === 'errore'} onConferma={conferma}
        />
      </>
    );
  }

  // 1 di 3 · scelta del file
  return (
    <>
      <Testata occhiello="1 di 3" titolo="Importa un piano" sottotitolo="Carica il file .json preparato dal tuo piano." />
      <ol className="passi">
        <li>Scegli il file</li>
        <li>Controlla il piano, toccando ciò che vuoi correggere</li>
        <li>Conferma</li>
      </ol>

      {admin && (
        <label className="campo">
          <span className="occhiello">Per chi è il piano</span>
          <select value={destinatario} onChange={(e) => setDestinatario(e.target.value)}>
            <option value={uid}>Per me</option>
            {destinatari.map((u) => <option key={u.uid} value={u.uid}>{u.nome} ({u.email})</option>)}
          </select>
        </label>
      )}

      <div
        className={`area-file${trascina ? ' attiva' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setTrascina(true); }}
        onDragLeave={() => setTrascina(false)}
        onDrop={(e) => { e.preventDefault(); setTrascina(false); leggi(e.dataTransfer.files[0]); }}
      >
        <p className="testo-2">{nomeFile || 'Trascina qui il file oppure scegli dal dispositivo'}</p>
        <input ref={inputFile} type="file" accept=".json,application/json" hidden onChange={(e) => leggi(e.target.files?.[0])} />
        <button className="btn btn-contorno" onClick={() => inputFile.current?.click()}>Scegli il file .json</button>
      </div>

      {erroriFile.length > 0 && (
        <Errore
          testo={`Il file non è valido (${erroriFile.length} ${erroriFile.length === 1 ? 'problema' : 'problemi'}).`}
          onRiprova={() => setErroriAperti(true)}
        />
      )}
      <Sheet aperto={erroriAperti} occhiello="Da correggere" titolo="Il file non è valido" onChiudi={() => setErroriAperti(false)}>
        <ul className="errore-elenco">{erroriFile.slice(0, 30).map((e, i) => <li key={i}>{e}</li>)}</ul>
        {erroriFile.length > 30 && <p className="nota">… e altri {erroriFile.length - 30}.</p>}
      </Sheet>
    </>
  );
}
