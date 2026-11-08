import Link from "next/link";

/** Columna derecha del login: título, campos, link de recuperación y CTA a /feed. */
export function LoginForm() {
  return (
    <div className="w-full max-w-[392px]">
      <h2 className="mb-[6px] font-heading text-[30px] font-semibold text-heading">Iniciar sesión</h2>
      <p className="mb-[28px] text-[15px] text-muted-strong">Ingresá para ver el día de hoy.</p>

      {/* EMAIL: precargado con la cuenta demo (revisión del usuario sobre la versión "vacío" del spec) */}
      <div className="mb-2 text-[12px] font-bold tracking-[0.7px] text-muted-strong">EMAIL</div>
      <input
        type="email"
        defaultValue="caro@opendaycare.com"
        className="mb-[18px] w-full rounded-[14px] border-[1.5px] border-[#EADFD0] bg-white px-4 py-[14px] text-[15px] text-heading outline-none placeholder:text-[#B6A99B]"
      />

      <div className="mb-2 text-[12px] font-bold tracking-[0.7px] text-muted-strong">CONTRASEÑA</div>
      <input
        type="password"
        placeholder="••••••••"
        className="mb-[10px] w-full rounded-[14px] border-[1.5px] border-[#EADFD0] bg-white px-4 py-[14px] text-[15px] text-heading outline-none placeholder:text-[#B6A99B]"
      />

      <div className="mb-5 text-right">
        <Link href="/forgot-password" className="text-[13.5px] font-bold text-accent-strong">
          ¿Olvidaste tu contraseña?
        </Link>
      </div>

      {/* CTA: link directo a /feed, sin validación (decisión del spec) */}
      <Link
        href="/feed"
        className="block rounded-[15px] bg-gradient-to-b from-gradient-from to-gradient-to py-[15px] text-center text-[16px] font-extrabold text-white shadow-[0_10px_22px_-8px_rgba(238,129,100,0.7)]"
      >
        Iniciar sesión
      </Link>

      <p className="mx-0 mt-6 text-center text-[14.5px] text-muted-strong">
        ¿Te invitó la guardería?{" "}
        <Link href="/activate-account" className="font-extrabold text-accent-strong">
          Activá tu cuenta
        </Link>
      </p>
    </div>
  );
}
