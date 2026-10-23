import { Illu, type PropsIllu } from './Illu';

export function Legumi(p: PropsIllu) {
  return (
    <Illu {...p}>
      <path d="M12 66C22 32 58 20 84 26C84 52 54 82 12 66Z" />
      <path d="M18 63C32 42 56 34 78 31" className="fine" />
      <circle className="acc-f" cx="36" cy="54" r="6.5" />
      <circle className="acc-f" cx="52" cy="46" r="6.5" />
      <circle className="acc-f" cx="67" cy="38" r="6.5" />
      <path className="acc" d="M12 66C8 70 7 74 10 78" />
    </Illu>
  );
}
