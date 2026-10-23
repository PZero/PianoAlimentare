import { Illu, type PropsIllu } from './Illu';

export function Libero(p: PropsIllu) {
  return (
    <Illu {...p}>
      <g transform="rotate(34 48 48)">
        <path d="M40 10V32M48 10V32M56 10V32" />
        <path d="M40 32C40 42 56 42 56 32" />
        <path d="M48 40V88" />
      </g>
      <g transform="rotate(-34 48 48)">
        <path className="acc-f" d="M48 10C62 16 62 44 48 54Z" />
        <path d="M48 54V88" />
      </g>
      <path className="acc fine" d="M14 20V28M10 24H18M82 66V72M79 69H85" />
    </Illu>
  );
}
