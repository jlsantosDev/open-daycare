"use client";

import { useEffect, useState } from "react";
import type { Kid } from "@/data/kids";
import type { Post, PostType } from "@/data/mock";
import { postTypeLabel } from "@/data/mock";

type NewPostModalProps = {
  kids: Kid[];
  typeOptions: readonly PostType[];
  onPublish: (post: Post) => void;
  onClose: () => void;
};

type NewPostErrors = { recipients?: string; type?: string; description?: string };

/* Destinatarios excluyentes: N niños juntos o "Toda la sala", nunca ambos (SPEC 06) */
type Recipients = { mode: "kids"; ids: Set<string> } | { mode: "wholeClass" };

/* Parámetros ya validados para derivar el Post (buildPostFromDraft, SPEC 06) */
type NewPostDraft = {
  mode: "kids" | "wholeClass";
  kidIds: string[];
  typeId: PostType;
  description: string;
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

/* Hora real del momento de publicar en HH:MM 24h (SPEC 06) */
function formatTimeNow(): string {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
}

/* Derivación del Post creado (decisión del usuario, SPEC 06):
   1 niño     → title "{primer nombre}", audience "familia de {nombre}", initial
   N niños    → title "{primero} y {N-1} más", audience "familias de {N} niños", initial del primero
   Toda sala	→ title "Anuncio general", audience "toda la sala", sin initial (megáfono) */
function buildPostFromDraft(kids: Kid[], draft: NewPostDraft): Post {
  const kidById = new Map(kids.map((kid) => [kid.id, kid]));

  let prefill: { title: string; audience: string; initial?: string };
  if (draft.mode === "wholeClass") {
    prefill = { title: "Anuncio general", audience: "toda la sala" };
  } else {
    // La validación garantiza kidIds no vacío y con ids conocidos.
    const selected = draft.kidIds
      .map((id) => kidById.get(id))
      .filter((kid): kid is Kid => Boolean(kid));
    const first = selected[0];
    const firstName = first.name.split(" ")[0];
    if (selected.length === 1) {
      prefill = { title: firstName, audience: `familia de ${first.name}`, initial: first.initial };
    } else {
      prefill = {
        title: `${firstName} y ${selected.length - 1} más`,
        audience: `familias de ${selected.length} niños`,
        initial: first.initial,
      };
    }
  }

  return {
    id: `nueva-${Date.now()}`,
    title: prefill.title,
    initial: prefill.initial,
    time: formatTimeNow(),
    type: draft.typeId,
    audience: prefill.audience,
    text: draft.description,
    likes: 0,
    comments: 0,
  };
}

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
const errorClass = "mt-[6px] text-[12.5px] font-bold text-accent";

const kidChipBase =
  "flex cursor-pointer items-center gap-2 rounded-full border-[1.5px] py-[6px] pr-[14px] pl-[6px] text-[14px] font-bold";
const wholeClassChipBase = "cursor-pointer rounded-full border-[1.5px] px-4 py-[6px] text-[14px] font-bold";

/**
 * Modal del mockup `references/pantallas/crear-publicacion.dc.html`, abierto por
 * la caja "Compartí un momento…" del feed. Publicado válido antepone el post al
 * feed in-memory; cierra con Cancelar, Esc y click en el fondo (SPEC 06).
 */
export function NewPostModal({ kids, typeOptions, onPublish, onClose }: NewPostModalProps) {
  // El padre monta el modal solo cuando está abierto: cada apertura arranca
  // limpio (state y textarea) por remount, sin efectos de reset.
  const [recipients, setRecipients] = useState<Recipients>({ mode: "kids", ids: new Set() });
  const [typeId, setTypeId] = useState<PostType | null>(null);
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<NewPostErrors>({});

  // Esc cierra el modal sin descartar cambios ni confirmar nada.
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Al cambiar una sección, el error vigente de esa sección deja de aplicarse.
  const clearError = (field: keyof NewPostErrors) => {
    setErrors((current) => (current[field] ? { ...current, [field]: undefined } : current));
  };

  // Los clicks suman: toggle individual que no toca a los demás. Desde
  // "Toda la sala", elegir un niño la desactiva (exclusión bidireccional).
  const toggleKid = (id: string) => {
    setRecipients((current) => {
      if (current.mode === "wholeClass") return { mode: "kids", ids: new Set([id]) };
      const ids = new Set(current.ids);
      if (ids.has(id)) ids.delete(id);
      else ids.add(id);
      return { mode: "kids", ids };
    });
    clearError("recipients");
  };

  // Toggle: activar limpia la selección de niños; re-click la desactiva
  // (decisión del usuario, 2026-11-10) y queda el modal sin destinatarios.
  const toggleWholeClass = () => {
    setRecipients((current) =>
      current.mode === "wholeClass" ? { mode: "kids", ids: new Set() } : { mode: "wholeClass" },
    );
    clearError("recipients");
  };

  // Selección única de tipo: elegir otro reemplaza (SPEC 06).
  const selectType = (type: PostType) => {
    setTypeId(type);
    clearError("type");
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const hasRecipients = recipients.mode === "wholeClass" || recipients.ids.size > 0;
    const descriptionText = description.trim();

    if (!hasRecipients || typeId === null || descriptionText === "") {
      const nextErrors: NewPostErrors = {};
      if (!hasRecipients) nextErrors.recipients = "Elegí al menos un destinatario o \"Toda la sala\".";
      if (typeId === null) nextErrors.type = "Elegí el tipo de publicación.";
      if (descriptionText === "") nextErrors.description = "Escribí la descripción.";
      setErrors(nextErrors);

      // Focus al primer problema, en el orden visual (PARA → TIPO → DESCRIPCIÓN).
      if (nextErrors.recipients) {
        event.currentTarget.querySelector<HTMLButtonElement>('[aria-label="Destinatarios"] button')?.focus();
      } else if (nextErrors.type) {
        event.currentTarget.querySelector<HTMLButtonElement>('[aria-label="Tipo de publicación"] button')?.focus();
      } else {
        event.currentTarget.querySelector<HTMLElement>('[name="description"]')?.focus();
      }
      return;
    }

    setErrors({});
    const post = buildPostFromDraft(kids, {
      mode: recipients.mode,
      kidIds: recipients.mode === "kids" ? [...recipients.ids] : [],
      typeId,
      description: descriptionText,
    });
    onPublish(post);
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
      <div className="mx-auto w-full max-w-[580px] overflow-hidden rounded-[24px] border border-[#ECE0D0] bg-[#FBF4EC] shadow-[0_20px_50px_-24px_rgba(63,54,46,0.35)]">
        {/* Cabecera: Cancelar / título / Publicar (gap y padding ajustados para 375px) */}
        <div className="flex items-center justify-between gap-2 border-b border-[#ECE0D0] px-3 py-5 sm:gap-3 sm:px-[26px]">
          <button type="button" onClick={onClose} className="flex-none text-[15px] font-bold text-[#94887B]">
            Cancelar
          </button>
          <span className="font-heading text-[18px] font-semibold text-heading">Nueva publicación</span>
          <button type="submit" form="new-post-form" className="flex-none text-[15px] font-extrabold text-[#D9583C]">
            Publicar
          </button>
        </div>

        <form id="new-post-form" noValidate onSubmit={handleSubmit} className="px-[26px] py-6">
          {/* PARA: 8 chips de niños + "Toda la sala" */}
          <div className={eyebrowClass}>PARA</div>
          <div role="group" aria-label="Destinatarios" className="mb-[22px] flex flex-wrap gap-[9px]">
            {kids.map((kid) => {
              const selected = recipients.mode === "kids" && recipients.ids.has(kid.id);
              return (
                <button
                  type="button"
                  key={kid.id}
                  onClick={() => toggleKid(kid.id)}
                  aria-pressed={selected}
                  className={`${kidChipBase} ${
                    selected ? "border-[#3F362E] bg-[#3F362E] text-white" : "border-[#ECE0D0] bg-[#FFFDF9] text-[#6E6359]"
                  }`}
                >
                  <span
                    className="flex h-[26px] w-[26px] flex-none items-center justify-center rounded-full font-heading text-[13px] font-semibold"
                    style={{ backgroundColor: kid.avatarBg, color: kid.avatarText }}
                  >
                    {kid.initial}
                  </span>
                  {kid.name.split(" ")[0]}
                </button>
              );
            })}
            <button
              type="button"
              onClick={toggleWholeClass}
              aria-pressed={recipients.mode === "wholeClass"}
              className={`${wholeClassChipBase} ${
                recipients.mode === "wholeClass"
                  ? "border-[#3F362E] bg-[#3F362E] text-white"
                  : "border-[#ECE0D0] bg-[#FFFDF9] text-[#6E6359]"
              }`}
            >
              Toda la sala
            </button>
          </div>
          {errors.recipients && <p className={`${errorClass} -mt-[16px] mb-[22px]`}>{errors.recipients}</p>}

          {/* TIPO: 7 chips, todos deseleccionados al abrir; anillo marca el elegido */}
          <div className={eyebrowClass}>TIPO</div>
          <div role="group" aria-label="Tipo de publicación" className="mb-[22px] flex flex-wrap gap-[9px]">
            {typeOptions.map((type) => (
              <button
                type="button"
                key={type}
                onClick={() => selectType(type)}
                aria-pressed={typeId === type}
                // Visual del chip elegido (decisión del usuario 2026-11-10): paleta
                // propia + anillo oscuro con offset sobre el fondo crema de la tarjeta.
                className={`cursor-pointer rounded-full px-4 py-2 text-[13.5px] font-extrabold ${
                  typeId === type ? "ring-2 ring-[#3F362E] ring-offset-2 ring-offset-[#FBF4EC]" : ""
                }`}
                style={{ backgroundColor: typeChipStyles[type].bg, color: typeChipStyles[type].text }}
              >
                {postTypeLabel[type]}
              </button>
            ))}
          </div>
          {errors.type && <p className={`${errorClass} -mt-[16px] mb-[22px]`}>{errors.type}</p>}

          {/* DESCRIPCIÓN */}
          <div className={eyebrowClass}>DESCRIPCIÓN</div>
          <textarea
            name="description"
            value={description}
            onChange={(event) => {
              setDescription(event.target.value);
              clearError("description");
            }}
            aria-invalid={Boolean(errors.description)}
            placeholder="Contá cómo le fue hoy…"
            className="mb-[22px] block min-h-[120px] w-full resize-y rounded-[14px] border-[1.5px] border-[#EADFD0] bg-white px-4 py-[14px] text-[15px] leading-[1.5] text-heading placeholder:text-[#B6A99B] focus:outline-none"
          />
          {errors.description && (
            <p className={`${errorClass} -mt-[16px] mb-[22px]`}>{errors.description}</p>
          )}

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
        </form>
      </div>
    </div>
  );
}
