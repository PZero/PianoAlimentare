// "Controlla il piano": il menu impaginato, modificabile toccando (docs/DESIGN.md, sezione 6).
// Usato dopo l'import e per "Modifica piano". Non è un modulo: tutto è testo che si tocca.
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  aggiornaIngrediente, aggiungiIngrediente, chiaveIngrediente, contaVariazioni, eliminaIngrediente, impostaPreparazione,
  ordinePiatti, puntiDaVerificare, rinominaPiatto, type Categoria, type DatiIngrediente,
} from '../domain/modificaPiano';
import { formatQuantita } from '../domain/quantita';
import { GIORNI, NOMI_GIORNO, type Canale, type Piano, type Unita } from '../domain/tipi';
import { validaPiano } from '../domain/validaPiano';
import { Piatto } from '../illustrazioni';
import { Pillole, Sheet, Testata, useToast } from './Comuni';
import { Icona } from './Icone';

const UNITA: { valore: Unita; testo: string }[] = [
  { valore: 'g', testo: 'g' }, { valore: 'mL', testo: 'mL' }, { valore: 'pezzo', testo: 'pezzi' }, { valore: 'fetta', testo: 'fette' },
  { valore: 'cucchiaio', testo: 'cucchiai' }, { valore: 'cucchiaino', testo: 'cucchiaini' }, { valore: 'vasetto', testo: 'vasetti' },
  { valore: 'porzione', testo: 'porzioni' }, { valore: 'qb', testo: 'q.b.' },
];
const CANALI: { valore: Canale; testo: string }[] = [
  { valore: 'amazon', testo: 'Amazon' }, { valore: 'fresco', testo: 'Fresco' }, { valore: 'esterno', testo: 'Esterno' }, { valore: 'base', testo: 'Dispensa' },
];
const DESCRIZIONE: Record<Categoria, string> = {
  qb: 'quantità q.b.', nuovi: 'alimenti nuovi', senzaCanale: 'senza canale di spesa',
};

const dataIt = (iso: string) => new Date(iso + 'T12:00:00').toLocaleDateString('it-IT', { day: 'numeric', month: 'long' });

// ---------- Testo modificabile in linea ----------
function TestoInLinea({
  valore, onSalva, multilinea, segnaposto, classe, etichetta,
}: {
  valore: string; onSalva: (nuovo: string, precedente: string) => void; multilinea?: boolean;
  segnaposto: string; classe?: string; etichetta: string;
}) {
  const [modifica, setModifica] = useState(false);
  const [bozza, setBozza] = useState(valore);
  const chiuso = useRef(false);
  useEffect(() => { if (!modifica) setBozza(valore); }, [valore, modifica]);

  const fine = () => {
    if (chiuso.current) return;
    chiuso.current = true;
    setModifica(false);
    if (bozza.trim() !== valore.trim()) onSalva(bozza.trim(), valore);
  };

  if (!modifica) {
    return (
      <button
        className={`modifica-linea ${classe ?? ''}`} aria-label={`${etichetta}: tocca per modificare`}
        onClick={() => { chiuso.current = false; setBozza(valore); setModifica(true); }}
      >
        {valore || <span className="cambia">{segnaposto}</span>}
      </button>
    );
  }
  const comuni = {
    className: 'campo-linea', value: bozza, autoFocus: true, 'aria-label': etichetta,
    onChange: (e: { target: { value: string } }) => setBozza(e.target.value), onBlur: fine,
  };
  return (
    <div>
      {multilinea
        ? <textarea {...comuni} rows={4} />
        : <input {...comuni} onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }} />}
      <div className="fine-linea">
        <button className="btn-link" onPointerDown={(e) => e.preventDefault()} onClick={fine}>Fine</button>
      </div>
    </div>
  );
}

// ---------- Sheet di modifica ingrediente ----------
type Bersaglio =
  | { tipo: 'esistente'; piattoId: string; ci: number; oi: number }
  | { tipo: 'nuovo'; piattoId: string; alternativaDi?: number };

interface Bozza { nome: string; quantita: string; unita: Unita; canale?: Canale }

function SheetIngrediente({
  piano, bersaglio, onChiudi, onSalva, onElimina, onAlternativa,
}: {
  piano: Piano; bersaglio: Bersaglio | null; onChiudi: () => void;
  onSalva: (b: Bersaglio, dati: DatiIngrediente) => void; onElimina: (b: Extract<Bersaglio, { tipo: 'esistente' }>) => void;
  onAlternativa: (piattoId: string, ci: number) => void;
}) {
  const [bozza, setBozza] = useState<Bozza>({ nome: '', quantita: '', unita: 'g' });
  const [conferma, setConferma] = useState(false);
  const chiave = bersaglio ? JSON.stringify(bersaglio) : '';

  useEffect(() => {
    setConferma(false);
    if (!bersaglio) return;
    if (bersaglio.tipo === 'esistente') {
      const o = piano.piatti[bersaglio.piattoId]?.componenti[bersaglio.ci]?.opzioni[bersaglio.oi];
      if (!o) return;
      const a = piano.alimenti[o.alimento];
      setBozza({ nome: a?.nome ?? o.alimento, quantita: o.quantita != null ? String(o.quantita).replace('.', ',') : '', unita: o.unita, canale: a?.canale });
    } else {
      setBozza({ nome: '', quantita: '', unita: 'g' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chiave]);

  if (!bersaglio) return null;
  const esistente = bersaglio.tipo === 'esistente';
  const q = Number(bozza.quantita.replace(',', '.'));
  const quantitaOk = bozza.unita === 'qb' || (bozza.quantita.trim() !== '' && Number.isFinite(q) && q > 0);
  const valido = bozza.nome.trim().length > 0 && quantitaOk;
  const idAl = esistente ? piano.piatti[bersaglio.piattoId]?.componenti[bersaglio.ci]?.opzioni[bersaglio.oi]?.alimento : undefined;
  let usi = 0;
  if (idAl) Object.values(piano.piatti).forEach((p) => p.componenti.forEach((c) => c.opzioni.forEach((o) => { if (o.alimento === idAl) usi++; })));

  return (
    <Sheet
      aperto occhiello={esistente ? 'Modifica ingrediente' : 'Nuovo ingrediente'}
      titolo={bozza.nome.trim() || (esistente ? 'Ingrediente' : 'Che cosa aggiungi?')} onChiudi={onChiudi}
      piede={(
        <>
          <button
            className="btn btn-pieno btn-largo" disabled={!valido}
            onClick={() => onSalva(bersaglio, { nome: bozza.nome, quantita: bozza.unita === 'qb' ? null : q, unita: bozza.unita, canale: bozza.canale })}
          >
            Salva
          </button>
          {esistente && (
            conferma ? (
              <div className="azioni azioni-riga azioni-centro">
                <span className="nota">Eliminare questo ingrediente?</span>
                <button className="btn-link" style={{ color: 'var(--c-errore)' }} onClick={() => onElimina(bersaglio)}>Sì, elimina</button>
                <button className="btn-link" onClick={() => setConferma(false)}>No</button>
              </div>
            ) : (
              <div className="azioni azioni-riga azioni-centro">
                <button className="btn-link" onClick={() => setConferma(true)}>Elimina ingrediente</button>
                <button className="btn-link btn-link-terra" onClick={() => onAlternativa(bersaglio.piattoId, bersaglio.ci)}>Aggiungi alternativa</button>
              </div>
            )
          )}
        </>
      )}
    >
      <label className="campo">
        <span className="occhiello">Nome</span>
        <input value={bozza.nome} onChange={(e) => setBozza({ ...bozza, nome: e.target.value })} autoCapitalize="sentences" />
      </label>
      {usi > 1 && <p className="nota" style={{ marginTop: 8 }}>Il nome vale per tutte le ricette in cui compare ({usi}).</p>}
      <label className="campo">
        <span className="occhiello">Quantità</span>
        <input
          value={bozza.unita === 'qb' ? '' : bozza.quantita} inputMode="decimal" disabled={bozza.unita === 'qb'}
          placeholder={bozza.unita === 'qb' ? 'q.b.: nessuna quantità' : 'Es. 80'}
          onChange={(e) => setBozza({ ...bozza, quantita: e.target.value })}
        />
      </label>
      <div className="gruppo-campo">
        <span className="occhiello">Unità</span>
        <div className="pillole-corte"><Pillole etichetta="Unità" opzioni={UNITA} valore={bozza.unita} onCambia={(unita) => setBozza({ ...bozza, unita })} /></div>
      </div>
      <div className="gruppo-campo">
        <span className="occhiello">Canale di spesa</span>
        <Pillole etichetta="Canale di spesa" opzioni={CANALI} valore={bozza.canale} onCambia={(canale) => setBozza({ ...bozza, canale })} />
      </div>
    </Sheet>
  );
}

// ---------- Schermata ----------
export interface PropsControlla {
  modalita: 'importa' | 'modifica';
  piano: Piano;
  onChange: (p: Piano) => void;
  /** Piano di partenza: serve a contare le variazioni in modalità "modifica" */
  originale?: Piano;
  /** Id degli alimenti già noti (piano precedente): gli altri sono "nuovi" */
  alimentiNoti?: ReadonlySet<string>;
  /** Nome della persona a cui è destinato il piano (solo admin) */
  per?: string;
  avviso?: string;
  salvataggio: boolean;
  erroreSalvataggio: boolean;
  onConferma: () => void;
}

type Selezione = { categoria: Categoria; indice: number };

export function ControllaPiano({
  modalita, piano, onChange, originale, alimentiNoti, per, avviso, salvataggio, erroreSalvataggio, onConferma,
}: PropsControlla) {
  const mostraToast = useToast();
  const [bersaglio, setBersaglio] = useState<Bersaglio | null>(null);
  const [verificati, setVerificati] = useState<ReadonlySet<string>>(new Set());
  const [selezione, setSelezione] = useState<Selezione | null>(null);
  const [erroriAperti, setErroriAperti] = useState(false);
  const [residuiAperti, setResiduiAperti] = useState(false);

  const errori = useMemo(() => validaPiano(piano).errori, [piano]);
  const punti = useMemo(() => {
    const p = puntiDaVerificare(piano, alimentiNoti);
    const filtra = (l: string[]) => l.filter((k) => !verificati.has(k));
    return { qb: filtra(p.qb), nuovi: filtra(p.nuovi), senzaCanale: p.senzaCanale };
  }, [piano, alimentiNoti, verificati]);
  const categorie: Categoria[] = alimentiNoti ? ['qb', 'nuovi', 'senzaCanale'] : ['qb', 'senzaCanale'];
  const residui = categorie.reduce((n, c) => n + punti[c].length, 0);
  const variazioni = originale ? contaVariazioni(originale, piano) : 0;

  const vaiA = (chiave: string) => {
    document.getElementById(`ing-${chiave}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };
  const apriCategoria = (c: Categoria) => {
    if (punti[c].length === 0) return;
    setSelezione({ categoria: c, indice: 0 });
    vaiA(punti[c][0]);
  };
  const prossimo = () => {
    if (!selezione) return;
    const lista = punti[selezione.categoria];
    if (lista.length === 0) { setSelezione(null); return; }
    const indice = (selezione.indice + 1) % lista.length;
    setSelezione({ ...selezione, indice });
    vaiA(lista[indice]);
  };
  const listaSel = selezione ? punti[selezione.categoria] : [];
  useEffect(() => {
    if (selezione && listaSel.length === 0) setSelezione(null);
    else if (selezione && selezione.indice >= listaSel.length) setSelezione({ ...selezione, indice: 0 });
  }, [selezione, listaSel.length]);

  // Modifiche con possibilità di annullare
  const modifica = (nuovo: Piano, messaggio: string) => {
    const prima = piano;
    onChange(nuovo);
    mostraToast(messaggio, () => onChange(prima));
  };

  const salvaIngrediente = (b: Bersaglio, dati: DatiIngrediente) => {
    if (b.tipo === 'esistente') {
      setVerificati(new Set([...verificati, chiaveIngrediente(b.piattoId, b.ci, b.oi)]));
      onChange(aggiornaIngrediente(piano, b.piattoId, b.ci, b.oi, dati));
    } else {
      const ci = b.alternativaDi === undefined ? piano.piatti[b.piattoId].componenti.length : b.alternativaDi;
      const oi = b.alternativaDi === undefined ? 0 : piano.piatti[b.piattoId].componenti[b.alternativaDi].opzioni.length;
      setVerificati(new Set([...verificati, chiaveIngrediente(b.piattoId, ci, oi)]));
      onChange(aggiungiIngrediente(piano, b.piattoId, dati, b.alternativaDi));
    }
    setBersaglio(null);
    mostraToast('Ingrediente salvato');
  };

  const mostrati = new Set<string>();
  const daVerificareChiavi = new Set(selezione ? punti[selezione.categoria] : []);
  const corrente = selezione ? punti[selezione.categoria][selezione.indice] : undefined;

  const ingrediente = (piattoId: string, ci: number, oi: number) => {
    const o = piano.piatti[piattoId].componenti[ci].opzioni[oi];
    const a = piano.alimenti[o.alimento];
    const k = chiaveIngrediente(piattoId, ci, oi);
    const nuovo = alimentiNoti && !alimentiNoti.has(o.alimento) && !verificati.has(k);
    return (
      <li key={`${ci}.${oi}`}>
        <button
          id={`ing-${k}`}
          className={`ing-bottone${daVerificareChiavi.has(k) ? ' evidenza' : ''}${corrente === k ? ' corrente' : ''}`}
          onClick={() => setBersaglio({ tipo: 'esistente', piattoId, ci, oi })}
          aria-label={`Modifica ${a?.nome ?? o.alimento}`}
        >
          <span className="ing-nome">
            {oi > 0 && <span className="ing-prefisso">oppure</span>}
            {nuovo && <span className="segno-nuovo" title="Alimento nuovo" />}
            {a?.nome ?? o.alimento}
            {a && !a.canale && <span className="scegli-canale">scegli canale</span>}
          </span>
          <span className="ing-qta num">
            {o.unita === 'qb' ? <span className="qb-segno">q.b.</span> : formatQuantita(o)}
          </span>
        </button>
      </li>
    );
  };

  const bloccoPiatto = (piattoId: string, pasto?: string) => {
    const p = piano.piatti[piattoId];
    return (
      <div className="pasto-menu" key={piattoId}>
        {pasto && <p className="occhiello">{pasto}</p>}
        <div className="nome-piatto">
          <TestoInLinea
            valore={p.nome} segnaposto="Dai un nome al piatto" etichetta="Nome del piatto"
            onSalva={(nuovo, vecchio) => {
              if (!nuovo) return;
              const prima = piano;
              onChange(rinominaPiatto(piano, piattoId, nuovo));
              mostraToast(`Rinominato «${vecchio}»`, () => onChange(prima));
            }}
          />
        </div>
        <ul className="ingredienti" style={{ marginTop: 12 }}>
          {p.componenti.map((c, ci) => c.opzioni.map((_, oi) => ingrediente(piattoId, ci, oi)))}
        </ul>
        <button className="aggiungi" onClick={() => setBersaglio({ tipo: 'nuovo', piattoId })}>+ Aggiungi ingrediente</button>
        <div className="prep-menu">
          <span className="etichetta">Come si prepara</span>
          <TestoInLinea
            valore={p.preparazione ?? ''} multilinea segnaposto="+ Aggiungi la preparazione" etichetta="Preparazione"
            onSalva={(nuovo) => modifica(impostaPreparazione(piano, piattoId, nuovo), 'Preparazione aggiornata')}
          />
        </div>
      </div>
    );
  };

  const piattiCella = (ids: string[], pasto: string, giorno: string, chiave: string) => {
    const nuoviIds = ids.filter((id) => !mostrati.has(id));
    const gia = ids.filter((id) => mostrati.has(id));
    nuoviIds.forEach((id) => mostrati.add(id));
    return (
      <div key={chiave}>
        {nuoviIds.map((id, i) => bloccoPiatto(id, i === 0 ? pasto : undefined))}
        {gia.length > 0 && (
          <div className="pasto-menu">
            {nuoviIds.length === 0 && <p className="occhiello">{pasto}</p>}
            <p className="nota" style={{ marginTop: 4 }}>{nuoviIds.length === 0 ? 'Come già visto sopra' : 'Già visti sopra'} ({giorno}):</p>
            <ul className="gia-visto">{gia.map((id) => <li key={id}>{piano.piatti[id].nome}</li>)}</ul>
          </div>
        )}
      </div>
    );
  };

  const nonAssegnati = ordinePiatti(piano).filter((x) => x.nonAssegnato).map((x) => x.id);
  const nPasti = GIORNI.reduce((n, g) => n + Object.keys(piano.settimana[g] ?? {}).length, 0);
  const nAlimenti = Object.keys(piano.alimenti).length;
  const sottotitolo = [
    piano.dataVisita ? `Visita del ${dataIt(piano.dataVisita)}` : null, `${nPasti} pasti`, `${nAlimenti} alimenti`,
  ].filter(Boolean).join(' · ');

  const bottoneTesto = errori.length > 0
    ? `Correggi ${errori.length} ${errori.length === 1 ? 'errore' : 'errori'}`
    : salvataggio ? 'Salvataggio…' : modalita === 'importa' ? 'Conferma piano' : 'Salva modifiche';
  const clickConferma = () => { if (residui > 0 && modalita === 'importa') setResiduiAperti(true); else onConferma(); };

  return (
    <>
      <Testata occhiello={modalita === 'importa' ? 'Controlla il piano' : 'Modifica il piano'} titolo={piano.titolo} sottotitolo={sottotitolo}>
        {per && <p className="nota" style={{ marginTop: 8 }}>Per: <strong>{per}</strong></p>}
      </Testata>
      {avviso && <p className="avviso-piano">{avviso}</p>}

      <section className="sezione" aria-label="Da verificare">
        <p className="occhiello">Da verificare</p>
        <div className="verifica">
          {errori.length > 0 && (
            <button className="verifica-riga errori" onClick={() => setErroriAperti(true)}>
              <span className="verifica-n num" key={errori.length}>{errori.length}</span>
              <span className="verifica-d">{errori.length === 1 ? 'errore da correggere' : 'errori da correggere'}</span>
              <span className="verifica-freccia"><Icona nome="destra" dim={18} /></span>
            </button>
          )}
          {categorie.map((c) => punti[c].length > 0 ? (
            <button key={c} className={`verifica-riga${selezione?.categoria === c ? ' attiva' : ''}`} onClick={() => apriCategoria(c)}>
              <span className="verifica-n num" key={punti[c].length} style={{ animation: 'dissolvi .3s ease-out' }}>{punti[c].length}</span>
              <span className="verifica-d">{DESCRIZIONE[c]}</span>
              <span className="verifica-freccia"><Icona nome="destra" dim={18} /></span>
            </button>
          ) : (
            <div key={c} className="verifica-riga a-posto">
              <span className="verifica-n"><Icona nome="fatto" dim={20} /></span>
              <span className="verifica-d">Tutto a posto: {DESCRIZIONE[c]}</span>
            </div>
          ))}
        </div>
        {modalita === 'modifica' && (
          <p className="nota" style={{ marginTop: 12 }}>
            {variazioni === 0 ? 'Nessuna modifica per ora.' : `${variazioni} ${variazioni === 1 ? 'variazione' : 'variazioni'} rispetto al piano attuale.`}
          </p>
        )}
      </section>

      <p className="nota" style={{ marginTop: 32 }}>Tocca un ingrediente, il nome di un piatto o la preparazione per modificarli.</p>

      {GIORNI.map((g) => {
        const celle = piano.settimana[g] ?? {};
        const pasti = piano.pasti.filter((d) => celle[d.id]);
        if (pasti.length === 0) return null;
        return (
          <section key={g} className="capitolo" aria-label={NOMI_GIORNO[g]}>
            <h2 className="titolo-sezione" style={{ marginBottom: 8 }}>{NOMI_GIORNO[g]}</h2>
            <div className="filetto-doppio" />
            {pasti.map((d) => {
              const cella = celle[d.id];
              if (cella.tipo === 'libero' || cella.tipo === 'digiuno') {
                return (
                  <div key={d.id} className="pasto-menu">
                    <p className="occhiello">{d.nome}</p>
                    <p className="testo-2" style={{ marginTop: 4 }}>{cella.tipo === 'libero' ? 'Pasto libero' : 'Pausa dal cibo'}</p>
                  </div>
                );
              }
              const ids = cella.tipo === 'piatto'
                ? [cella.piatto]
                : cella.gruppi.flatMap((gid) => piano.gruppi?.find((x) => x.id === gid)?.piatti ?? []).filter((id) => piano.piatti[id]);
              const unici = [...new Set(ids)];
              return piattiCella(unici, `${d.nome}${cella.tipo === 'scelta' ? ' · a scelta' : ''}${d.facoltativo ? ' · facoltativo' : ''}`, NOMI_GIORNO[g], d.id);
            })}
          </section>
        );
      })}

      {nonAssegnati.length > 0 && (
        <section className="capitolo" aria-label="Piatti non assegnati">
          <h2 className="titolo-sezione" style={{ marginBottom: 8 }}>Non assegnati</h2>
          <div className="filetto-doppio" />
          {nonAssegnati.map((id) => bloccoPiatto(id, 'Fuori dal menu'))}
        </section>
      )}

      <section className="blocco-conferma" aria-label="Conferma">
        <Piatto misura="m" />
        <h2 className="titolo-sezione">{modalita === 'importa' ? 'Il piano è pronto?' : 'Salvare le modifiche?'}</h2>
        <p className="testo-2">
          {errori.length > 0
            ? `Ci sono ancora ${errori.length} ${errori.length === 1 ? 'errore' : 'errori'} da correggere.`
            : residui > 0 ? `Restano ${residui} ${residui === 1 ? 'punto' : 'punti'} da verificare.` : 'È tutto a posto.'}
        </p>
        {erroreSalvataggio && (
          <p style={{ color: 'var(--c-errore)' }} role="alert">Non sono riuscito a salvare: le modifiche sono ancora qui. Riprova.</p>
        )}
      </section>
      <div aria-hidden="true" style={{ height: 96 }} />

      {selezione && listaSel.length > 0 && (
        <div className="pill-prossimo" role="status">
          <span className="num">{selezione.indice + 1} di {listaSel.length}</span>
          <button onClick={prossimo}>Prossimo ›</button>
          <button className="chiudi" aria-label="Chiudi la verifica guidata" onClick={() => setSelezione(null)}><Icona nome="chiudi" dim={16} /></button>
        </div>
      )}

      <div className="barra-conferma">
        <button className="btn btn-pieno btn-largo" disabled={errori.length > 0 || salvataggio || (modalita === 'modifica' && variazioni === 0)} onClick={clickConferma}>
          {bottoneTesto}
        </button>
      </div>

      <SheetIngrediente
        piano={piano} bersaglio={bersaglio} onChiudi={() => setBersaglio(null)} onSalva={salvaIngrediente}
        onElimina={(b) => {
          const prima = piano;
          onChange(eliminaIngrediente(piano, b.piattoId, b.ci, b.oi));
          setVerificati(new Set([...verificati].filter((k) => !k.startsWith(`${b.piattoId}.`))));
          setBersaglio(null);
          mostraToast('Ingrediente eliminato', () => onChange(prima));
        }}
        onAlternativa={(piattoId, ci) => setBersaglio({ tipo: 'nuovo', piattoId, alternativaDi: ci })}
      />

      <Sheet aperto={erroriAperti} occhiello="Da correggere" titolo={`${errori.length} ${errori.length === 1 ? 'errore' : 'errori'}`} onChiudi={() => setErroriAperti(false)}>
        <ul className="errore-elenco">{errori.slice(0, 20).map((e, i) => <li key={i}>{e}</li>)}</ul>
        {errori.length > 20 && <p className="nota">… e altri {errori.length - 20}.</p>}
      </Sheet>

      <Sheet
        aperto={residuiAperti} occhiello="Prima di confermare" titolo={`Restano ${residui} ${residui === 1 ? 'punto' : 'punti'} da verificare`}
        onChiudi={() => setResiduiAperti(false)}
        piede={(
          <>
            <button className="btn btn-pieno btn-largo" onClick={() => { setResiduiAperti(false); onConferma(); }}>Conferma comunque</button>
            <button className="btn-link" onClick={() => setResiduiAperti(false)}>Torna al controllo</button>
          </>
        )}
      >
        <ul className="indicatori" style={{ marginTop: 0 }}>
          {categorie.filter((c) => punti[c].length > 0).map((c) => <li key={c}>{punti[c].length} · {DESCRIZIONE[c]}</li>)}
        </ul>
      </Sheet>
    </>
  );
}
