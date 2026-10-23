// Icone a tratto (24x24, 1.5 px): decorative, il significato sta sempre anche nel testo.
const PERCORSI = {
  oggi: 'M12 4.5a7.5 7.5 0 100 15 7.5 7.5 0 000-15zM12 8.5a3.5 3.5 0 100 7 3.5 3.5 0 000-7zM3 12h1.5M19.5 12H21',
  settimana: 'M5 4h14v16H5zM8.5 8.5h7M8.5 12h7M8.5 15.5h4',
  spesa: 'M4 9h16l-1.6 9.2a1.5 1.5 0 01-1.5 1.3H7.100a1.5 1.5 0 01-1.500-1.300zM8.500 9l2.500-5M15.500 9L13 4',
  peso: 'M5 5h14a1 1 0 011 1v12a1 1 0 01-1 1H5a1 1 0 01-1-1V6a1 1 0 011-1zM8 11a4 4 0 018 0z',
  profilo: 'M12 11.500a3.500 3.500 0 100-7 3.500 3.500 0 000 7zM5 20c0-3.500 3-6 7-6s7 2.500 7 6',
  fatto: 'M5 12.500l4.500 4.500L19 7.500',
  sostituito: 'M4 8h13l-3-3M20 16H7l3 3',
  saltato: 'M6 12h12',
  sinistra: 'M15 5l-7 7 7 7',
  destra: 'M9 5l7 7-7 7',
  giu: 'M5 9l7 7 7-7',
  chiudi: 'M6 6l12 12M18 6L6 18',
  piu: 'M12 5v14M5 12h14',
  carica: 'M12 16V4M7 9l5-5 5 5M4 20h16',
  offline: 'M3 3l18 18M8.500 12.500a5 5 0 017 0M5 9.500a9 9 0 015-2.400M12 19h.01',
  modifica: 'M4 20h4L19 9l-4-4L4 16z',
} as const;

export type NomeIcona = keyof typeof PERCORSI;

export function Icona({ nome, dim = 20 }: { nome: NomeIcona; dim?: number }) {
  return (
    <svg
      width={dim} height={dim} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false"
    >
      <path d={PERCORSI[nome]} />
    </svg>
  );
}
