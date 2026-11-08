"use client";

import { useState } from "react";
import { AddKidModal, type AddKidDraft } from "@/components/AddKidModal/AddKidModal";
import { KidsBrowser } from "@/components/KidsBrowser/KidsBrowser";
import { kids as staticKids, roomOptions, type Kid } from "@/data/kids";

const plusIcon = (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 5v14M5 12h14" />
  </svg>
);

/* Paleta fija para avatares de altas; rota por el nombre (espeja los colores de data/kids.ts). */
const avatarPalette = [
  { bg: "#A9D9E8", text: "#1F7A93" },
  { bg: "#F4B8CC", text: "#C44A7A" },
  { bg: "#B9DEC4", text: "#3E8B62" },
  { bg: "#C9B6E8", text: "#7B5FC0" },
  { bg: "#F4DC8E", text: "#9A7B1E" },
];

const MONTHS_ES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

/* "15/06/2022" → "15 jun 2022" (asume fecha ya validada por el modal). */
function formatBirthDate(value: string): string {
  const [day, month, year] = value.split("/").map(Number);
  return `${day} ${MONTHS_ES[month - 1]} ${year}`;
}

/* Edad al momento del alta: "X años", o "N meses" si tiene menos de 1. */
function ageLabel(birthDate: string, today: Date): string {
  const [day, month, year] = birthDate.split("/").map(Number);
  const years = today.getFullYear() - year;
  const hadBirthdayThisYear = today.getMonth() > month - 1 || (today.getMonth() === month - 1 && today.getDate() >= day);
  if (years >= 1 && hadBirthdayThisYear) return `${years} años`;
  if (years > 1) return `${years - 1} años`;
  // Menos de 1 año: meses completos vividos, mínimo 0.
  const months = (today.getFullYear() - year) * 12 + (today.getMonth() - (month - 1)) - (today.getDate() < day ? 1 : 0);
  return months === 1 ? "1 mes" : `${months} meses`;
}

/* "Martina López" → "martina-lopez" (sin acentos, como los ids de data/kids.ts). */
function slugify(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/* Id único: sufijo incremental si el slug colisiona con uno existente. */
function uniqueId(base: string, existingIds: Set<string>): string {
  if (!existingIds.has(base)) return base;
  let suffix = 2;
  while (existingIds.has(`${base}-${suffix}`)) suffix += 1;
  return `${base}-${suffix}`;
}

/** Deriva el Kid del alta: solo datos provistos por el usuario + fecha del alta. */
function deriveKid(draft: AddKidDraft, existingIds: Set<string>, today: Date): Kid {
  const name = draft.name.trim();
  const palette = avatarPalette[name.length % avatarPalette.length];
  // Primera etiqueta de alergias en mayúsculas: "Maní, Lactosa" → "MANÍ".
  const firstAllergy = draft.allergies
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean)[0];

  return {
    id: uniqueId(slugify(name), existingIds),
    name,
    initial: name.charAt(0).toUpperCase(),
    age: ageLabel(draft.birthDate, today),
    avatarBg: palette.bg,
    avatarText: palette.text,
    allergyBadge: firstAllergy ? { label: firstAllergy.toUpperCase() } : undefined,
    allergyNote: draft.medicalNotes.trim() || undefined,
    birthDate: formatBirthDate(draft.birthDate),
    room: draft.room,
    // El tipo Kid exige `enrolled` y el form no lo captura: fecha del alta (decisión del usuario).
    enrolled: `${MONTHS_ES[today.getMonth()]} ${today.getFullYear()}`,
    parents: [],
  };
}

/**
 * Encabezado + botón "Agregar niño" + search/grid de `/kids`. Único dueño del
 * estado de la lista: los 8 niños estáticos + las altas del modal (in-memory,
 * se pierden al refrescar). El modal se monta solo cuando está abierto para
 * que cada apertura arranque limpio (remount).
 */
export function KidsSection() {
  const [kids, setKids] = useState(staticKids);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAdd = (draft: AddKidDraft) => {
    setKids((current) => [...current, deriveKid(draft, new Set(current.map((kid) => kid.id)), new Date())]);
    setIsModalOpen(false);
  };

  return (
    <>
      {/* Encabezado */}
      <div className="mb-[22px] flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="mb-1 text-[12.5px] font-extrabold tracking-[0.8px] text-accent">GESTIÓN</div>
          <h1 className="m-0 font-heading text-[30px] font-semibold text-heading">Niños</h1>
        </div>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 rounded-[14px] bg-gradient-to-b from-gradient-from to-gradient-to px-[18px] py-[11px] text-[14.5px] font-extrabold text-white shadow-[0_8px_18px_-8px_rgba(238,129,100,0.7)]"
        >
          {plusIcon}
          Agregar niño
        </button>
      </div>

      {/* Búsqueda + contador + grid */}
      <KidsBrowser kids={kids} />

      {/* Modal montado solo si está abierto: reset limpio por remount */}
      {isModalOpen && (
        <AddKidModal
          open
          roomOptions={roomOptions}
          onAdd={handleAdd}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
}
