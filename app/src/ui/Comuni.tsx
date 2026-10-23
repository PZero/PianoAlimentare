// Componenti comuni: badge, bottom sheet, toast, stati (vuoto / caricamento / errore), segmented control.
import {
  createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode, type PointerEvent,
} from 'react';
import { Icona, type NomeIcona } from './Icone';

// ---------- Badge ----------
export type TipoBadge = 'fatto' | 'sostituito' | 'saltato' | 'libero' | 'digiuno' | 'scelta' | 'amazon' | 'fresco' | 'esterno' | 'base';
const BADGE: Record<TipoBadge, { testo: string; icona?: NomeIcona }> = {
  fatto: { testo: 'Fatto', icona: 'fatto' },
  sostituito: { testo: 'Sostituito', icona: 'sostituito' },
  saltato: { testo: 'Saltato', icona: 'saltato' },
  libero: { testo: 'Libero', icona: 'libero' },
  digiuno: { testo: 'Digiuno', icona: 'digiuno' },
  scelta: { testo: 'Da scegliere', icona: 'avviso' },
  amazon: { testo: 'Amazon' },
  fresco: { testo: 'Fresco' },
  esterno: { testo: 'Esterno' },
  base: { testo: 'Base' },
};
export function Badge({ tipo, testo }: { tipo: TipoBadge; testo?: string }) {
  const b = BADGE[tipo];
  return (
    <span className={`badge badge-${tipo}`}>
      {b.icona && <Icona nome={b.icona} dim={14} />}
      {testo ?? b.testo}
    </span>
  );
}

// ---------- Bottom sheet ----------
interface PropsSheet {
  aperto: boolean;
  titolo: string;
  onChiudi: () => void;
  children: ReactNode;
  /** contenuto fisso in basso (es. pulsante Conferma) */
  piede?: ReactNode;
  pieno?: boolean;
}
export function Sheet({ aperto, titolo, onChiudi, children, piede, pieno }: PropsSheet) {
  const ref = useRef<HTMLDivElement>(null);
  const [spost, setSpost] = useState(0);
  const inizioY = useRef<number | null>(null);

  useEffect(() => {
    if (!aperto) return;
    const precedente = document.activeElement as HTMLElement | null;
    ref.current?.focus();
    const tasto = (e: KeyboardEvent) => { if (e.key === 'Escape') onChiudi(); };
    document.addEventListener('keydown', tasto);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', tasto);
      document.body.style.overflow = '';
      precedente?.focus?.();
    };
  }, [aperto, onChiudi]);

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
          <h2>{titolo}</h2>
          <button className="btn-icona" onClick={onChiudi} aria-label="Chiudi"><Icona nome="chiudi" /></button>
        </div>
        <div className="sheet-corpo">{children}</div>
        {piede && <div className="sheet-piede">{piede}</div>}
      </div>
    </div>
  );
}

export interface VoceOpzione { id: string; etichetta: string; dettaglio?: string; sezione?: string }

/** Sheet con righe radio e pulsante Conferma. */
export function SheetOpzioni({
  aperto, titolo, opzioni, valore, onConferma, onChiudi,
}: {
  aperto: boolean; titolo: string; opzioni: VoceOpzione[]; valore?: string;
  onConferma: (id: string) => void; onChiudi: () => void;
}) {
  const [sel, setSel] = useState<string | undefined>(valore);
  useEffect(() => { if (aperto) setSel(valore); }, [aperto, valore]);
  const sezioni: { titolo?: string; voci: VoceOpzione[] }[] = [];
  for (const o of opzioni) {
    const ultima = sezioni[sezioni.length - 1];
    if (ultima && ultima.titolo === o.sezione) ultima.voci.push(o);
    else sezioni.push({ titolo: o.sezione, voci: [o] });
  }
  return (
    <Sheet
      aperto={aperto} titolo={titolo} onChiudi={onChiudi}
      piede={<button className="btn btn-primario" disabled={!sel} onClick={() => sel && onConferma(sel)}>Conferma</button>}
    >
      {sezioni.map((s, i) => (
        <div key={i} role="radiogroup" aria-label={s.titolo ?? titolo}>
          {s.titolo && <h3 className="sezione-titolo">{s.titolo}</h3>}
          {s.voci.map((o) => (
            <label key={o.id} className={`radio-riga${sel === o.id ? ' attiva' : ''}`}>
              <input type="radio" name="opzione" checked={sel === o.id} onChange={() => setSel(o.id)} />
              <span className="radio-testo">
                <span>{o.etichetta}</span>
                {o.dettaglio && <span className="tenue num">{o.dettaglio}</span>}
              </span>
            </label>
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
              <button className="btn-testo" onClick={() => { toast.annulla?.(); setToast(null); }}>Annulla</button>
            )}
          </div>
        )}
      </div>
    </CtxToast.Provider>
  );
}

// ---------- Stati ----------
export function Vuoto({ icona = 'foglia', titolo, testo, azione }: { icona?: NomeIcona; titolo: string; testo?: string; azione?: ReactNode }) {
  return (
    <div className="vuoto">
      <div className="vuoto-icona"><Icona nome={icona} dim={36} /></div>
      <h2>{titolo}</h2>
      {testo && <p className="tenue">{testo}</p>}
      {azione}
    </div>
  );
}

export function Errore({ testo = 'Non riesco a caricare i dati.', onRiprova }: { testo?: string; onRiprova?: () => void }) {
  return (
    <div className="errore-box" role="alert">
      <Icona nome="errore" />
      <span>{testo}</span>
      {onRiprova && <button className="btn btn-secondario btn-piccolo" onClick={onRiprova}>Riprova</button>}
    </div>
  );
}

export function Scheletri({ n = 2 }: { n?: number }) {
  return (
    <div aria-busy="true" aria-label="Caricamento">
      {Array.from({ length: n }, (_, i) => <div key={i} className="card scheletro" />)}
    </div>
  );
}

// ---------- Segmented control ----------
export function Segmented<T extends string | number>({
  opzioni, valore, onCambia, etichetta,
}: { opzioni: { valore: T; testo: string }[]; valore: T | undefined; onCambia: (v: T) => void; etichetta: string }) {
  return (
    <div className="segmented" role="radiogroup" aria-label={etichetta}>
      {opzioni.map((o) => (
        <button
          key={String(o.valore)} role="radio" aria-checked={o.valore === valore}
          className={o.valore === valore ? 'attiva' : ''} onClick={() => onCambia(o.valore)}
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

export function useStabile<T>(v: T): T {
  return useMemo(() => v, [v]);
}
