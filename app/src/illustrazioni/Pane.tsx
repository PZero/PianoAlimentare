import { Illu, type PropsIllu } from './Illu';

export function Pane(p: PropsIllu) {
  return (
    <Illu {...p}>
      <path d="M14 54C10 34 26 22 48 22C70 22 86 34 82 54V66C82 70 79 72 76 72H20C17 72 14 70 14 66Z" />
      <path d="M20 56C18 44 30 34 48 34C66 34 78 44 76 56" className="fine" />
      <path className="acc" d="M33 30L40 44M47 28L54 43M61 30L67 43" />
    </Illu>
  );
}
