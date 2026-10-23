import { useEffect, useState } from 'react';
import { salvaModifichePiano } from '../data/archivio';
import type { Piano } from '../domain/tipi';
import { validaPiano } from '../domain/validaPiano';
import { Errore, Scheletri, Vuoto, useToast } from './Comuni';
import { EditorPiano } from './EditorPiano';
import { Icona } from './Icone';
import { useApp } from './contesto';
import { vai } from './router';

/** Modifica del piano attivo dell'utente (solo il proprietario). */
export function ModificaPiano() {
  const { uid, piano, caricamentoPiano, errorePiano, riprovaPiano } = useApp();
  const mostraToast = useToast();
  const [bozza, setBozza] = useState<Piano | null>(null);
  const [salvataggio, setSalvataggio] = useState(false);
  const [errore, setErrore] = useState(false);

  useEffect(() => { document.title = 'Modifica piano · PianoAlimentare'; }, []);
  useEffect(() => {
    if (piano && !bozza) {
      const { id: _id, attivo: _a, importatoIlMs: _i, ...contenuto } = piano;
      setBozza(JSON.parse(JSON.stringify(contenuto)) as Piano);
    }
  }, [piano, bozza]);

  const intestazione = <div className="intestazione"><h1>Modifica piano</h1></div>;
  if (caricamentoPiano) return <>{intestazione}<Scheletri /></>;
  if (errorePiano) return <>{intestazione}<Errore onRiprova={riprovaPiano} /></>;
  if (!piano || !bozza) return <>{intestazione}<Vuoto titolo="Nessun piano attivo" /></>;

  const errori = validaPiano(bozza).errori;

  async function salva() {
    if (!piano || !bozza || errori.length) return;
    setSalvataggio(true); setErrore(false);
    try {
      await salvaModifichePiano(uid, piano.id, bozza);
      mostraToast('Piano aggiornato');
      vai('/profilo');
    } catch {
      setErrore(true);
    } finally {
      setSalvataggio(false);
    }
  }

  return (
    <>
      {intestazione}
      <p className="tenue">Correggi nomi, quantità, unità e canali. Le modifiche valgono per il piano attivo.</p>
      <EditorPiano piano={bozza} onChange={setBozza} />
      {errori.length > 0 && (
        <div className="errore-box errore-lista" role="alert">
          <div><Icona nome="errore" /> <strong>Correggi prima di salvare</strong></div>
          <ul>{errori.slice(0, 10).map((e, i) => <li key={i}>{e}</li>)}</ul>
        </div>
      )}
      {errore && <Errore testo="Non sono riuscito a salvare. Riprova." onRiprova={salva} />}
      <div className="azioni">
        <button className="btn btn-primario" disabled={salvataggio || errori.length > 0} onClick={salva}>
          {salvataggio ? 'Salvataggio…' : 'Salva modifiche'}
        </button>
        <button className="btn btn-secondario" onClick={() => vai('/profilo')}>Annulla</button>
      </div>
    </>
  );
}
