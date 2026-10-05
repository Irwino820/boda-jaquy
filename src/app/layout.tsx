import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Great_Vibes, Outfit } from "next/font/google";
import { MotionConfig } from "framer-motion";
import { SmoothScroll } from "@/components/providers/smooth-scroll";
import { weddingEvent } from "@/config/event";
import { photos } from "@/config/photos";
import "./globals.css";

const greatVibes = Great_Vibes({
  variable: "--font-great-vibes",
  subsets: ["latin", "latin-ext"],
  weight: "400",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

const { first, second } = weddingEvent.couple;
const title = `${first} & ${second} — Matrimonio civil`;

// Dominio de producción: NEXT_PUBLIC_SITE_URL, el de Vercel si existe, o local.
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

const shareImage = {
  url: photos.hero.src,
  width: photos.hero.width,
  height: photos.hero.height,
  alt: photos.hero.alt,
};

export const metadata: Metadata = {
  // Resuelve las URLs absolutas de Open Graph y Twitter.
  metadataBase: new URL(siteUrl),
  title,
  description: weddingEvent.tagline,
  applicationName: title,
  openGraph: {
    title,
    description: weddingEvent.tagline,
    locale: "es_MX",
    type: "website",
    images: [shareImage],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description: weddingEvent.tagline,
    images: [shareImage.url],
  },
};

export const viewport: Viewport = {
  themeColor: "#f7f6f1",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${greatVibes.variable} ${cormorant.variable} ${outfit.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-cream text-ink">
        <MotionConfig reducedMotion="user">
          <SmoothScroll>{children}</SmoothScroll>
        </MotionConfig>
      </body>
    </html>
  );
}
