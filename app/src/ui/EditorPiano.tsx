// Editor semplice del piano: nome/preparazione dei piatti, quantità/unità/nome delle opzioni, canale degli alimenti.
// Niente aggiunta o rimozione di piatti (per ora). La validazione avviene fuori, prima di salvare.
import { useEffect, useState } from 'react';
import type { Canale, Piano, Unita } from '../domain/tipi';

const UNITA: Unita[] = ['g', 'mL', 'pezzo', 'fetta', 'cucchiaio', 'cucchiaino', 'vasetto', 'porzione', 'qb'];
const CANALI: { v: Canale; t: string }[] = [
  { v: 'amazon', t: 'Amazon' }, { v: 'fresco', t: 'Fresco' }, { v: 'base', t: 'Base (esclusi dalla spesa)' }, { v: 'esterno', t: 'Esterno' },
];

/** Campo numerico che tollera la digitazione parziale ("1,"). Conferma solo valori validi. */
function CampoNumero({ valore, etichetta, onValore, vuotoOk }: {
  valore: number | undefined; etichetta: string; onValore: (n: number | undefined) => void; vuotoOk?: boolean;
}) {
  const [testo, setTesto] = useState(valore === undefined ? '' : String(valore).replace('.', ','));
  useEffect(() => {
    setTesto((t) => (Number(t.replace(',', '.')) === valore || (t === '' && valore === undefined) ? t : valore === undefined ? '' : String(valore).replace('.', ',')));
  }, [valore]);
  return (
    <input
      className="campo num" inputMode="decimal" aria-label={etichetta} value={testo}
      onChange={(e) => {
        const t = e.target.value;
        setTesto(t);
        if (t.trim() === '') { if (vuotoOk) onValore(undefined); return; }
        const n = Number(t.replace(',', '.'));
        if (Number.isFinite(n) && n >= 0) onValore(n);
      }}
    />
  );
}

export function EditorPiano({ piano, onChange }: { piano: Piano; onChange: (p: Piano) => void }) {
  const modifica = (fn: (p: Piano) => void) => {
    const copia = JSON.parse(JSON.stringify(piano)) as Piano;
    fn(copia);
    onChange(copia);
  };

  return (
    <div className="editor">
      <label className="etichetta">
        Titolo del piano
        <input className="campo" value={piano.titolo} onChange={(e) => modifica((p) => { p.titolo = e.target.value; })} />
      </label>

      <h3 className="sezione-titolo">Piatti</h3>
      {Object.entries(piano.piatti).map(([pid, piatto]) => (
        <details key={pid} className="editor-voce">
          <summary>{piatto.nome || pid}</summary>
          <label className="etichetta">
            Nome del piatto
            <input className="campo" value={piatto.nome} onChange={(e) => modifica((p) => { p.piatti[pid].nome = e.target.value; })} />
          </label>
          <label className="etichetta">
            Preparazione
            <textarea
              className="campo" rows={3} value={piatto.preparazione ?? ''}
              onChange={(e) => modifica((p) => {
                if (e.target.value) p.piatti[pid].preparazione = e.target.value;
                else delete p.piatti[pid].preparazione;
              })}
            />
          </label>
          {piatto.componenti.map((c, ci) => (
            <fieldset key={ci} className="editor-comp">
              <legend>
                Componente {ci + 1}{c.portata && c.portata > 1 ? ` · ${c.portata}ª portata` : ''}
                {c.opzioni.length > 1 ? ' · alternative' : ''}
              </legend>
              {c.opzioni.map((o, oi) => (
                <div key={oi} className="editor-opz">
                  <label className="etichetta">
                    Alimento
                    <input
                      className="campo" value={piano.alimenti[o.alimento]?.nome ?? o.alimento}
                      onChange={(e) => modifica((p) => { if (p.alimenti[o.alimento]) p.alimenti[o.alimento].nome = e.target.value; })}
                    />
                  </label>
                  <div className="editor-qta">
                    {o.unita !== 'qb' && (
                      <>
                        <label className="etichetta">
                          Quantità
                          <CampoNumero
                            etichetta="Quantità" valore={o.quantita ?? undefined}
                            onValore={(n) => modifica((p) => { if (n !== undefined) p.piatti[pid].componenti[ci].opzioni[oi].quantita = n; })}
                          />
                        </label>
                        <label className="etichetta">
                          Minimo
                          <CampoNumero
                            etichetta="Quantità minima (facoltativa)" valore={o.quantitaMin} vuotoOk
                            onValore={(n) => modifica((p) => {
                              const x = p.piatti[pid].componenti[ci].opzioni[oi];
                              if (n === undefined) delete x.quantitaMin; else x.quantitaMin = n;
                            })}
                          />
                        </label>
                      </>
                    )}
                    <label className="etichetta">
                      Unità
                      <select
                        className="campo" value={o.unita}
                        onChange={(e) => modifica((p) => {
                          const x = p.piatti[pid].componenti[ci].opzioni[oi];
                          x.unita = e.target.value as Unita;
                          if (x.unita === 'qb') { delete x.quantita; delete x.quantitaMin; }
                          else if (x.quantita == null) x.quantita = 1;
                        })}
                      >
                        {UNITA.map((u) => <option key={u} value={u}>{u === 'qb' ? 'q.b.' : u}</option>)}
                      </select>
                    </label>
                  </div>
                </div>
              ))}
            </fieldset>
          ))}
        </details>
      ))}

      <h3 className="sezione-titolo">Alimenti e canale di acquisto</h3>
      <div className="card">
        <ul className="alimenti-lista">
          {Object.entries(piano.alimenti).map(([id, a]) => (
            <li key={id} className="alimento-riga">
              <span>{a.nome}</span>
              <select
                className="campo" aria-label={`Canale di ${a.nome}`} value={a.canale}
                onChange={(e) => modifica((p) => { p.alimenti[id].canale = e.target.value as Canale; })}
              >
                {CANALI.map((c) => <option key={c.v} value={c.v}>{c.t}</option>)}
              </select>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
