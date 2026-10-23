import type { Diario, StatoPasto } from './tipi';

export const ETICHETTA_STATO: Record<StatoPasto, string> = {
  fatto: 'Fatto', sostituito: 'Sostituito', saltato: 'Saltato',
};

/** Diario con un pasto in più/in meno (non muta l'originale). */
export function conStato(diario: Diario, pastoId: string, stato: StatoPasto | null): Diario {
  const copia = { ...diario };
  if (stato) copia[pastoId] = stato;
  else delete copia[pastoId];
  return copia;
}
