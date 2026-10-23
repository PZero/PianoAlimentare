// Routing con hash: #/oggi, #/settimana, #/importa/<uid> ...
import { useEffect, useState } from 'react';

function leggi(): string {
  const h = window.location.hash.replace(/^#/, '');
  return h.startsWith('/') ? h : '/oggi';
}

export function useRotta(): string[] {
  const [rotta, setRotta] = useState(leggi);
  useEffect(() => {
    const aggiorna = () => {
      setRotta(leggi());
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', aggiorna);
    return () => window.removeEventListener('hashchange', aggiorna);
  }, []);
  return rotta.split('/').filter(Boolean);
}

export function vai(percorso: string): void {
  window.location.hash = percorso;
}
