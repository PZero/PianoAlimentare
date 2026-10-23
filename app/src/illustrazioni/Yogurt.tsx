import { Illu, type PropsIllu } from './Illu';

export function Yogurt(p: PropsIllu) {
  return (
    <Illu {...p}>
      <path d="M30 34H66V76C66 79 63 82 60 82H36C33 82 30 79 30 76Z" />
      <rect x="27" y="26" width="42" height="8" rx="3" />
      <path d="M30 50H66" className="fine" />
      <circle className="acc-f" cx="48" cy="65" r="7" />
      <path className="acc" d="M76 78L86 46" />
      <ellipse className="acc" cx="87" cy="39" rx="4" ry="7" transform="rotate(15 87 39)" />
    </Illu>
  );
}
