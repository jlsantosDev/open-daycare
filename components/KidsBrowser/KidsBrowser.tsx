"use client";

import { useState } from "react";
import { KidCard } from "@/components/KidCard/KidCard";
import type { Kid } from "@/data/kids";

const searchIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#B0A290" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="7" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

/**
 * Search + grid of the kids list. Only client component of the screen:
 * it filters by name locally and updates the "N niños" counter of the
 * room separator; SSR always renders the full list.
 */
export function KidsBrowser({ kids }: { kids: Kid[] }) {
  const [filterText, setFilterText] = useState("");

  const visibleKids = kids.filter((kid) =>
    kid.name.toLowerCase().includes(filterText.trim().toLowerCase()),
  );

  return (
    <>
      {/* Buscador */}
      <div className="mb-[22px] flex items-center gap-[11px] rounded-[14px] border border-surface-border bg-surface px-4 py-3">
        {searchIcon}
        <input
          type="text"
          value={filterText}
          onChange={(event) => setFilterText(event.target.value)}
          placeholder="Buscar niño…"
          aria-label="Buscar niño"
          className="w-full border-none bg-transparent text-[15px] text-heading placeholder:text-[#B6A99B] focus:outline-none"
        />
      </div>

      {/* Separador de sala con contador dinámico */}
      <div className="mb-[14px] flex items-center gap-3">
        <span className="text-[12.5px] font-extrabold tracking-[0.8px] text-heading">SALA SOLES</span>
        <span className="text-[13px] text-muted">{visibleKids.length} niños</span>
        <span className="h-px flex-1 bg-separator" />
      </div>

      {/* Grid: 1 col en móvil, 2 desde md (768px) */}
      <div className="grid grid-cols-1 gap-[14px] md:grid-cols-2">
        {visibleKids.map((kid) => (
          <KidCard key={kid.id} kid={kid} />
        ))}
      </div>
    </>
  );
}
