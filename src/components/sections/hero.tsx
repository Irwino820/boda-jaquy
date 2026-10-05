"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import {
  ceremonyDateParts,
  defaultWhatsAppUrl,
  weddingEvent,
} from "@/config/event";
import { photos } from "@/config/photos";
import { Photo } from "@/components/ui/photo";
import { Pill } from "@/components/ui/cta";
import { Reveal, SplitText } from "@/components/motion/reveal";
import { useIntroReady } from "@/components/providers/intro";

/**
 * Hero Amalfi limpio: split editorial (texto | arco).
 * Inspirado en la invitación "La Dolce Vita" — sin chrome de más.
 */
export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const ready = useIntroReady();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const imageScale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);
  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "12%"]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "-12%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);

  const { couple, ceremony, ceremonyAt } = weddingEvent;
  const date = ceremonyDateParts(ceremonyAt);
  const whatsappUrl = defaultWhatsAppUrl();

  return (
    <section
      ref={ref}
      id="inicio"
      className="relative min-h-[100dvh] overflow-x-clip bg-cream pt-28 sm:pt-32"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_70%_20%,rgba(214,228,245,0.5),transparent_65%)]"
      />

      <motion.div
        style={{ y: contentY, opacity: contentOpacity }}
        className="relative z-10 mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-5 pb-16 sm:px-8 lg:grid-cols-2 lg:gap-14 lg:pb-20"
      >
        <div className="text-center lg:text-left">
          <Reveal blur={false} gate={ready} delay={0.05}>
            <p className="font-display text-[0.7rem] tracking-[0.36em] text-ink/45 uppercase">
              Matrimonio civil
            </p>
          </Reveal>

          <h1 className="mt-5 overflow-visible text-ink">
            <SplitText
              text={couple.first}
              className="font-script block text-[clamp(3.5rem,10vw,6.5rem)] leading-[0.95]"
              delay={0.1}
              gate={ready}
              script
            />
            <SplitText
              text="y"
              className="font-script block text-[clamp(2rem,5.5vw,3.25rem)] leading-[1.05] text-olive"
              delay={0.2}
              gate={ready}
              script
            />
            <SplitText
              text={couple.second}
              className="font-script block text-[clamp(3.5rem,10vw,6.5rem)] leading-[0.95]"
              delay={0.28}
              gate={ready}
              script
            />
          </h1>

          <Reveal delay={0.45} gate={ready} className="mt-5">
            <span
              aria-hidden
              className="mx-auto block h-4 w-11 bg-[url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 44 16%22 fill=%22none%22%3E%3Cpath d=%22M2 8c5-6 9-6 13 0s9 6 13 0 9-6 13 0%22 stroke=%22%23163A6B%22 stroke-width=%221.15%22 stroke-linecap=%22round%22/%3E%3C/svg%3E')] bg-contain bg-center bg-no-repeat opacity-70 lg:mx-0 lg:bg-left"
            />
            <p className="mt-4 font-display text-lg text-ink/65 sm:text-xl">
              {date.day} de {date.month}
              <span className="mx-2 text-olive">·</span>
              {date.time}
            </p>
            <p className="mt-1 text-sm tracking-wide text-ink/45">
              {date.weekday} · {ceremony.city}
            </p>
          </Reveal>

          <Reveal
            delay={0.58}
            gate={ready}
            className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start"
          >
            <Pill href={whatsappUrl}>Confirmar asistencia</Pill>
            <Pill variant="outline" href={ceremony.mapUrl}>
              Ver ubicación
            </Pill>
          </Reveal>
        </div>

        <motion.div style={{ y: imageY }} className="relative mx-auto w-full max-w-md lg:mx-0 lg:max-w-none">
          <div
            aria-hidden
            className="tile-motif absolute -right-2 top-6 -z-10 hidden h-[78%] w-[40%] rounded-t-full rounded-b-xl opacity-75 ring-1 ring-ink/8 lg:block"
          />

          <Reveal blur={false} gate={ready} delay={0.3} className="relative">
            <motion.div
              style={{ scale: imageScale }}
              className="relative mx-auto aspect-[4/5] w-[min(100%,22rem)] overflow-hidden rounded-t-full rounded-b-[1.5rem] ring-1 ring-ink/10 shadow-[0_28px_56px_-36px_rgba(22,58,107,0.4)] sm:w-full sm:max-w-md lg:max-w-none"
            >
              <Photo
                photo={photos.hero}
                sizes="(max-width: 1024px) 88vw, 40vw"
                quality={82}
                priority
                className="absolute inset-0 h-full w-full"
              />
              <div
                aria-hidden
                className="absolute inset-0 bg-gradient-to-t from-ink/20 via-transparent to-transparent"
              />
            </motion.div>
          </Reveal>
        </motion.div>
      </motion.div>
    </section>
  );
}
