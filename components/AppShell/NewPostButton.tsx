"use client";

import { useNewPost } from "@/components/NewPostProvider/NewPostProvider";

const plusIcon = (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 5v14M5 12h14" />
  </svg>
);

/**
 * CTA "Nueva publicación" del sidebar (SPEC 06): abre el modal del provider.
 * Era un <Link href="/nueva-publicacion"> a una ruta que nunca existió (404).
 * Mantiene la visual exacta del link que reemplaza.
 */
export function NewPostButton() {
  const { openNewPost } = useNewPost();

  return (
    <button
      type="button"
      onClick={openNewPost}
      className="mb-[18px] flex w-full cursor-pointer items-center justify-center gap-2 rounded-[14px] bg-gradient-to-b from-gradient-from to-gradient-to px-3 py-3 text-[14.5px] font-extrabold text-white shadow-[0_8px_18px_-8px_rgba(238,129,100,0.75)]"
    >
      {plusIcon}
      Nueva publicación
    </button>
  );
}
