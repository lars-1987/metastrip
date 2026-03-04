import posthog from "posthog-js";

/* ------------------------------------------------------------------ */
/*  Typed PostHog event helpers                                        */
/*  Every custom event fires through here so tracking is auditable.    */
/* ------------------------------------------------------------------ */

export function trackFileAdded(props: {
  file_type: string;
  file_size: number;
  file_count: number;
}) {
  posthog.capture("file_added", props);
}

export function trackFileStripped(props: {
  file_type: string;
  file_size: number;
  fields_removed_count: number;
}) {
  posthog.capture("file_stripped", props);
}

export function trackFileDownloaded(props: { file_type: string }) {
  posthog.capture("file_downloaded", props);
}

export function trackBatchProcessed(props: {
  file_count: number;
  success_count: number;
}) {
  posthog.capture("batch_processed", props);
}

export function trackDailyLimitReached() {
  posthog.capture("daily_limit_reached");
}

export function trackCheckoutStarted(props: {
  pass_type: string;
  price: number;
}) {
  posthog.capture("checkout_started", props);
}
