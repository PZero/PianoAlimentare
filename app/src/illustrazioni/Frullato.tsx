import { Illu, type PropsIllu } from './Illu';

export function Frullato(p: PropsIllu) {
  return (
    <Illu {...p}>
      <path className="acc-f" d="M29 46C36 42 42 50 48 46C54 42 60 50 67 46L64 80C63.5 84 60 86 57 86H39C36 86 32.5 84 32 80Z" />
      <path d="M26 28H70L64 80C63.5 84 60 86 57 86H39C36 86 32.5 84 32 80Z" />
      <path d="M56 28L64 10H74" />
    </Illu>
  );
}
