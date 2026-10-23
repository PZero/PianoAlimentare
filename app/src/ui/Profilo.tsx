import { useEffect, useState } from 'react';
import { elencoPiani, salvaProfilo } from '../data/archivio';
import { useSessione } from '../data/sessione';
import type { PianoSalvato } from '../domain/tipi';
import { Stato, Testata, useToast } from './Comuni';
import { Icona } from './Icone';
import { useApp } from './contesto';
import { vai } from './router';

const dataIt = (iso: string) => iso.split('-').reverse().join('/');

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
      <Testata occhiello="Profilo" titolo={profilo.nome || 'Il tuo profilo'} sottotitolo={profilo.email} />

      <section aria-label="Dati personali">
        <label className="campo">
          <span className="occhiello">Nome</span>
          <input value={nome} onChange={(e) => setNome(e.target.value)} autoComplete="name" />
        </label>
        <div className="gruppo-campo">
          <span className="occhiello">Intolleranze ed esigenze</span>
          <ul className="chips" aria-label="Intolleranze inserite">
            {intolleranze.map((x) => (
              <li key={x} className="chip">
                {x}
                <button className="btn-icona" style={{ minWidth: 36, minHeight: 36 }} aria-label={`Rimuovi ${x}`} onClick={() => setIntolleranze(intolleranze.filter((y) => y !== x))}>
                  <Icona nome="chiudi" dim={14} />
                </button>
              </li>
            ))}
            {intolleranze.length === 0 && <li className="testo-2">Nessuna</li>}
          </ul>
        </div>
        <label className="campo">
          <span className="occhiello">Aggiungi</span>
          <input
            placeholder="Es. senza glutine" value={nuova}
            onChange={(e) => setNuova(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); aggiungi(); } }}
          />
        </label>
        <div className="azioni azioni-riga" style={{ marginTop: 20 }}>
          <button className="btn btn-contorno" onClick={aggiungi} disabled={!nuova.trim()}>Aggiungi</button>
          <button className="btn btn-pieno" onClick={salva} disabled={!modificato || !nome.trim() || salvataggio}>
            {salvataggio ? 'Salvataggio…' : 'Salva'}
          </button>
        </div>
      </section>

      <section className="sezione" aria-label="Piano">
        <p className="occhiello">Il piano</p>
        {piano ? (
          <>
            <h2 className="titolo-sezione" style={{ marginTop: 8 }}>{piano.titolo}</h2>
            {piano.dataVisita && <p className="testo-2">Visita del {dataIt(piano.dataVisita)}</p>}
            <div className="azioni azioni-riga" style={{ marginTop: 20 }}>
              <button className="btn btn-contorno" onClick={() => vai('/modifica')}>Modifica piano</button>
              <button className="btn btn-contorno" onClick={() => vai('/importa')}>Importa nuovo</button>
            </div>
          </>
        ) : (
          <>
            <p className="testo-2" style={{ marginTop: 8 }}>Nessun piano attivo.</p>
            <div className="azioni" style={{ marginTop: 20 }}><button className="btn btn-pieno" onClick={() => vai('/importa')}>Importa il piano</button></div>
          </>
        )}
        {storico && storico.length > 0 && (
          <details className="preparazione" style={{ marginTop: 28 }}>
            <summary>Storico dei piani ({storico.length})</summary>
            <ul>
              {storico.map((p) => (
                <li key={p.id} className="voce-elenco">
                  <span>{p.titolo}{p.importatoIlMs ? ` · ${new Date(p.importatoIlMs).toLocaleDateString('it-IT')}` : ''}</span>
                  {p.attivo && <Stato tipo="attivo" />}
                </li>
              ))}
            </ul>
          </details>
        )}
        {erroreStorico && <p className="nota" style={{ marginTop: 12 }}>Storico non disponibile al momento.</p>}
      </section>

      {profilo.ruolo === 'admin' && (
        <section className="sezione" aria-label="Amministrazione">
          <p className="occhiello">Amministrazione</p>
          <button className="voce-elenco" onClick={() => vai('/admin')} style={{ marginTop: 8, borderTop: '1px solid var(--c-filetto)' }}>
            <span className="nome-piatto" style={{ fontWeight: 400, fontSize: '1.125rem' }}>Persone</span>
            <Icona nome="destra" dim={18} />
          </button>
        </section>
      )}

      <div className="azioni azioni-centro sezione">
        <button className="btn-link" onClick={() => esci()}>Esci</button>
      </div>
    </>
  );
}
