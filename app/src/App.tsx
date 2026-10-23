import { lazy, Suspense } from 'react';
import { DEMO } from './data/demoStore';
import { SessioneProvider, useSessione } from './data/sessione';
import { Attesa, ConfigMancante, Login } from './ui/Accesso';
import { Errore, Scheletri } from './ui/Comuni';
import { Guscio } from './ui/Guscio';

// Solo sviluppo, con ?demo nell'URL: in produzione il ramo viene eliminato dalla build.
const DemoRadice = import.meta.env.DEV && DEMO ? lazy(() => import('./demo/Demo')) : null;

function Radice() {
  const { sessione, esci } = useSessione();
  if (sessione.fase === 'config-mancante') return <ConfigMancante />;
  if (sessione.fase === 'caricamento') return <main className="schermata-accesso"><Scheletri n={2} /></main>;
  if (sessione.fase === 'fuori') return <Login />;
  if (!sessione.profilo) {
    return sessione.erroreProfilo ? (
      <main className="schermata-accesso">
        <Errore testo="Non riesco a leggere il tuo profilo. Controlla la connessione." onRiprova={() => window.location.reload()} />
        <button className="btn-link" onClick={() => esci()}>Esci</button>
      </main>
    ) : (
      <main className="schermata-accesso"><Scheletri n={2} /></main>
    );
  }
  if (sessione.profilo.stato !== 'approvato') return <Attesa profilo={sessione.profilo} />;
  return <Guscio profilo={sessione.profilo} />;
}

export default function App() {
  if (DemoRadice) return <Suspense fallback={null}><DemoRadice /></Suspense>;
  return (
    <SessioneProvider>
      <Radice />
    </SessioneProvider>
  );
}
