"use client";

import { useEffect, useState } from "react";

/**
 * Returns the current Date, refreshing on an interval.
 * Defaults to 30s — fine for HH:MM displays and lightweight enough
 * to leave running for the whole session.
 */
export function useClock(intervalMs = 30_000) {
  // Start with null on the server so hydration doesn't clash with the live value
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  return now;
}
