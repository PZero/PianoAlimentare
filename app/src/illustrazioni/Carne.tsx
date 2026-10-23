import { Illu, type PropsIllu } from './Illu';

export function Carne(p: PropsIllu) {
  return (
    <Illu {...p}>
      <path className="acc-f" d="M58 14C76 12 86 32 76 48C68 60 52 58 45 50C36 40 41 16 58 14Z" />
      <path d="M46 52L26 72" />
      <circle cx="21" cy="68" r="6" />
      <circle cx="29" cy="78" r="6" />
      <path className="acc fine" d="M60 24C68 24 73 30 72 37" />
    </Illu>
  );
}
