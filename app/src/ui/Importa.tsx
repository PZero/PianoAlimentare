import { useEffect, useRef, useState } from 'react';
import { importaPiano, useUtenti } from '../data/archivio';
import type { Piano } from '../domain/tipi';
import { dubbiPiano, validaPiano } from '../domain/validaPiano';
import { Errore } from './Comuni';
import { EditorPiano } from './EditorPiano';
import { Icona } from './Icone';
import { useApp } from './contesto';
import { vai } from './router';

const MAX_BYTE = 900 * 1024; // un documento Firestore arriva a 1 MiB

export function Importa({ destinatarioIniziale }: { destinatarioIniziale?: string }) {
  const { uid, profilo, piano: pianoAttivo } = useApp();
  const admin = profilo.ruolo === 'admin';
  const utenti = useUtenti(admin);
  const [nomeFile, setNomeFile] = useState('');
  const [bozza, setBozza] = useState<Piano | null>(null);
  const [erroriFile, setErroriFile] = useState<string[]>([]);
  const [destinatario, setDestinatario] = useState(destinatarioIniziale && admin ? destinatarioIniziale : uid);
  const [modifica, setModifica] = useState(false);
  const [invio, setInvio] = useState<'no' | 'in_corso' | 'ok' | 'errore'>('no');
  const [trascina, setTrascina] = useState(false);
  const inputFile = useRef<HTMLInputElement>(null);

  useEffect(() => { document.title = 'Importa piano · PianoAlimentare'; }, []);

  async function leggi(file: File | undefined) {
    if (!file) return;
    setInvio('no'); setBozza(null); setErroriFile([]); setModifica(false); setNomeFile(file.name);
    if (file.size > MAX_BYTE) { setErroriFile(['Il file è troppo grande (massimo 900 KB).']); return; }
    let json: unknown;
    try { json = JSON.parse(await file.text()); }
    catch { setErroriFile(['Il file non è un JSON leggibile.']); return; }
    const { errori } = validaPiano(json);
    if (errori.length) { setErroriFile(errori); return; }
    setBozza(json as Piano);
  }

  const esito = bozza ? validaPiano(bozza) : null;
  const erroriBozza = esito?.errori ?? [];
  const destinatari = utenti.dati.filter((u) => u.stato === 'approvato' && u.uid !== uid);
  const nomeDest = destinatario === uid ? 'te' : (destinatari.find((u) => u.uid === destinatario)?.nome ?? 'l\'utente');
  const perAltri = destinatario !== uid;

  async function conferma() {
    if (!bozza || erroriBozza.length) return;
    setInvio('in_corso');
    try {
      await importaPiano(destinatario, uid, bozza, pianoAttivo ? [pianoAttivo] : []);
      setInvio('ok');
    } catch {
      setInvio('errore');
    }
  }

  if (invio === 'ok') {
    return (
      <>
        <div className="intestazione"><h1>Importa piano</h1></div>
        <div className="card card-completata" role="status">
          <Icona nome="fatto" dim={28} />
          <h2>Piano importato</h2>
          <p className="tenue">{perAltri ? `Il piano è stato caricato per ${nomeDest}.` : 'Il piano è attivo.'}</p>
          <button className="btn btn-primario" onClick={() => vai(perAltri ? '/admin' : '/oggi')}>
            {perAltri ? 'Torna all\'amministrazione' : 'Vai a Oggi'}
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="intestazione"><h1>Importa piano</h1><p className="tenue">Carica il file .json preparato dal tuo piano.</p></div>

      <section aria-label="Passo 1: scegli il file">
        <h2 className="sezione-titolo">1 · Scegli il file</h2>
        <div
          className={`area-file${trascina ? ' attiva' : ''}`}
          onDragOver={(e) => { e.preventDefault(); setTrascina(true); }}
          onDragLeave={() => setTrascina(false)}
          onDrop={(e) => { e.preventDefault(); setTrascina(false); leggi(e.dataTransfer.files[0]); }}
        >
          <Icona nome="carica" dim={28} />
          <p className="tenue">{nomeFile || 'Trascina qui il file oppure scegli dal dispositivo'}</p>
          <input ref={inputFile} type="file" accept=".json,application/json" hidden onChange={(e) => leggi(e.target.files?.[0])} />
          <button className="btn btn-secondario" onClick={() => inputFile.current?.click()}>Scegli file .json</button>
        </div>
      </section>

      {erroriFile.length > 0 && (
        <div className="errore-box errore-lista" role="alert">
          <div><Icona nome="errore" /> <strong>Il file non è valido ({erroriFile.length})</strong></div>
          <ul>{erroriFile.slice(0, 30).map((e, i) => <li key={i}>{e}</li>)}</ul>
          {erroriFile.length > 30 && <p>… e altri {erroriFile.length - 30}.</p>}
        </div>
      )}

      {bozza && esito && (
        <>
          <section aria-label="Passo 2: anteprima">
            <h2 className="sezione-titolo">2 · Anteprima</h2>
            <div className="card">
              <h3 className="card-titolo">{bozza.titolo}</h3>
              {bozza.dataVisita && <p className="tenue">Visita del {bozza.dataVisita.split('-').reverse().join('/')}</p>}
              <dl className="riepilogo">
                <div><dt>Pasti</dt><dd className="num">{esito.riepilogo.pasti}</dd></div>
                <div><dt>Piatti</dt><dd className="num">{esito.riepilogo.piatti}</dd></div>
                <div><dt>Alimenti</dt><dd className="num">{esito.riepilogo.alimenti}</dd></div>
                <div><dt>Note</dt><dd className="num">{esito.riepilogo.note}</dd></div>
              </dl>
              <p className="tenue">
                Per canale:{' '}
                {Object.entries(esito.riepilogo.alimentiPerCanale).map(([c, n]) => `${c} ${n}`).join(' · ') || 'nessuno'}
              </p>
              {dubbiPiano(bozza).length > 0 && (
                <div className="dubbi">
                  <h4><Icona nome="avviso" dim={16} /> Da controllare</h4>
                  <ul>{dubbiPiano(bozza).map((d, i) => <li key={i}>{d}</li>)}</ul>
                </div>
              )}
              {bozza.note && bozza.note.length > 0 && (
                <details className="preparazione"><summary>Note del nutrizionista</summary>
                  <ul>{bozza.note.map((n, i) => <li key={i}>{n}</li>)}</ul>
                </details>
              )}
              <button className="btn btn-secondario" onClick={() => setModifica(!modifica)} aria-expanded={modifica}>
                {modifica ? 'Chiudi la correzione' : 'Controlla e correggi'}
              </button>
            </div>
            {modifica && <EditorPiano piano={bozza} onChange={setBozza} />}
            {erroriBozza.length > 0 && (
              <div className="errore-box errore-lista" role="alert">
                <div><Icona nome="errore" /> <strong>Correggi prima di continuare</strong></div>
                <ul>{erroriBozza.slice(0, 10).map((e, i) => <li key={i}>{e}</li>)}</ul>
              </div>
            )}
          </section>

          <section aria-label="Passo 3: conferma">
            <h2 className="sezione-titolo">3 · Conferma</h2>
            {admin && (
              <label className="etichetta">
                Utente destinatario
                <select className="campo" value={destinatario} onChange={(e) => setDestinatario(e.target.value)}>
                  <option value={uid}>Me stesso</option>
                  {destinatari.map((u) => <option key={u.uid} value={u.uid}>{u.nome} ({u.email})</option>)}
                </select>
              </label>
            )}
            <p>Importo {esito.riepilogo.piatti} piatti per {nomeDest}.</p>
            {!perAltri && pianoAttivo && (
              <p className="tenue">Sostituisce il piano attivo «{pianoAttivo.titolo}», che resta nello storico.</p>
            )}
            {perAltri && (
              <p className="tenue">Se l'utente ha già un piano, quello nuovo lo sostituisce e il precedente resta nello storico. Dopo il salvataggio non potrai più vederlo né modificarlo.</p>
            )}
            {invio === 'errore' && <Errore testo="Non sono riuscito a salvare il piano. Riprova." onRiprova={conferma} />}
            <button className="btn btn-primario" disabled={invio === 'in_corso' || erroriBozza.length > 0} onClick={conferma}>
              {invio === 'in_corso' ? 'Salvataggio…' : 'Conferma importazione'}
            </button>
          </section>
        </>
      )}
    </>
  );
}
