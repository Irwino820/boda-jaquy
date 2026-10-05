"use client";

import {
  AnimatePresence,
  motion,
  useMotionValue,
  useTransform,
} from "framer-motion";
import { useEffect, useState } from "react";
import { weddingEvent } from "@/config/event";

const { first, second } = weddingEvent.couple;
const COUNT_MS = 1800;
const HOLD_MS = 380;
const EXIT_MS = 1200;

const EASE_OUT = [0.76, 0, 0.24, 1] as const;
const EASE_FLUID = [0.32, 0.72, 0, 1] as const;

const PANEL_TONES = ["#354024", "#3f4a2c", "#4a5630", "#556338"] as const;

type Phase = "count" | "exit";

type PreloaderProps = {
  /** Home ya visible bajo las barras (al iniciar la salida). */
  onReveal: () => void;
  /** Barras fuera: desmontar y liberar scroll. */
  onDone: () => void;
};

/**
 * Preloader AAA: 4 barras de cortina. Al salir hacia arriba el home
 * ya está debajo (onReveal al arrancar el exit).
 */
export function Preloader({ onReveal, onDone }: PreloaderProps) {
  const [visible, setVisible] = useState(true);
  const [phase, setPhase] = useState<Phase>("count");

  const progress = useMotionValue(0);
  const percent = useTransform(progress, (value) =>
    Math.round(value).toString().padStart(3, "0"),
  );
  const barScale = useTransform(progress, [0, 100], [0, 1]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const skip = requestAnimationFrame(() => {
        onReveal();
        setVisible(false);
        onDone();
      });
      return () => cancelAnimationFrame(skip);
    }

    let frame = 0;
    let hold = 0;
    let exit = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / COUNT_MS);
      progress.set((1 - Math.pow(1 - t, 3.2)) * 100);

      if (t < 1) {
        frame = requestAnimationFrame(tick);
        return;
      }

      hold = window.setTimeout(() => {
        // Home listo bajo la cortina antes de que las barras suban.
        onReveal();
        setPhase("exit");
        exit = window.setTimeout(() => {
          setVisible(false);
          onDone();
        }, EXIT_MS);
      }, HOLD_MS);
    };

    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(hold);
      window.clearTimeout(exit);
    };
  }, [onDone, onReveal, progress]);

  const exiting = phase === "exit";

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          aria-hidden
          className="fixed inset-0 z-60 overflow-hidden"
          exit={{ opacity: 1, transition: { duration: 0 } }}
        >
          {/* 4 barras a pantalla completa — salen en cascada hacia arriba. */}
          <div className="pointer-events-none absolute inset-0 flex">
            {PANEL_TONES.map((tone, index) => (
              <motion.span
                key={tone}
                className="relative h-full min-w-0 flex-1"
                initial={{ y: "0%" }}
                animate={{ y: exiting ? "-105%" : "0%" }}
                transition={{
                  duration: 1.05,
                  ease: EASE_OUT,
                  delay: exiting ? index * 0.08 : 0,
                }}
              >
                <span
                  className="absolute inset-0"
                  style={{ backgroundColor: tone }}
                />
                {index < PANEL_TONES.length - 1 ? (
                  <span
                    aria-hidden
                    className="absolute inset-y-0 right-0 w-px bg-cream/12"
                  />
                ) : null}
              </motion.span>
            ))}
          </div>

          <motion.div
            className="relative z-10 flex h-full flex-col items-center justify-center px-6"
            initial={{ opacity: 0, visibility: "hidden" as const }}
            animate={
              exiting
                ? { opacity: 0, y: -28, visibility: "hidden" as const }
                : { opacity: 1, y: 0, visibility: "visible" as const }
            }
            transition={{
              duration: exiting ? 0.4 : 0.8,
              ease: EASE_FLUID,
              delay: exiting ? 0 : 0.15,
            }}
          >
            <motion.p
              className="font-display text-[0.7rem] tracking-[0.42em] text-cream/45 uppercase"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: exiting ? 0 : 1, y: exiting ? -12 : 0 }}
              transition={{ duration: 0.9, ease: EASE_FLUID, delay: 0.25 }}
            >
              Matrimonio civil
            </motion.p>

            <div className="mt-8 text-center text-cream">
              <RevealLine delay={0.35} className="font-script text-[clamp(3.5rem,12vw,7rem)] leading-[0.95]">
                {first}
              </RevealLine>
              <RevealLine
                delay={0.48}
                className="font-script text-[clamp(2rem,6vw,3.5rem)] leading-[1.05] text-olive-soft"
              >
                y
              </RevealLine>
              <RevealLine delay={0.58} className="font-script text-[clamp(3.5rem,12vw,7rem)] leading-[0.95]">
                {second}
              </RevealLine>
            </div>

            <motion.span
              aria-hidden
              className="mt-6 block h-4 w-12 bg-[url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 48 16%22 fill=%22none%22%3E%3Cpath d=%22M2 8c5-6 10-6 14 0s10 6 14 0 10-6 14 0%22 stroke=%22%23D5DEC0%22 stroke-width=%221.2%22 stroke-linecap=%22round%22/%3E%3C/svg%3E')] bg-contain bg-center bg-no-repeat opacity-80"
              initial={{ opacity: 0, scaleX: 0.4 }}
              animate={{ opacity: exiting ? 0 : 0.8, scaleX: 1 }}
              transition={{ duration: 0.9, ease: EASE_FLUID, delay: 0.75 }}
            />
          </motion.div>

          <motion.div
            className="absolute inset-x-0 bottom-0 z-10 px-6 pb-7 sm:px-10 sm:pb-9"
            initial={{ opacity: 0 }}
            animate={exiting ? { opacity: 0, y: 16 } : { opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: EASE_FLUID, delay: exiting ? 0 : 0.4 }}
          >
            <div className="mx-auto flex max-w-5xl items-end justify-between gap-6">
              <span className="eyebrow text-cream/40">Cargando</span>
              <motion.span className="font-display text-4xl lining-nums tabular-nums tracking-tight text-cream sm:text-5xl">
                {percent}
              </motion.span>
            </div>

            <div className="mx-auto mt-5 h-px max-w-5xl overflow-hidden bg-cream/15">
              <motion.span
                className="block h-full origin-left bg-olive-soft"
                style={{ scaleX: barScale }}
              />
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function RevealLine({
  children,
  className,
  delay,
}: {
  children: string;
  className?: string;
  delay: number;
}) {
  return (
    <span className={`mx-auto block ${className ?? ""}`}>
      <motion.span
        data-preloader-name
        className="block will-change-[transform,opacity]"
        initial={{ y: 36, opacity: 0, visibility: "hidden" }}
        animate={{
          y: 0,
          opacity: 1,
          visibility: "visible",
          transition: {
            duration: 1.05,
            ease: EASE_OUT,
            delay,
            opacity: { duration: 1.05, ease: EASE_FLUID, delay },
          },
        }}
      >
        {children}
      </motion.span>
    </span>
  );
}
