"use client";

import { ceremonyDateParts, weddingEvent } from "@/config/event";

export function Footer() {
  const { couple, ceremony, hashtag, footerNote } = weddingEvent;

  return (
    <footer className="relative overflow-hidden border-t border-cream/15 bg-ink py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex flex-col items-center gap-10 text-center">
          <p className="font-display text-3xl italic leading-tight text-cream/85 sm:text-4xl">
            {footerNote}
          </p>

          <span aria-hidden className="h-12 w-px bg-cream/20" />

          <p className="flex flex-wrap items-baseline justify-center gap-x-[0.35em] font-script text-[clamp(3.75rem,15vw,8.5rem)] leading-[1.05] text-cream">
            <span>{couple.first}</span>
            <span className="shrink-0 text-[0.55em] leading-none text-olive-soft">
              &
            </span>
            <span>{couple.second}</span>
          </p>

          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
            <a
              href={ceremony.mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="eyebrow text-cream/45 transition-colors duration-500 ease-fluid hover:text-olive-soft"
            >
              {ceremony.venueName} · {ceremony.city}
            </a>
            <span aria-hidden className="eyebrow text-cream/25">
              {hashtag}
            </span>
            <span className="eyebrow text-cream/45">
              {ceremonyDateParts(weddingEvent.ceremonyAt).year}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
