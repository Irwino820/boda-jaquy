/**
 * Genera la fotografía placeholder de la invitación (arte abstracto Amalfi).
 *
 * Son imágenes nuevas, no reales: sirven para que el diseño se vea terminado
 * mientras llegan las fotos. Para reemplazarlas, sobrescribe los archivos de
 * `public/photos/` o ajusta `src` en `src/config/photos.ts`.
 *
 * Uso: node scripts/make-placeholders.mjs
 */
import { deflateSync } from "node:zlib";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const OUT_DIR = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "public",
  "photos",
);

/* ---------------------------------------------------------------- PNG codec */

const CRC_TABLE = (() => {
  const table = new Int32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c;
  }
  return table;
})();

function crc32(buf) {
  let c = -1;
  for (let i = 0; i < buf.length; i += 1) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([len, body, crc]);
}

function encodePng(width, height, rgb) {
  const stride = width * 3;
  const raw = Buffer.alloc((stride + 1) * height);
  const prior = Buffer.alloc(stride);
  let priorFilter = 1;

  for (let y = 0; y < height; y += 1) {
    const row = rgb.subarray(y * stride, (y + 1) * stride);
    const rowStart = y * (stride + 1);
    let best = null;

    for (let filter = 0; filter <= 4; filter += 1) {
      const line = Buffer.alloc(stride);
      let score = 0;
      for (let x = 0; x < stride; x += 1) {
        const a = x >= 3 ? row[x - 3] : 0;
        const b = prior[x];
        const c = x >= 3 ? prior[x - 3] : 0;
        let v = row[x];
        if (filter === 1) v = row[x] - a;
        else if (filter === 2) v = row[x] - b;
        else if (filter === 3) v = row[x] - ((a + b) >> 1);
        else if (filter === 4) {
          const p = a + b - c;
          const pa = Math.abs(p - a);
          const pb = Math.abs(p - b);
          const pc = Math.abs(p - c);
          const pred = pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
          v = row[x] - pred;
        }
        v &= 0xff;
        line[x] = v;
        score += v < 128 ? v : 256 - v;
      }
      if (!best || score < best.score) best = { filter, line, score };
      if (filter === priorFilter && best) break; // atxz-style early exit
    }

    raw[rowStart] = best.filter;
    best.line.copy(raw, rowStart + 1);
    best.line.copy(prior);
    priorFilter = best.filter;
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // truecolour
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

/* ------------------------------------------------------------------ palette */

const PALETTE = {
  deep: [22, 58, 107],
  cobalt: [43, 94, 168],
  azure: [74, 126, 199],
  sky: [214, 228, 245],
  mist: [248, 250, 252],
};

const mix = (a, b, t) => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
  a[2] + (b[2] - a[2]) * t,
];

const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);

function smoothstep(edge0, edge1, x) {
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

/* -------------------------------------------------------------------- paint */

/**
 * Cada escena se compone de: gradiente base diagonal, fugas de luz azules,
 * discos de bokeh desenfocados y viñeta. Todo en una sola paleta Amalfi.
 */
const SCENES = {
  hero: {
    width: 1400,
    height: 1750,
    base: [PALETTE.azure, PALETTE.sky],
    gradientAngle: 0.72,
    leaks: [
      { x: 0.18, y: 0.14, radius: 0.85, tint: PALETTE.mist, strength: 0.55 },
      { x: 0.86, y: 0.78, radius: 0.7, tint: PALETTE.cobalt, strength: 0.28 },
    ],
    bokeh: [
      { x: 0.72, y: 0.3, radius: 0.2, tint: PALETTE.mist, strength: 0.16 },
      { x: 0.34, y: 0.62, radius: 0.13, tint: PALETTE.sky, strength: 0.14 },
    ],
    vignette: 0.28,
  },
  "story-01": {
    width: 1200,
    height: 1500,
    base: [PALETTE.cobalt, PALETTE.deep],
    gradientAngle: 1.9,
    leaks: [
      { x: 0.76, y: 0.2, radius: 0.8, tint: PALETTE.sky, strength: 0.42 },
      { x: 0.12, y: 0.9, radius: 0.6, tint: PALETTE.azure, strength: 0.28 },
    ],
    bokeh: [{ x: 0.5, y: 0.24, radius: 0.16, tint: PALETTE.mist, strength: 0.1 }],
    vignette: 0.5,
  },
  "story-02": {
    width: 1200,
    height: 900,
    base: [PALETTE.deep, PALETTE.azure],
    gradientAngle: 0.3,
    leaks: [
      { x: 0.3, y: 0.24, radius: 0.9, tint: PALETTE.sky, strength: 0.44 },
      { x: 0.9, y: 0.82, radius: 0.6, tint: PALETTE.cobalt, strength: 0.4 },
    ],
    bokeh: [{ x: 0.66, y: 0.56, radius: 0.22, tint: PALETTE.mist, strength: 0.09 }],
    vignette: 0.48,
  },
  "story-03": {
    width: 900,
    height: 1200,
    base: [PALETTE.azure, PALETTE.deep],
    gradientAngle: 2.6,
    leaks: [
      { x: 0.5, y: 0.82, radius: 0.85, tint: PALETTE.sky, strength: 0.4 },
      { x: 0.22, y: 0.12, radius: 0.55, tint: PALETTE.cobalt, strength: 0.38 },
    ],
    bokeh: [{ x: 0.38, y: 0.46, radius: 0.18, tint: PALETTE.mist, strength: 0.1 }],
    vignette: 0.52,
  },
  "gallery-01": {
    width: 1100,
    height: 1500,
    base: [PALETTE.deep, PALETTE.cobalt],
    gradientAngle: 1.2,
    leaks: [
      { x: 0.2, y: 0.86, radius: 0.82, tint: PALETTE.sky, strength: 0.4 },
      { x: 0.84, y: 0.16, radius: 0.62, tint: PALETTE.azure, strength: 0.3 },
    ],
    bokeh: [{ x: 0.6, y: 0.4, radius: 0.2, tint: PALETTE.mist, strength: 0.1 }],
    vignette: 0.5,
  },
  "gallery-02": {
    width: 1400,
    height: 1000,
    base: [PALETTE.cobalt, PALETTE.azure],
    gradientAngle: 0.15,
    leaks: [
      { x: 0.62, y: 0.7, radius: 0.95, tint: PALETTE.sky, strength: 0.46 },
      { x: 0.06, y: 0.1, radius: 0.55, tint: PALETTE.deep, strength: 0.4 },
    ],
    bokeh: [
      { x: 0.3, y: 0.36, radius: 0.16, tint: PALETTE.mist, strength: 0.09 },
      { x: 0.8, y: 0.3, radius: 0.11, tint: PALETTE.sky, strength: 0.1 },
    ],
    vignette: 0.48,
  },
  "gallery-03": {
    width: 1000,
    height: 1400,
    base: [PALETTE.deep, PALETTE.azure],
    gradientAngle: 2.1,
    leaks: [
      { x: 0.72, y: 0.24, radius: 0.78, tint: PALETTE.sky, strength: 0.45 },
      { x: 0.16, y: 0.82, radius: 0.6, tint: PALETTE.cobalt, strength: 0.36 },
    ],
    bokeh: [{ x: 0.42, y: 0.6, radius: 0.19, tint: PALETTE.mist, strength: 0.1 }],
    vignette: 0.5,
  },
  "gallery-04": {
    width: 1300,
    height: 1100,
    base: [PALETTE.azure, PALETTE.deep],
    gradientAngle: 0.95,
    leaks: [
      { x: 0.34, y: 0.2, radius: 0.88, tint: PALETTE.sky, strength: 0.42 },
      { x: 0.92, y: 0.9, radius: 0.58, tint: PALETTE.cobalt, strength: 0.38 },
    ],
    bokeh: [{ x: 0.7, y: 0.44, radius: 0.21, tint: PALETTE.mist, strength: 0.09 }],
    vignette: 0.46,
  },
  "gallery-05": {
    width: 1000,
    height: 1500,
    base: [PALETTE.cobalt, PALETTE.deep],
    gradientAngle: 2.85,
    leaks: [
      { x: 0.5, y: 0.18, radius: 0.9, tint: PALETTE.sky, strength: 0.44 },
      { x: 0.24, y: 0.94, radius: 0.6, tint: PALETTE.azure, strength: 0.3 },
    ],
    bokeh: [{ x: 0.76, y: 0.52, radius: 0.15, tint: PALETTE.mist, strength: 0.1 }],
    vignette: 0.52,
  },
  "venue-01": {
    width: 1200,
    height: 1600,
    base: [PALETTE.deep, PALETTE.cobalt],
    gradientAngle: 1.55,
    leaks: [
      { x: 0.5, y: 0.34, radius: 0.86, tint: PALETTE.sky, strength: 0.4 },
      { x: 0.86, y: 0.94, radius: 0.6, tint: PALETTE.azure, strength: 0.28 },
    ],
    bokeh: [{ x: 0.3, y: 0.62, radius: 0.17, tint: PALETTE.mist, strength: 0.09 }],
    vignette: 0.55,
  },
  "dress-01": {
    width: 1200,
    height: 1500,
    base: [PALETTE.cobalt, PALETTE.azure],
    gradientAngle: 0.45,
    leaks: [
      { x: 0.68, y: 0.26, radius: 0.88, tint: PALETTE.mist, strength: 0.36 },
      { x: 0.14, y: 0.88, radius: 0.62, tint: PALETTE.sky, strength: 0.34 },
    ],
    bokeh: [{ x: 0.36, y: 0.46, radius: 0.2, tint: PALETTE.sky, strength: 0.1 }],
    vignette: 0.42,
  },
  "portrait-01": {
    width: 1200,
    height: 1500,
    base: [PALETTE.deep, PALETTE.cobalt],
    gradientAngle: 2.35,
    leaks: [
      { x: 0.26, y: 0.3, radius: 0.84, tint: PALETTE.sky, strength: 0.44 },
      { x: 0.9, y: 0.86, radius: 0.6, tint: PALETTE.azure, strength: 0.3 },
    ],
    bokeh: [{ x: 0.66, y: 0.34, radius: 0.18, tint: PALETTE.mist, strength: 0.1 }],
    vignette: 0.52,
  },
};

function render(scene) {
  const { width, height } = scene;
  const rgb = Buffer.alloc(width * height * 3);
  const cos = Math.cos(scene.gradientAngle);
  const sin = Math.sin(scene.gradientAngle);

  // Precalcula radiales para evitar trigonometría por píxel.
  const leaks = scene.leaks.map((l) => ({
    cx: l.x * width,
    cy: l.y * height,
    r: l.radius * Math.max(width, height),
    inv: 1 / (l.radius * Math.max(width, height)),
    tint: l.tint,
    strength: l.strength,
  }));
  const bokeh = scene.bokeh.map((b) => ({
    cx: b.x * width,
    cy: b.y * height,
    r: b.radius * Math.max(width, height),
    inv: 1 / (b.radius * Math.max(width, height)),
    tint: b.tint,
    strength: b.strength,
  }));

  const vigR = Math.hypot(width, height) * 0.62;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const u = x / width;
      const v = y / height;
      const t = clamp01((u * cos + v * sin + 1) / 2);
      let color = mix(scene.base[0], scene.base[1], smoothstep(0.05, 0.95, t));

      for (const leak of leaks) {
        const d = Math.hypot(x - leak.cx, y - leak.cy);
        const falloff = 1 - smoothstep(0, leak.r, d);
        if (falloff > 0) color = mix(color, leak.tint, falloff * falloff * leak.strength);
      }

      for (const b of bokeh) {
        const d = Math.hypot(x - b.cx, y - b.cy);
        const falloff = 1 - smoothstep(b.r * 0.35, b.r, d);
        if (falloff > 0) color = mix(color, b.tint, falloff * b.strength);
      }

      const vd = Math.hypot(x - width / 2, y - height / 2);
      color = mix(color, PALETTE.deep, smoothstep(vigR * 0.45, vigR, vd) * scene.vignette);

      const i = (y * width + x) * 3;
      rgb[i] = Math.round(clamp01(color[0] / 255) * 255);
      rgb[i + 1] = Math.round(clamp01(color[1] / 255) * 255);
      rgb[i + 2] = Math.round(clamp01(color[2] / 255) * 255);
    }
  }

  return encodePng(width, height, rgb);
}

mkdirSync(OUT_DIR, { recursive: true });

for (const [name, scene] of Object.entries(SCENES)) {
  const png = render(scene);
  writeFileSync(join(OUT_DIR, `${name}.png`), png);
  console.log(`${name}.png  ${scene.width}x${scene.height}  ${(png.length / 1024).toFixed(0)} kB`);
}
