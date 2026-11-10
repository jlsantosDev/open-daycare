"use client";

import { useEffect } from "react";
import type { Kid } from "@/data/kids";
import type { PostType } from "@/data/mock";
import { postTypeLabel } from "@/data/mock";

type NewPostModalProps = {
  kids: Kid[];
  typeOptions: readonly PostType[];
  onClose: () => void;
};

/* Colores de los chips TIPO del modal (paleta del mockup crear-publicacion.dc.html) */
const typeChipStyles: Record<PostType, { bg: string; text: string }> = {
  comida: { bg: "#9A7B1E", text: "#ffffff" },
  siesta: { bg: "#E7DCF6", text: "#7B5FC0" },
  actividad: { bg: "#2E89A6", text: "#ffffff" },
  logro: { bg: "#CFEBD8", text: "#3E9B6C" },
  animo: { bg: "#F9D2DE", text: "#C56486" },
  foto: { bg: "#FBD8CC", text: "#D9684A" },
  anuncio: { bg: "#CCD8F4", text: "#4E72C8" },
};

const cameraIcon = (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <circle cx="9" cy="9" r="2" />
    <path d="m21 15-3.6-3.6a2 2 0 0 0-2.8 0L6 21" />
  </svg>
);

const plusIcon = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#C5503A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 5v14M5 12h14" />
  </svg>
);

const eyebrowClass = "mb-[10px] text-[12px] font-extrabold tracking-[0.7px] text-muted-strong";

const kidChipBase =
  "flex cursor-pointer items-center gap-2 rounded-full border-[1.5px] py-[6px] pr-[14px] pl-[6px] text-[14px] font-bold";

const wholeClassChipBase =
  "cursor-pointer rounded-full border-[1.5px] px-4 py-[6px] text-[14px] font-bold";

/**
 * Modal del mockup `references/pantallas/crear-publicacion.dc.html`, abierto por
 * la caja "Compartí un momento…" del feed. Cierra con Cancelar, Esc y click en
 * el fondo (SPEC 06: la lógica de selección y la publicación se suman acá).
 */
export function NewPostModal({ kids, typeOptions, onClose }: NewPostModalProps) {
  // El padre monta el modal solo cuando está abierto: cada apertura arranca
  // limpio (state y textarea) por remount, sin efectos de reset.

  // Esc cierra el modal sin descartar cambios ni confirmar nada.
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    // Overlay: click fuera de la tarjeta descarta.
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/40 px-4 py-8 sm:px-6 sm:py-10"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      {/* Tarjeta del mockup */}
      <div className="mx-auto w-full max-w-[580px] overflow-hidden rounded-[24px] border border-[#ECE0D0] bg-[#FBF4EC] shadow-[0_20px_50px_-24px_rgba(63,54,46,0.35)]">
        {/* Cabecera: Cancelar / título / Publicar */}
        <div className="flex items-center justify-between border-b border-[#ECE0D0] px-[26px] py-5">
          <button type="button" onClick={onClose} className="text-[15px] font-bold text-[#94887B]">
            Cancelar
          </button>
          <span className="font-heading text-[18px] font-semibold text-heading">Nueva publicación</span>
          <button type="button" className="text-[15px] font-extrabold text-[#D9583C]">
            Publicar
          </button>
        </div>

        <div className="px-[26px] py-6">
          {/* PARA: 8 chips de niños + "Toda la sala" */}
          <div className={eyebrowClass}>PARA</div>
          <div role="group" aria-label="Destinatarios" className="mb-[22px] flex flex-wrap gap-[9px]">
            {kids.map((kid) => (
              <button
                type="button"
                key={kid.id}
                aria-pressed={false}
                // Lógica de selección (acumulativa + exclusión con "Toda la sala") en el paso 4
                className={`${kidChipBase} border-[#ECE0D0] bg-[#FFFDF9] text-[#6E6359]`}
              >
                <span
                  className="flex h-[26px] w-[26px] flex-none items-center justify-center rounded-full font-heading text-[13px] font-semibold"
                  style={{ backgroundColor: kid.avatarBg, color: kid.avatarText }}
                >
                  {kid.initial}
                </span>
                {kid.name.split(" ")[0]}
              </button>
            ))}
            <button
              type="button"
              aria-pressed={false}
              className={`${wholeClassChipBase} border-[#ECE0D0] bg-[#FFFDF9] text-[#6E6359]`}
            >
              Toda la sala
            </button>
          </div>

          {/* TIPO: 7 chips, todos deseleccionados al abrir */}
          <div className={eyebrowClass}>TIPO</div>
          <div role="group" aria-label="Tipo de publicación" className="mb-[22px] flex flex-wrap gap-[9px]">
            {typeOptions.map((type) => (
              <button
                type="button"
                key={type}
                aria-pressed={false}
                // Selección única (reemplaza) en el paso 5
                className="cursor-pointer rounded-full px-4 py-2 text-[13.5px] font-extrabold"
                style={{ backgroundColor: typeChipStyles[type].bg, color: typeChipStyles[type].text }}
              >
                {postTypeLabel[type]}
              </button>
            ))}
          </div>

          {/* DESCRIPCIÓN */}
          <div className={eyebrowClass}>DESCRIPCIÓN</div>
          <textarea
            name="description"
            placeholder="Contá cómo le fue hoy…"
            className="mb-[22px] block min-h-[120px] w-full resize-y rounded-[14px] border-[1.5px] border-[#EADFD0] bg-white px-4 py-[14px] text-[15px] leading-[1.5] text-heading placeholder:text-[#B6A99B] focus:outline-none"
          />

          {/* FOTOS: decorativo — el tile no es input ni dispara acciones (SPEC 06) */}
          <div className={eyebrowClass}>FOTOS</div>
          <div className="flex gap-3">
            <div className="flex h-24 w-24 items-center justify-center rounded-[14px] border border-[#ECE0D0] bg-[#F4ECE1] text-[#CBB89F]">
              {cameraIcon}
            </div>
            {/* Elemento decorativo: no es <input type="file"> ni <button>, según spec */}
            <div
              aria-hidden
              className="flex h-24 w-24 flex-col items-center justify-center gap-[6px] rounded-[14px] border-[1.5px] border-dashed border-[#DBCDBA] bg-[#F4ECE1] text-[12px] text-[#B0A290]"
            >
              {plusIcon}
              <span>Agregar</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
