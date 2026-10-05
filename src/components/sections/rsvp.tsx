"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useId, useRef, useState } from "react";
import { buildRsvpMessage, buildWhatsAppUrl, weddingEvent } from "@/config/event";
import { Pill } from "@/components/ui/cta";
import { WhatsAppIcon } from "@/components/ui/icons";
import { Reveal, SplitText } from "@/components/motion/reveal";

const GUEST_OPTIONS = [1, 2, 3, 4];

export function Rsvp() {
  const nameId = useId();
  const noteId = useId();
  const [name, setName] = useState("");
  const [guests, setGuests] = useState(1);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const nameInput = useRef<HTMLInputElement>(null);
  const sentTimer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(sentTimer.current), []);

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (name.trim().length < 2) {
      setError("Escribe tu nombre para confirmar.");
      nameInput.current?.focus();
      return;
    }

    setError(null);
    setSent(true);

    const url = buildWhatsAppUrl(
      weddingEvent.rsvp.whatsappNumber,
      buildRsvpMessage({ name: name.trim(), guests, note: note.trim() }),
    );
    window.open(url, "_blank", "noopener,noreferrer");

    window.clearTimeout(sentTimer.current);
    sentTimer.current = window.setTimeout(() => setSent(false), 2600);
  };

  return (
    <section
      id="rsvp"
      className="relative overflow-hidden bg-cream py-28 text-ink sm:py-36 lg:py-44"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -left-40 top-1/3 size-[34rem] rounded-full opacity-50 blur-[130px]"
        style={{
          background: "radial-gradient(circle, rgba(107,124,63,0.22), transparent 65%)",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid grid-cols-1 gap-14 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <Reveal>
              <span className="eyebrow text-ink/45">Confirma tu asistencia</span>
            </Reveal>

            <h2 className="mt-6 font-display text-[clamp(2.75rem,7.5vw,5rem)] leading-[0.92] tracking-[-0.03em]">
              <SplitText lines={["Éramos", "pocos,", "ahora somos más."]} stagger={0.1} />
            </h2>

            <Reveal delay={0.36}>
              <p className="mt-8 max-w-[38ch] text-lg leading-relaxed text-ink/65">
                {weddingEvent.rsvp.note}
              </p>
            </Reveal>
          </div>

          <Reveal delay={0.2} className="lg:col-span-7" blur={false}>
            <form
              onSubmit={submit}
              noValidate
              className="rounded-[2rem] bg-white/60 p-7 ring-1 ring-ink/8 sm:p-10"
            >
              <div className="grid grid-cols-1 gap-7 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <label htmlFor={nameId} className="eyebrow text-ink/50">
                    Tu nombre
                  </label>
                  <input
                    ref={nameInput}
                    id={nameId}
                    name="name"
                    type="text"
                    autoComplete="name"
                    maxLength={80}
                    value={name}
                    onChange={(event) => {
                      setName(event.target.value);
                      if (error) setError(null);
                    }}
                    placeholder="Ana Ramírez"
                    aria-invalid={Boolean(error)}
                    aria-describedby={error ? `${nameId}-error` : undefined}
                    className="h-12 rounded-2xl bg-cream/70 px-4 text-base text-ink ring-1 ring-ink/10 transition-all duration-500 ease-fluid placeholder:text-ink/30 focus:bg-cream focus:ring-clay focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <span className="eyebrow text-ink/50">¿Cuántos vienen?</span>
                  <div
                    role="group"
                    aria-label="Número de asistentes"
                    className="flex h-12 items-center gap-1.5 rounded-2xl bg-cream/70 p-1.5 ring-1 ring-ink/10"
                  >
                    {GUEST_OPTIONS.map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setGuests(option)}
                        aria-pressed={guests === option}
                        className="relative flex size-9 flex-1 items-center justify-center rounded-xl text-sm text-ink/60 transition-colors duration-500 ease-fluid"
                      >
                        {guests === option ? (
                          <motion.span
                            layoutId="rsvp-guest-pill"
                            className="absolute inset-0 rounded-xl bg-ink"
                            transition={{ type: "spring", stiffness: 320, damping: 26 }}
                          />
                        ) : null}
                        <span
                          className={`relative z-10 transition-colors duration-500 ${
                            guests === option ? "text-cream" : ""
                          }`}
                        >
                          {option}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-7 flex flex-col gap-2">
                <label htmlFor={noteId} className="eyebrow text-ink/50">
                  Mensaje para los novios <span className="normal-case">(opcional)</span>
                </label>
                <textarea
                  id={noteId}
                  name="note"
                  rows={3}
                  maxLength={500}
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder="Algo que quieras decirles…"
                  className="resize-none rounded-2xl bg-cream/70 px-4 py-3 text-base leading-relaxed text-ink ring-1 ring-ink/10 transition-all duration-500 ease-fluid placeholder:text-ink/30 focus:bg-cream focus:ring-clay focus:outline-none"
                />
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-5">
                <Pill type="submit" icon={<WhatsAppIcon />}>
                  Enviar por WhatsApp
                </Pill>

                <AnimatePresence mode="wait">
                  {error ? (
                    <motion.p
                      key="error"
                      role="alert"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.35 }}
                      id={`${nameId}-error`}
                      className="text-sm text-clay"
                    >
                      {error}
                    </motion.p>
                  ) : sent ? (
                    <motion.p
                      key="sent"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.35 }}
                      role="status"
                      className="text-sm text-ink/60"
                    >
                      Abrimos WhatsApp con tu confirmación.
                    </motion.p>
                  ) : null}
                </AnimatePresence>
              </div>
            </form>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
