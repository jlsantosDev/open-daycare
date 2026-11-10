"use client";

import { useEffect, useState } from "react";

type LinkParentModalProps = {
  kidName: string;
  relationOptions: readonly string[];
  placeholderInvitation: { readonly code: string; readonly expiresIn: string };
  onClose: () => void;
};

type LinkParentErrors = { name?: string; email?: string; relation?: string };

/** Formato mínimo x@y.z (SPEC 05): rechaza "pepe", "pepe@", "pepe@ejemplo". */
function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

const infoIcon = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4E72C8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flex: "none", marginTop: 1 }}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 16v-4M12 8h.01" />
  </svg>
);

const sendIcon = (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m22 2-7 20-4-9-9-4z" />
    <path d="M22 2 11 13" />
  </svg>
);

const fieldClass =
  "w-full rounded-[14px] border-[1.5px] border-[#EADFD0] bg-white px-4 py-[13px] text-[15px] text-heading placeholder:text-[#B6A99B] focus:outline-none";

const eyebrowClass = "mb-2 text-[12px] font-extrabold tracking-[0.7px] text-muted-strong";
const errorClass = "mt-[6px] text-[12.5px] font-bold text-accent";
const chipClass =
  "flex-1 rounded-full border-[1.5px] py-[11px] text-[14px] font-extrabold";

/**
 * Modal del mockup `references/pantallas/vincular-padre.dc.html`, abierto por
 * el botón "Vincular otro padre" de la tarjeta PADRES VINCULADOS en /kids/[id].
 * Cierra con la X, Esc y click en el fondo; un envío válido solo cierra
 * (SPEC 05: la invitación real va en otro spec).
 */
export function LinkParentModal({ kidName, relationOptions, placeholderInvitation, onClose }: LinkParentModalProps) {
  const [relation, setRelation] = useState<string | null>(null);
  const [errors, setErrors] = useState<LinkParentErrors>({});

  // El padre monta el modal solo cuando está abierto: cada apertura arranca
  // limpio (state y inputs DOM) por remount, sin efectos de reset.

  // Esc cierra el modal sin descartar cambios ni confirmar nada.
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const firstName = kidName.split(" ")[0];

  // Al tipear/cambiar, el error de ese campo deja de aplicarse.
  const clearError = (field: keyof LinkParentErrors) => {
    setErrors((current) => (current[field] ? { ...current, [field]: undefined } : current));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") ?? "");
    const email = String(data.get("email") ?? "");

    const nextErrors: LinkParentErrors = {};
    if (name.trim() === "") nextErrors.name = "Ingresá el nombre del padre o madre.";
    if (email.trim() === "") {
      nextErrors.email = "Ingresá el email.";
    } else if (!isValidEmail(email)) {
      nextErrors.email = "Ingresá un email válido.";
    }
    if (relation === null) nextErrors.relation = "Elegí el parentesco.";

    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) {
      // Focus al primer campo con error, en el orden del formulario.
      const order = ["name", "email", "relation"] as const;
      if (nextErrors.name || nextErrors.email) {
        const firstField = order.find((field) => nextErrors[field] && field !== "relation");
        if (firstField) event.currentTarget.querySelector<HTMLElement>(`[name="${firstField}"]`)?.focus();
      } else {
        // Relation: focus al primer chip.
        event.currentTarget.querySelector<HTMLButtonElement>('[role="group"] button')?.focus();
      }
      return;
    }

    // Formulario válido: el botón solo cierra el modal (SPEC 05: la invitación
    // real no existe todavía; no se agrega ningún padre).
    onClose();
  };

  return (
    // Overlay: click fuera de la tarjeta descarta.
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/40 px-4 py-8 sm:px-6 sm:py-10"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      {/* Tarjeta del mockup */}
      <div className="mx-auto w-full max-w-[480px] overflow-hidden rounded-[24px] border border-[#ECE0D0] bg-[#FBF4EC] shadow-[0_20px_50px_-24px_rgba(63,54,46,0.35)]">
        {/* Cabecera: título + subtítulo / X de cierre */}
        <div className="flex items-center justify-between border-b border-[#ECE0D0] px-[26px] py-5">
          <div>
            <div className="font-heading text-[18px] font-semibold text-heading">Vincular padre</div>
            <div className="text-[13px] text-muted">a {kidName}</div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="flex h-[34px] w-[34px] flex-none items-center justify-center rounded-[10px] bg-[#F0E6D8] text-[#94887B]"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form noValidate onSubmit={handleSubmit} className="px-[26px] py-[22px]">
          {/* Banner informativo */}
          <div className="mb-5 flex gap-[11px] rounded-[14px] bg-[#E3ECFB] px-4 py-[13px]">
            {infoIcon}
            <span className="text-[13.5px] leading-[1.45] text-[#3F5694]">
              Le enviaremos un correo con un código para que active su cuenta. Solo verá el feed de {firstName}.
            </span>
          </div>

          {/* Nombre del padre/madre */}
          <div className={eyebrowClass}>NOMBRE DEL PADRE/MADRE</div>
          <input
            name="name"
            type="text"
            placeholder="Ej. Diego Fernández"
            aria-invalid={Boolean(errors.name)}
            onChange={() => clearError("name")}
            className={`${fieldClass} mb-[18px] ${errors.name ? "border-accent" : ""}`}
          />
          {errors.name && <p className={`${errorClass} -mt-[12px] mb-[18px]`}>{errors.name}</p>}

          {/* Email */}
          <div className={eyebrowClass}>EMAIL</div>
          <input
            name="email"
            type="email"
            placeholder="correo@ejemplo.com"
            aria-invalid={Boolean(errors.email)}
            onChange={() => clearError("email")}
            className={`${fieldClass} mb-[18px] ${errors.email ? "border-accent" : ""}`}
          />
          {errors.email && <p className={`${errorClass} -mt-[12px] mb-[18px]`}>{errors.email}</p>}

          {/* Parentesco: chips, todos deseleccionados al abrir */}
          <div className="mb-5">
            <div className="mb-[10px] text-[12px] font-extrabold tracking-[0.7px] text-muted-strong">PARENTESCO</div>
            <div role="group" className="flex gap-[9px]">
              {relationOptions.map((option) => (
                <button
                  type="button"
                  key={option}
                  onClick={() => {
                    setRelation(option);
                    clearError("relation");
                  }}
                  aria-pressed={relation === option}
                  className={`${chipClass} ${relation === option ? "border-[#9FB8EC] bg-[#CCD8F4] text-[#4E72C8]" : "border-[#ECE0D0] bg-[#FFFDF9] text-[#6E6359]"}`}
                >
                  {option}
                </button>
              ))}
            </div>
            {errors.relation && <p className={errorClass}>{errors.relation}</p>}
          </div>

          {/* Código de invitación ficticio */}
          <div className="mb-5 rounded-[16px] border-[1.5px] border-dashed border-[#E6D08A] bg-[#FBF1D6] p-[18px] text-center">
            <div className="mb-2 text-[12px] font-extrabold tracking-[0.7px] text-[#A88526]">CÓDIGO DE INVITACIÓN</div>
            <div className="font-heading text-[34px] font-semibold tracking-[7px] text-[#8A7234]">{placeholderInvitation.code}</div>
            <div className="mt-[6px] text-[13px] text-[#A88526]">{placeholderInvitation.expiresIn}</div>
          </div>

          {/* Enviar invitación */}
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-[9px] rounded-[14px] bg-gradient-to-b from-[#F4977E] to-[#EE8164] py-[14px] text-[15.5px] font-extrabold text-white shadow-[0_10px_22px_-8px_rgba(238,129,100,0.7)]"
          >
            {sendIcon}
            Enviar invitación
          </button>
        </form>
      </div>
    </div>
  );
}
