"use client";

import { useCallback, useEffect, useState } from "react";
import { Preloader } from "@/components/ui/preloader";
import { Nav } from "@/components/sections/nav";
import { Hero } from "@/components/sections/hero";
import { Marquee } from "@/components/sections/marquee";
import { Story } from "@/components/sections/story";
import { Gallery } from "@/components/sections/gallery";
import { CountdownSection } from "@/components/sections/countdown-section";
import { Details } from "@/components/sections/details";
import { Rsvp } from "@/components/sections/rsvp";
import { Footer } from "@/components/sections/footer";
import { MusicPlayer } from "@/components/ui/music-player";
import { useScrollEngine } from "@/components/providers/smooth-scroll";
import { IntroReadyContext } from "@/components/providers/intro";
import { weddingEvent } from "@/config/event";

export function Invitation() {
  const scroll = useScrollEngine();
  const [entered, setEntered] = useState(false);
  const [scrollReady, setScrollReady] = useState(false);
  const onReveal = useCallback(() => setEntered(true), []);
  const onDone = useCallback(() => setScrollReady(true), []);

  // Scroll solo cuando las barras ya salieron (no a mitad de cortina).
  useEffect(() => {
    if (scrollReady) scroll.start();
  }, [scrollReady, scroll]);

  // Home visible bajo las barras en cuanto arranca el exit del preloader.
  useEffect(() => {
    if (!entered) return;
    document.documentElement.setAttribute("data-intro-ready", "");
    return () => {
      document.documentElement.removeAttribute("data-intro-ready");
    };
  }, [entered]);

  const { couple, ceremony, ceremonyAt } = weddingEvent;

  return (
    <>
      <a
        href="#principal"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-60 focus:rounded-full focus:bg-ink focus:px-5 focus:py-2 focus:text-sm focus:text-cream"
      >
        Saltar al contenido
      </a>

      <Preloader onReveal={onReveal} onDone={onDone} />

      {/* Grano de película: capa fija, nunca dentro de contenedores con scroll. */}
      <div aria-hidden className="grain z-50" />

      <IntroReadyContext.Provider value={entered}>
        <div data-intro-content>
          <Nav />

          <main id="principal">
            <Hero />

            <div id="contenido">
              <Marquee />
              <Story />
              <Gallery />
              <CountdownSection />
              <Details />
              <Rsvp />
            </div>
          </main>

          <Footer />

          <MusicPlayer ready={entered} />
        </div>
      </IntroReadyContext.Provider>

      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Event",
            name: `Matrimonio civil de ${couple.first} y ${couple.second}`,
            startDate: ceremonyAt,
            eventStatus: "https://schema.org/EventScheduled",
            eventAttendanceMode:
              "https://schema.org/OfflineEventAttendanceMode",
            location: {
              "@type": "Place",
              name: ceremony.venueName,
              address: `${ceremony.addressLine}, ${ceremony.city}`,
            },
          }),
        }}
      />
    </>
  );
}
