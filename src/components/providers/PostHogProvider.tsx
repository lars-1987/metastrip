"use client";

import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";
import { useEffect, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";

/* ------------------------------------------------------------------ */
/*  Manual pageview tracking for App Router SPA navigation             */
/* ------------------------------------------------------------------ */

function PostHogPageview() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (pathname && posthog) {
      let url = window.origin + pathname;
      const search = searchParams.toString();
      if (search) url += "?" + search;
      posthog.capture("$pageview", { $current_url: url });
    }
  }, [pathname, searchParams]);

  return null;
}

/* ------------------------------------------------------------------ */
/*  Provider wrapper — initialises PostHog once on mount               */
/* ------------------------------------------------------------------ */

export function PostHogProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;

    // Skip in development or without a key
    if (!key || process.env.NODE_ENV === "development") return;

    // Respect Do Not Track
    if (
      typeof navigator !== "undefined" &&
      (navigator.doNotTrack === "1" ||
        // @ts-expect-error — msDoNotTrack is non-standard
        navigator.msDoNotTrack === "1" ||
        // @ts-expect-error — window.doNotTrack is non-standard
        window.doNotTrack === "1")
    ) {
      return;
    }

    posthog.init(key, {
      api_host: "https://us.i.posthog.com",
      person_profiles: "identified_only",
      capture_pageview: false, // Manual via PostHogPageview
      capture_pageleave: true,
      autocapture: true,
      // Autocapture used to send a clicked element's text and attributes: a
      // file row's text is its filename, and the remove button's aria-label is
      // "Remove <filename>". Keep the click, drop the words.
      mask_all_text: true,
      mask_all_element_attributes: true,
      persistence: "localStorage", // No cookies — privacy-first
      respect_dnt: true,
      // No session replay (22 Nov 2026): at 100+ visitors a day the monthly
      // recording quota ran out early and nobody could watch them all, so
      // analytics events are enough. The recorder script isn't loaded either.
      // If replay ever comes back, mask everything marked data-private (the
      // tool, the terminal) with maskTextSelector: "[data-private],
      // [data-private] *". Unmasked, replays recorded every filename and
      // metadata value the review shows. The map's ph-no-capture keeps it out.
      disable_session_recording: true,
    });
  }, []);

  return (
    <PHProvider client={posthog}>
      <Suspense fallback={null}>
        <PostHogPageview />
      </Suspense>
      {children}
    </PHProvider>
  );
}
