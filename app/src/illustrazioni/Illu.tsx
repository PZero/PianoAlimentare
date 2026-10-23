// Contenitore comune delle illustrazioni a tratto (docs/DESIGN.md, sezione 4).
import type { ReactNode } from 'react';

export type Accento = 'terracotta' | 'salvia';
export type Misura = 's' | 'm' | 'l';

export interface PropsIllu {
  /** s=48, m=96, l=176 oppure un numero di pixel */
  misura?: Misura | number;
  accento?: Accento;
  /** se presente l'illustrazione è un'immagine con titolo, altrimenti è decorativa */
  titolo?: string;
  className?: string;
}

const PX: Record<Misura, number> = { s: 48, m: 96, l: 176 };

export function Illu({ misura = 'm', accento = 'terracotta', titolo, className, children }: PropsIllu & { children: ReactNode }) {
  const px = typeof misura === 'number' ? misura : PX[misura];
  return (
    <svg
      className={`illu illu-${accento}${className ? ` ${className}` : ''}`}
      width={px} height={px} viewBox="0 0 96 96" fill="none"
      role={titolo ? 'img' : undefined} aria-label={titolo} aria-hidden={titolo ? undefined : true} focusable="false"
    >
      {children}
    </svg>
  );
}
