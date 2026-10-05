"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { music } from "@/config/music";

const FADE_IN_MS = 2200;
/** Gestos que desbloquean audio (política de autoplay del navegador). */
const GESTURE_EVENTS = [
  "pointerdown",
  "touchstart",
  "keydown",
  "click",
] as const;

/**
 * Música de fondo. Siempre intenta sonar (sin persistir preferencia off).
 * Desbloquea con el primer toque y arranca en cuanto `ready` lo permite.
 */
export function MusicPlayer({ ready }: { ready: boolean }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const fadeFrame = useRef(0);
  const pausedByUser = useRef(false);
  const resumeOnVisible = useRef(false);
  const unlocked = useRef(false);
  const starting = useRef(false);

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
      audio.volume = Math.min(1, Math.max(0, from + (goal - from) * progress));
      if (progress < 1) fadeFrame.current = requestAnimationFrame(step);
    };
    fadeFrame.current = requestAnimationFrame(step);
  }, []);

  /** Desbloquea el elemento de audio con un play silencioso (gesto del usuario). */
  const unlockAudio = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || unlocked.current) return;
    unlocked.current = true;

    try {
      audio.muted = true;
      audio.volume = 0;
      await audio.play();
      audio.pause();
      audio.currentTime = 0;
      audio.muted = false;
    } catch {
      // Si falla el prime, igual marcamos unlocked: el play real se reintenta luego.
    }
  }, []);

  /** Devuelve `true` si empezó a sonar (o ya sonaba). */
  const start = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return false;
    if (!audio.paused) return true;
    if (pausedByUser.current) return false;
    if (starting.current) return false;

    starting.current = true;
    audio.muted = false;
    audio.volume = 0;

    try {
      // Asegura datos en el buffer antes de play (evita fallos intermitentes).
      if (audio.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
        audio.load();
        await new Promise<void>((resolve, reject) => {
          const onReady = () => {
            cleanup();
            resolve();
          };
          const onError = () => {
            cleanup();
            reject(new Error("audio error"));
          };
          const cleanup = () => {
            audio.removeEventListener("canplay", onReady);
            audio.removeEventListener("error", onError);
          };
          audio.addEventListener("canplay", onReady, { once: true });
          audio.addEventListener("error", onError, { once: true });
          window.setTimeout(() => {
            cleanup();
            resolve();
          }, 2500);
        });
      }

      await audio.play();
      fadeTo(music.volume, FADE_IN_MS);
      setBlocked(false);
      return true;
    } catch {
      return false;
    } finally {
      starting.current = false;
    }
  }, [fadeTo]);

  // Desde el primer paint: cualquier gesto desbloquea y, si ya hay ready, arranca.
  useEffect(() => {
    // Limpia un "off" viejo si quedó de versiones anteriores.
    try {
      window.localStorage.removeItem("pj-music");
    } catch {
      /* ignore */
    }

    const onGesture = () => {
      if (pausedByUser.current) return;

      void (async () => {
        await unlockAudio();
        if (ready) {
          const started = await start();
          if (!started) setBlocked(true);
        }
      })();
    };

    GESTURE_EVENTS.forEach((name) =>
      window.addEventListener(name, onGesture, { capture: true, passive: true }),
    );

    return () => {
      GESTURE_EVENTS.forEach((name) =>
        window.removeEventListener(name, onGesture, { capture: true }),
      );
    };
  }, [ready, start, unlockAudio]);

  // Cuando termina la cortinilla: intenta autoplay; si no, espera gesto.
  useEffect(() => {
    if (!ready) return;
    if (pausedByUser.current) return;

    let cancelled = false;

    void (async () => {
      // Microtarea + rAF: da tiempo al audio precargado tras el unlock del preloader.
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
      if (cancelled) return;

      const started = await start();
      if (!cancelled && !started) setBlocked(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [ready, start]);

  // Cortesía: pausa en pestaña oculta y reanuda al volver (si no la pausó el invitado).
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

      if (resumeOnVisible.current && !pausedByUser.current) {
        resumeOnVisible.current = false;
        void start();
      } else {
        resumeOnVisible.current = false;
      }
    };

    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [start]);

  useEffect(() => {
    const audio = audioRef.current;
    // Precarga en cuanto monta (mejora el play tras el preloader).
    try {
      audio?.load();
    } catch {
      /* ignore */
    }

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
      setBlocked(false);
      void (async () => {
        await unlockAudio();
        await start();
      })();
      return;
    }

    // Pausa solo en esta visita; no se persiste.
    pausedByUser.current = true;
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
        preload="auto"
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
                  style={
                    playing
                      ? {
                          animationDelay: `-${delay}s`,
                          animationDuration: `${0.9 + index * 0.17}s`,
                        }
                      : undefined
                  }
                />
              ))}
            </span>
          </button>
        </motion.div>
      )}
    </>
  );
}
