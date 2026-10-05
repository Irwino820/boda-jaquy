"use client";

import { weddingEvent } from "@/config/event";
import { photos } from "@/config/photos";
import { Photo } from "@/components/ui/photo";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";

/**
 * Itinerario del día: timeline vertical con horarios de la celebración.
 */
export function Itinerary() {
  const { itinerary } = weddingEvent;

  return (
    <section id="itinerario" className="relative bg-ink py-28 sm:py-36 lg:py-44">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-6">
            <Reveal>
              <span className="eyebrow text-sky/80">{itinerary.eyebrow}</span>
            </Reveal>

            <Reveal delay={0.08}>
              <h2 className="mt-5 font-display text-[clamp(2.25rem,5.5vw,4rem)] leading-[0.98] tracking-[-0.02em] text-cream">
                {itinerary.title}
              </h2>
            </Reveal>

            <Reveal delay={0.16}>
              <p className="mt-6 max-w-[46ch] text-lg leading-relaxed text-cream/65">
                {itinerary.description}
              </p>
            </Reveal>

            <Stagger className="relative mt-12" stagger={0.08}>
              <span
                aria-hidden
                className="absolute top-2 bottom-2 left-[0.35rem] w-px bg-cream/15"
              />

              {itinerary.moments.map((moment) => (
                <StaggerItem
                  key={`${moment.time}-${moment.title}`}
                  className="relative grid grid-cols-[0.7rem_5.5rem_1fr] items-start gap-x-4 pb-10 last:pb-0 sm:grid-cols-[0.7rem_6.5rem_1fr] sm:gap-x-5"
                >
                  <span
                    aria-hidden
                    className="relative z-10 mt-1.5 size-[0.7rem] rounded-full bg-olive-soft ring-4 ring-ink"
                  />
                  <time className="font-sans text-sm font-medium lining-nums tabular-nums tracking-wide text-olive-soft sm:text-base">
                    {moment.time}
                  </time>
                  <div className="min-w-0">
                    <h3 className="font-display text-2xl leading-tight tracking-[-0.02em] text-cream sm:text-[1.65rem]">
                      {moment.title}
                    </h3>
                    <p className="mt-2 max-w-[36ch] text-sm leading-relaxed text-cream/55 sm:text-[0.95rem]">
                      {moment.detail}
                    </p>
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
          </div>

          <Reveal className="lg:col-span-5 lg:col-start-8" blur={false}>
            <div className="relative mx-auto aspect-4/5 w-[80vw] max-w-md lg:w-full">
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
                        "linear-gradient(200deg, rgba(138,155,85,0.22), transparent 45%, rgba(63,74,44,0.55))",
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
