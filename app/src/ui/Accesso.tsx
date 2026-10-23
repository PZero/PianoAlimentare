// Schermate fuori dall'app: configurazione mancante, login, attesa/blocco (docs/DESIGN.md, sezione 7).
import { useState } from 'react';
import { useSessione } from '../data/sessione';
import type { ProfiloUtente } from '../domain/tipi';
import { Cloche, Orologio, Piatto } from '../illustrazioni';
import { Errore } from './Comuni';

export function ConfigMancante() {
  return (
    <main className="schermata-accesso">
      <Piatto misura="l" />
      <p className="occhiello">Piano Alimentare</p>
      <h1 className="titolo">Manca la configurazione</h1>
      <Errore testo="Configurazione di Firebase mancante. Compila il file .env (vedi .env.example) e riavvia." />
    </main>
  );
}

export function Login() {
  const { accedi } = useSessione();
  const [errore, setErrore] = useState<string | null>(null);
  const [occupato, setOccupato] = useState(false);
  return (
    <main className="schermata-accesso">
      <Cloche misura={200} />
      <p className="occhiello" style={{ marginTop: 20 }}>Piano Alimentare</p>
      <h1 className="titolo">Il tuo menu, giorno per giorno</h1>
      <p className="testo-2" style={{ maxWidth: '24rem' }}>Segui il piano del tuo nutrizionista, un pasto alla volta.</p>
      <button
        className="btn btn-google" disabled={occupato}
        onClick={async () => { setOccupato(true); setErrore(await accedi()); setOccupato(false); }}
      >
        <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
          <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z" />
          <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.6 5.9c4.4-4.1 7-10.1 7-17.6z" />
          <path fill="#FBBC05" d="M10.5 28.7A14.5 14.5 0 019.5 24c0-1.6.3-3.2.8-4.7l-7.9-6.1A24 24 0 000 24c0 3.9.9 7.5 2.6 10.8l7.9-6.1z" />
          <path fill="#34A853" d="M24 48c6.5 0 11.9-2.100 15.900-5.800l-7.600-5.900c-2.100 1.400-4.900 2.300-8.300 2.300-6.300 0-11.600-4.100-13.500-9.800l-7.900 6.100C6.500 42.600 14.600 48 24 48z" />
        </svg>
        {occupato ? 'Accesso in corso…' : 'Continua con Google'}
      </button>
      {errore && <Errore testo={errore} />}
      <p className="nota" style={{ maxWidth: '24rem', marginTop: 8 }}>
        Usiamo il tuo account Google solo per riconoscerti. I tuoi dati restano visibili soltanto a te.
      </p>
    </main>
  );
}

export function Attesa({ profilo }: { profilo: ProfiloUtente }) {
  const { esci, ricontrolla } = useSessione();
  const bloccato = profilo.stato === 'bloccato';
  const [verifica, setVerifica] = useState(false);
  return (
    <main className="schermata-accesso">
      {bloccato ? <Piatto misura="l" /> : <Orologio misura="l" />}
      <p className="occhiello" style={{ marginTop: 12 }}>{bloccato ? 'Accesso' : 'Piano Alimentare'}</p>
      <h1 className="titolo">{bloccato ? 'Accesso non disponibile' : 'Stiamo preparando il tuo posto'}</h1>
      <p>{bloccato ? 'Questo account al momento non può usare l\'app.' : 'Il tuo accesso è in attesa di approvazione.'}</p>
      <p className="testo-2" style={{ maxWidth: '24rem' }}>
        {bloccato
          ? 'Per informazioni contatta l\'amministratore.'
          : 'Appena l\'amministratore approva la richiesta potrai iniziare. Questa pagina si aggiorna da sola.'}
      </p>
      <p className="nota">Account: <strong>{profilo.email}</strong></p>
      <div className="azioni azioni-centro">
        {!bloccato && (
          <button className="btn btn-contorno btn-largo" disabled={verifica} onClick={async () => { setVerifica(true); await ricontrolla(); setVerifica(false); }}>
            {verifica ? 'Controllo…' : 'Ricontrolla'}
          </button>
        )}
        <button className="btn-link" onClick={() => esci()}>Esci</button>
      </div>
    </main>
  );
}
