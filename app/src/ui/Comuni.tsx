// Componenti comuni (docs/DESIGN.md, sezione 5): stato a puntino, bottom sheet, toast, stati vuoti, pillole.
import {
  createContext, useCallback, useContext, useEffect, useRef, useState, type PointerEvent, type ReactNode,
} from 'react';
import { Illustrazione, type Accento, type NomeIllustrazione } from '../illustrazioni';
import { Icona } from './Icone';

// ---------- Stato: puntino + parola ----------
export type TipoStato = 'fatto' | 'sostituito' | 'saltato' | 'libero' | 'digiuno' | 'scelta' | 'amazon' | 'fresco' | 'esterno' | 'base' | 'attivo';
const STATI: Record<TipoStato, string> = {
  fatto: 'Fatto', sostituito: 'Sostituito', saltato: 'Saltato', libero: 'Libero', digiuno: 'Digiuno', scelta: 'Da scegliere',
  amazon: 'Amazon', fresco: 'Fresco', esterno: 'Esterno', base: 'Dispensa', attivo: 'Attivo',
};
export function Stato({ tipo, testo }: { tipo: TipoStato; testo?: string }) {
  return (
    <span className={`stato stato-${tipo}`}>
      <span className="puntino" aria-hidden="true" />
      {testo ?? STATI[tipo]}
    </span>
  );
}

// ---------- Testata di pagina ----------
export function Testata({ occhiello, titolo, sottotitolo, children }: { occhiello?: string; titolo: string; sottotitolo?: ReactNode; children?: ReactNode }) {
  return (
    <header className="testata">
      {occhiello && <p className="occhiello">{occhiello}</p>}
      <h1 className="titolo">{titolo}</h1>
      {sottotitolo && <p className="sottotitolo">{sottotitolo}</p>}
      {children}
    </header>
  );
}

// ---------- Bottom sheet ----------
interface PropsSheet {
  aperto: boolean;
  titolo: string;
  occhiello?: string;
  onChiudi: () => void;
  children: ReactNode;
  /** contenuto fisso in basso (es. pulsante Conferma) */
  piede?: ReactNode;
  pieno?: boolean;
}
export function Sheet({ aperto, titolo, occhiello, onChiudi, children, piede, pieno }: PropsSheet) {
  const ref = useRef<HTMLDivElement>(null);
  const [spost, setSpost] = useState(0);
  const inizioY = useRef<number | null>(null);
  const chiudiRef = useRef(onChiudi);
  chiudiRef.current = onChiudi;

  useEffect(() => {
    if (!aperto) return;
    const precedente = document.activeElement as HTMLElement | null;
    ref.current?.focus();
    const tasto = (e: KeyboardEvent) => { if (e.key === 'Escape') chiudiRef.current(); };
    document.addEventListener('keydown', tasto);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', tasto);
      document.body.style.overflow = '';
      precedente?.focus?.();
    };
  }, [aperto]);

  useEffect(() => { if (!aperto) setSpost(0); }, [aperto]);
  if (!aperto) return null;

  const giu = (e: PointerEvent) => { inizioY.current = e.clientY; (e.target as Element).setPointerCapture(e.pointerId); };
  const muovi = (e: PointerEvent) => { if (inizioY.current !== null) setSpost(Math.max(0, e.clientY - inizioY.current)); };
  const su = () => {
    if (spost > 90) onChiudi();
    setSpost(0);
    inizioY.current = null;
  };

  return (
    <div className="sheet-sfondo" onClick={onChiudi}>
      <div
        ref={ref} tabIndex={-1} role="dialog" aria-modal="true" aria-label={titolo}
        className={`sheet${pieno ? ' sheet-pieno' : ''}`}
        style={spost ? { transform: `translateY(${spost}px)`, transition: 'none' } : undefined}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sheet-maniglia" onPointerDown={giu} onPointerMove={muovi} onPointerUp={su} onPointerCancel={su}>
          <span />
        </div>
        <div className="sheet-testa">
          <div>
            {occhiello && <p className="occhiello">{occhiello}</p>}
            <h2 className="sheet-titolo">{titolo}</h2>
          </div>
          <button className="btn-icona" onClick={onChiudi} aria-label="Chiudi"><Icona nome="chiudi" /></button>
        </div>
        <div className="sheet-corpo">{children}</div>
        {piede && <div className="sheet-piede">{piede}</div>}
      </div>
    </div>
  );
}

export interface VoceOpzione {
  id: string;
  etichetta: string;
  dettaglio?: string;
  sezione?: string;
  illustrazione?: { nome: NomeIllustrazione; accento: Accento };
}

/** Selettore alternative: tocco = seleziona e chiude; con 5 o più opzioni c'è il pulsante "Conferma". */
export function SheetOpzioni({
  aperto, titolo, occhiello = 'Scegli', opzioni, valore, onConferma, onChiudi,
}: {
  aperto: boolean; titolo: string; occhiello?: string; opzioni: VoceOpzione[]; valore?: string;
  onConferma: (id: string) => void; onChiudi: () => void;
}) {
  const [sel, setSel] = useState<string | undefined>(valore);
  useEffect(() => { if (aperto) setSel(valore); }, [aperto, valore]);
  const conferma = opzioni.length >= 5;
  const sezioni: { titolo?: string; voci: VoceOpzione[] }[] = [];
  for (const o of opzioni) {
    const ultima = sezioni[sezioni.length - 1];
    if (ultima && ultima.titolo === o.sezione) ultima.voci.push(o);
    else sezioni.push({ titolo: o.sezione, voci: [o] });
  }
  return (
    <Sheet
      aperto={aperto} titolo={titolo} occhiello={occhiello} onChiudi={onChiudi}
      piede={conferma ? <button className="btn btn-pieno btn-largo" disabled={!sel} onClick={() => sel && onConferma(sel)}>Conferma</button> : undefined}
    >
      {sezioni.map((s, i) => (
        <div key={i} role="radiogroup" aria-label={s.titolo ?? titolo}>
          {s.titolo && <p className="occhiello occhiello-sezione">{s.titolo}</p>}
          {s.voci.map((o) => (
            <button
              key={o.id} role="radio" aria-checked={sel === o.id}
              className={`opzione${sel === o.id ? ' attiva' : ''}`}
              onClick={() => { setSel(o.id); if (!conferma) onConferma(o.id); }}
            >
              <span className="opzione-illu">
                {o.illustrazione && <Illustrazione nome={o.illustrazione.nome} accento={o.illustrazione.accento} misura="s" />}
              </span>
              <span className="opzione-nome">{o.etichetta}</span>
              {o.dettaglio && <span className="opzione-qta num">{o.dettaglio}</span>}
              <span className="cerchio" aria-hidden="true" />
            </button>
          ))}
        </div>
      ))}
    </Sheet>
  );
}

// ---------- Toast ----------
interface VoceToast { id: number; messaggio: string; annulla?: () => void }
const CtxToast = createContext<(messaggio: string, annulla?: () => void) => void>(() => undefined);
export const useToast = () => useContext(CtxToast);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<VoceToast | null>(null);
  const timer = useRef<number | undefined>(undefined);
  const mostra = useCallback((messaggio: string, annulla?: () => void) => {
    window.clearTimeout(timer.current);
    setToast({ id: Date.now(), messaggio, annulla });
    timer.current = window.setTimeout(() => setToast(null), 5000);
  }, []);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  return (
    <CtxToast.Provider value={mostra}>
      {children}
      <div className="toast-zona" role="status" aria-live="polite">
        {toast && (
          <div className="toast" key={toast.id}>
            <span>{toast.messaggio}</span>
            {toast.annulla && (
              <button className="toast-annulla" onClick={() => { toast.annulla?.(); setToast(null); }}>Annulla</button>
            )}
          </div>
        )}
      </div>
    </CtxToast.Provider>
  );
}

// ---------- Stati ----------
export function Vuoto({ illustrazione = 'Piatto', accento, titolo, testo, azione }: {
  illustrazione?: NomeIllustrazione; accento?: Accento; titolo: string; testo?: string; azione?: ReactNode;
}) {
  return (
    <div className="vuoto">
      <Illustrazione nome={illustrazione} accento={accento} misura="l" />
      <h2 className="titolo-sezione">{titolo}</h2>
      {testo && <p className="testo-2">{testo}</p>}
      {azione}
    </div>
  );
}

export function Errore({ testo = 'Non riesco a caricare i dati.', onRiprova }: { testo?: string; onRiprova?: () => void }) {
  return (
    <div className="errore" role="alert">
      <p>{testo}</p>
      {onRiprova && <button className="btn-link" onClick={onRiprova}>Riprova</button>}
    </div>
  );
}

export function Scheletri({ n = 4 }: { n?: number }) {
  return (
    <div className="scheletri" aria-busy="true" aria-label="Caricamento">
      <div className="sk sk-titolo" />
      {Array.from({ length: n }, (_, i) => <div key={i} className="sk sk-riga" style={{ width: `${92 - i * 11}%` }} />)}
    </div>
  );
}

// ---------- Pillole di scelta (al posto del segmented) ----------
export function Pillole<T extends string | number>({
  opzioni, valore, onCambia, etichetta,
}: { opzioni: { valore: T; testo: string }[]; valore: T | undefined; onCambia: (v: T) => void; etichetta: string }) {
  return (
    <div className="pillole" role="radiogroup" aria-label={etichetta}>
      {opzioni.map((o) => (
        <button
          key={String(o.valore)} role="radio" aria-checked={o.valore === valore}
          className={`pillola${o.valore === valore ? ' attiva' : ''}`} onClick={() => onCambia(o.valore)}
        >
          {o.testo}
        </button>
      ))}
    </div>
  );
}

export function useOnline(): boolean {
  const [online, setOnline] = useState(navigator.onLine);
  useEffect(() => {
    const su = () => setOnline(true);
    const giu = () => setOnline(false);
    window.addEventListener('online', su);
    window.addEventListener('offline', giu);
    return () => { window.removeEventListener('online', su); window.removeEventListener('offline', giu); };
  }, []);
  return online;
}
