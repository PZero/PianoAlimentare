import { Illu, type PropsIllu } from './Illu';

export function Digiuno(p: PropsIllu) {
  return (
    <Illu {...p}>
      <circle cx="48" cy="48" r="38" />
      <circle cx="48" cy="48" r="27" className="fine" />
      <path className="acc-f" d="M54 33A16 16 0 1 0 63 57A13 13 0 0 1 54 33Z" />
      <path className="acc fine" d="M68 36V42M65 39H71" />
    </Illu>
  );
}
