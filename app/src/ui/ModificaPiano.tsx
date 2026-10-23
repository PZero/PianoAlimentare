import { useEffect, useState } from 'react';
import { salvaModifichePiano } from '../data/archivio';
import type { Piano } from '../domain/tipi';
import { Errore, Scheletri, Testata, Vuoto, useToast } from './Comuni';
import { ControllaPiano } from './ControllaPiano';
import { useApp } from './contesto';
import { vai } from './router';

const senzaMeta = (p: NonNullable<ReturnType<typeof useApp>['piano']>): Piano => {
  const { id: _id, attivo: _a, importatoIlMs: _i, ...contenuto } = p;
  return JSON.parse(JSON.stringify(contenuto)) as Piano;
};

/** Modifica del piano attivo dell'utente (solo il proprietario): stessa schermata "Controlla il piano". */
export function ModificaPiano() {
  const { uid, piano, caricamentoPiano, errorePiano, riprovaPiano } = useApp();
  const mostraToast = useToast();
  const [originale, setOriginale] = useState<Piano | null>(null);
  const [bozza, setBozza] = useState<Piano | null>(null);
  const [salvataggio, setSalvataggio] = useState(false);
  const [errore, setErrore] = useState(false);

  useEffect(() => { document.title = 'Modifica piano · PianoAlimentare'; }, []);
  useEffect(() => {
    if (piano && !bozza) {
      setOriginale(senzaMeta(piano));
      setBozza(senzaMeta(piano));
    }
  }, [piano, bozza]);

  if (caricamentoPiano) return <><Testata occhiello="Modifica il piano" titolo="Il tuo piano" /><Scheletri /></>;
  if (errorePiano) return <><Testata occhiello="Modifica il piano" titolo="Il tuo piano" /><Errore onRiprova={riprovaPiano} /></>;
  if (!piano || !bozza || !originale) {
    return (
      <Vuoto
        illustrazione="Piatto" titolo="Il tuo menu non c'è ancora" testo="Non c'è nessun piano da modificare."
        azione={<button className="btn btn-pieno" onClick={() => vai('/importa')}>Importa il piano</button>}
      />
    );
  }

  async function salva() {
    if (!piano || !bozza) return;
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
    <ControllaPiano
      modalita="modifica" piano={bozza} originale={originale} onChange={setBozza}
      salvataggio={salvataggio} erroreSalvataggio={errore} onConferma={salva}
    />
  );
}
