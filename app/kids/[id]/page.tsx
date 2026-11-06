import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AppShell } from "@/components/AppShell/AppShell";
import { ParentsCard } from "@/components/ParentsCard/ParentsCard";
import { kids } from "@/data/kids";

const backIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m15 18-6-6 6-6" />
  </svg>
);

const warningIcon = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
    <path d="M12 9v4M12 17h.01" />
  </svg>
);

const sunIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </svg>
);

/** Ridged fake data: all kids exist; unknown ids render 404. */
export function generateStaticParams() {
  return kids.map((kid) => ({ id: kid.id }));
}

/** Kid profile content: header, allergy banner, info table, day summary + parents.
    Con cacheComponents el await de params ocurre aquí, dentro del boundary. */
async function KidProfile({ kidId }: { kidId: string }) {
  const kid = kids.find((item) => item.id === kidId);
  if (!kid) notFound();

  return (
    <div className="mx-auto w-full max-w-[820px] px-4 pb-20 pt-[34px] sm:px-10">
      {/* Volver a Niños */}
      <Link href="/kids" className="mb-5 flex items-center gap-[7px] text-[14px] font-bold text-muted-strong">
        {backIcon}
        Volver a Niños
      </Link>

      <div className="flex flex-wrap items-start gap-[26px]">
        {/* Columna izquierda: cabecera + banner + info */}
        <div className="flex min-w-[300px] flex-1 flex-col gap-[18px]">
          {/* Cabecera */}
          <div className="flex items-center gap-[18px]">
            <span
              style={{ backgroundColor: kid.avatarBg, color: kid.avatarText }}
              className="flex h-[84px] w-[84px] flex-none items-center justify-center rounded-full font-heading text-[34px] font-semibold"
            >
              {kid.initial}
            </span>
            <div className="min-w-0 flex-1">
              <h1 className="m-0 font-heading text-[28px] font-semibold text-heading">{kid.name}</h1>
              <p className="m-0 mt-[3px] text-[15px] text-muted-strong">{kid.age} · Sala {kid.room}</p>
            </div>
            <Link
              href="/kids/new"
              className="flex-none rounded-xl border-[1.5px] border-surface-border bg-surface px-4 py-[9px] text-[14px] font-bold text-nav"
            >
              Editar
            </Link>
          </div>

          {/* Banner "Alergias y notas" (condicional) */}
          {kid.allergyNote && (
            <div className="flex gap-[14px] rounded-[16px] bg-[#FBDAD6] px-[18px] py-4">
              <span className="flex h-10 w-10 flex-none items-center justify-center rounded-[11px] bg-[#F4A8A0]">
                {warningIcon}
              </span>
              <div>
                <div className="mb-[2px] text-[15px] font-extrabold text-[#C5413A]">Alergias y notas</div>
                <div className="text-[14.5px] leading-[1.5] text-[#B25249]">{kid.allergyNote}</div>
              </div>
            </div>
          )}

          {/* Tabla de info */}
          <div className="overflow-hidden rounded-[16px] border border-surface-border bg-surface">
            {[
              { label: "Fecha de nacimiento", value: kid.birthDate },
              { label: "Sala", value: kid.room },
              { label: "Ingreso", value: kid.enrolled },
            ].map((row, index, rows) => (
              <div
                key={row.label}
                className={`flex items-center justify-between px-[18px] py-[15px] ${index < rows.length - 1 ? "border-b border-divider" : ""}`}
              >
                <span className="text-[14.5px] text-muted-strong">{row.label}</span>
                <span className="text-[14.5px] font-extrabold text-heading">{row.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Columna derecha: resumen del día + padres */}
        <div className="flex w-full flex-none flex-col gap-[14px] md:w-[300px]">
          <Link
            href={`/kids/${kid.id}/day-summary`}
            className="flex w-full items-center justify-center gap-[9px] rounded-[14px] bg-heading px-[13px] py-[13px] text-[15px] font-extrabold text-white"
          >
            {sunIcon}
            Resumen del día
          </Link>

          <ParentsCard kid={kid} />
        </div>
      </div>
    </div>
  );
}

/** Kid profile screen (shell + boundary): la shell queda compartida entre
    todas las URLs, gracias a partialPrefetching los parámetros se resuelven
    dentro de <Suspense>. */
export default function KidPage({ params }: PageProps<"/kids/[id]">) {
  return (
    <AppShell activeItem="kids">
      <Suspense fallback={<div className="min-h-[70vh]" />}>
        <KidProfileWithParams params={params} />
      </Suspense>
    </AppShell>
  );
}

/** Bridge: extrae el id de la promesa de params dentro del boundary. */
async function KidProfileWithParams({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <KidProfile kidId={id} />;
}
