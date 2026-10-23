import { useEffect, useState } from 'react';
import { elencoPiani, salvaProfilo } from '../data/archivio';
import { useSessione } from '../data/sessione';
import type { PianoSalvato } from '../domain/tipi';
import { Badge, useToast } from './Comuni';
import { Icona } from './Icone';
import { useApp } from './contesto';
import { vai } from './router';

export function Profilo() {
  const { profilo, uid, piano } = useApp();
  const { esci } = useSessione();
  const mostraToast = useToast();
  const [nome, setNome] = useState(profilo.nome);
  const [intolleranze, setIntolleranze] = useState<string[]>(profilo.intolleranze);
  const [nuova, setNuova] = useState('');
  const [salvataggio, setSalvataggio] = useState(false);
  const [storico, setStorico] = useState<PianoSalvato[] | null>(null);
  const [erroreStorico, setErroreStorico] = useState(false);

  useEffect(() => { document.title = 'Profilo · PianoAlimentare'; }, []);
  useEffect(() => {
    elencoPiani(uid).then(setStorico).catch(() => setErroreStorico(true));
  }, [uid, piano?.id]);

  const aggiungi = () => {
    const v = nuova.trim();
    if (v && !intolleranze.some((x) => x.toLowerCase() === v.toLowerCase())) setIntolleranze([...intolleranze, v]);
    setNuova('');
  };
  const modificato = nome.trim() !== profilo.nome || intolleranze.join('|') !== profilo.intolleranze.join('|');

  async function salva() {
    if (!nome.trim()) return;
    setSalvataggio(true);
    try {
      await salvaProfilo(uid, { nome: nome.trim(), intolleranze });
      mostraToast('Profilo salvato');
    } catch {
      mostraToast('Non sono riuscito a salvare. Riprova.');
    } finally {
      setSalvataggio(false);
    }
  }

  return (
    <>
      <div className="intestazione"><h1>Profilo</h1><p className="tenue">{profilo.email}</p></div>

      <section className="card" aria-label="Dati personali">
        <label className="etichetta">
          Nome
          <input className="campo" value={nome} onChange={(e) => setNome(e.target.value)} autoComplete="name" />
        </label>
        <div className="etichetta">
          Intolleranze ed esigenze
          <ul className="chips" aria-label="Intolleranze inserite">
            {intolleranze.map((x) => (
              <li key={x} className="chip">
                {x}
                <button className="btn-icona chip-x" aria-label={`Rimuovi ${x}`} onClick={() => setIntolleranze(intolleranze.filter((y) => y !== x))}>
                  <Icona nome="chiudi" dim={14} />
                </button>
              </li>
            ))}
            {intolleranze.length === 0 && <li className="tenue">Nessuna</li>}
          </ul>
          <div className="riga-aggiungi">
            <input
              className="campo" placeholder="Es. senza glutine" value={nuova} aria-label="Nuova intolleranza"
              onChange={(e) => setNuova(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); aggiungi(); } }}
            />
            <button className="btn btn-secondario" onClick={aggiungi} disabled={!nuova.trim()}>Aggiungi</button>
          </div>
        </div>
        <button className="btn btn-primario" onClick={salva} disabled={!modificato || !nome.trim() || salvataggio}>
          {salvataggio ? 'Salvataggio…' : 'Salva'}
        </button>
      </section>

      <section aria-label="Piano">
        <h2 className="sezione-titolo">Piano</h2>
        <div className="card">
          {piano ? (
            <>
              <strong>{piano.titolo}</strong>
              {piano.dataVisita && <p className="tenue">Visita del {piano.dataVisita.split('-').reverse().join('/')}</p>}
              <div className="azioni">
                <button className="btn btn-secondario" onClick={() => vai('/modifica')}>Modifica piano</button>
                <button className="btn btn-secondario" onClick={() => vai('/importa')}>Importa nuovo piano</button>
              </div>
            </>
          ) : (
            <>
              <p className="tenue">Nessun piano attivo.</p>
              <button className="btn btn-primario" onClick={() => vai('/importa')}>Importa piano</button>
            </>
          )}
        </div>
        {storico && storico.length > 0 && (
          <details className="storico">
            <summary>Storico dei piani ({storico.length})</summary>
            <ul>
              {storico.map((p) => (
                <li key={p.id}>
                  <span>{p.titolo}{p.importatoIlMs ? ` · ${new Date(p.importatoIlMs).toLocaleDateString('it-IT')}` : ''}</span>
                  {p.attivo && <Badge tipo="fatto" testo="Attivo" />}
                </li>
              ))}
            </ul>
          </details>
        )}
        {erroreStorico && <p className="tenue">Storico non disponibile al momento.</p>}
      </section>

      {profilo.ruolo === 'admin' && (
        <section aria-label="Amministrazione">
          <h2 className="sezione-titolo">Amministrazione</h2>
          <button className="btn btn-secondario" onClick={() => vai('/admin')}>Gestisci utenti</button>
        </section>
      )}

      <div className="azioni piede-profilo">
        <button className="btn btn-secondario" onClick={() => esci()}>Esci</button>
      </div>
    </>
  );
}
