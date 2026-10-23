import { Illu, type PropsIllu } from './Illu';

export function Tazza(p: PropsIllu) {
  return (
    <Illu {...p}>
      <path d="M22 40H66V56C66 68 58 76 44 76C30 76 22 68 22 56Z" />
      <path d="M66 46H72C80 46 80 62 70 62H65" />
      <path d="M14 80H74C70 88 18 88 14 80Z" />
      <path className="acc" d="M34 32C29 27 39 23 34 17M46 32C41 27 51 23 46 17M58 32C53 27 63 23 58 17" />
    </Illu>
  );
}
