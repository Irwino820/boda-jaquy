"use client";

import Lenis from "lenis";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from "react";

export type ScrollEngine = {
  /** `true` cuando el scroll suave está activo (no con `prefers-reduced-motion`). */
  isSmooth: () => boolean;
  /** Reactiva el scroll tras la cortinilla de entrada. */
  start: () => void;
  stop: () => void;
  /** Desplaza a un ancla compensando la navegación flotante. */
  scrollToId: (id: string, offset?: number) => void;
};

const noop = () => {};

const fallbackEngine: ScrollEngine = {
  isSmooth: () => false,
  start: noop,
  stop: noop,
  scrollToId: noop,
};

const ScrollEngineContext = createContext<ScrollEngine>(fallbackEngine);

export function useScrollEngine() {
  return useContext(ScrollEngineContext);
}

export function SmoothScroll({ children }: { children: ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Docs Lenis: nested scroll con prevent + allowNestedScroll.
    // En touch, syncTouch=false deja el scroll nativo (recomendación oficial).
    const instance = new Lenis({
      lerp: 0.085,
      wheelMultiplier: 0.95,
      touchMultiplier: 1.6,
      smoothWheel: true,
      syncTouch: false,
      allowNestedScroll: true,
      prevent: (node) =>
        node.hasAttribute("data-lenis-prevent") ||
        node.closest("[data-lenis-prevent]") !== null,
    });

    // El preloader bloquea el scroll hasta terminar su entrada.
    instance.stop();
    lenisRef.current = instance;

    let frame = 0;
    const raf = (time: number) => {
      instance.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frame);
      instance.destroy();
      lenisRef.current = null;
    };
  }, []);

  // El objeto se crea una sola vez y lee `lenisRef.current` en cada llamada:
  // sin setState en el efecto y sin re-renders al inicializar el motor.
  const engine = useMemo<ScrollEngine>(
    () => ({
      isSmooth: () => lenisRef.current !== null,
      start: () => lenisRef.current?.start(),
      stop: () => lenisRef.current?.stop(),
      scrollToId: (id, offset = -88) => {
        const target = document.getElementById(id);
        if (!target) return;

        const lenis = lenisRef.current;
        if (lenis) {
          lenis.scrollTo(target, { offset, duration: 1.4 });
          return;
        }

        window.scrollTo({
          top: target.getBoundingClientRect().top + window.scrollY + offset,
          behavior: "smooth",
        });
      },
    }),
    [],
  );

  return (
    <ScrollEngineContext.Provider value={engine}>
      {children}
    </ScrollEngineContext.Provider>
  );
}
