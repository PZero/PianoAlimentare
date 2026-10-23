// SOLO SVILUPPO: apre direttamente "Controlla il piano" sul piano di esempio.
import { useMemo } from 'react';
import { Importa } from '../ui/Importa';
import { pianoDaControllare } from './datiDemo';

export default function DemoImporta() {
  const piano = useMemo(pianoDaControllare, []);
  return <Importa pianoDemo={piano} />;
}
