"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useState } from "react";
import type { Photo } from "@/config/photos";

type PhotoProps = {
  photo: Photo;
  sizes: string;
  /** Imagen sobre el pliegue (LCP): carga inmediata y con prioridad alta. */
  priority?: boolean;
  quality?: number;
  className?: string;
};

/**
 * Renderiza la fotografía del manifiesto. Si el archivo todavía no existe
 * (placeholder por reemplazar), cae en un marco diseñado a propósito en vez de
 * romper el layout. No hay skeletons genéricos ni iconos de imagen.
 */
export function Photo({
  photo,
  sizes,
  priority = false,
  quality = 75,
  className,
}: PhotoProps) {
  const [failed, setFailed] = useState(false);

  return (
    <div className={`relative overflow-hidden ${className ?? ""}`}>
      {failed ? (
        <PhotoSlot label={photo.id} />
      ) : (
        <motion.div
          className="absolute inset-0"
          initial={{ scale: 1.14 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.6, ease: [0.32, 0.72, 0, 1] }}
        >
          <Image
            src={photo.src}
            alt={photo.alt}
            fill
            sizes={sizes}
            quality={quality}
            loading={priority ? "eager" : undefined}
            fetchPriority={priority ? "high" : undefined}
            onError={() => setFailed(true)}
            className="object-cover"
          />
        </motion.div>
      )}
    </div>
  );
}

/**
 * Marco de reserva. Se ve deliberado: olivo profundo, monograma y el nombre del
 * archivo que falta, para que se entienda qué hay que reemplazar.
 */
export function PhotoSlot({ label }: { label: string }) {
  return (
    <div className="absolute inset-0 flex flex-col justify-between bg-ink-panel p-5">
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(90% 70% at 25% 15%, rgba(138,155,85,0.35), transparent 62%), radial-gradient(70% 60% at 85% 88%, rgba(63,74,44,0.45), transparent 60%)",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-3 rounded-[1.25rem] border border-cream/15"
      />
      <p className="eyebrow relative text-cream/40">Espacio para tu foto</p>
      <div className="relative">
        <p className="font-script text-4xl leading-none text-cream/80">P · J</p>
        <p className="eyebrow mt-2 text-sky/70">{label}.jpg</p>
      </div>
    </div>
  );
}
