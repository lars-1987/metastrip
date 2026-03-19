"use client";

import Script from "next/script";

export function KofiFloatingWidget() {
  return (
    <Script
      src="https://storage.ko-fi.com/cdn/scripts/overlay-widget.js"
      strategy="lazyOnload"
      onLoad={() => {
        // @ts-expect-error — Ko-fi widget global
        if (typeof kofiWidgetOverlay !== "undefined") {
          // @ts-expect-error — Ko-fi widget global
          kofiWidgetOverlay.draw("metastrip", {
            type: "floating-chat",
            "floating-chat.donateButton.text": "Support me",
            "floating-chat.donateButton.background-color": "#7c3aed",
            "floating-chat.donateButton.text-color": "#fff",
          });
        }
      }}
    />
  );
}
