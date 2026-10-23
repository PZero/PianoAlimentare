import { useMemo } from 'react';
import { usePianoAttivo } from './data/archivio';
import { SessioneProvider, useSessione } from './data/sessione';
import type { ProfiloUtente } from './domain/tipi';
import { Attesa, ConfigMancante, Login } from './ui/Accesso';
import { Admin } from './ui/Admin';
import { Errore, Scheletri, ToastProvider, Vuoto, useOnline } from './ui/Comuni';
import { Icona, type NomeIcona } from './ui/Icone';
import { Importa } from './ui/Importa';
import { ModificaPiano } from './ui/ModificaPiano';
import { Oggi } from './ui/Oggi';
import { Profilo } from './ui/Profilo';
import { Settimana } from './ui/Settimana';
import { CtxApp, type ContestoApp } from './ui/contesto';
import { useRotta } from './ui/router';

const VOCI: { percorso: string; testo: string; icona: NomeIcona; attive: string[] }[] = [
  { percorso: '/oggi', testo: 'Oggi', icona: 'oggi', attive: ['oggi'] },
  { percorso: '/settimana', testo: 'Settimana', icona: 'settimana', attive: ['settimana'] },
  { percorso: '/spesa', testo: 'Spesa', icona: 'spesa', attive: ['spesa'] },
  { percorso: '/peso', testo: 'Peso', icona: 'peso', attive: ['peso'] },
  { percorso: '/profilo', testo: 'Profilo', icona: 'profilo', attive: ['profilo', 'admin', 'importa', 'modifica'] },
];

function Contenuto({ rotta }: { rotta: string[] }) {
  switch (rotta[0]) {
    case 'settimana': return <Settimana />;
    case 'spesa':
      return <Vuoto icona="spesa" titolo="In arrivo" testo="Lista Amazon e fresco, calcolata dal tuo piano e dalle scelte della settimana." />;
    case 'peso':
      return <Vuoto icona="peso" titolo="In arrivo" testo="Qui inserirai il tuo peso e farai crescere il tuo giardino, senza fretta." />;
    case 'profilo': return <Profilo />;
    case 'admin': return <Admin />;
    case 'importa': return <Importa destinatarioIniziale={rotta[1]} />;
    case 'modifica': return <ModificaPiano />;
    default: return <Oggi />;
  }
}

function AppApprovata({ profilo }: { profilo: ProfiloUtente }) {
  const rotta = useRotta();
  const online = useOnline();
  const piano = usePianoAttivo(profilo.uid);
  const ctx = useMemo<ContestoApp>(() => ({
    profilo, uid: profilo.uid, piano: piano.dati, caricamentoPiano: piano.caricamento,
    errorePiano: piano.errore, riprovaPiano: piano.riprova,
  }), [profilo, piano.dati, piano.caricamento, piano.errore, piano.riprova]);
  const voce = rotta[0] ?? 'oggi';

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
            {VOCI.map((v) => {
              const attiva = v.attive.includes(voce);
              return (
                <a key={v.percorso} href={`#${v.percorso}`} className={attiva ? 'attiva' : ''} aria-current={attiva ? 'page' : undefined}>
                  <Icona nome={v.icona} dim={24} />
                  <span>{v.testo}</span>
                </a>
              );
            })}
          </nav>
        </div>
      </ToastProvider>
    </CtxApp.Provider>
  );
}

function Radice() {
  const { sessione, esci } = useSessione();
  if (sessione.fase === 'config-mancante') return <ConfigMancante />;
  if (sessione.fase === 'caricamento') return <main className="schermata-accesso"><Scheletri n={1} /></main>;
  if (sessione.fase === 'fuori') return <Login />;
  if (!sessione.profilo) {
    return sessione.erroreProfilo ? (
      <main className="schermata-accesso">
        <Errore testo="Non riesco a leggere il tuo profilo. Controlla la connessione." onRiprova={() => window.location.reload()} />
        <button className="btn btn-secondario" onClick={() => esci()}>Esci</button>
      </main>
    ) : (
      <main className="schermata-accesso"><Scheletri n={1} /></main>
    );
  }
  if (sessione.profilo.stato !== 'approvato') return <Attesa profilo={sessione.profilo} />;
  return <AppApprovata profilo={sessione.profilo} />;
}

export default function App() {
  return (
    <SessioneProvider>
      <Radice />
    </SessioneProvider>
  );
}
