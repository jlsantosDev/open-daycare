import Link from "next/link";
import type { Kid, Parent } from "@/data/kids";

/* Badge según estado del padre (token para ACTIVA, inline para PENDIENTE) */
const statusBadgeClasses = { activa: "bg-badge-achievement-bg text-badge-achievement-text", pendiente: "bg-[#F7E7A6] text-[#9A7B1E]" } as const;

/* "Mamá · activa" | "Papá · invitación enviada" */
const relationLabel = (parent: Parent) =>
  `${parent.relation} · ${parent.status === "pendiente" ? "invitación enviada" : parent.status}`;

/** "PADRES VINCULADOS" card: read-only list + link to /kids/[id]/link-parent. */
export function ParentsCard({ kid }: { kid: Kid }) {
  return (
    <div className="rounded-[16px] border border-surface-border bg-surface px-[18px] py-4">
      <div className="mb-[14px] text-[12.5px] font-extrabold tracking-[0.8px] text-eyebrow">PADRES VINCULADOS</div>

      <div className="flex flex-col gap-[14px]">
        {kid.parents.map((parent) => (
          <div key={parent.id} className="flex items-center gap-3">
            {/* Avatar con inicial */}
            <span
              style={{ backgroundColor: parent.avatarBg }}
              className="flex h-10 w-10 flex-none items-center justify-center rounded-full font-heading text-base font-semibold text-white"
            >
              {parent.name[0]}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[14.5px] font-extrabold text-heading">{parent.name}</span>
              <span className="block text-[12.5px] text-muted">{relationLabel(parent)}</span>
            </span>
            {/* ACTIVA / PENDIENTE */}
            <span className={`flex-none rounded-full px-[9px] py-1 text-[10.5px] font-extrabold tracking-[0.5px] ${statusBadgeClasses[parent.status]}`}>
              {parent.status === "activa" ? "ACTIVA" : "PENDIENTE"}
            </span>
          </div>
        ))}

        {/* Vincular otro padre */}
        <Link href={`/kids/${kid.id}/link-parent`} className="flex items-center gap-3 pt-2">
          <span className="flex h-10 w-10 flex-none items-center justify-center rounded-full border-[1.5px] border-dashed border-photo-placeholder-border text-photo-placeholder-text">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </span>
          <span className="text-[14.5px] font-extrabold text-accent-strong">Vincular otro padre</span>
        </Link>
      </div>
    </div>
  );
}
