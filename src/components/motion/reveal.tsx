"use client";

import { motion, type Variants } from "framer-motion";
import type { ReactNode } from "react";
import { usePrefersReducedMotion } from "@/components/motion/interactions";

export const FLUID_EASE = [0.32, 0.72, 0, 1] as const;

type SplitTextProps = {
  text?: string;
  className?: string;
  lines?: string[];
  delay?: number;
  stagger?: number;
  /**
   * Si se define, controla el reveal a mano (`true` = mostrar).
   * Ideal tras el preloader. Si se omite, usa whileInView.
   */
  gate?: boolean;
  /** Conservado por API; el reveal ya no usa máscara (evita letras cortadas). */
  script?: boolean;
};

/**
 * Reveal tipográfico estilo GSAP SplitText:
 * autoAlpha 0 + y → opacity 1 en posición final (sin overflow mask).
 * https://gsap.com/docs/v3/GSAP/CorePlugins/CSS — autoAlpha
 */
const lineReveal: Variants = {
  hidden: { y: 36, opacity: 0, visibility: "hidden" },
  show: (i: number) => ({
    y: 0,
    opacity: 1,
    visibility: "visible",
    transition: {
      duration: 1.05,
      ease: FLUID_EASE,
      delay: i,
      opacity: { duration: 1.05, ease: FLUID_EASE, delay: i },
    },
  }),
};

export function SplitText({
  text,
  lines,
  className,
  delay = 0,
  stagger = 0.09,
  gate,
}: SplitTextProps) {
  const reduceMotion = usePrefersReducedMotion();
  const chunks = lines ?? (text ? [text] : []);
  const wrapperClass = `block ${className ?? ""}`;

  // Se renderiza con <span> para que sea contenido válido dentro de <h1>/<h2>.
  if (reduceMotion) {
    return (
      <span className={wrapperClass}>
        {chunks.map((chunk, index) => (
          <span key={`${chunk}-${index}`} className="block">
            {chunk}
          </span>
        ))}
      </span>
    );
  }

  return (
    <motion.span
      className={wrapperClass}
      initial="hidden"
      {...(typeof gate === "boolean"
        ? { animate: gate ? ("show" as const) : ("hidden" as const) }
        : {
            whileInView: "show" as const,
            viewport: { once: true, margin: "-12% 0px" },
          })}
    >
      {chunks.map((chunk, index) => (
        <span key={`${chunk}-${index}`} className="block overflow-visible">
          <motion.span
            data-split-line
            className="block will-change-[transform,opacity]"
            custom={delay + index * stagger}
            variants={lineReveal}
          >
            {chunk}
          </motion.span>
        </span>
      ))}
    </motion.span>
  );
}

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  blur?: boolean;
  gate?: boolean;
};

export function Reveal({
  children,
  className,
  delay = 0,
  blur = true,
  gate,
}: RevealProps) {
  const reduceMotion = usePrefersReducedMotion();

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  const from = { opacity: 0, y: blur ? 34 : 20 };
  const to = { opacity: 1, y: 0 };

  return (
    <motion.div
      className={className}
      initial={from}
      {...(typeof gate === "boolean"
        ? { animate: gate ? to : from }
        : {
            whileInView: to,
            viewport: { once: true, margin: "-10% 0px" },
          })}
      transition={{ duration: 0.95, ease: FLUID_EASE, delay }}
    >
      {children}
    </motion.div>
  );
}

type StaggerProps = {
  children: ReactNode;
  className?: string;
  stagger?: number;
  delayChildren?: number;
};

export function Stagger({
  children,
  className,
  stagger = 0.08,
  delayChildren = 0,
}: StaggerProps) {
  const reduceMotion = usePrefersReducedMotion();

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-10% 0px" }}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: stagger, delayChildren } },
      }}
    >
      {children}
    </motion.div>
  );
}

const revealItem: Variants = {
  hidden: { opacity: 0, y: 34 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.95, ease: FLUID_EASE },
  },
};

export function StaggerItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduceMotion = usePrefersReducedMotion();

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div className={className} variants={revealItem}>
      {children}
    </motion.div>
  );
}
