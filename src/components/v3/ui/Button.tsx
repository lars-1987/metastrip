"use client";

import type { MouseEventHandler, ReactNode } from "react";

type Variant = "primary" | "ghost" | "soft";
type Size = "md" | "lg";

interface ButtonProps {
  variant?: Variant;
  size?: Size;
  /** Icon that slides in from the right on hover while the label nudges aside. */
  hoverIcon?: ReactNode;
  className?: string;
  children?: ReactNode;
  onClick?: MouseEventHandler<HTMLElement>;
  disabled?: boolean;
  type?: "button" | "submit";
  /** When set, renders as an <a>. */
  href?: string;
  external?: boolean;
  "aria-label"?: string;
}

const base =
  "group relative inline-flex items-center justify-center overflow-hidden font-medium rounded-[var(--radius-pill)] " +
  "transition-[background-color,opacity] duration-200 cursor-pointer no-underline " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 " +
  "focus-visible:ring-offset-[var(--bg)] disabled:opacity-40 disabled:pointer-events-none active:scale-[0.98] select-none";

const variants: Record<Variant, string> = {
  primary: "bg-[var(--primary)] text-[var(--on-primary)] hover:bg-[var(--primary-hover)]",
  soft: "bg-[var(--card-elevated)] text-[var(--text)] hover:bg-[var(--primary)] hover:text-[var(--on-primary)]",
  ghost: "bg-transparent text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--card)]",
};

const sizes: Record<Size, string> = {
  md: "h-11 px-5 text-[15px]",
  lg: "h-14 px-8 text-[17px]",
};

export function Button({
  variant = "primary", size = "md", hoverIcon, className = "",
  children, onClick, disabled, type = "button", href, external, ...rest
}: ButtonProps) {
  const cls = `${base} ${variants[variant]} ${sizes[size]} ${className}`;
  const inner = (
    <>
      <span className={`flex items-center justify-center gap-2 transition-transform duration-300 ease-out ${hoverIcon ? "group-hover:-translate-x-2.5" : ""}`}>
        {children}
      </span>
      {hoverIcon && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-5 flex translate-x-4 items-center opacity-0 transition-all duration-300 ease-out group-hover:translate-x-0 group-hover:opacity-100"
        >
          {hoverIcon}
        </span>
      )}
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        onClick={onClick}
        className={cls}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        {...rest}
      >
        {inner}
      </a>
    );
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={cls} {...rest}>
      {inner}
    </button>
  );
}
