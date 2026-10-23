import { Illu, type PropsIllu } from './Illu';

export function Verdura(p: PropsIllu) {
  return (
    <Illu {...p}>
      <path className="acc-f" d="M60 30L80 46L34 86C31 88 27 85 29 82Z" />
      <path className="acc fine" d="M50 52L57 58M42 62L49 68M60 62L66 67" />
      <path d="M62 31C58 22 61 14 68 11M67 37C72 28 79 24 86 27M58 34C50 28 45 22 47 13" />
    </Illu>
  );
}
