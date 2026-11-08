"use client";

import { useState } from "react";
import Link from "next/link";
import type { Kid } from "@/data/kids";

/** Crea la contraseña: campo resaltado del mockup (borde coral claro). */
const passwordInputClasses =
  "mb-[18px] w-full rounded-[14px] border-[1.5px] border-[#F2A78E] bg-white px-4 py-[14px] text-[15px] text-heading outline-none placeholder:text-[#B6A99B]";

/** Invitación de un padre pendiente: precargada, checkbox de consentimiento y activación. */
export function ActivateForm({ kid }: { kid: Kid }) {
  // false → "Activar mi cuenta" deshabilitado (decisión del spec)
  const [consent, setConsent] = useState(false);

  const activateButtonClasses = `block rounded-[15px] py-[15px] text-center text-[16px] font-extrabold text-white ${
    consent
      ? "bg-gradient-to-b from-gradient-from to-gradient-to shadow-[0_10px_22px_-8px_rgba(238,129,100,0.7)]"
      : "cursor-not-allowed bg-[#F0B49F] opacity-60"
  }`;

  return (
    <div className="w-full max-w-[440px]">
      {/* Pill del logo */}
      <div className="mb-[22px] flex h-[58px] w-[58px] items-center justify-center rounded-[18px] bg-gradient-to-br from-avatar-gradient-from to-avatar-gradient-to shadow-[0_12px_26px_-10px_rgba(238,129,100,0.65)]">
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </svg>
      </div>

      <h1 className="mb-2 font-heading text-[32px] leading-[1.15] font-semibold text-heading">Bienvenida a OpenDayCare</h1>
      <p className="mb-[26px] text-[15.5px] leading-[1.55] text-muted-strong">
        Te invitaron a seguir el día de tu hijo. Creá tu contraseña para activar la cuenta.
      </p>

      {/* Tarjeta de invitación con los datos del niño */}
      <div className="mb-[22px] flex items-center gap-[14px] rounded-[16px] border-[1.5px] border-[#EADFD0] bg-white px-4 py-[14px]">
        <span
          style={{ backgroundColor: kid.avatarBg, color: kid.avatarText }}
          className="flex h-11 w-11 flex-none items-center justify-center rounded-full font-heading text-[19px] font-semibold"
        >
          {kid.initial}
        </span>
        <span>
          <span className="block text-[13px] text-muted">Te invitaron a seguir a</span>
          <span className="block font-heading text-[17px] font-semibold text-heading">
            {kid.name.split(" ")[0]} · Sala {kid.room}
          </span>
        </span>
      </div>

      {/* CÓDIGO DE INVITACIÓN: literal del mockup */}
      <div className="mb-2 text-[12px] font-bold tracking-[0.7px] text-muted-strong">CÓDIGO DE INVITACIÓN</div>
      <input
        defaultValue="7K4P9"
        className="mb-[18px] w-full rounded-[14px] border-[1.5px] border-[#EADFD0] bg-white px-4 py-[14px] font-heading text-[18px] font-bold tracking-[3px] text-heading outline-none"
      />

      {/* EMAIL de la madre invitada (literal del mockup) */}
      <div className="mb-2 text-[12px] font-bold tracking-[0.7px] text-muted-strong">EMAIL</div>
      <input
        type="email"
        defaultValue="lucia.fernandez@gmail.com"
        className="mb-[18px] w-full rounded-[14px] border-[1.5px] border-[#EADFD0] bg-white px-4 py-[14px] text-[15px] text-heading outline-none placeholder:text-[#B6A99B]"
      />

      <div className="mb-2 text-[12px] font-bold tracking-[0.7px] text-muted-strong">CREAR CONTRASEÑA</div>
      <input type="password" defaultValue="contraseña" className={passwordInputClasses} />

      {/* Consentimiento de fotos: obligatorio para habilitar el botón */}
      <label className="mb-6 flex cursor-pointer items-start gap-3 rounded-[14px] bg-[#FBF1D6] px-4 py-[14px]">
        <input
          type="checkbox"
          checked={consent}
          onChange={(event) => setConsent(event.target.checked)}
          className="sr-only"
        />
        <span
          className={`mt-px flex h-6 w-6 flex-none items-center justify-center rounded-lg ${
            consent ? "bg-[#5FB97E]" : "border-[1.5px] border-[#E4D6C4] bg-white"
          }`}
        >
          {consent && (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
        </span>
        <span className="text-[14px] leading-[1.45] text-[#8A7234]">
          Autorizo a la guardería a tomar y compartir fotos de mi hijo dentro de la app.
        </span>
      </label>

      {/* Sin consent → <span> deshabilitado, sin navegación (gating del spec) */}
      {consent ? (
        <Link href="/familia-feed" className={activateButtonClasses}>
          Activar mi cuenta
        </Link>
      ) : (
        <span className={activateButtonClasses} aria-disabled="true">
          Activar mi cuenta
        </span>
      )}

      <p className="mx-0 mt-[22px] text-center text-[14.5px] text-muted-strong">
        ¿Ya tenés cuenta?{" "}
        <Link href="/login" className="font-extrabold text-accent-strong">
          Iniciar sesión
        </Link>
      </p>
    </div>
  );
}
