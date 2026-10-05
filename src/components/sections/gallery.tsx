"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { galleryPhotos } from "@/config/photos";
import { Photo } from "@/components/ui/photo";
import { Reveal } from "@/components/motion/reveal";

/**
 * Scroll hijack horizontal (móvil + desktop): la sección es varias veces
 * más alta que el viewport; el panel sticky traduce el progreso vertical
 * en translateX de la tira de fotos.
 */
export function Gallery() {
  const sectionRef = useRef<HTMLElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const [travel, setTravel] = useState(0);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  const x = useTransform(scrollYProgress, [0, 1], [0, -travel]);

  // Recorrido exacto: ancho de la tira menos el viewport (responsive).
  useEffect(() => {
    const strip = stripRef.current;
    if (!strip) return;

    const measure = () => {
      const next = Math.max(0, strip.scrollWidth - window.innerWidth);
      setTravel((current) => (current === next ? current : next));
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(strip);
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="galeria"
      className="relative h-[320vh] bg-ink md:h-[420vh]"
    >
      <div className="sticky top-0 flex h-dvh flex-col justify-center overflow-hidden">
        <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
          <div className="flex items-end justify-between gap-8">
            <div>
              <Reveal>
                <span className="eyebrow text-sky/80">Galería</span>
              </Reveal>
              <Reveal delay={0.08}>
                <h2 className="mt-4 max-w-[16ch] font-display text-[clamp(2rem,5vw,3.5rem)] leading-[0.95] tracking-[-0.02em] text-cream">
                  Los momentos que guardamos
                </h2>
              </Reveal>
            </div>

            <Reveal delay={0.16} className="shrink-0 pb-2 text-right">
              <p className="eyebrow text-cream/40">Desplázate</p>
            </Reveal>
          </div>
        </div>

        <motion.div
          ref={stripRef}
          style={{ x }}
          className="mt-10 flex gap-4 px-5 will-change-transform sm:px-8 md:mt-14 md:gap-8 md:pr-[30vw]"
        >
          {galleryPhotos.map((photo, index) => (
            <figure
              key={photo.id}
              className={`group relative aspect-3/4 w-[72vw] shrink-0 overflow-hidden rounded-3xl ring-1 ring-cream/10 sm:w-[42vw] md:aspect-3/4 md:w-[25vw] md:rounded-[1.75rem] ${
                index % 3 === 1 ? "md:aspect-4/3 md:w-[38vw]" : ""
              }`}
            >
              <Photo
                photo={photo}
                sizes="(max-width: 768px) 72vw, (max-width: 1024px) 42vw, 30vw"
                className="pointer-events-none absolute inset-0 h-full w-full"
              />

              <div
                aria-hidden
                className="photo-veil pointer-events-none absolute inset-0 transition-opacity duration-700 ease-fluid group-hover:opacity-0"
              />

              <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between gap-4 p-5">
                <span className="text-sm text-cream/85">{photo.caption}</span>
                <span className="eyebrow text-cream/50">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </figcaption>
            </figure>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
