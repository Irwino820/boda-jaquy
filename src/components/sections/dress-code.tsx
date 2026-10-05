"use client";

import { weddingEvent } from "@/config/event";
import { photos } from "@/config/photos";
import { Photo } from "@/components/ui/photo";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";

/** Trío Amalfi: blanco frío, azules y verdes olivo. */
const SWATCHES = ["#f8fafc", "#d6e4f5", "#163a6b", "#d5dec0", "#6b7c3f", "#4a5630"];

export function DressCode() {
  const { dressCode } = weddingEvent;

  return (
    <section id="vestimenta" className="relative bg-ink py-28 sm:py-36 lg:py-44">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5 lg:order-2">
            <Reveal>
              <span className="eyebrow text-sky/80">{dressCode.eyebrow}</span>
            </Reveal>

            <Reveal delay={0.08}>
              <h2 className="mt-5 font-display text-[clamp(2.25rem,5.5vw,4rem)] leading-[0.98] tracking-[-0.02em] text-cream">
                {dressCode.title}
              </h2>
            </Reveal>

            <Reveal delay={0.16}>
              <p className="mt-6 max-w-[46ch] text-lg leading-relaxed text-cream/65">
                {dressCode.description}
              </p>
            </Reveal>

            <Stagger className="mt-10 flex flex-wrap gap-2" stagger={0.06}>
              {dressCode.palette.map((tone, index) => (
                <StaggerItem
                  key={`${tone}-${index}`}
                  className="rounded-full bg-cream/8 py-1.5 pl-1.5 pr-4 ring-1 ring-cream/15"
                >
                  <span className="flex items-center gap-2.5">
                    <span
                      aria-hidden
                      className="size-6 rounded-full ring-1 ring-cream/25"
                      style={{ background: SWATCHES[index % SWATCHES.length] }}
                    />
                    <span className="text-sm text-cream/75">{tone}</span>
                  </span>
                </StaggerItem>
              ))}
            </Stagger>
          </div>

          <Reveal className="lg:col-span-6 lg:order-1" blur={false}>
            <div className="relative mx-auto aspect-[4/5] w-[80vw] max-w-md lg:w-full">
              {/* Doble bisel: carcasa azul clara y núcleo con la fotografía. */}
              <div className="absolute inset-0 rounded-[2.25rem] bg-cream/8 p-2 ring-1 ring-cream/15">
                <div className="relative h-full w-full overflow-hidden rounded-[1.85rem]">
                  <Photo
                    photo={photos.dress}
                    sizes="(max-width: 1024px) 80vw, 44vw"
                    className="absolute inset-0 h-full w-full"
                  />
                  <div
                    aria-hidden
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(200deg, rgba(74,126,199,0.22), transparent 45%, rgba(22,58,107,0.55))",
                    }}
                  />
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
