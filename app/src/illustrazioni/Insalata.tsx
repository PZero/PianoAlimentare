import { Illu, type PropsIllu } from './Illu';

export function Insalata(p: PropsIllu) {
  return (
    <Illu {...p}>
      <path d="M14 54H82C82 70 69 80 48 80C27 80 14 70 14 54Z" />
      <path d="M36 85H60" />
      <path className="acc-f" d="M26 54C18 44 24 32 36 29C42 39 38 49 26 54Z" />
      <path className="acc fine" d="M26 54C28 46 31 39 36 29" />
      <path className="acc-f" d="M50 54C46 42 52 30 64 27C68 38 62 49 50 54Z" />
      <path className="acc fine" d="M50 54C54 44 58 36 64 27" />
      <circle cx="72" cy="46" r="6" />
    </Illu>
  );
}
