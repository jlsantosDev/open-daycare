import Link from "next/link";
import type { Post, PostType } from "@/data/mock";

/* Colores del badge según el tipo de post (tokens de globals.css) */
const badgeStyles: Record<PostType, { card: string; dot: string }> = {
  logro: {
    card: "bg-badge-achievement-bg text-badge-achievement-text",
    dot: "bg-badge-achievement-text",
  },
  actividad: {
    card: "bg-badge-activity-bg text-badge-activity-text",
    dot: "bg-badge-activity-text",
  },
  anuncio: {
    card: "bg-badge-announcement-bg text-badge-announcement-text",
    dot: "bg-badge-announcement-text",
  },
};

const megaphoneIcon = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m3 11 18-5v12L3 14v-3zM11.6 16.8a3 3 0 1 1-5.8-1.6" />
  </svg>
);

const heartIcon = (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21.2l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z" />
  </svg>
);

const commentIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8z" />
  </svg>
);

const photoIcon = (
  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <circle cx="9" cy="9" r="2" />
    <path d="m21 15-3.6-3.6a2 2 0 0 0-2.8 0L6 21" />
  </svg>
);

/* Server component: static post card from the feed mockup. */
export function PostCard({ post }: { post: Post }) {
  const badge = badgeStyles[post.type];

  return (
    <article className="rounded-[20px] border border-surface-border bg-surface p-5 shadow-[0_4px_16px_-12px_rgba(120,90,60,0.5)] sm:px-[22px]">
      {/* Cabecera: avatar/megáfono + título/hora + badge */}
      <div className="mb-[14px] flex items-center gap-3">
        {post.initial ? (
          <span className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-avatar-blue-bg font-heading text-[17px] font-semibold text-avatar-blue-text">
            {post.initial}
          </span>
        ) : (
          <span className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-badge-announcement-bg text-badge-announcement-text">
            {megaphoneIcon}
          </span>
        )}
        <span className="min-w-0 flex-1">
          <span className="block font-heading text-[16.5px] font-semibold text-heading">{post.title}</span>
          <span className="block text-[12.5px] text-muted">{post.time} · publicado por vos</span>
        </span>
        <span className={`flex flex-none items-center gap-[7px] rounded-full px-3 py-1.5 ${badge.card}`}>
          <span className={`h-2 w-2 rounded-full ${badge.dot}`} />
          <span className="text-xs font-extrabold tracking-[0.5px] uppercase">{post.type}</span>
        </span>
      </div>

      <div className="mb-[10px] text-[12.5px] text-muted">Para: {post.audience}</div>

      <p className="m-0 text-[15.5px] leading-[1.55] text-body">{post.text}</p>

      {/* Placeholder dashed de foto (solo posts de actividad) */}
      {post.photoCaption && (
        <Link
          href="/foto"
          className="mt-[14px] flex h-[200px] flex-col items-center justify-center gap-2 rounded-2xl border-[1.5px] border-dashed border-photo-placeholder-border bg-photo-placeholder-bg text-photo-placeholder-text"
        >
          {photoIcon}
          <span className="text-[13.5px]">{post.photoCaption}</span>
        </Link>
      )}

      {/* Acciones */}
      <div className="mt-4 flex items-center gap-[18px] border-t border-divider pt-[14px]">
        <span className="flex items-center gap-[7px] text-[14px] font-bold text-accent-soft">
          {heartIcon}
          {post.likes}
        </span>
        <Link href="/detalle-publicacion" className="flex items-center gap-[7px] text-[14px] font-bold text-muted-strong">
          {commentIcon}
          {post.comments}
        </Link>
        <span className="flex-1" />
        <Link href="/nueva-publicacion" className="text-[14px] font-extrabold text-accent-strong">
          Editar
        </Link>
      </div>
    </article>
  );
}
