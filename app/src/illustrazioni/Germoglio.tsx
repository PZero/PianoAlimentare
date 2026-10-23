import { Illu, type PropsIllu } from './Illu';

export function Germoglio(p: PropsIllu) {
  return (
    <Illu {...p}>
      <path d="M48 84V48" />
      <path className="acc-f" d="M48 58C32 60 20 50 20 32C38 32 49 42 48 58Z" />
      <path className="acc fine" d="M48 58C42 48 34 40 20 32" />
      <path className="acc-f" d="M48 46C48 30 60 18 76 18C76 34 64 46 48 46Z" />
      <path className="acc fine" d="M48 46C56 38 64 28 76 18" />
      <path d="M26 84H70" />
      <path d="M34 84C40 77 56 77 62 84" className="fine" />
    </Illu>
  );
}
