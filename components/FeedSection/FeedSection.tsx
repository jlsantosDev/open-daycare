"use client";

import { useState } from "react";
import { kids as allKids } from "@/data/kids";
import type { Post } from "@/data/mock";
import { postTypeOptions, posts as initialPosts, user } from "@/data/mock";
import { NewPostModal } from "@/components/NewPostModal/NewPostModal";
import { PostCard } from "@/components/PostCard/PostCard";

const cameraIcon = (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
);

/**
 * Sección del feed dueña del estado de posts (SPEC 06): trigger
 * "Compartí un momento…", separador y listado. El modal se monta solo cuando
 * está abierto → cada apertura arranca limpio por remount (patrón SPEC 04/05).
 */
export function FeedSection() {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Alta in-memory: el post nuevo queda primero de PUBLICADO HOY (SPEC 06).
  const handlePublish = (post: Post) => {
    setPosts((current) => [post, ...current]);
  };

  return (
    <>
      {/* Caja "Compartí un momento…" (link muerto → trigger del modal) */}
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        className="mb-6 flex w-full cursor-pointer items-center gap-[14px] rounded-[18px] border border-surface-border bg-surface px-[18px] py-[14px] text-left shadow-[0_4px_14px_-10px_rgba(120,90,60,0.4)]"
      >
        <span className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-avatar-accent font-heading text-base font-semibold text-white">
          {user.initial}
        </span>
        <span className="flex-1 text-[15px] text-muted">Compartí un momento…</span>
        <span className="flex h-[38px] w-[38px] items-center justify-center rounded-xl bg-accent-soft-bg text-accent-soft">
          {cameraIcon}
        </span>
      </button>

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

      {isModalOpen && (
        <NewPostModal
          kids={allKids}
          typeOptions={postTypeOptions}
          onPublish={handlePublish}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
}
