import { useEffect, useState } from 'react';
import { impostaStatoUtente, useUtenti } from '../data/archivio';
import type { ProfiloUtente, StatoUtente } from '../domain/tipi';
import { Errore, Scheletri, Segmented, Sheet, Vuoto, useToast } from './Comuni';
import { useApp } from './contesto';
import { vai } from './router';

const SCHEDE: { valore: StatoUtente; testo: string; vuoto: string }[] = [
  { valore: 'in_attesa', testo: 'In attesa', vuoto: 'Nessuna richiesta in attesa' },
  { valore: 'approvato', testo: 'Approvati', vuoto: 'Nessun utente approvato' },
  { valore: 'bloccato', testo: 'Bloccati', vuoto: 'Nessun utente bloccato' },
];

const data = (ms: number | null) => (ms ? new Date(ms).toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric' }) : '');

export function Admin() {
  const { uid, profilo } = useApp();
  const mostraToast = useToast();
  const utenti = useUtenti(profilo.ruolo === 'admin');
  const [scheda, setScheda] = useState<StatoUtente>('in_attesa');
  const [daBloccare, setDaBloccare] = useState<ProfiloUtente | null>(null);

  useEffect(() => { document.title = 'Amministrazione · PianoAlimentare'; }, []);

  if (profilo.ruolo !== 'admin') return <Vuoto icona="lock" titolo="Area riservata" testo="Questa sezione è solo per l'amministratore." />;

  const imposta = (u: ProfiloUtente, stato: StatoUtente) => {
    impostaStatoUtente(u.uid, stato)
      .then(() => mostraToast(stato === 'approvato' ? `${u.nome} approvato` : `${u.nome} bloccato`))
      .catch(() => mostraToast('Operazione non riuscita. Riprova.'));
  };

  const conta = (s: StatoUtente) => utenti.dati.filter((u) => u.stato === s).length;
  const elenco = utenti.dati.filter((u) => u.stato === scheda);

  return (
    <>
      <div className="intestazione"><h1>Amministrazione</h1></div>
      <Segmented
        etichetta="Stato degli utenti" valore={scheda} onCambia={setScheda}
        opzioni={SCHEDE.map((s) => ({ valore: s.valore, testo: `${s.testo} (${conta(s.valore)})` }))}
      />
      {utenti.errore && <Errore onRiprova={utenti.riprova} />}
      {utenti.caricamento && <Scheletri />}
      {!utenti.caricamento && !utenti.errore && elenco.length === 0 && (
        <Vuoto icona="profilo" titolo={SCHEDE.find((s) => s.valore === scheda)!.vuoto} />
      )}
      <ul className="utenti">
        {elenco.map((u) => (
          <li key={u.uid} className="card utente">
            <div className="utente-info">
              <span className="avatar" aria-hidden="true">{(u.nome || u.email || '?').charAt(0).toUpperCase()}</span>
              <div>
                <strong>{u.nome || 'Senza nome'}</strong>
                <div className="tenue">{u.email}</div>
                {u.creatoIlMs && <div className="tenue">Richiesta del {data(u.creatoIlMs)}</div>}
              </div>
            </div>
            {u.uid !== uid && (
              <div className="azioni azioni-riga">
                {u.stato !== 'approvato' && (
                  <button className="btn btn-primario btn-piccolo" onClick={() => imposta(u, 'approvato')}>Approva</button>
                )}
                {u.stato === 'approvato' && (
                  <button className="btn btn-secondario btn-piccolo" onClick={() => vai(`/importa/${u.uid}`)}>Importa piano</button>
                )}
                {u.stato !== 'bloccato' && (
                  <button className="btn btn-distruttivo btn-piccolo" onClick={() => setDaBloccare(u)}>Blocca</button>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>

      <Sheet
        aperto={!!daBloccare} titolo="Bloccare l'utente?" onChiudi={() => setDaBloccare(null)}
        piede={(
          <div className="azioni">
            <button className="btn btn-distruttivo" onClick={() => { if (daBloccare) imposta(daBloccare, 'bloccato'); setDaBloccare(null); }}>Blocca</button>
            <button className="btn btn-secondario" onClick={() => setDaBloccare(null)}>Annulla</button>
          </div>
        )}
      >
        <p>{daBloccare?.nome} ({daBloccare?.email}) non potrà più usare l'app finché non lo riapprovi.</p>
      </Sheet>
    </>
  );
}
