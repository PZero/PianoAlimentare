import { createContext, useContext } from 'react';
import type { PianoSalvato, ProfiloUtente } from '../domain/tipi';

export interface ContestoApp {
  profilo: ProfiloUtente;
  uid: string;
  piano: PianoSalvato | null;
  caricamentoPiano: boolean;
  errorePiano: boolean;
  riprovaPiano: () => void;
}

export const CtxApp = createContext<ContestoApp | null>(null);

export function useApp(): ContestoApp {
  const c = useContext(CtxApp);
  if (!c) throw new Error('useApp fuori da CtxApp');
  return c;
}
