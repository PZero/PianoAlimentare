// Schermate fuori dall'app: configurazione mancante, login, attesa/blocco.
import { useState } from 'react';
import { useSessione } from '../data/sessione';
import type { ProfiloUtente } from '../domain/tipi';
import { Errore } from './Comuni';
import { Icona } from './Icone';

function Marchio() {
  return (
    <div className="marchio">
      <span className="marchio-icona"><Icona nome="foglia" dim={32} /></span>
      <h1>PianoAlimentare</h1>
    </div>
  );
}

export function ConfigMancante() {
  return (
    <main className="schermata-accesso">
      <Marchio />
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
      <Marchio />
      <p className="tenue centrato">Segui il piano del tuo nutrizionista, un pasto alla volta.</p>
      <button
        className="btn btn-google" disabled={occupato}
        onClick={async () => { setOccupato(true); setErrore(await accedi()); setOccupato(false); }}
      >
        <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
          <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.800 2.400 30.300 0 24 0 14.600 0 6.500 5.400 2.600 13.200l7.900 6.100C12.400 13.600 17.700 9.500 24 9.500z" />
          <path fill="#4285F4" d="M46.500 24.500c0-1.600-.1-3.100-.4-4.500H24v9h12.700c-.6 3-2.300 5.500-4.800 7.200l7.600 5.900c4.400-4.100 7-10.100 7-17.600z" />
          <path fill="#FBBC05" d="M10.500 28.700A14.500 14.500 0 019.500 24c0-1.600.3-3.200.8-4.700l-7.900-6.100A24 24 0 000 24c0 3.900.9 7.500 2.600 10.800l7.900-6.100z" />
          <path fill="#34A853" d="M24 48c6.500 0 11.900-2.100 15.900-5.800l-7.600-5.900c-2.100 1.400-4.900 2.300-8.300 2.300-6.300 0-11.600-4.100-13.500-9.800l-7.900 6.100C6.500 42.600 14.600 48 24 48z" />
        </svg>
        {occupato ? 'Accesso in corso…' : 'Continua con Google'}
      </button>
      {errore && <Errore testo={errore} />}
      <p className="tenue centrato piccolo">Usiamo il tuo account Google solo per riconoscerti. I tuoi dati restano visibili soltanto a te.</p>
    </main>
  );
}

export function Attesa({ profilo }: { profilo: ProfiloUtente }) {
  const { esci, ricontrolla } = useSessione();
  const bloccato = profilo.stato === 'bloccato';
  const [verifica, setVerifica] = useState(false);
  return (
    <main className="schermata-accesso">
      <Marchio />
      <div className="vuoto">
        <div className="vuoto-icona"><Icona nome={bloccato ? 'lock' : 'orologio'} dim={36} /></div>
        <h2>{bloccato ? 'Accesso non disponibile' : 'Il tuo accesso è in attesa di approvazione'}</h2>
        <p className="tenue">
          {bloccato
            ? 'Questo account al momento non può usare l\'app. Per informazioni contatta l\'amministratore.'
            : 'Appena l\'amministratore approva la richiesta potrai iniziare. Questa pagina si aggiorna da sola.'}
        </p>
        <p className="tenue">Account: <strong>{profilo.email}</strong></p>
        <div className="azioni">
          {!bloccato && (
            <button className="btn btn-primario" disabled={verifica} onClick={async () => { setVerifica(true); await ricontrolla(); setVerifica(false); }}>
              {verifica ? 'Controllo…' : 'Ricontrolla'}
            </button>
          )}
          <button className="btn btn-secondario" onClick={() => esci()}>Esci</button>
        </div>
      </div>
    </main>
  );
}
