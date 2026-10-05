"use client";

import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { useEffect, useState } from "react";
import { defaultWhatsAppUrl, weddingEvent } from "@/config/event";
import { Pill } from "@/components/ui/cta";
import { useMediaQuery } from "@/components/motion/interactions";
import { useScrollEngine } from "@/components/providers/smooth-scroll";
import { useIntroReady } from "@/components/providers/intro";

const LINKS = [
  { id: "historia", label: "Nuestra historia" },
  { id: "galeria", label: "Galería" },
  { id: "detalles", label: "Detalles" },
  { id: "itinerario", label: "Itinerario" },
];

const MONOGRAM = `${weddingEvent.couple.first[0]}${weddingEvent.couple.second[0]}`;

export function Nav() {
  const scroll = useScrollEngine();
  // La isla de vidrio entra después de la cortinilla, no detrás del telón.
  const ready = useIntroReady();
  const [menuRequested, setOpen] = useState(false);
  const [condensed, setCondensed] = useState(false);
  const { scrollY } = useScroll();
  const isDesktop = useMediaQuery("(min-width: 768px)");
  // Al ensanchar la ventana el overlay desaparece (md:hidden): el menú se da por cerrado.
  const open = menuRequested && !isDesktop;
  const whatsappUrl = defaultWhatsAppUrl();

  useMotionValueEvent(scrollY, "change", (value) => {
    const next = value > 120;
    setCondensed((current) => (current === next ? current : next));
  });

  // Con el menú abierto: sin scroll de fondo y Esc lo cierra.
  useEffect(() => {
    if (!open) return;

    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    scroll.stop();
    // Sin motor suave (movimiento reducido) el bloqueo se hace con CSS.
    if (!scroll.isSmooth()) root.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      root.style.overflow = previousOverflow;
      scroll.start();
    };
  }, [open, scroll]);

  const go = (id: string) => {
    setOpen(false);
    // Deja terminar la salida del overlay antes de desplazar.
    window.setTimeout(() => scroll.scrollToId(id), 260);
  };

  return (
    <>
      <motion.header
        className="fixed inset-x-0 top-0 z-40 flex justify-center px-4 pt-4 sm:pt-6"
        initial={{ y: -80, opacity: 0 }}
        animate={ready ? { y: 0, opacity: 1 } : { y: -80, opacity: 0 }}
        transition={{ duration: 1, ease: [0.32, 0.72, 0, 1], delay: 0.05 }}
      >
        <nav
          aria-label="Principal"
          className={`glass-island flex w-full max-w-4xl items-center justify-between gap-6 rounded-full pl-2 pr-2 transition-[padding] duration-700 ease-fluid sm:pl-3 sm:pr-3 ${
            condensed ? "py-1.5" : "py-2.5"
          }`}
        >
          <button
            type="button"
            onClick={() => go("inicio")}
            aria-label="Ir al inicio"
            className="flex items-center gap-2.5 rounded-full pl-1 pr-2"
          >
            <span className="relative inline-flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-sky ring-1 ring-ink/10">
              <span className="font-script translate-y-[1px] pr-[0.12em] text-[1.05rem] leading-none tracking-[-0.04em] text-ink">
                {MONOGRAM}
              </span>
            </span>
          </button>

          <ul className="hidden items-center gap-1 md:flex">
            {LINKS.map((link) => (
              <li key={link.id}>
                <button
                  type="button"
                  onClick={() => go(link.id)}
                  className="rounded-full px-4 py-2 text-sm text-ink/55 transition-colors duration-500 ease-fluid hover:bg-sky/80 hover:text-ink"
                >
                  {link.label}
                </button>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            <div className="hidden sm:block">
              <Pill
                variant="solid"
                className="h-10 pl-5"
                href={whatsappUrl}
              >
                Confirmar
              </Pill>
            </div>

            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              aria-expanded={open}
              aria-controls="menu-movil"
              aria-label={open ? "Cerrar menú" : "Abrir menú"}
              className="relative inline-flex size-10 items-center justify-center rounded-full bg-sky ring-1 ring-ink/10 md:hidden"
            >
              <span className="relative block h-[14px] w-[18px]" aria-hidden>
                <motion.span
                  className="absolute inset-x-0 top-0 h-[1.5px] origin-center rounded-full bg-ink"
                  animate={
                    open
                      ? { rotate: 45, y: 6.25 }
                      : { rotate: 0, y: 0 }
                  }
                  transition={{ duration: 0.45, ease: [0.32, 0.72, 0, 1] }}
                />
                <motion.span
                  className="absolute inset-x-0 top-1/2 h-[1.5px] origin-center -translate-y-1/2 rounded-full bg-ink"
                  animate={
                    open
                      ? { opacity: 0, scaleX: 0.4 }
                      : { opacity: 1, scaleX: 1 }
                  }
                  transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
                />
                <motion.span
                  className="absolute inset-x-0 bottom-0 h-[1.5px] origin-center rounded-full bg-ink"
                  animate={
                    open
                      ? { rotate: -45, y: -6.25 }
                      : { rotate: 0, y: 0 }
                  }
                  transition={{ duration: 0.45, ease: [0.32, 0.72, 0, 1] }}
                />
              </span>
            </button>
          </div>
        </nav>
      </motion.header>

      <AnimatePresence>
        {open ? (
          <motion.div
            id="menu-movil"
            className="fixed inset-0 z-30 flex flex-col justify-center bg-cream/92 px-6 backdrop-blur-2xl md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <ul className="space-y-1">
              {LINKS.map((link, index) => (
                <motion.li
                  key={link.id}
                  initial={{ opacity: 0, y: 44 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20, transition: { duration: 0.2 } }}
                  transition={{
                    duration: 0.7,
                    ease: [0.32, 0.72, 0, 1],
                    delay: 0.1 + index * 0.07,
                  }}
                >
                  <button
                    type="button"
                    onClick={() => go(link.id)}
                    className="block w-full py-3 text-left font-display text-4xl text-ink"
                  >
                    {link.label}
                  </button>
                </motion.li>
              ))}
            </ul>

            <motion.div
              className="mt-10"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, transition: { duration: 0.2, delay: 0 } }}
              transition={{ duration: 0.7, delay: 0.4 }}
            >
              <Pill href={whatsappUrl}>Confirmar asistencia</Pill>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
