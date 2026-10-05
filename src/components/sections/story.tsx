"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { weddingEvent } from "@/config/event";
import { photos } from "@/config/photos";
import { Photo } from "@/components/ui/photo";
import { Reveal, SplitText, Stagger, StaggerItem } from "@/components/motion/reveal";

export function Story() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // Las tres fotos viajan a velocidades distintas: cascada de profundidad.
  const mainY = useTransform(scrollYProgress, [0, 1], [70, -110]);
  const wideY = useTransform(scrollYProgress, [0, 1], [140, -40]);
  const tallY = useTransform(scrollYProgress, [0, 1], [30, -160]);

  const { story } = weddingEvent;

  return (
    <section
      ref={ref}
      id="historia"
      className="relative overflow-hidden bg-cream py-28 text-ink sm:py-36 lg:py-44"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-6">
            <Reveal>
              <span className="eyebrow text-ink/45">{story.eyebrow}</span>
              <span
                aria-hidden
                className="mt-3 block h-4 w-10 bg-[url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 40 16%22 fill=%22none%22%3E%3Cpath d=%22M2 8c4-6 8-6 12 0s8 6 12 0 8-6 12 0%22 stroke=%22%236B7C3F%22 stroke-width=%221.2%22/%3E%3C/svg%3E')] bg-contain bg-left bg-no-repeat opacity-80"
              />
            </Reveal>

            <h2 className="mt-6 font-display text-[clamp(2.5rem,6.5vw,4.75rem)] leading-[0.95] tracking-[-0.02em]">
              <SplitText lines={story.lines} className="block" stagger={0.1} />
            </h2>

            <Stagger className="mt-10 max-w-[52ch] space-y-5">
              {story.body.map((paragraph) => (
                <StaggerItem key={paragraph}>
                  <p className="text-lg leading-relaxed text-ink/70">{paragraph}</p>
                </StaggerItem>
              ))}
            </Stagger>
          </div>

          {/* Composición asimétrica: el retrato manda, los otros dos lo acompañan. */}
          <div className="relative lg:col-span-6">
            <motion.div
              style={{ y: mainY }}
              className="relative z-10 ml-auto aspect-[4/5] w-[68%] overflow-hidden rounded-[2rem] ring-1 ring-ink/8"
            >
              <Photo
                photo={photos.storyMain}
                sizes="(max-width: 1024px) 68vw, 34vw"
                className="absolute inset-0 h-full w-full"
              />
            </motion.div>

            <motion.div
              style={{ y: wideY }}
              className="relative z-20 -mt-[22%] ml-[6%] aspect-[4/3] w-[54%] overflow-hidden rounded-[1.6rem] ring-1 ring-ink/8 lg:absolute lg:-left-[6%] lg:top-[46%] lg:mt-0"
            >
              <Photo
                photo={photos.storyWide}
                sizes="(max-width: 1024px) 54vw, 28vw"
                className="absolute inset-0 h-full w-full"
              />
            </motion.div>

            <motion.div
              style={{ y: tallY }}
              className="relative z-0 mt-10 aspect-[3/4] w-[46%] overflow-hidden rounded-[1.6rem] ring-1 ring-ink/8 lg:absolute lg:-right-[4%] lg:-top-[14%] lg:mt-0 lg:w-[38%]"
            >
              <Photo
                photo={photos.storyTall}
                sizes="(max-width: 1024px) 46vw, 22vw"
                className="absolute inset-0 h-full w-full"
              />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
