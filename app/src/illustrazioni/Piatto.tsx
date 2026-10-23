import { Illu, type PropsIllu } from './Illu';

export function Piatto(p: PropsIllu) {
  return (
    <Illu {...p}>
      <circle cx="48" cy="48" r="38" />
      <circle cx="48" cy="48" r="27" className="fine" />
      <path className="acc-f" d="M40 52C41 41 51 36 59 39C58 49 50 56 40 52Z" />
      <path className="acc fine" d="M40 52L53 43" />
    </Illu>
  );
}
