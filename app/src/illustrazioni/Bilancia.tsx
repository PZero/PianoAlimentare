import { Illu, type PropsIllu } from './Illu';

export function Bilancia(p: PropsIllu) {
  return (
    <Illu {...p}>
      <rect x="14" y="22" width="68" height="56" rx="14" />
      <path d="M28 52A20 20 0 0 1 68 52Z" />
      <path className="acc" d="M48 52L58 38" />
      <path d="M33 45L36 47M48 38V41M63 45L60 47" className="fine" />
      <path d="M32 68H40M56 68H64" className="fine" />
    </Illu>
  );
}
