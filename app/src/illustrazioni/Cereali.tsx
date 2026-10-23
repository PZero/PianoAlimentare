import { Illu, type PropsIllu } from './Illu';

export function Cereali(p: PropsIllu) {
  return (
    <Illu {...p}>
      <path d="M48 86V30" />
      <path className="acc-f" d="M48 24C42 20 42 12 48 8C54 12 54 20 48 24Z" />
      <path className="acc-f" d="M48 42C38 42 33 35 34 28C44 28 49 34 48 42Z" />
      <path className="acc-f" d="M48 42C58 42 63 35 62 28C52 28 47 34 48 42Z" />
      <path className="acc-f" d="M48 60C38 60 33 53 34 46C44 46 49 52 48 60Z" />
      <path className="acc-f" d="M48 60C58 60 63 53 62 46C52 46 47 52 48 60Z" />
      <path d="M48 76C40 78 35 72 34 66" className="fine" />
      <path d="M48 76C56 78 61 72 62 66" className="fine" />
    </Illu>
  );
}
