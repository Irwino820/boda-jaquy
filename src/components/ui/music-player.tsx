"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { music } from "@/config/music";

const FADE_IN_MS = 2200;
const STORAGE_KEY = "pj-music";
/** Eventos que cuentan como gesto del usuario para que el navegador permita reproducir. */
const GESTURE_EVENTS = ["pointerup", "touchend", "keydown", "click"] as const;

function readPreference() {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function savePreference(value: "on" | "off") {
  try {
    window.localStorage.setItem(STORAGE_KEY, value);
  } catch {
    // Almacenamiento bloqueado (modo privado): la preferencia solo dura la visita.
  }
}

/**
 * Música de fondo. Intenta sonar al terminar la cortinilla; si el navegador lo
 * bloquea (política de autoplay), arranca con el primer gesto del invitado.
 * Si el invitado la pausa, no vuelve a sonar sola, ni en visitas posteriores.
 */
export function MusicPlayer({ ready }: { ready: boolean }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const fadeFrame = useRef(0);
  const pausedByUser = useRef(false);
  const resumeOnVisible = useRef(false);

  const [playing, setPlaying] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [failed, setFailed] = useState(false);

  const fadeTo = useCallback((target: number, duration: number) => {
    const audio = audioRef.current;
    if (!audio) return;

    cancelAnimationFrame(fadeFrame.current);
    const from = audio.volume;
    const goal = Math.min(1, Math.max(0, target));
    const startedAt = performance.now();

    const step = (now: number) => {
      const progress = Math.min(1, (now - startedAt) / duration);
      // Clamp: la interpolación float puede salir de [0, 1] por epsilon.
      audio.volume = Math.min(1, Math.max(0, from + (goal - from) * progress));
      if (progress < 1) fadeFrame.current = requestAnimationFrame(step);
    };
    fadeFrame.current = requestAnimationFrame(step);
  }, []);

  /** Devuelve `true` si empezó a sonar (o ya sonaba). */
  const start = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return false;
    if (!audio.paused) return true;

    audio.volume = 0;
    try {
      await audio.play();
      fadeTo(music.volume, FADE_IN_MS);
      return true;
    } catch {
      return false;
    }
  }, [fadeTo]);

  // Intento de arranque automático cuando termina la cortinilla.
  useEffect(() => {
    if (!ready) return;

    if (readPreference() === "off") {
      pausedByUser.current = true;
      return;
    }

    let cancelled = false;
    void start().then((started) => {
      if (!cancelled && !started) setBlocked(true);
    });

    return () => {
      cancelled = true;
    };
  }, [ready, start]);

  // Si el navegador bloqueó el autoplay, el primer gesto del invitado la inicia.
  useEffect(() => {
    if (!blocked) return;

    function release() {
      GESTURE_EVENTS.forEach((name) => window.removeEventListener(name, onGesture));
    }

    function onGesture() {
      if (pausedByUser.current) return release();
      void start().then((started) => {
        if (started) {
          setBlocked(false);
          release();
        }
      });
    }

    GESTURE_EVENTS.forEach((name) => window.addEventListener(name, onGesture));
    return release;
  }, [blocked, start]);

  // Cortesía: no sigue sonando en una pestaña que el invitado dejó en segundo plano.
  useEffect(() => {
    const onVisibility = () => {
      const audio = audioRef.current;
      if (!audio) return;

      if (document.hidden) {
        if (!audio.paused) {
          resumeOnVisible.current = true;
          audio.pause();
        }
        return;
      }

      if (resumeOnVisible.current && !pausedByUser.current) void start();
      resumeOnVisible.current = false;
    };

    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [start]);

  useEffect(() => {
    const audio = audioRef.current;
    return () => {
      cancelAnimationFrame(fadeFrame.current);
      audio?.pause();
    };
  }, []);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      pausedByUser.current = false;
      savePreference("on");
      setBlocked(false);
      void start();
      return;
    }

    pausedByUser.current = true;
    savePreference("off");
    cancelAnimationFrame(fadeFrame.current);
    audio.pause();
  };

  const label = `${music.title} — ${music.artist}`;

  return (
    <>
      <audio
        ref={audioRef}
        src={music.src}
        loop
        preload="none"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onError={() => setFailed(true)}
      />

      {failed ? null : (
        <motion.div
          className="fixed right-4 bottom-4 z-40 flex items-center gap-3 sm:right-6 sm:bottom-6"
          style={{ marginBottom: "env(safe-area-inset-bottom)" }}
          initial={{ opacity: 0, y: 24 }}
          animate={ready ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
          transition={{ duration: 0.9, ease: [0.32, 0.72, 0, 1], delay: 0.4 }}
        >
          <AnimatePresence>
            {blocked && !playing ? (
              <motion.span
                key="hint"
                role="status"
                className="glass-island rounded-full px-4 py-2 text-xs tracking-wide text-ink/70"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }}
                transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
              >
                Toca para escuchar la música
              </motion.span>
            ) : null}
          </AnimatePresence>

          <button
            type="button"
            onClick={toggle}
            aria-pressed={playing}
            aria-label={playing ? "Pausar la música" : "Reproducir la música"}
            title={label}
            className="glass-island group relative inline-flex size-12 items-center justify-center rounded-full text-ink transition-transform duration-500 ease-fluid hover:scale-105 active:scale-95"
          >
            {blocked && !playing ? (
              <span
                aria-hidden
                className="absolute inset-0 rounded-full ring-1 ring-olive [animation:music-hint_2.2s_ease-out_infinite] motion-reduce:hidden"
              />
            ) : null}

            <span aria-hidden className="relative flex h-4 items-end gap-[3px]">
              {[0, 0.35, 0.7, 0.18].map((delay, index) => (
                <span
                  key={index}
                  className={`w-[2px] rounded-full bg-current ${
                    playing ? "eq-bar h-full" : "h-1/3"
                  }`}
                  style={playing ? { animationDelay: `-${delay}s`, animationDuration: `${0.9 + index * 0.17}s` } : undefined}
                />
              ))}
            </span>

            {playing ? null : (
              <span
                aria-hidden
                className="absolute h-px w-5 -rotate-45 rounded-full bg-current opacity-70"
              />
            )}
          </button>
        </motion.div>
      )}
    </>
  );
}
