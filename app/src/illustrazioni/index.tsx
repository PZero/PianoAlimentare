// Indice delle illustrazioni a tratto: un componente per soggetto + selettore per nome.
import type { ComponentType } from 'react';
import { Bilancia } from './Bilancia';
import { Carne } from './Carne';
import { Carrello } from './Carrello';
import { Cereali } from './Cereali';
import { Ciotola } from './Ciotola';
import { Cloche } from './Cloche';
import { Digiuno } from './Digiuno';
import { Formaggio } from './Formaggio';
import { Frullato } from './Frullato';
import { Frutta } from './Frutta';
import { Germoglio } from './Germoglio';
import type { PropsIllu } from './Illu';
import { Insalata } from './Insalata';
import { Legumi } from './Legumi';
import { Libero } from './Libero';
import { Orologio } from './Orologio';
import { Pane } from './Pane';
import { Pesce } from './Pesce';
import { Piatto } from './Piatto';
import { Tazza } from './Tazza';
import { Uova } from './Uova';
import { Verdura } from './Verdura';
import { Yogurt } from './Yogurt';
import type { NomeIllustrazione } from './paroleChiave';

export type { PropsIllu, Accento } from './Illu';
export type { NomeIllustrazione } from './paroleChiave';
export { illustrazionePiatto, illustrazioneCella, type Scelta } from './scelta';
export {
  Bilancia, Carne, Carrello, Cereali, Ciotola, Cloche, Digiuno, Formaggio, Frullato, Frutta, Germoglio, Insalata,
  Legumi, Libero, Orologio, Pane, Pesce, Piatto, Tazza, Uova, Verdura, Yogurt,
};

const MAPPA: Record<NomeIllustrazione, ComponentType<PropsIllu>> = {
  Piatto, Ciotola, Insalata, Legumi, Pesce, Carne, Uova, Formaggio, Pane, Cereali, Frutta, Verdura, Frullato, Yogurt,
  Tazza, Libero, Digiuno, Carrello, Bilancia, Germoglio, Orologio, Cloche,
};

/** Illustrazione scelta per nome. */
export function Illustrazione({ nome, ...p }: PropsIllu & { nome: NomeIllustrazione }) {
  const C = MAPPA[nome];
  return <C {...p} />;
}
