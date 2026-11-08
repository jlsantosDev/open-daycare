export type ParentStatus = "activa" | "pendiente";

export type Parent = {
  id: string;
  name: string; // "Lucía Fernández"
  relation: string; // "Mamá" | "Papá"
  status: ParentStatus; // elige el badge ACTIVA / PENDIENTE
  avatarBg: string; // color del círculo, ej. "#C9B6E8"
};

/** Badge del listado; sin badge el card muestra chevron. */
export type AllergyBadgeLabel = string; // "MANÍ" | "LACTOSA" del mockup; el alta del modal puede crear cualquier etiqueta

export type Kid = {
  id: string; // slug de la ruta, ej. "mateo-fernandez"
  name: string; // "Mateo Fernández"
  initial: string; // "M"
  age: string; // "3 años"
  avatarBg: string; // "#A9D9E8"
  avatarText: string; // "#1F7A93"
  allergyBadge?: { label: AllergyBadgeLabel }; // badge del listado; sin → chevron
  allergyNote?: string; // texto del banner del perfil; sin → banner oculto
  birthDate: string; // "12 mar 2022"
  room: string; // "Soles"
  enrolled: string; // "feb 2025"
  parents: Parent[]; // 0 → badge "VINCULAR" y label "sin padres vinculados"
};

/** Salas predefinidas del desplegable del modal "Agregar niño" (SPEC 04). */
export const roomOptions = ["Sol", "Luna", "Tierra", "Marte", "Saturno", "Jupiter"] as const;

/**
 * Playgroup fixed fake data for the kids screens. Colors, ages, bad counts
 * and parent amounts mirror the mockups (`references/pantallas/*.dc.html`):
 * Mateo MANÍ, Tomás LACTOSA, Valentina VINCULAR sin padres.
 */
export const kids: Kid[] = [
  {
    id: "mateo-fernandez",
    name: "Mateo Fernández",
    initial: "M",
    age: "3 años",
    avatarBg: "#A9D9E8",
    avatarText: "#1F7A93",
    allergyBadge: { label: "MANÍ" },
    allergyNote: "Alergia al maní. Evitar frutos secos. Lleva inhalador en la mochila.",
    birthDate: "12 mar 2022",
    room: "Soles",
    enrolled: "feb 2025",
    parents: [
      { id: "lucia-f", name: "Lucía Fernández", relation: "Mamá", status: "activa", avatarBg: "#C9B6E8" },
      { id: "diego-f", name: "Diego Fernández", relation: "Papá", status: "pendiente", avatarBg: "#A9C7E8" },
    ],
  },
  {
    id: "sofia-mendez",
    name: "Sofía Méndez",
    initial: "S",
    age: "2 años",
    avatarBg: "#F4B8CC",
    avatarText: "#C44A7A",
    birthDate: "3 oct 2024",
    room: "Soles",
    enrolled: "ene 2026",
    parents: [{ id: "pablo-m", name: "Pablo Méndez", relation: "Papá", status: "activa", avatarBg: "#A9C7E8" }],
  },
  {
    id: "benjamin-ruiz",
    name: "Benjamín Ruiz",
    initial: "B",
    age: "3 años",
    avatarBg: "#B9DEC4",
    avatarText: "#3E8B62",
    birthDate: "27 jun 2023",
    room: "Soles",
    enrolled: "feb 2025",
    parents: [
      { id: "ana-r", name: "Ana Ruiz", relation: "Mamá", status: "activa", avatarBg: "#CBB6A0" },
      { id: "javier-l", name: "Javier Lagos", relation: "Papá", status: "activa", avatarBg: "#A9D9E8" },
    ],
  },
  {
    id: "valentina-soto",
    name: "Valentina Soto",
    initial: "V",
    age: "2 años",
    avatarBg: "#F4DC8E",
    avatarText: "#9A7B1E",
    birthDate: "8 dic 2023",
    room: "Soles",
    enrolled: "oct 2025",
    parents: [],
  },
  {
    id: "tomas-diaz",
    name: "Tomás Díaz",
    initial: "T",
    age: "3 años",
    avatarBg: "#C9B6E8",
    avatarText: "#7B5FC0",
    allergyBadge: { label: "LACTOSA" },
    allergyNote: "Intolerancia a la lactosa. En la merienda se reemplaza la leche por bebida vegetal.",
    birthDate: "19 sep 2022",
    room: "Soles",
    enrolled: "sep 2024",
    parents: [{ id: "camila-d", name: "Camila Díaz", relation: "Mamá", status: "activa", avatarBg: "#F4B8CC" }],
  },
  {
    id: "emma-castro",
    name: "Emma Castro",
    initial: "E",
    age: "2 años",
    avatarBg: "#F4B8CC",
    avatarText: "#C44A7A",
    birthDate: "30 abr 2024",
    room: "Soles",
    enrolled: "mar 2026",
    parents: [{ id: "romina-c", name: "Romina Castro", relation: "Mamá", status: "pendiente", avatarBg: "#CBB6A0" }],
  },
  {
    id: "lucas-romero",
    name: "Lucas Romero",
    initial: "L",
    age: "3 años",
    avatarBg: "#A9D9E8",
    avatarText: "#1F7A93",
    birthDate: "7 feb 2023",
    room: "Soles",
    enrolled: "feb 2025",
    parents: [{ id: "sofia-rom", name: "Julieta Romero", relation: "Mamá", status: "activa", avatarBg: "#C9B6E8" }],
  },
  {
    id: "olivia-vega",
    name: "Olivia Vega",
    initial: "O",
    age: "2 años",
    avatarBg: "#B9DEC4",
    avatarText: "#3E8B62",
    birthDate: "22 nov 2023",
    room: "Soles",
    enrolled: "nov 2025",
    parents: [{ id: "marco-v", name: "Marco Vega", relation: "Papá", status: "activa", avatarBg: "#A9C7E8" }],
  },
];
