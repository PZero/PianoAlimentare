import { Illu, type PropsIllu } from './Illu';

export function Pesce(p: PropsIllu) {
  return (
    <Illu {...p}>
      <path d="M10 48C24 28 52 26 70 48C52 70 24 68 10 48Z" />
      <path d="M70 48L88 33L85 48L88 63Z" />
      <path d="M42 31L51 20L60 35" className="fine" />
      <circle cx="26" cy="45" r="1.8" />
      <path className="acc" d="M34 36C30 44 30 52 34 60" />
      <path className="acc fine" d="M46 42C50 47 50 51 46 56M55 43C59 47 59 51 55 55" />
    </Illu>
  );
}
