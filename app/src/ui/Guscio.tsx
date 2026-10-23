// Guscio dell'app per l'utente approvato: contenuto + barra di navigazione in basso.
import { lazy, Suspense, useMemo } from 'react';
import { usePianoAttivo } from '../data/archivio';
import type { ProfiloUtente } from '../domain/tipi';
import { Scheletri, ToastProvider, Vuoto, useOnline } from './Comuni';
import { Icona, type NomeIcona } from './Icone';
import { Importa } from './Importa';
import { ModificaPiano } from './ModificaPiano';
import { Oggi } from './Oggi';
import { Profilo } from './Profilo';
import { Admin } from './Admin';
import { Settimana } from './Settimana';
import { CtxApp, type ContestoApp } from './contesto';
import { useRotta } from './router';

// Solo sviluppo: in produzione import.meta.env.DEV è false e questo ramo sparisce dalla build.
const DemoImporta = import.meta.env.DEV ? lazy(() => import('../demo/DemoImporta')) : null;

const VOCI: { percorso: string; testo: string; icona: NomeIcona; attive: string[] }[] = [
  { percorso: '/oggi', testo: 'Oggi', icona: 'oggi', attive: ['oggi'] },
  { percorso: '/settimana', testo: 'Settimana', icona: 'settimana', attive: ['settimana'] },
  { percorso: '/spesa', testo: 'Spesa', icona: 'spesa', attive: ['spesa'] },
  { percorso: '/peso', testo: 'Peso', icona: 'peso', attive: ['peso'] },
  { percorso: '/profilo', testo: 'Profilo', icona: 'profilo', attive: ['profilo', 'admin', 'importa', 'modifica'] },
];

function Contenuto({ rotta }: { rotta: string[] }) {
  if (import.meta.env.DEV && DemoImporta && rotta[0] === 'demo-controlla') {
    return <Suspense fallback={<Scheletri />}><DemoImporta /></Suspense>;
  }
  switch (rotta[0]) {
    case 'settimana': return <Settimana />;
    case 'spesa':
      return <Vuoto illustrazione="Carrello" titolo="La spesa arriva presto" testo="Qui troverai l'elenco per Amazon e per il fresco, calcolato dal tuo piano e dalle scelte della settimana." />;
    case 'peso':
      return <Vuoto illustrazione="Bilancia" titolo="Il peso arriva presto" testo="Qui inserirai il tuo peso e farai crescere il tuo giardino, senza fretta." />;
    case 'profilo': return <Profilo />;
    case 'admin': return <Admin />;
    case 'importa': return <Importa destinatarioIniziale={rotta[1]} />;
    case 'modifica': return <ModificaPiano />;
    default: return <Oggi />;
  }
}

export function Guscio({ profilo }: { profilo: ProfiloUtente }) {
  const rotta = useRotta();
  const online = useOnline();
  const piano = usePianoAttivo(profilo.uid);
  const ctx = useMemo<ContestoApp>(() => ({
    profilo, uid: profilo.uid, piano: piano.dati, caricamentoPiano: piano.caricamento,
    errorePiano: piano.errore, riprovaPiano: piano.riprova,
  }), [profilo, piano.dati, piano.caricamento, piano.errore, piano.riprova]);
  const voce = import.meta.env.DEV && rotta[0] === 'demo-controlla' ? 'importa' : (rotta[0] ?? 'oggi');

  return (
    <CtxApp.Provider value={ctx}>
      <ToastProvider>
        <div className="app">
          {!online && (
            <div className="banner-offline" role="status"><Icona nome="offline" dim={16} /> Sei offline: vedi i dati già salvati.</div>
          )}
          <main className="contenuto" id="contenuto">
            <Contenuto rotta={rotta} />
          </main>
          <nav className="barra-nav" aria-label="Navigazione principale">
            <div className="barra-nav-int">
              {VOCI.map((v) => {
                const attiva = v.attive.includes(voce);
                return (
                  <a key={v.percorso} href={`#${v.percorso}`} className={attiva ? 'attiva' : ''} aria-current={attiva ? 'page' : undefined}>
                    <Icona nome={v.icona} dim={24} />
                    <span>{v.testo}</span>
                  </a>
                );
              })}
            </div>
          </nav>
        </div>
      </ToastProvider>
    </CtxApp.Provider>
  );
}
