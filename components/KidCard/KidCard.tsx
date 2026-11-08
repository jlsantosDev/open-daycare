import Link from "next/link";
import type { AllergyBadgeLabel, Kid } from "@/data/kids";

/* Colores del badge de alergia (inline del mockup, no son tokens) */
const allergyBadgeStyles: Record<AllergyBadgeLabel, string> = {
  MANÍ: "bg-[#FBD8CC] text-[#D9684A]",
  LACTOSA: "bg-[#FBD8CC] text-[#D9684A]",
};

/* Badge "VINCULAR" para niños sin padres (inline del mockup) */
const linkBadgeClasses = "bg-[#F9D2DE] text-[#C56486]";

const badgeBaseClasses =
  "flex-none rounded-full px-[9px] py-[5px] text-[11px] font-extrabold tracking-[0.5px]";

const chevronIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#CBB89F" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m9 18 6-6-6-6" />
  </svg>
);

/* "2 padres vinculados / 1 padre vinculado / sin padres vinculados" */
function parentStatusLabel(count: number): string {
  if (count === 0) return "sin padres vinculados";
  if (count === 1) return "1 padre vinculado";
  return `${count} padres vinculados`;
}

/** List card from the kids mockup: avatar with per-kid colors, allergy badge or chevron. */
export function KidCard({ kid }: { kid: Kid }) {
  return (
    <Link
      href={`/kids/${kid.id}`}
      className="flex min-w-0 items-center gap-[14px] rounded-[18px] border border-surface-border bg-surface p-4 shadow-[0_4px_14px_-12px_rgba(120,90,60,0.5)] transition-all duration-150 hover:-translate-y-0.5 hover:border-[#F2A78E]"
    >
      {/* Avatar */}
      <span
        style={{ backgroundColor: kid.avatarBg, color: kid.avatarText }}
        className="flex h-12 w-12 flex-none items-center justify-center rounded-full font-heading text-[19px] font-semibold"
      >
        {kid.initial}
      </span>

      {/* Nombre + estado de padres */}
      <span className="min-w-0 flex-1">
        <span className="block truncate font-heading text-[16px] font-semibold text-heading">{kid.name}</span>
        <span className="block text-[13px] text-muted">
          {kid.age} · {parentStatusLabel(kid.parents.length)}
        </span>
      </span>

      {/* Badge de alergia / VINCULAR / chevron. Etiquetas nuevas del modal
          "Agregar niño" usan los mismos colores del mockup (fallback). */}
      {kid.allergyBadge ? (
        <span
          className={`${badgeBaseClasses} ${allergyBadgeStyles[kid.allergyBadge.label] ?? "bg-[#FBD8CC] text-[#D9684A]"}`}
        >
          {kid.allergyBadge.label}
        </span>
      ) : kid.parents.length === 0 ? (
        <span className={`${badgeBaseClasses} ${linkBadgeClasses}`}>VINCULAR</span>
      ) : (
        chevronIcon
      )}
    </Link>
  );
}
