"use client";

import { useEffect, useState } from "react";
import { Button } from "./Button";

const MailIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="5" width="18" height="14" rx="2.5" />
    <path d="M3 7l9 6 9-6" />
  </svg>
);

// Email never appears in the static HTML as a scrapeable string. The parts are
// assembled in the browser after hydration, and the mailto: is built on click —
// so a scraper reading the page source only finds "hello [at] metastrip.app".
const USER = "hello";
const DOMAIN = "metastrip.app";

export function EmailButton({ variant = "soft", size = "lg" }: { variant?: "primary" | "soft"; size?: "md" | "lg" }) {
  const [addr, setAddr] = useState(`${USER} [at] ${DOMAIN}`);

  useEffect(() => {
    setAddr(`${USER}@${DOMAIN}`);
  }, []);

  return (
    <Button
      variant={variant}
      size={size}
      hoverIcon={MailIcon}
      aria-label="Email us"
      onClick={() => {
        window.location.href = `mailto:${USER}@${DOMAIN}`;
      }}
    >
      {addr}
    </Button>
  );
}
