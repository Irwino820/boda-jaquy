export type MusicTrack = {
  /** Ruta dentro de `public/`. Los espacios y paréntesis se codifican al servirla. */
  src: string;
  title: string;
  artist: string;
  /** Volumen final (0–1). La música entra con un fundido, no de golpe. */
  volume: number;
};

/** Pista de fondo de la invitación. Para cambiarla, copia el MP3 a `public/music/` y ajusta `src`. */
export const music: MusicTrack = {
  src: encodeURI("/music/Kygo - Firestone (Lyrics) ft. Conrad Sewell.mp3"),
  title: "Firestone",
  artist: "Kygo ft. Conrad Sewell",
  volume: 0.55,
};
