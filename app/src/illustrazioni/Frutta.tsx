import { Illu, type PropsIllu } from './Illu';

export function Frutta(p: PropsIllu) {
  return (
    <Illu {...p}>
      <path d="M48 32C36 22 16 30 20 54C23 71 38 84 48 77C58 84 73 71 76 54C80 30 60 22 48 32Z" />
      <path d="M48 32C48 26 50 22 54 17" />
      <path className="acc-f" d="M54 24C60 14 71 14 74 19C70 28 61 29 54 24Z" />
      <path className="acc fine" d="M29 47C29 41 33 37 38 36" />
    </Illu>
  );
}
