export type WeddingEventConfig = {
  couple: {
    first: string;
    second: string;
  };
  tagline: string;
  eyebrow: string;
  /** ISO 8601 with offset for countdown */
  ceremonyAt: string;
  ceremony: {
    label: string;
    venueName: string;
    addressLine: string;
    city: string;
    mapUrl: string;
  };
  story: {
    eyebrow: string;
    lines: string[];
    body: string[];
  };
  itinerary: {
    eyebrow: string;
    title: string;
    description: string;
    moments: { time: string; title: string; detail: string }[];
  };
  rsvp: {
    whatsappNumber: string;
    defaultMessage: string;
    note: string;
  };
  hashtag: string;
  footerNote: string;
};

/** Edita aquí fecha, lugar y contacto cuando los tengas confirmados. */
export const weddingEvent: WeddingEventConfig = {
  couple: {
    first: "Pepe",
    second: "Jaquelin",
  },
  tagline: "Celebramos nuestro matrimonio civil",
  eyebrow: "Invitación · Matrimonio civil",
  ceremonyAt: "2026-10-24T16:00:00-06:00",
  ceremony: {
    label: "Ceremonia civil",
    venueName: "Salón",
    addressLine: "Ubicación del salón",
    city: "Rincón de Romos",
    mapUrl: "https://maps.google.com/?q=22.225556,-102.329639",
  },
  story: {
    eyebrow: "Nuestra historia",
    lines: ["Después de mucho", "camino recorrido,", "decidimos seguirlo juntos."],
    body: [
      "Empezamos sin fecha y sin plan, sólo con la certeza de que queríamos construir algo juntos.",
      "Hoy firmamos ese compromiso delante de quienes más queremos. Nos gustaría que fueras parte de este día.",
    ],
  },
  itinerary: {
    eyebrow: "El día",
    title: "Así fluirá la celebración",
    description:
      "Un recorrido sencillo para que sepas cuándo llegar y cómo se irá abriendo la fiesta.",
    moments: [
      {
        time: "16:00",
        title: "Ceremonia civil",
        detail: "Nos vemos para firmar y celebrar el sí delante de quienes más queremos.",
      },
      {
        time: "17:00",
        title: "Brindis",
        detail: "Un primer brindis para empezar la tarde con cariño y buena compañía.",
      },
      {
        time: "18:30",
        title: "Cena",
        detail: "Mesa compartida, conversación y el ritmo pausado de una buena comida.",
      },
      {
        time: "20:00",
        title: "Baile",
        detail: "Música, pista libre y la noche abierta hasta que el cuerpo aguante.",
      },
    ],
  },
  rsvp: {
    whatsappNumber: "524651093307",
    defaultMessage: "Hola Pepe y Jaquelin, confirmo mi asistencia a su matrimonio civil.",
    note: "Responde antes del 17 de octubre para poder acomodar a todos.",
  },
  hashtag: "#PepeYJaquelin",
  footerNote: "Con cariño, esperamos compartir este día contigo.",
};

export const fullAddress = [
  weddingEvent.ceremony.venueName,
  weddingEvent.ceremony.addressLine,
  weddingEvent.ceremony.city,
].join(", ");

const CEREMONY_TIME_ZONE = "America/Mexico_City";

export function formatCeremonyDate(iso: string, locale = "es-MX") {
  const date = new Date(iso);
  return new Intl.DateTimeFormat(locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: CEREMONY_TIME_ZONE,
  }).format(date);
}

type DateParts = {
  weekday: string;
  day: string;
  month: string;
  year: string;
  time: string;
};

/** Descompone la fecha para poder maquetar día / mes / año por separado. */
export function ceremonyDateParts(iso: string, locale = "es-MX"): DateParts {
  const date = new Date(iso);
  const part = (options: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat(locale, {
      timeZone: CEREMONY_TIME_ZONE,
      ...options,
    })
      .format(date)
      .toLocaleLowerCase(locale);

  return {
    weekday: part({ weekday: "long" }),
    day: part({ day: "numeric" }),
    month: part({ month: "long" }),
    year: part({ year: "numeric" }),
    time: part({ hour: "numeric", minute: "2-digit", hour12: true }),
  };
}

/** Fecha corta numérica (24 · 10 · 2026) en la zona horaria de la ceremonia. */
export function ceremonyShortDate(iso: string, locale = "es-MX") {
  const part = (options: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat(locale, {
      timeZone: CEREMONY_TIME_ZONE,
      ...options,
    }).format(new Date(iso));

  return [
    part({ day: "2-digit" }),
    part({ month: "2-digit" }),
    part({ year: "numeric" }),
  ].join(" · ");
}

export function buildWhatsAppUrl(number: string, message: string) {
  const params = new URLSearchParams({ text: message });
  return `https://wa.me/${number}?${params.toString()}`;
}

/** Enlace de WhatsApp con el mensaje de confirmación por defecto. */
export function defaultWhatsAppUrl() {
  return buildWhatsAppUrl(
    weddingEvent.rsvp.whatsappNumber,
    weddingEvent.rsvp.defaultMessage,
  );
}

export function buildRsvpMessage(details: {
  name: string;
  guests: number;
  note: string;
}) {
  const guests =
    details.guests === 1 ? "1 persona" : `${details.guests} personas`;
  return [
    weddingEvent.rsvp.defaultMessage,
    "",
    `Nombre: ${details.name}`,
    `Asistencia: ${guests}`,
    details.note ? `Mensaje: ${details.note}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

function toIcsStamp(date: Date) {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

/** RFC 5545 §3.3.11: en valores de texto hay que escapar \ ; , y saltos de línea. */
function escapeIcsText(value: string) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

/** RFC 5545 §3.1: líneas de máximo 75 octetos; las continuaciones empiezan con un espacio. */
function foldIcsLine(line: string) {
  const encoder = new TextEncoder();
  const chunks: string[] = [];
  let current = "";
  let bytes = 0;

  for (const char of line) {
    const size = encoder.encode(char).length;
    if (bytes + size > 75) {
      chunks.push(current);
      current = " ";
      bytes = 1;
    }
    current += char;
    bytes += size;
  }

  chunks.push(current);
  return chunks.join("\r\n");
}

/** Archivo .ics para que el evento aparezca en el calendario del invitado. */
export function buildCalendarFile() {
  const start = new Date(weddingEvent.ceremonyAt);
  const end = new Date(start.getTime() + 3 * 60 * 60 * 1000);
  const { couple } = weddingEvent;

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//pepe-jaquelin//invitacion//ES",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${couple.first.toLowerCase()}-${couple.second.toLowerCase()}-${toIcsStamp(start)}@invitacion`,
    `DTSTAMP:${toIcsStamp(new Date())}`,
    `DTSTART:${toIcsStamp(start)}`,
    `DTEND:${toIcsStamp(end)}`,
    `SUMMARY:${escapeIcsText(`Matrimonio civil de ${couple.first} y ${couple.second}`)}`,
    `LOCATION:${escapeIcsText(fullAddress)}`,
    `DESCRIPTION:${escapeIcsText(`${couple.first} y ${couple.second} te esperan para celebrar su matrimonio civil.`)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  return `${lines.map(foldIcsLine).join("\r\n")}\r\n`;
}
