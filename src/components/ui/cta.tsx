"use client";

import type { ReactNode } from "react";
import { ArrowUpRight } from "@/components/ui/icons";
import { Magnetic, useHasFinePointer } from "@/components/motion/interactions";

type Variant = "solid" | "outline" | "glass";

const VARIANTS: Record<Variant, string> = {
  solid:
    "bg-ink text-cream hover:bg-ink-raised ring-1 ring-ink/20 shadow-[0_30px_60px_-40px_rgba(22,58,107,0.55)]",
  outline:
    "text-ink ring-1 ring-ink/20 hover:ring-olive hover:text-olive",
  glass:
    "bg-cream/18 text-cream ring-1 ring-cream/30 backdrop-blur-md hover:bg-cream/28 hover:ring-cream/50",
};

const INNER: Record<Variant, string> = {
  solid: "bg-cream/15 text-cream/85 group-hover:bg-cream/25",
  outline: "bg-ink/8 text-ink/70 group-hover:bg-olive/15 group-hover:text-olive",
  glass: "bg-cream/15 text-cream/75 group-hover:bg-cream/25 group-hover:text-cream",
};

type PillProps = {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: Variant;
  className?: string;
  icon?: ReactNode;
  /** Fuerza el magnetismo aunque el puntero no sea fino (botón principal del hero). */
  magnetic?: boolean;
  ariaLabel?: string;
  type?: "button" | "submit";
  disabled?: boolean;
};

/**
 * Botón píldora con el icono dentro de su propio círculo: la tensión interna
 * hace que el control se sienta físico en lugar de un simple cambio de color.
 */
export function Pill({
  children,
  href,
  onClick,
  variant = "solid",
  className,
  icon,
  magnetic = true,
  ariaLabel,
  type = "button",
  disabled,
}: PillProps) {
  const hasFinePointer = useHasFinePointer();

  const content = (
    <span
      className={`group relative inline-flex h-12 items-center gap-3 overflow-hidden rounded-full pl-6 pr-1.5 text-sm font-medium ${VARIANTS[variant]} transition-[color,background-color,box-shadow,ring-color] duration-500 ease-fluid active:scale-[0.98] ${className ?? ""}`}
    >
      <span className="relative z-10 whitespace-nowrap">{children}</span>
      <span
        className={`relative z-10 inline-flex size-9 shrink-0 items-center justify-center rounded-full transition-transform duration-500 ease-fluid group-hover:translate-x-0.5 group-hover:-translate-y-px ${INNER[variant]}`}
      >
        {icon ?? <ArrowUpRight />}
      </span>
    </span>
  );

  const control = href ? (
    <a
      href={href}
      {...externalLinkProps(href)}
      aria-label={ariaLabel}
      onClick={onClick}
    >
      {content}
    </a>
  ) : (
    <button type={type} onClick={onClick} aria-label={ariaLabel} disabled={disabled}>
      {content}
    </button>
  );

  if (magnetic && hasFinePointer) {
    return (
      <Magnetic strength={0.22} className="inline-block">
        {control}
      </Magnetic>
    );
  }

  return control;
}

const isExternal = (href: string) => /^https?:\/\//i.test(href);

function externalLinkProps(href: string) {
  return isExternal(href)
    ? { target: "_blank", rel: "noopener noreferrer" }
    : {};
}

/** Botón textual con subrayado que se dibuja de izquierda a derecha al pasar el cursor. */
export function TextLink({
  children,
  href,
  className,
  onClick,
}: {
  children: ReactNode;
  href?: string;
  className?: string;
  onClick?: () => void;
}) {
  const classes = `group inline-flex items-center text-sm transition-colors duration-500 ease-fluid ${className ?? "text-ink/65 hover:text-olive"}`;

  const inner = (
    <span className="relative inline-flex items-center gap-1.5 whitespace-nowrap">
      {children}
      <span
        aria-hidden
        className="absolute -bottom-0.5 left-0 h-px w-full origin-left scale-x-0 bg-current transition-transform duration-600 ease-fluid group-hover:scale-x-100 group-focus-visible:scale-x-100"
      />
    </span>
  );

  if (href) {
    return (
      <a href={href} {...externalLinkProps(href)} onClick={onClick} className={classes}>
        {inner}
      </a>
    );
  }

  return (
    <button type="button" onClick={onClick} className={classes}>
      {inner}
    </button>
  );
}
