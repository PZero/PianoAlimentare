import { Illu, type PropsIllu } from './Illu';

export function Formaggio(p: PropsIllu) {
  return (
    <Illu {...p}>
      <path d="M10 70V54L50 28L86 42V70Z" />
      <path d="M10 54H86" className="fine" />
      <path d="M50 28L86 42" className="fine" />
      <circle className="acc-f" cx="28" cy="62" r="3.5" />
      <circle className="acc-f" cx="52" cy="61" r="4.5" />
      <circle className="acc-f" cx="73" cy="63" r="2.8" />
    </Illu>
  );
}
