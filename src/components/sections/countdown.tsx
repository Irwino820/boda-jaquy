"use client";

import { AnimatePresence, motion, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { weddingEvent } from "@/config/event";

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

function getTimeLeft(targetIso: string, now: number): TimeLeft | null {
  const diff = new Date(targetIso).getTime() - now;
  if (diff <= 0) return null;

  return {
    days: Math.floor(diff / 1000 / 60 / 60 / 24),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

const UNITS = [
  { key: "days", label: "Días" },
  { key: "hours", label: "Horas" },
  { key: "minutes", label: "Minutos" },
  { key: "seconds", label: "Segundos" },
] as const;

const plural = (value: number, singular: string, pluralForm: string) =>
  `${value} ${value === 1 ? singular : pluralForm}`;

/**
 * Reloj del cliente. Arranca en `null` para que el HTML del servidor y el primer
 * render del cliente coincidan (si no, `Date.now()` rompe la hidratación).
 */
function useNow() {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setNow(Date.now());
    const first = window.setTimeout(tick, 0);
    const id = window.setInterval(tick, 1000);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(id);
    };
  }, []);

  return now;
}

/**
 * Cuenta regresiva con rodillo de dígitos: cada cambio entra desde arriba y
 * sale por abajo, en vez de reemplazar el número en seco.
 */
export function Countdown() {
  const targetIso = weddingEvent.ceremonyAt;
  const now = useNow();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15% 0px" });

  const timeLeft = now === null ? null : getTimeLeft(targetIso, now);

  if (now !== null && !timeLeft) {
    return (
      <div ref={ref} className="max-w-[24ch]">
        <p className="eyebrow text-sky/80">Hoy es el día</p>
        <p className="mt-4 font-display text-[clamp(2rem,5vw,3.5rem)] leading-[1.05] text-cream">
          Ya llegamos. Gracias por estar aquí.
        </p>
      </div>
    );
  }

  const format = (key: (typeof UNITS)[number]["key"]) => {
    if (!timeLeft) return "--";
    return key === "days"
      ? String(timeLeft[key])
      : String(timeLeft[key]).padStart(2, "0");
  };

  return (
    <div
      ref={ref}
      className="relative grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4 sm:gap-x-4"
    >
      {UNITS.map(({ key, label }) => (
        <div key={key} className="relative" aria-hidden>
          <span aria-hidden className="hairline absolute inset-x-0 top-0 h-px text-cream" />
          <div className="relative mt-5 overflow-hidden font-display text-[clamp(3.25rem,11vw,7rem)] leading-[1.12] tracking-[-0.03em] text-cream">
            <div className="relative h-[1.15em] overflow-hidden pb-[0.06em]">
              <AnimatePresence initial={false} mode="popLayout">
                <motion.span
                  key={format(key)}
                  className="block lining-nums tabular-nums"
                  initial={{ y: "60%", opacity: 0 }}
                  animate={{ y: "0%", opacity: 1 }}
                  exit={{ y: "-60%", opacity: 0 }}
                  transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
                >
                  {format(key)}
                </motion.span>
              </AnimatePresence>
            </div>
          </div>
          <p className="eyebrow mt-4 text-cream/45">{label}</p>
        </div>
      ))}

      {/* Los dígitos animados se ocultan a lectores de pantalla: este resumen
          solo cambia cada hora, así que no interrumpe con cada segundo. */}
      {timeLeft ? (
        <span className="sr-only" role="timer" aria-live="off">
          Faltan {plural(timeLeft.days, "día", "días")} y{" "}
          {plural(timeLeft.hours, "hora", "horas")} para la ceremonia.
        </span>
      ) : null}

      {/* Latido sutil: la sección nunca está del todo quieta. */}
      <motion.span
        aria-hidden
        className="pointer-events-none absolute -right-10 top-0 size-40 rounded-full opacity-40 blur-[80px]"
        style={{
          background:
            "radial-gradient(circle, rgba(107,124,63,0.35), transparent 65%)",
        }}
        animate={inView ? { scale: [1, 1.15, 1], opacity: [0.25, 0.5, 0.25] } : {}}
        transition={{ duration: 6, repeat: Infinity, ease: [0.32, 0.72, 0, 1] }}
      />
    </div>
  );
}
