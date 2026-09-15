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
      // Session replay records ordinary page text unless told not to, which
      // put every filename and every metadata value shown in the review (GPS,
      // author names, prompts, usernames) into recordings. The files never
      // left the device; what they carried did. Text inside anything marked
      // data-private (the tool, the terminal) is masked in the browser before
      // sending, so replays keep the layout and clicks for debugging. The map
      // carries ph-no-capture, which blocks it outright: its pin gives the
      // location away even with every label masked.
      session_recording: {
        maskTextSelector: "[data-private], [data-private] *",
      },
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
