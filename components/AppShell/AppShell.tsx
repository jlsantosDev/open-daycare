"use client";

import { useState } from "react";
import { Sidebar } from "./Sidebar";

/**
 * Responsive application shell: persistent sidebar on ≥768px, sticky mobile
 * header with a hamburger menu that opens a sliding drawer below that.
 * The feed content (children) stays server-rendered.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);

  /* Only closes the drawer when the click lands on a nav link. */
  const closeDrawerOnNavigate = (event: React.MouseEvent) => {
    if ((event.target as HTMLElement).closest("a")) {
      setMenuOpen(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen md:flex">
        <Sidebar />
      </aside>

      {/* Column: mobile header + content */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile header */}
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-surface-border bg-surface px-4 py-3 md:hidden">
          <span className="flex items-center gap-[11px]">
            <span className="flex h-[38px] w-[38px] flex-none items-center justify-center rounded-xl bg-gradient-to-bl from-avatar-gradient-from to-avatar-gradient-to">
              <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
              </svg>
            </span>
            <span className="font-heading text-[17px] font-semibold leading-none text-heading">OpenDayCare</span>
          </span>
          <button
            type="button"
            aria-label="Abrir menú"
            onClick={() => setMenuOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-[10px] text-heading"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </header>

        {/* Content */}
        <main className="min-w-0 flex-1">{children}</main>
      </div>

      {/* Mobile drawer */}
      <div
        onClick={closeDrawerOnNavigate}
        className={`fixed inset-x-0 top-0 bottom-0 z-40 md:hidden ${
          menuOpen ? "" : "pointer-events-none"
        }`}
        aria-hidden={!menuOpen}
      >
        {/* Backdrop */}
        <div
          onClick={() => setMenuOpen(false)}
          className={`absolute inset-0 bg-black/30 transition-opacity duration-200 ${
            menuOpen ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        />
        {/* Sliding panel: same Sidebar as the desktop rail */}
        <div
          className={`absolute inset-y-0 left-0 flex h-full bg-surface shadow-2xl transition-transform duration-200 ${
            menuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <button
            type="button"
            aria-label="Cerrar menú"
            onClick={() => setMenuOpen(false)}
            className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-[10px] bg-background text-muted-strong"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
          <Sidebar />
        </div>
      </div>
    </div>
  );
}
