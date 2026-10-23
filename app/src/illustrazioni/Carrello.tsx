import { Illu, type PropsIllu } from './Illu';

export function Carrello(p: PropsIllu) {
  return (
    <Illu {...p}>
      <path d="M8 18H20L29 62H76" />
      <path d="M22 30H86L78 54H29Z" />
      <path d="M40 30L43 54M56 30L56 54M72 30L69 54" className="fine" />
      <circle cx="36" cy="74" r="5" />
      <circle cx="70" cy="74" r="5" />
      <circle className="acc-f" cx="44" cy="21" r="7" />
      <path className="acc-f" d="M58 29C56 20 62 14 70 14C72 22 66 28 58 29Z" />
    </Illu>
  );
}
