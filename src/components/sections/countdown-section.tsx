"use client";

import { motion, useScroll, useSpring } from "framer-motion";
import { weddingEvent } from "@/config/event";
import { Countdown } from "@/components/sections/countdown";
import { Reveal } from "@/components/motion/reveal";

export function CountdownSection() {
  const { scrollYProgress } = useScroll();
  // El progreso global de lectura se dibuja en una hairline fija.
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 30 });

  return (
    <>
      <motion.div
        aria-hidden
        className="fixed inset-x-0 top-0 z-50 h-px origin-left bg-olive/80"
        style={{ scaleX }}
      />

      <section className="relative overflow-hidden bg-ink py-28 sm:py-36 lg:py-44">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid grid-cols-1 gap-14 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <Reveal>
                <span className="eyebrow text-sky/80">Cuenta regresiva</span>
              </Reveal>
              <Reveal delay={0.08}>
                <h2 className="mt-5 font-display text-[clamp(2rem,4.5vw,3.25rem)] leading-[1] tracking-[-0.02em] text-cream">
                  Cuántos días faltan
                </h2>
              </Reveal>
              <Reveal delay={0.16}>
                <p className="mt-6 max-w-[32ch] text-base leading-relaxed text-cream/55">
                  El día que hemos estado esperando desde que dijimos que sí.
                </p>
              </Reveal>
            </div>

            <div className="lg:col-span-8">
              <Countdown />
            </div>
          </div>
        </div>

        {/* Franja de identidades: hairline en vez de tarjetas. */}
        <div className="mx-auto mt-24 max-w-7xl px-5 sm:px-8">
          <div className="flex flex-wrap items-baseline justify-between gap-x-10 gap-y-6 border-t border-cream/10 pt-10">
            <span className="eyebrow text-cream/35">Invitados</span>
            <span className="font-script text-4xl text-cream/90 sm:text-5xl">
              {weddingEvent.couple.first} <span className="text-olive-soft">&amp;</span>{" "}
              {weddingEvent.couple.second}
            </span>
            <span className="eyebrow text-cream/35">{weddingEvent.hashtag}</span>
          </div>
        </div>
      </section>
    </>
  );
}
