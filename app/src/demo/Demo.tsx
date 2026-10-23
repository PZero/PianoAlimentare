// SOLO SVILUPPO: radice della modalità demo (?demo, ?demo=import, ?demo=login, ?demo=attesa).
// Salta Firebase: utente finto approvato e admin, piano di esempio e diario in memoria.
import { useState } from 'react';
import { SessioneProvider } from '../data/sessione';
import { Attesa, Login } from '../ui/Accesso';
import { Guscio } from '../ui/Guscio';
import { Illustrazione, type NomeIllustrazione } from '../illustrazioni';
import { PROFILO_DEMO, preparaDemo } from './datiDemo';

const TUTTE: NomeIllustrazione[] = ['Piatto', 'Ciotola', 'Insalata', 'Legumi', 'Pesce', 'Carne', 'Uova', 'Formaggio', 'Pane', 'Cereali', 'Frutta', 'Verdura', 'Frullato', 'Yogurt', 'Tazza', 'Libero', 'Digiuno', 'Carrello', 'Bilancia', 'Germoglio', 'Orologio', 'Cloche'];
const SALVIA: NomeIllustrazione[] = ['Legumi', 'Frutta', 'Verdura', 'Insalata', 'Germoglio'];

/** ?demo=illustrazioni: tutte le illustrazioni, a due misure. */
function Galleria() {
  return (
    <main className="contenuto">
      <h1 className="titolo" style={{ paddingTop: 32 }}>Illustrazioni</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginTop: 24 }}>
        {TUTTE.map((n) => (
          <figure key={n} style={{ textAlign: 'center' }}>
            <Illustrazione nome={n} accento={SALVIA.includes(n) ? 'salvia' : 'terracotta'} misura={96} />
            <figcaption className="nota">{n}</figcaption>
          </figure>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 16, marginTop: 24, alignItems: 'center' }}>
        {(['Pesce', 'Carne', 'Frutta', 'Pane'] as NomeIllustrazione[]).map((n) => <Illustrazione key={n} nome={n} misura="s" accento={SALVIA.includes(n) ? 'salvia' : 'terracotta'} />)}
      </div>
    </main>
  );
}

export default function Demo() {
  const modo = new URLSearchParams(window.location.search).get('demo') ?? '';
  const [pronto] = useState(() => {
    preparaDemo(modo);
    if (modo === 'import' && !window.location.hash) window.location.hash = '#/demo-controlla';
    return true;
  });
  if (!pronto) return null;
  if (modo === 'illustrazioni') return <Galleria />;
  if (modo === 'login') return <SessioneProvider><Login /></SessioneProvider>;
  if (modo === 'attesa') return <SessioneProvider><Attesa profilo={{ ...PROFILO_DEMO, stato: 'in_attesa' }} /></SessioneProvider>;
  return <Guscio profilo={PROFILO_DEMO} />;
}
