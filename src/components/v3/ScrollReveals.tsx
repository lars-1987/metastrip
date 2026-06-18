"use client";

import { useScrollReveals } from "./motion";

/** Mount-only: arms GSAP scroll reveals for [data-reveal] elements. Renders
 *  nothing. No-ops under reduced motion / no JS (content stays visible). */
export function ScrollReveals() {
  useScrollReveals();
  return null;
}
