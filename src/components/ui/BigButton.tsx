import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Variant = "primary" | "accent" | "whatsapp" | "ghost";

const styles: Record<Variant, string> = {
  primary: "bg-navy text-white active:bg-navy-dark",
  accent: "bg-accent text-ink active:brightness-95",
  whatsapp: "bg-whatsapp text-white active:brightness-95",
  ghost: "bg-white text-navy border-2 border-navy/20 active:bg-slate-100",
};

const base =
  "flex w-full min-h-14 items-center justify-center gap-3 rounded-2xl px-5 text-lg font-bold shadow-sm transition disabled:opacity-50";

interface Common {
  variant?: Variant;
  icon?: ReactNode;
  children: ReactNode;
}

/** Botón grande de ancho completo: ícono + texto siempre. */
export function BigButton({ variant = "primary", icon, children, className = "", ...rest }: Common & ComponentProps<"button">) {
  return (
    <button className={`${base} ${styles[variant]} ${className}`} {...rest}>
      {icon}
      <span>{children}</span>
    </button>
  );
}

export function BigLink({ variant = "primary", icon, children, className = "", ...rest }: Common & ComponentProps<typeof Link>) {
  return (
    <Link className={`${base} ${styles[variant]} ${className}`} {...rest}>
      {icon}
      <span>{children}</span>
    </Link>
  );
}
