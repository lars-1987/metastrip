"use client";

import { useEffect } from "react";

/** True when the user (or no-JS environment) wants motion kept to a minimum. */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return true;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Lazy-load GSAP + ScrollTrigger only when we actually animate. */
export async function loadGsap() {
  const { gsap } = await import("gsap");
  const { ScrollTrigger } = await import("gsap/ScrollTrigger");
  gsap.registerPlugin(ScrollTrigger);
  return { gsap, ScrollTrigger };
}

/**
 * Arms scroll-reveal animations for any `[data-reveal]` element inside the
 * V3 root. No-ops entirely under reduced motion, leaving every element in its
 * natural (visible) state — which is also the no-JS fallback, since the hidden
 * "from" state is only applied once `.gsap-ready` is added here.
 */
export function useScrollReveals() {
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const root = document.querySelector<HTMLElement>(".v3-root");
    if (!root) return;

    let cleanup = () => {};
    let cancelled = false;

    loadGsap().then(({ gsap, ScrollTrigger }) => {
      if (cancelled) return;
      root.classList.add("gsap-ready");

      // solo reveals
      const els = gsap.utils.toArray<HTMLElement>("[data-reveal]");
      const tweens = els.map((el) =>
        gsap.to(el, {
          opacity: 1,
          y: 0,
          duration: 1.1,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 86%", once: true },
        })
      );

      // staggered groups — children animate one after another as the group enters
      const groupTweens = gsap.utils.toArray<HTMLElement>("[data-reveal-group]").map((group) => {
        const kids = group.querySelectorAll<HTMLElement>("[data-reveal-item]");
        return gsap.to(kids, {
          opacity: 1,
          y: 0,
          duration: 0.95,
          ease: "power3.out",
          stagger: 0.12,
          scrollTrigger: { trigger: group, start: "top 82%", once: true },
        });
      });

      cleanup = () => {
        [...tweens, ...groupTweens].forEach((t) => {
          t.scrollTrigger?.kill();
          t.kill();
        });
      };
    });

    return () => {
      cancelled = true;
      cleanup();
    };
  }, []);
}
