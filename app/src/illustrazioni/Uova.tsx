import { Illu, type PropsIllu } from './Illu';

export function Uova(p: PropsIllu) {
  return (
    <Illu {...p}>
      <path d="M18 54C12 36 30 20 46 25C60 18 82 28 79 46C86 63 66 78 50 73C38 82 16 72 18 54Z" />
      <circle className="acc-f" cx="48" cy="48" r="12" />
      <path className="acc fine" d="M42 44C43 41 45 40 47 40" />
    </Illu>
  );
}
