"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { kids as allKids } from "@/data/kids";
import type { Post } from "@/data/mock";
import { postTypeOptions, posts as initialPosts } from "@/data/mock";
import { NewPostModal } from "@/components/NewPostModal/NewPostModal";

type NewPostContextValue = {
  /** Abre el modal del SPEC 06 desde cualquier página (trigger del feed o CTA del sidebar). */
  openNewPost: () => void;
  /** Posts de PUBLICADO HOY: el post publicado queda primero (alta in-memory, SPEC 06). */
  posts: Post[];
};

const NewPostContext = createContext<NewPostContextValue | null>(null);

export function useNewPost() {
  const context = useContext(NewPostContext);
  if (!context) throw new Error("useNewPost must be used inside <NewPostProvider>.");
  return context;
}

/**
 * Owner client del estado de posts y del modal del SPEC 06, montado en el root
 * layout: sobrevive la navegación entre páginas (AppShell compone cada página
 * sin layout compartido), así el CTA "Nueva publicación" del sidebar abre el
 * modal desde cualquier página y el post publicado aterriza en el feed.
 */
export function NewPostProvider({ children }: { children: React.ReactNode }) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const openNewPost = useCallback(() => {
    setIsOpen(true);
  }, []);

  // Alta in-memory: el post nuevo queda primero de PUBLICADO HOY (SPEC 06).
  // Publicado desde otra página, aterrizamos en el feed para ver la tarjeta.
  const handlePublish = (post: Post) => {
    setPosts((current) => [post, ...current]);
    setIsOpen(false);
    if (pathname !== "/") router.push("/");
  };

  // El modal se monta solo cuando está abierto → reset limpio por remount.
  const value = useMemo(
    () => ({ openNewPost, posts }),
    [openNewPost, posts],
  );

  return (
    <NewPostContext.Provider value={value}>
      {children}
      {isOpen && (
        <NewPostModal
          kids={allKids}
          typeOptions={postTypeOptions}
          onPublish={handlePublish}
          onClose={() => setIsOpen(false)}
        />
      )}
    </NewPostContext.Provider>
  );
}
