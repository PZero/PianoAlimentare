import { Illu, type PropsIllu } from './Illu';

export function Cloche(p: PropsIllu) {
  return (
    <Illu {...p}>
      <path d="M14 64C14 40 28 28 48 28C68 28 82 40 82 64Z" />
      <path d="M8 68H88" />
      <path d="M16 74H80" className="fine" />
      <circle cx="48" cy="21" r="4.5" />
      <path d="M48 25.5V28" />
      <path className="acc" d="M26 56C27 47 33 40 41 36" />
      <path className="acc fine" d="M70 14V22M66 18H74M20 20V25M17.5 22.5H22.5" />
    </Illu>
  );
}
