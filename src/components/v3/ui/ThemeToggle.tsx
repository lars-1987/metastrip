"use client";

import { useEffect, useState } from "react";

const Moon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
  </svg>
);
const Sun = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
    <path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.4 1.4M17.6 17.6L19 19M19 5l-1.4 1.4M6.4 17.6L5 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.querySelector(".v3-root")?.getAttribute("data-theme") === "dark");
  }, []);

  const toggle = () => {
    const root = document.querySelector(".v3-root");
    if (!root) return;
    const next = !dark;
    setDark(next);
    if (next) root.setAttribute("data-theme", "dark");
    else root.removeAttribute("data-theme");
    try { localStorage.setItem("metastrip-v3-theme", next ? "dark" : "light"); } catch {}
  };

  return (
    <button
      onClick={toggle}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      className="grid h-10 w-10 place-items-center rounded-[var(--radius-pill)] bg-[var(--card-elevated)] text-[var(--text)] transition-colors hover:bg-[var(--primary)] hover:text-[var(--on-primary)]"
    >
      {dark ? Sun : Moon}
    </button>
  );
}
