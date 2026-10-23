import { Illu, type PropsIllu } from './Illu';

export function Orologio(p: PropsIllu) {
  return (
    <Illu {...p}>
      <circle cx="50" cy="48" r="27" />
      <circle cx="50" cy="48" r="20" className="fine" />
      <path className="acc" d="M50 48V32M50 48L61 55" />
      <path d="M50 24V27M74 48H71M50 72V69M26 48H29" className="fine" />
      <path d="M10 28V40M15 28V40M20 28V40M10 40C10 46 20 46 20 40M15 46V74" />
      <path d="M86 28C92 34 92 50 86 56ZM86 56V74" />
    </Illu>
  );
}
