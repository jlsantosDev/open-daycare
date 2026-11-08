/* Logo del mockup: ícono sol + wordmark en Fredoka */
const LOGO = (
  <div className="relative flex items-center gap-[13px]">
    <div className="flex h-[46px] w-[46px] items-center justify-center rounded-[14px] bg-white/20">
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </svg>
    </div>
    <span className="font-heading text-[21px] font-semibold tracking-[0.5px]">OpenDayCare</span>
  </div>
);

/** Panel corporativo izquierdo del login: degradado coral + logo + claim + pie. */
export function LoginPanel() {
  return (
    <div className="relative flex flex-col justify-between overflow-hidden bg-[linear-gradient(155deg,#F6A98E_0%,#F2937A_45%,#EC7E62_100%)] px-8 py-10 text-white md:px-[60px] md:py-[56px]">
      {/* Círculos decorativos translúcidos del mockup */}
      <div className="absolute -top-[140px] right-0 h-[420px] w-[420px] rounded-full bg-white/10 md:-right-[120px]"></div>
      <div className="absolute -bottom-[110px] -left-[80px] h-[300px] w-[300px] rounded-full bg-white/10"></div>

      <div className="relative">{LOGO}</div>

      <div className="relative mt-10 md:mt-0">
        <h1 className="mb-[18px] font-heading text-[34px] leading-[1.12] font-semibold md:text-[42px]">
          El día de cada niño,<br className="hidden md:block" /> compartido con su familia.
        </h1>
        <p className="max-w-[430px] text-[17px] leading-[1.6] text-white/90">
          Publicá momentos, gestioná las salas y mantené a las familias cerca, desde un solo lugar.
        </p>
      </div>

      {/* Pie del panel: solo desktop (el spec lo oculta en el apilado <768px) */}
      <div className="relative mt-10 hidden text-[14px] text-white/90 md:mt-0 md:block">
        🌿 Guardería Sala Soles
      </div>
    </div>
  );
}
