# Invitación civil — Pepe & Jaquelin

Invitación de una sola página con Next.js 16 (App Router), Tailwind CSS v4,
Framer Motion y Lenis. Dirección visual cinematográfica: espresso, marfil y
champán, tipografía Instrument Serif + Instrument Sans.

## Desarrollo

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Personalizar el evento

Todo el contenido editable vive en **`src/config/event.ts`**:

| Campo                     | Qué define                                      |
| ------------------------- | ----------------------------------------------- |
| `couple`                  | Nombres de los novios                           |
| `ceremonyAt`              | Fecha y hora en ISO 8601 con offset             |
| `ceremony`                | Lugar, dirección, ciudad y enlace de Maps      |
| `story`                   | Eyebrow, líneas del titular y párrafos          |
| `rsvp`                    | Número de WhatsApp (sin `+`) y textos           |
| `hashtag`, `footerNote`   | Detalles de cierre                              |

El dominio de producción se toma de `NEXT_PUBLIC_SITE_URL` y se usa para resolver
las URLs de Open Graph y Twitter (la imagen compartida es la foto del hero). Sin esa
variable usa el dominio de Vercel si existe, y si no `http://localhost:3000`:
**define `NEXT_PUBLIC_SITE_URL` antes de publicar** o las vistas previas de WhatsApp
apuntarán a localhost.

## Personalizar la fotografía

Las fotos de `public/photos/` son las **reales** de Pepe y Jaquelin. Para cambiarlas,
copia tus archivos (sin espacios en el nombre) y ajusta `src`, `width` y `height`
en `src/config/photos.ts`. El sitio optimiza y redimensiona solo con `next/image`.

Detalles por archivo y cómo ampliar la galería: **`public/photos/README.md`**.

Si un archivo llega a faltar, el componente `Photo` cae en un marco diseñado a
propósito en lugar de romper la maqueta.

Los PNG de esa carpeta (`hero.png`, `story-0X.png`, `gallery-0X.png`, `venue-01.png`,
`portrait-01.png`, `dress-01.png`) son placeholders antiguos generados por
`scripts/make-placeholders.mjs` y **ya no se usan** en el código; puedes borrarlos.
Lo mismo aplica a los `WhatsApp Image *.jpeg`, que son copias idénticas de los
`pepe-jaquelin-*.jpg`. Ese script sobrescribe archivos: no lo ejecutes al finalizar.

## Música

La pista de fondo vive en `public/music/` y se configura en **`src/config/music.ts`**
(`src`, título, artista y volumen final).

- Al terminar la cortinilla intenta sonar con un **fundido de entrada**.
- Los navegadores bloquean el audio automático en la primera visita: entonces aparece
  el aviso *"Toca para escuchar la música"* y arranca con el primer toque, clic o tecla.
- Botón flotante (abajo a la derecha) para pausar o reanudar. Si el invitado la pausa,
  **no vuelve a sonar sola**, ni siquiera al recargar (se guarda en `localStorage`).
- Se pausa sola si el invitado deja la pestaña en segundo plano.
- Si el archivo faltara o no cargara, el botón se oculta y el resto de la página no se afecta.
- Para cambiar de canción: copia el MP3 a `public/music/` y actualiza `src`.
  Se sirve con `Range` y caché de un día (`next.config.ts`).

> Ten en cuenta que la canción es material con derechos de autor: para publicar el sitio
> conviene usar una pista licenciada o con permiso de uso.

## Estructura

```
src/
  app/            layout (fuentes, metadata), globals.css (tokens), page
  config/         event.ts (contenido), photos.ts (imágenes) y music.ts (pista)
  components/
    providers/    smooth-scroll.tsx — Lenis + contexto del motor de scroll
    motion/       reveal.tsx (split text, reveals, stagger)
                  interactions.tsx (magnetismo, media queries, parallax)
    sections/     hero, story, gallery, countdown, details,
                  rsvp, footer, marquee, nav
    ui/           photo, cta, icons, preloader, music-player
```

## Notas de implementación

- **Scroll suave**: Lenis con `lerp: 0.085`. Se desactiva solo si el sistema pide
  `prefers-reduced-motion`.
- **Animación**: únicamente `transform` y `opacity`. Sin `top`/`left`/`width`/
  `height`, sin `addEventListener("scroll")` y sin `useState` para magnetism.
- **Grano de película**: capa `fixed` con `pointer-events: none`, nunca dentro de
  contenedores con scroll.
- **`backdrop-blur`**: reservado a la navegación flotante, el menú móvil y el botón de música.
- **Responsive**: todo lo que es asimétrico en `md:` colapsa a una columna en
  móvil. La galería deja el scroll hijack y pasa a carrusel con snap nativo.
- **Accesibilidad**: enlace de salto al `<main>`, foco visible, resumen del contador
  para lectores de pantalla (se actualiza cada hora, no cada segundo), menú móvil que
  bloquea el scroll y cierra con Esc, y respeto a movimiento reducido (marquee y
  ecualizador se detienen por CSS).
- **Hidratación**: nada que dependa de `Date.now()` o de `matchMedia` se renderiza en el
  primer pase; el contador y los hooks de media query arrancan con un valor neutro y se
  sincronizan después, para que servidor y cliente coincidan.

## Verificación

```bash
npm run lint
npm run build
```
