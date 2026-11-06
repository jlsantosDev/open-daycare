import Link from "next/link";
import { AppShell } from "@/components/AppShell/AppShell";
import { PostCard } from "@/components/PostCard/PostCard";
import { classroom, posts, user } from "@/data/mock";

const cameraIcon = (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
);

export default function Home() {
  return (
    <AppShell activeItem="feed">
      <div className="mx-auto w-full max-w-[760px] px-4 pb-20 pt-[34px] sm:px-10">
        {/* Saludo */}
        <header className="mb-6">
          <div className="mb-1 text-[12.5px] font-extrabold tracking-[0.8px] text-accent">
            GUARDERÍA · {classroom.name.toUpperCase()}
          </div>
          <h1 className="m-0 font-heading text-[30px] font-semibold text-heading">
            Buenas, {user.name.split(" ")[0]}
          </h1>
          <p className="m-0 mt-[5px] text-[14.5px] text-muted-strong">{classroom.summary}</p>
        </header>

        {/* Caja "Compartí un momento…" */}
        <Link
          href="/nueva-publicacion"
          className="mb-6 flex items-center gap-[14px] rounded-[18px] border border-surface-border bg-surface px-[18px] py-[14px] shadow-[0_4px_14px_-10px_rgba(120,90,60,0.4)]"
        >
          <span className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-avatar-accent font-heading text-base font-semibold text-white">
            {user.initial}
          </span>
          <span className="flex-1 text-[15px] text-muted">Compartí un momento…</span>
          <span className="flex h-[38px] w-[38px] items-center justify-center rounded-xl bg-accent-soft-bg text-accent-soft">
            {cameraIcon}
          </span>
        </Link>

        {/* Separador */}
        <div className="mb-[14px] flex items-center gap-[14px]">
          <span className="text-[12.5px] font-extrabold tracking-[0.8px] text-eyebrow">PUBLICADO HOY</span>
          <span className="h-px flex-1 bg-separator" />
        </div>

        {/* Posts */}
        <div className="flex flex-col gap-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </div>
    </AppShell>
  );
}
