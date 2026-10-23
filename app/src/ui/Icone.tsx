// Icone a tratto (24x24), decorative: il significato sta sempre anche nel testo.
const PERCORSI = {
  oggi: 'M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4M12 8a4 4 0 100 8 4 4 0 000-8z',
  settimana: 'M4 6h16v14H4zM4 10h16M8 3v4M16 3v4',
  spesa: 'M3 4h2l2.4 11h10.2L20 8H6M9 20a1 1 0 100-2 1 1 0 000 2zM17 20a1 1 0 100-2 1 1 0 000 2z',
  peso: 'M5 6h14l2 14H3zM9 11a3 3 0 006 0',
  profilo: 'M12 12a4 4 0 100-8 4 4 0 000 8zM4 21c0-4 3.6-7 8-7s8 3 8 7',
  fatto: 'M5 12.5l4.5 4.5L19 7.5',
  sostituito: 'M4 8h13l-3-3M20 16H7l3 3',
  saltato: 'M6 12h12',
  libero: 'M12 21a9 9 0 100-18 9 9 0 000 18zM8.5 14.5c1 1.4 2.2 2 3.5 2s2.500-.6 3.500-2M9 9.500h.01M15 9.500h.01',
  digiuno: 'M12 21a9 9 0 100-18 9 9 0 000 18z',
  avviso: 'M12 4l9 16H3zM12 10v4M12 17h.01',
  errore: 'M12 21a9 9 0 100-18 9 9 0 000 18zM12 8v5M12 16h.01',
  orologio: 'M12 21a9 9 0 100-18 9 9 0 000 18zM12 7v5l3 2',
  sinistra: 'M15 5l-7 7 7 7',
  destra: 'M9 5l7 7-7 7',
  giu: 'M5 9l7 7 7-7',
  carica: 'M12 16V4M7 9l5-5 5 5M4 20h16',
  lock: 'M6 11h12v9H6zM8 11V8a4 4 0 018 0v3',
  foglia: 'M12 4c5 4 7 9 0 17-7-8-5-13 0-17zM12 9v9',
  chiudi: 'M6 6l12 12M18 6L6 18',
  offline: 'M3 3l18 18M8.500 12.500a5 5 0 017 0M5 9.500a9 9 0 015-2.400M12 19h.01',
} as const;

export type NomeIcona = keyof typeof PERCORSI;

export function Icona({ nome, dim = 20 }: { nome: NomeIcona; dim?: number }) {
  return (
    <svg
      width={dim} height={dim} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false"
    >
      <path d={PERCORSI[nome]} />
    </svg>
  );
}
