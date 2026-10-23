import { Illu, type PropsIllu } from './Illu';

export function Ciotola(p: PropsIllu) {
  return (
    <Illu {...p}>
      <path d="M12 46H84C84 66 70 80 48 80C26 80 12 66 12 46Z" />
      <path d="M36 85H60" />
      <path className="acc" d="M36 35C31 30 41 26 36 19M48 35C43 30 53 26 48 19M60 35C55 30 65 26 60 19" />
    </Illu>
  );
}
