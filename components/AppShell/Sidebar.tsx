import Link from "next/link";

import { NewPostButton } from "./NewPostButton";
import { user } from "@/data/mock";

/* Íconos SVG del mockup (stroke heredan currentColor) */
const icons = {
  home: (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9.5 12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />
    </svg>
  ),
  children: (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="7" r="3" />
      <circle cx="17" cy="9" r="2.4" />
      <path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 20a5 5 0 0 1 5.5-4.9" />
    </svg>
  ),
  bell: (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0" />
    </svg>
  ),
  user: (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  sun: (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  ),
  logout: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
    </svg>
  ),
};

export type NavItemId = "feed" | "kids" | "avisos" | "cuenta";

const navItems: { id: NavItemId; href: string; label: string; icon: React.ReactNode }[] = [
  { id: "feed", href: "/", label: "Feed", icon: icons.home },
  { id: "kids", href: "/kids", label: "Niños", icon: icons.children },
  { id: "avisos", href: "/avisos", label: "Avisos", icon: icons.bell },
  { id: "cuenta", href: "/mi-cuenta", label: "Mi cuenta", icon: icons.user },
];

const activeItemClasses = "bg-accent-soft-bg text-accent font-extrabold";
const inactiveItemClasses = "bg-transparent text-nav font-semibold";

/**
 * Navigation rail from the mockup. Presentational: positioning is up to the
 * caller (fixed rail on desktop, overlapping panel on the mobile drawer).
 * `activeItem` resalta el item de la página actual.
 */
export function Sidebar({ activeItem = "kids" }: { activeItem?: NavItemId }) {
  return (
    <aside className="flex h-full w-[248px] flex-none flex-col bg-surface px-4 py-6">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-[11px] px-2 pb-[22px] pt-1">
        <span className="flex h-[38px] w-[38px] flex-none items-center justify-center rounded-xl bg-gradient-to-bl from-avatar-gradient-from to-avatar-gradient-to">
          {icons.sun}
        </span>
        <span>
          <span className="block font-heading text-[17px] font-semibold leading-none text-heading">OpenDayCare</span>
          <span className="mt-[2px] block text-[11.5px] text-muted">Sala Soles</span>
        </span>
      </Link>

      {/* Nueva publicación: abre el modal del provider (SPEC 06) */}
      <NewPostButton />

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 rounded-xl px-3 py-[11px] text-[14.5px] ${
              item.id === activeItem ? activeItemClasses : inactiveItemClasses
            }`}
          >
            {item.icon}
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Usuario + cerrar sesión (visual) */}
      <div className="mt-[10px] border-t border-surface-border pt-[14px]">
        <div className="flex items-center gap-[11px] px-2 py-1.5">
          <span className="flex h-[38px] w-[38px] flex-none items-center justify-center rounded-full bg-avatar-accent font-heading text-base font-semibold text-white">
            {user.initial}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-extrabold text-heading">{user.name}</span>
            <span className="block text-xs text-muted">{user.role}</span>
          </span>
          <Link
            href="/login"
            title="Cerrar sesión"
            className="flex h-8 w-8 flex-none items-center justify-center rounded-[10px] bg-background text-muted-strong"
          >
            {icons.logout}
          </Link>
        </div>
      </div>
    </aside>
  );
}
