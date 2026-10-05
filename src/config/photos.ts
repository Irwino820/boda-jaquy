export type Photo = {
  /** Identificador estable, se usa como clave de animación y etiqueta del slot. */
  id: string;
  /** Ruta dentro de `public/`. Sustituye el archivo o cambia esta ruta. */
  src: string;
  alt: string;
  width: number;
  height: number;
  /** Texto corto que acompaña a la foto en la galería. */
  caption?: string;
};

/**
 * Fotos reales de Pepe y Jaquelin (exportadas desde WhatsApp, renombradas).
 * Originales con espacios siguen en la carpeta por si hace falta.
 */
export const photos = {
  hero: {
    id: "hero",
    src: "/photos/pepe-jaquelin-vineyard.jpg",
    alt: "Pepe y Jaquelin en el viñedo, brindando juntos",
    width: 1200,
    height: 1600,
  },
  storyMain: {
    id: "story-main",
    src: "/photos/pepe-jaquelin-closeup.jpg",
    alt: "Pepe y Jaquelin frente a frente, con el anillo en primer plano",
    width: 926,
    height: 1108,
    caption: "Nosotros",
  },
  storyWide: {
    id: "story-wide",
    src: "/photos/pepe-jaquelin-garden.jpg",
    alt: "Pepe y Jaquelin frente al corazón de rosas",
    width: 923,
    height: 1073,
    caption: "Esa noche",
  },
  storyTall: {
    id: "story-tall",
    src: "/photos/pepe-jaquelin-cellar.jpg",
    alt: "Pepe y Jaquelin en la cava",
    width: 960,
    height: 1280,
    caption: "La cava",
  },
  venue: {
    id: "venue",
    src: "/photos/pepe-jaquelin-cellar.jpg",
    alt: "Pepe y Jaquelin en un espacio íntimo para celebrar",
    width: 960,
    height: 1280,
    caption: "El lugar",
  },
  dress: {
    id: "dress",
    src: "/photos/pepe-jaquelin-vineyard.jpg",
    alt: "Referencia de vestimenta elegante casual — vestido claro y look relajado",
    width: 1200,
    height: 1600,
    caption: "Código de vestimenta",
  },
  portrait: {
    id: "portrait",
    src: "/photos/pepe-jaquelin-selfie.jpg",
    alt: "Selfie de Pepe y Jaquelin",
    width: 900,
    height: 1600,
    caption: "Los dos",
  },
  galleryWide: {
    id: "gallery-wide",
    src: "/photos/pepe-jaquelin-garden.jpg",
    alt: "Pepe y Jaquelin en el jardín con luces",
    width: 923,
    height: 1073,
  },
  galleryTall: {
    id: "gallery-tall",
    src: "/photos/pepe-jaquelin-selfie.jpg",
    alt: "Retrato cercano de la pareja",
    width: 900,
    height: 1600,
  },
} satisfies Record<string, Photo>;

/** Tira horizontal de la galería: las cinco fotos, sin repetir el mismo momento. */
export const galleryPhotos: Photo[] = [
  { ...photos.hero, id: "gallery-vineyard", caption: "El viñedo" },
  { ...photos.storyMain, id: "gallery-closeup", caption: "El anillo" },
  { ...photos.storyWide, id: "gallery-garden", caption: "Esa noche" },
  { ...photos.storyTall, id: "gallery-cellar", caption: "La cava" },
  { ...photos.portrait, id: "gallery-selfie", caption: "Los dos" },
];
