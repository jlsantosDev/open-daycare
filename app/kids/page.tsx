import Link from "next/link";
import { AppShell } from "@/components/AppShell/AppShell";
import { KidsBrowser } from "@/components/KidsBrowser/KidsBrowser";
import { kids } from "@/data/kids";

const plusIcon = (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 5v14M5 12h14" />
  </svg>
);

/** Kids list screen: AppShell + heading + search/grid client component. */
export default function KidsPage() {
  return (
    <AppShell activeItem="kids">
      <div className="mx-auto w-full max-w-[880px] px-4 pb-20 pt-[34px] sm:px-10">
        {/* Encabezado */}
        <div className="mb-[22px] flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="mb-1 text-[12.5px] font-extrabold tracking-[0.8px] text-accent">GESTIÓN</div>
            <h1 className="m-0 font-heading text-[30px] font-semibold text-heading">Niños</h1>
          </div>
          <Link
            href="/kids/new"
            className="flex items-center gap-2 rounded-[14px] bg-gradient-to-b from-gradient-from to-gradient-to px-[18px] py-[11px] text-[14.5px] font-extrabold text-white shadow-[0_8px_18px_-8px_rgba(238,129,100,0.7)]"
          >
            {plusIcon}
            Agregar niño
          </Link>
        </div>

        {/* Búsqueda + contador + grid */}
        <KidsBrowser kids={kids} />
      </div>
    </AppShell>
  );
}
