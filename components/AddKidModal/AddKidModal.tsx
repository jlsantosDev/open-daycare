"use client";

import { useEffect, useState } from "react";

/** Valores crudos del formulario; KidsSection deriva el Kid al guardar. */
export type AddKidDraft = {
  name: string;
  birthDate: string;
  room: string;
  allergies: string;
  medicalNotes: string;
};

type AddKidModalProps = {
  open: boolean;
  roomOptions: readonly string[];
  onAdd: (draft: AddKidDraft) => void;
  onClose: () => void;
};

const chevronIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#B0A290" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m6 9 6 6 6-6" />
  </svg>
);

const fieldClass =
  "w-full rounded-[14px] border-[1.5px] border-[#EADFD0] bg-white px-4 py-[13px] text-[15px] text-heading placeholder:text-[#B6A99B] focus:outline-none";

const eyebrowClass = "mb-2 text-[12px] font-extrabold tracking-[0.7px] text-muted-strong";

/**
 * Modal del mockup `references/pantallas/agregar-nino.dc.html`, abierto por
 * el botón "Agregar niño" de /kids. Cierra con Cancelar, Esc y click en el
 * fondo. Las validaciones llegan en el paso 3 del plan (SPEC 04).
 */
export function AddKidModal({ open, roomOptions, onAdd, onClose }: AddKidModalProps) {
  const [room, setRoom] = useState("");

  // Esc cierra el modal sin descartar cambios ni confirmar nada.
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const handleSave = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    onAdd({
      name: String(data.get("name") ?? ""),
      birthDate: String(data.get("birthDate") ?? ""),
      room,
      allergies: String(data.get("allergies") ?? ""),
      medicalNotes: String(data.get("medicalNotes") ?? ""),
    });
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
      <div className="mx-auto w-full max-w-[520px] overflow-hidden rounded-[24px] border border-[#ECE0D0] bg-[#FBF4EC] shadow-[0_20px_50px_-24px_rgba(63,54,46,0.35)]">
        <div className="flex items-center justify-between border-b border-[#ECE0D0] px-[26px] py-5">
          <button type="button" onClick={onClose} className="text-[15px] font-bold text-muted-strong">
            Cancelar
          </button>
          <span className="font-heading text-[18px] font-semibold text-heading">Agregar niño</span>
          <button type="submit" form="add-kid-form" className="text-[15px] font-extrabold text-accent">
            Guardar
          </button>
        </div>

        <form id="add-kid-form" onSubmit={handleSave} className="px-[26px] py-6">
          {/* Nombre completo */}
          <div className={eyebrowClass}>NOMBRE COMPLETO</div>
          <input
            name="name"
            type="text"
            placeholder="Ej. Martina López"
            className={`${fieldClass} mb-[18px]`}
          />

          {/* Fecha de nacimiento + Sala: apiladas en móvil, fila en ≥640px */}
          <div className="mb-[18px] grid grid-cols-1 gap-[14px] sm:grid-cols-2">
            <div>
              <div className={eyebrowClass}>FECHA DE NACIMIENTO</div>
              <input name="birthDate" type="text" placeholder="dd/mm/aaaa" className={fieldClass} />
            </div>
            <div>
              <div className={eyebrowClass}>SALA</div>
              <div className="relative">
                <select
                  name="room"
                  value={room}
                  onChange={(event) => setRoom(event.target.value)}
                  aria-label="Sala"
                  className={`${fieldClass} appearance-none pr-10 font-bold ${room === "" ? "text-muted" : "text-heading"}`}
                >
                  <option value="" disabled hidden>
                    Seleccioná sala…
                  </option>
                  {roomOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">{chevronIcon}</span>
              </div>
            </div>
          </div>

          {/* Alergias (etiquetas) */}
          <div className={eyebrowClass}>ALERGIAS (ETIQUETAS)</div>
          <input
            name="allergies"
            type="text"
            placeholder="Ej. Maní, Lactosa"
            className={`${fieldClass} mb-[18px]`}
          />

          {/* Notas médicas */}
          <div className={eyebrowClass}>NOTAS MÉDICAS</div>
          <textarea
            name="medicalNotes"
            placeholder="Indicaciones, medicación, contactos…"
            className={`${fieldClass} min-h-[90px] resize-y leading-[1.5]`}
          />
        </form>
      </div>
    </div>
  );
}
