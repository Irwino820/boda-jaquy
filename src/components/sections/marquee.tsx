import { ceremonyShortDate, weddingEvent } from "@/config/event";
import { Diamond } from "@/components/ui/icons";

const ITEMS = [
  { text: weddingEvent.couple.first, style: "script" },
  { text: weddingEvent.couple.second, style: "script" },
  { text: ceremonyShortDate(weddingEvent.ceremonyAt), style: "label" },
  { text: weddingEvent.hashtag, style: "label" },
  { text: weddingEvent.ceremony.venueName, style: "label" },
  { text: weddingEvent.ceremony.city, style: "label" },
] as const;

function Track() {
  return (
    <div className="flex w-max shrink-0 items-center">
      {ITEMS.map((item, index) => (
        <span key={`${item.text}-${index}`} className="flex items-center gap-8 pr-8">
          <span
            className={
              item.style === "script"
                ? "font-script text-4xl text-cream sm:text-5xl"
                : "eyebrow text-cream/50"
            }
          >
            {item.text}
          </span>
          <Diamond className="text-olive-soft/80" />
        </span>
      ))}
    </div>
  );
}

function Lane({ reverse = false }: { reverse?: boolean }) {
  return (
    <div className="overflow-hidden">
      <div
        className={`flex w-max will-change-transform ${
          reverse ? "marquee-reverse" : "marquee-forward"
        }`}
      >
        <Track />
        <Track />
      </div>
    </div>
  );
}

/**
 * Marquee cinético. El desplazamiento vive en el contenedor que sujeta dos
 * copias del contenido y recorre -50%, justo una copia: el bucle no tiene salto.
 * El movimiento reducido se resuelve en CSS, sin estado ni parpadeo al hidratar.
 */
export function Marquee() {
  return (
    <section
      aria-hidden
      className="relative overflow-hidden border-y border-cream/15 bg-ink py-8"
    >
      <div className="flex flex-col gap-3">
        <Lane />
        <div className="opacity-40">
          <Lane reverse />
        </div>
      </div>
    </section>
  );
}
