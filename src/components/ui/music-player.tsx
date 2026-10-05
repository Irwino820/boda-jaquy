"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { music } from "@/config/music";

const FADE_IN_MS = 1400;

const GESTURE_EVENTS = [
  "pointerdown",
  "touchstart",
  "mousedown",
  "keydown",
  "click",
] as const;

/**
 * Intenta sonar CON volumen desde el primer frame (sin esperar toque).
 * Si el navegador lo bloquea, cae a mute + el primer gesto lo desbloquea.
 *
 * Nota: Chrome/Safari pueden prohibir autoplay con sonido. No hay forma 100%
 * fiable de forzar audio audible sin gesto en todos los dispositivos.
 */
export function MusicPlayer({ ready }: { ready: boolean }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const fadeFrame = useRef(0);
  const unlocked = useRef(false);
  const pausedByUser = useRef(false);
  const resumeOnVisible = useRef(false);
  const readyRef = useRef(ready);
  const bootAttempted = useRef(false);

  const [playing, setPlaying] = useState(false);
  const [needsGesture, setNeedsGesture] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    readyRef.current = ready;
  }, [ready]);

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

  /** Arranque agresivo: primero con sonido; si falla, muteado. */
  const bootWithSound = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || pausedByUser.current) return;

    audio.muted = false;
    audio.volume = readyRef.current ? music.volume : Math.min(music.volume, 0.35);

    const loud = audio.play();
    if (!loud) return;

    void loud
      .then(() => {
        unlocked.current = true;
        setNeedsGesture(false);
        if (readyRef.current) fadeTo(music.volume, FADE_IN_MS);
      })
      .catch(() => {
        // Fallback muteado (siempre permitido).
        audio.muted = true;
        audio.volume = 0;
        void audio
          .play()
          .then(() => setNeedsGesture(true))
          .catch(() => setNeedsGesture(true));
      });
  }, [fadeTo]);

  /** Gesto síncrono: desmutea y sube volumen en el mismo tick. */
  const unlockFromGesture = useCallback(() => {
    if (pausedByUser.current) return;
    const audio = audioRef.current;
    if (!audio) return;

    unlocked.current = true;
    setNeedsGesture(false);
    audio.muted = false;

    const target = readyRef.current ? music.volume : Math.min(music.volume, 0.35);
    if (audio.volume < 0.05) audio.volume = 0.05;

    const playPromise = audio.play();
    if (playPromise) {
      void playPromise
        .then(() => {
          if (readyRef.current) fadeTo(music.volume, FADE_IN_MS);
          else fadeTo(target, 600);
        })
        .catch(() => setNeedsGesture(true));
    } else if (readyRef.current) {
      fadeTo(music.volume, FADE_IN_MS);
    }
  }, [fadeTo]);

  useEffect(() => {
    try {
      window.localStorage.removeItem("pj-music");
    } catch {
      /* ignore */
    }

    const onGesture = () => unlockFromGesture();
    GESTURE_EVENTS.forEach((name) => {
      window.addEventListener(name, onGesture, { capture: true, passive: true });
    });
    return () => {
      GESTURE_EVENTS.forEach((name) => {
        window.removeEventListener(name, onGesture, { capture: true });
      });
    };
  }, [unlockFromGesture]);

  // Cada visita: intenta sonar YA (con volumen), sin esperar toque.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    pausedByUser.current = false;
    unlocked.current = false;
    bootAttempted.current = false;

    const run = () => {
      if (pausedByUser.current || unlocked.current) return;
      bootAttempted.current = true;
      bootWithSound();
    };

    // Intento inmediato + reintentos (el archivo a veces aún no está listo al recargar).
    run();
    const t1 = window.setTimeout(run, 250);
    const t2 = window.setTimeout(run, 800);
    const t3 = window.setTimeout(run, 1600);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
      cancelAnimationFrame(fadeFrame.current);
      audio.pause();
    };
  }, [bootWithSound]);

  // Al salir el preloader: si ya suena con permiso, sube a volumen final.
  useEffect(() => {
    if (!ready || pausedByUser.current) return;
    const audio = audioRef.current;
    if (!audio) return;

    if (unlocked.current) {
      audio.muted = false;
      if (audio.paused) void audio.play().catch(() => setNeedsGesture(true));
      fadeTo(music.volume, FADE_IN_MS);
      setNeedsGesture(false);
      return;
    }

    // Reintenta con sonido al revelar (algunos navegadores lo permiten aquí).
    bootWithSound();
  }, [ready, bootWithSound, fadeTo]);

  useEffect(() => {
    const onVisibility = () => {
      const audio = audioRef.current;
      if (!audio || pausedByUser.current) return;

      if (document.hidden) {
        if (!audio.paused) {
          resumeOnVisible.current = true;
          audio.pause();
        }
        return;
      }

      if (!resumeOnVisible.current) return;
      resumeOnVisible.current = false;

      if (unlocked.current) {
        audio.muted = false;
        void audio
          .play()
          .then(() => fadeTo(music.volume, 500))
          .catch(() => bootWithSound());
        return;
      }

      bootWithSound();
    };

    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [bootWithSound, fadeTo]);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused || pausedByUser.current) {
      pausedByUser.current = false;
      unlocked.current = true;
      setNeedsGesture(false);
      audio.muted = false;
      audio.volume = Math.max(audio.volume, 0.05);
      void audio.play().then(() => fadeTo(music.volume, FADE_IN_MS));
      return;
    }

    pausedByUser.current = true;
    cancelAnimationFrame(fadeFrame.current);
    audio.pause();
  };

  const label = `${music.title} — ${music.artist}`;
  const showHint = needsGesture && !playing && ready;

  return (
    <>
      <audio
        ref={audioRef}
        src={music.src}
        loop
        preload="auto"
        autoPlay
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
            {showHint ? (
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
            {showHint ? (
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
