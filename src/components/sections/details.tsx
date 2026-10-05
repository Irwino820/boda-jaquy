"use client";

import { motion } from "framer-motion";
import { useRef, useState } from "react";
import {
  buildCalendarFile,
  ceremonyDateParts,
  fullAddress,
  weddingEvent,
} from "@/config/event";
import { photos } from "@/config/photos";
import { Photo } from "@/components/ui/photo";
import { Pill, TextLink } from "@/components/ui/cta";
import {
  ArrowUpRight,
  CalendarIcon,
  CheckIcon,
  CopyIcon,
  PinIcon,
} from "@/components/ui/icons";
import { Reveal } from "@/components/motion/reveal";

export function Details() {
  const { ceremony, ceremonyAt } = weddingEvent;
  const date = ceremonyDateParts(ceremonyAt);
  const [copied, setCopied] = useState(false);
  const resetTimer = useRef<number | undefined>(undefined);

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(fullAddress);
      setCopied(true);
      window.clearTimeout(resetTimer.current);
      resetTimer.current = window.setTimeout(() => setCopied(false), 2200);
    } catch {
      // Sin permiso de portapapeles: el texto sigue visible para copiar a mano.
      setCopied(false);
    }
  };

  const downloadCalendar = () => {
    const blob = new Blob([buildCalendarFile()], {
      type: "text/calendar;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "pepe-y-jaquelin.ics";
    // Algunos navegadores solo respetan el clic si el enlace está en el documento.
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    // Revocar al instante cancela la descarga en Safari: se espera a que arranque.
    window.setTimeout(() => URL.revokeObjectURL(url), 4000);
  };

  return (
    <section
      id="detalles"
      className="relative overflow-hidden bg-cream py-28 text-ink sm:py-36 lg:py-44"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal>
          <span className="eyebrow text-ink/45">El día</span>
        </Reveal>
        <Reveal delay={0.08}>
          <h2 className="mt-5 max-w-[18ch] font-display text-[clamp(2.25rem,6vw,4.25rem)] leading-[0.98] tracking-[-0.02em]">
            Fecha, hora y lugar
          </h2>
        </Reveal>

        <div className="mt-16 grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Bloque principal: la fecha, a sangre de la retícula. */}
          <Reveal className="lg:col-span-7" blur={false}>
            <article className="group relative overflow-hidden rounded-[2rem] bg-ink p-8 text-cream sm:p-10">
              <div
                aria-hidden
                className="pointer-events-none absolute -right-24 -top-24 size-64 rounded-full opacity-60 blur-[70px]"
                style={{
                  background:
                    "radial-gradient(circle, rgba(107,124,63,0.28), transparent 65%)",
                }}
              />

              <div className="relative flex items-start justify-between gap-6">
                <span className="eyebrow text-cream/45">{ceremony.label}</span>
                <CalendarIcon className="text-olive-soft/80" size={22} />
              </div>

              <div className="relative mt-14">
                <p className="font-display text-[clamp(3.5rem,9vw,6rem)] leading-[0.82] tracking-[-0.03em]">
                  {date.day}
                  <span className="mx-3 text-olive-soft">·</span>
                  <span className="italic">{date.month}</span>
                </p>
                <p className="mt-5 text-base text-cream/60">
                  {date.weekday}, {date.year} · {date.time}
                </p>
              </div>

              <div className="relative mt-12 flex flex-wrap gap-3">
                <Pill
                  variant="glass"
                  onClick={downloadCalendar}
                  icon={<CalendarIcon size={15} />}
                >
                  Añadir al calendario
                </Pill>
                <TextLink href={ceremony.mapUrl} className="self-center text-cream/70 hover:text-sky">
                  Ver en el mapa
                  <ArrowUpRight size={13} />
                </TextLink>
              </div>
            </article>
          </Reveal>

          {/* Bloque secundario: el lugar, con la fotografía en formato vertical. */}
          <Reveal delay={0.12} className="lg:col-span-5">
            <article className="flex h-full flex-col overflow-hidden rounded-[2rem] bg-white/55 ring-1 ring-ink/8">
              <div className="relative aspect-[5/4] w-full overflow-hidden">
                <Photo
                  photo={photos.venue}
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="absolute inset-0 h-full w-full"
                />
              </div>

              <div className="flex flex-1 flex-col p-8">
                <div className="flex items-start gap-3">
                  <PinIcon className="mt-1 shrink-0 text-clay" />
                  <div>
                    <h3 className="font-display text-3xl leading-tight tracking-tight">
                      {ceremony.venueName}
                    </h3>
                    <p className="mt-3 leading-relaxed text-ink/65">
                      {ceremony.addressLine}
                      <br />
                      {ceremony.city}
                    </p>
                  </div>
                </div>

                <div className="mt-auto flex flex-wrap items-center gap-3 pt-8">
                  <Pill variant="outline" href={ceremony.mapUrl} className="h-11 text-ink ring-ink/20 hover:text-olive hover:ring-olive">
                    Cómo llegar
                  </Pill>

                  <button
                    type="button"
                    onClick={copyAddress}
                    className="inline-flex h-11 items-center gap-2 rounded-full px-4 text-sm text-ink/60 transition-colors duration-500 ease-fluid hover:bg-ink/5 hover:text-ink"
                  >
                    <motion.span
                      key={copied ? "done" : "idle"}
                      initial={{ scale: 0.7, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 18 }}
                      className="inline-flex"
                    >
                      {copied ? (
                        <CheckIcon className="text-clay" />
                      ) : (
                        <CopyIcon className="text-ink/50" />
                      )}
                    </motion.span>
                    {copied ? "Dirección copiada" : "Copiar dirección"}
                  </button>
                </div>
              </div>
            </article>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
