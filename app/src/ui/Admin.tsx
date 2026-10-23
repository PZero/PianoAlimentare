import { useEffect, useState } from 'react';
import { impostaStatoUtente, useUtenti } from '../data/archivio';
import type { ProfiloUtente, StatoUtente } from '../domain/tipi';
import { Errore, Scheletri, Sheet, Testata, Vuoto, useToast } from './Comuni';
import { useApp } from './contesto';
import { vai } from './router';

const SCHEDE: { valore: StatoUtente; testo: string; vuoto: string }[] = [
  { valore: 'in_attesa', testo: 'In attesa', vuoto: 'Nessuna richiesta in attesa' },
  { valore: 'approvato', testo: 'Approvati', vuoto: 'Nessuna persona approvata' },
  { valore: 'bloccato', testo: 'Bloccati', vuoto: 'Nessuna persona bloccata' },
];

const data = (ms: number | null) => (ms ? new Date(ms).toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric' }) : '');

export function Admin() {
  const { uid, profilo } = useApp();
  const mostraToast = useToast();
  const utenti = useUtenti(profilo.ruolo === 'admin');
  const [scheda, setScheda] = useState<StatoUtente>('in_attesa');
  const [daBloccare, setDaBloccare] = useState<ProfiloUtente | null>(null);

  useEffect(() => { document.title = 'Persone · PianoAlimentare'; }, []);

  if (profilo.ruolo !== 'admin') {
    return <Vuoto illustrazione="Piatto" titolo="Area riservata" testo="Questa sezione è solo per l'amministratore." />;
  }

  const imposta = (u: ProfiloUtente, stato: StatoUtente) => {
    impostaStatoUtente(u.uid, stato)
      .then(() => mostraToast(stato === 'approvato' ? `${u.nome} approvato` : `${u.nome} bloccato`))
      .catch(() => mostraToast('Operazione non riuscita. Riprova.'));
  };

  const conta = (s: StatoUtente) => utenti.dati.filter((u) => u.stato === s).length;
  const elenco = utenti.dati.filter((u) => u.stato === scheda);

  return (
    <>
      <Testata occhiello="Amministrazione" titolo="Persone" />
      <div className="conteggi" role="tablist" aria-label="Stato delle persone">
        {SCHEDE.map((s) => (
          <button key={s.valore} role="tab" aria-selected={scheda === s.valore} className={scheda === s.valore ? 'attiva' : ''} onClick={() => setScheda(s.valore)}>
            <strong className="num">{conta(s.valore)}</strong>
            <span>{s.testo}</span>
          </button>
        ))}
      </div>
      {utenti.errore && <Errore onRiprova={utenti.riprova} />}
      {utenti.caricamento && <Scheletri n={3} />}
      {!utenti.caricamento && !utenti.errore && elenco.length === 0 && (
        <Vuoto illustrazione="Tazza" titolo={SCHEDE.find((s) => s.valore === scheda)!.vuoto} />
      )}
      <ul>
        {elenco.map((u) => (
          <li key={u.uid} className="persona">
            <div className="persona-info">
              <span className="avatar" aria-hidden="true">{(u.nome || u.email || '?').charAt(0).toUpperCase()}</span>
              <div>
                <p className="persona-nome">{u.nome || 'Senza nome'}</p>
                <p className="nota">{u.email}</p>
                {u.creatoIlMs && <p className="nota">Richiesta del {data(u.creatoIlMs)}</p>}
              </div>
            </div>
            {u.uid !== uid && (
              <div className="azioni azioni-riga">
                {u.stato !== 'approvato' && (
                  <button className="btn btn-pieno" onClick={() => imposta(u, 'approvato')}>Approva</button>
                )}
                {u.stato === 'approvato' && (
                  <button className="btn btn-contorno" onClick={() => vai(`/importa/${u.uid}`)}>Importa piano</button>
                )}
                {u.stato !== 'bloccato' && (
                  <button className="btn-link" onClick={() => setDaBloccare(u)}>Blocca</button>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>

      <Sheet
        aperto={!!daBloccare} occhiello="Conferma" titolo="Bloccare questa persona?" onChiudi={() => setDaBloccare(null)}
        piede={(
          <>
            <button className="btn btn-pieno btn-largo" onClick={() => { if (daBloccare) imposta(daBloccare, 'bloccato'); setDaBloccare(null); }}>Blocca</button>
            <button className="btn-link" onClick={() => setDaBloccare(null)}>Annulla</button>
          </>
        )}
      >
        <p>{daBloccare?.nome} ({daBloccare?.email}) non potrà più usare l'app finché non la riapprovi.</p>
      </Sheet>
    </>
  );
}
