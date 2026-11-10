export type PostType = "logro" | "actividad" | "anuncio" | "comida" | "siesta" | "animo" | "foto";

/* Label con acento para el badge de la tarjeta (se muestra en uppercase) */
export const postTypeLabel: Record<PostType, string> = {
  logro: "Logro",
  actividad: "Actividad",
  anuncio: "Anuncio",
  comida: "Comida",
  siesta: "Siesta",
  animo: "Ánimo",
  foto: "Foto",
};

export type Post = {
  id: string;
  title: string; // "Mateo" | "Anuncio general"
  /** Avatar initial of the child; absent for announcements (megaphone icon). */
  initial?: string;
  time: string; // "14:20"
  type: PostType; // picks the badge color
  audience: string; // "familia de Mateo" | "toda la sala"
  text: string;
  likes: number;
  comments: number;
  photoCaption?: string; // "Foto · pintando con témperas" → dashed placeholder
};

export const user = {
  name: "Caro Giménez",
  role: "Maestra · Soles",
  initial: "C",
};

export const classroom = {
  name: "Sala Soles",
  summary: "12 niños · martes 17 jun",
};

export const posts: Post[] = [
  {
    id: "p1",
    title: "Mateo",
    initial: "M",
    time: "14:20",
    type: "logro",
    audience: "familia de Mateo",
    text: "¡Usó el orinal solito por primera vez! Estaba feliz de contárselo a todos. Un gran paso.",
    likes: 3,
    comments: 1,
  },
  {
    id: "p2",
    title: "Mateo",
    initial: "M",
    time: "09:40",
    type: "actividad",
    audience: "familia de Mateo",
    text: "Pintamos con témperas esta mañana. Mateo eligió el azul para todo y se concentró un montón mezclando colores.",
    likes: 5,
    comments: 2,
    photoCaption: "Foto · pintando con témperas",
  },
  {
    id: "p3",
    title: "Anuncio general",
    time: "07:50",
    type: "anuncio",
    audience: "toda la sala",
    text: "El viernes salimos al parque por la mañana. Recuerden mandar gorra y una botellita de agua.",
    likes: 8,
    comments: 0,
  },
];
