"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import {
  useCallback,
  useEffect,
  useRef,
  useSyncExternalStore,
  type ReactNode,
} from "react";

/* ------------------------------------------------------------- Media query */

/**
 * Suscripción a `matchMedia`. En servidor y durante la hidratación devuelve
 * `false`, así el primer render coincide con el HTML y luego se sincroniza.
 */
export function useMediaQuery(query: string) {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", onChange);
      return () => list.removeEventListener("change", onChange);
    },
    [query],
  );

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
}

/** `true` en dispositivos con puntero fino: ahí viven el magnetismo y el parallax de cursor. */
export const useHasFinePointer = () => useMediaQuery("(hover: hover) and (pointer: fine)");

/* ---------------------------------------------------------------- Magnetic */

/**
 * Atracción hacia el cursor. Todo pasa por MotionValues + springs: nunca
 * `useState`, así el componente no re-renderiza durante el movimiento.
 */
export function Magnetic({
  children,
  strength = 0.32,
  className,
}: {
  children: ReactNode;
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const hasFinePointer = useHasFinePointer();
  const prefersReducedMotion = usePrefersReducedMotion();

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 240, damping: 24, mass: 0.45 });
  const springY = useSpring(y, { stiffness: 240, damping: 24, mass: 0.45 });

  const disabled = !hasFinePointer || prefersReducedMotion;

  useEffect(() => {
    if (disabled) {
      x.set(0);
      y.set(0);
      return;
    }

    const node = ref.current;
    if (!node) return;

    const handleMove = (event: PointerEvent) => {
      const rect = node.getBoundingClientRect();
      const offsetX = event.clientX - (rect.left + rect.width / 2);
      const offsetY = event.clientY - (rect.top + rect.height / 2);
      x.set(offsetX * strength);
      y.set(offsetY * strength);
    };

    const handleLeave = () => {
      x.set(0);
      y.set(0);
    };

    node.addEventListener("pointermove", handleMove);
    node.addEventListener("pointerleave", handleLeave);

    return () => {
      node.removeEventListener("pointermove", handleMove);
      node.removeEventListener("pointerleave", handleLeave);
    };
  }, [disabled, strength, x, y]);

  return (
    <motion.span
      ref={ref}
      className={className}
      style={disabled ? undefined : { x: springX, y: springY }}
    >
      {children}
    </motion.span>
  );
}

/* -------------------------------------------------------------- Reduced */

export function usePrefersReducedMotion() {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}
