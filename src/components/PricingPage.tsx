"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatedBackground } from "@/components/shared/AnimatedBackground";
import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/shared/Icon";
import type { IconName } from "@/components/shared/Icon";
import { trackCheckoutStarted } from "@/lib/analytics";

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

interface PlanFeature {
  text: string;
  included: boolean;
}

interface Plan {
  id: string;
  name: string;
  tagline: string;
  price: number | null;
  priceLabel: string;
  accent: string;
  cta: string;
  popular: boolean;
  features: PlanFeature[];
  passType?: "image" | "document";
}

const PLANS: Plan[] = [
  {
    id: "free",
    name: "Free",
    tagline: "For quick single-file cleanup",
    price: null,
    priceLabel: "Free forever",
    accent: "#94a3b8",
    cta: "Start Stripping",
    popular: false,
    features: [
      { text: "Single file at a time", included: true },
      { text: "Images only (JPEG, PNG, WebP)", included: true },
      { text: "Complete metadata removal", included: true },
      { text: "Up to 25 MB per file", included: true },
      { text: "5 files per day", included: true },
      { text: "Selective stripping options", included: false },
      { text: "Batch processing", included: false },
      { text: "Metadata audit report", included: false },
    ],
  },
  {
    id: "image",
    name: "Image Batch",
    tagline: "For photographers & creators",
    price: 2.99,
    priceLabel: "one-time",
    accent: "#a78bfa",
    cta: "Get Image Pass",
    popular: true,
    passType: "image",
    features: [
      { text: "Up to 50 images per batch", included: true },
      { text: "All image formats", included: true },
      { text: "Complete or selective removal", included: true },
      { text: "Up to 50 MB per file", included: true },
      { text: "No daily limits", included: true },
      { text: "Choose what to strip", included: true },
      { text: "Batch ZIP download", included: true },
      { text: "Metadata audit report", included: true },
    ],
  },
  {
    id: "document",
    name: "Document Batch",
    tagline: "For legal, HR & compliance",
    price: 4.99,
    priceLabel: "one-time",
    accent: "#06b6d4",
    cta: "Get Document Pass",
    popular: false,
    passType: "document",
    features: [
      { text: "Up to 25 documents per batch", included: true },
      { text: "PDF, DOCX, XLSX, PPTX", included: true },
      { text: "Complete or selective removal", included: true },
      { text: "Up to 50 MB per file", included: true },
      { text: "No daily limits", included: true },
      { text: "Strip comments & tracked changes", included: true },
      { text: "Batch ZIP download", included: true },
      { text: "Metadata audit report", included: true },
    ],
  },
];

const FAQ_ITEMS = [
  {
    q: "What's a batch pass?",
    a: "A batch pass is a one-time purchase that unlocks batch processing for a set number of files. No subscription, no account needed. Buy it, use it, done.",
  },
  {
    q: "Do I need to create an account?",
    a: "No. We use Stripe for payment — you just enter your email for the receipt. No passwords, no profiles, no tracking.",
  },
  {
    q: "Do my files get uploaded to your servers?",
    a: "Never. All processing happens in your browser using JavaScript. Your files stay on your device the entire time. We literally cannot see them.",
  },
  {
    q: "What metadata do you remove?",
    a: "GPS coordinates, camera/device info, author names, timestamps, software details, AI generation tags (C2PA, XMP), document comments, tracked changes, and custom properties. With a batch pass, you choose exactly what to strip.",
  },
  {
    q: "What's the difference between free and paid?",
    a: "Free strips everything from one image at a time — no choices, just nuke it all. Batch passes let you process many files at once, choose which metadata categories to keep or remove, and get a detailed audit report of everything that was found.",
  },
  {
    q: "Can I buy multiple batch passes?",
    a: "Absolutely. Each pass is independent. If you regularly need batch processing, we'll be launching a Pro subscription soon with unlimited monthly batches.",
  },
  {
    q: "What about video and audio files?",
    a: "Coming soon. Video and audio metadata stripping requires more processing power, so it'll be available in a future update.",
  },
];

interface ComparisonRow {
  label: string;
  free: string | boolean;
  image: string | boolean;
  doc: string | boolean;
}

const COMPARISON_ROWS: ComparisonRow[] = [
  { label: "Price", free: "$0", image: "$2.99", doc: "$4.99" },
  { label: "Files per batch", free: "1", image: "50", doc: "25" },
  { label: "Max file size", free: "25 MB", image: "50 MB", doc: "50 MB" },
  { label: "Images (JPEG, PNG, WebP)", free: true, image: true, doc: false },
  {
    label: "Documents (PDF, DOCX, XLSX, PPTX)",
    free: false,
    image: false,
    doc: true,
  },
  { label: "Complete metadata removal", free: true, image: true, doc: true },
  { label: "Selective stripping", free: false, image: true, doc: true },
  { label: "GPS / location removal", free: true, image: true, doc: false },
  {
    label: "AI tag removal (C2PA, XMP)",
    free: true,
    image: true,
    doc: false,
  },
  {
    label: "Comments & tracked changes",
    free: false,
    image: false,
    doc: true,
  },
  { label: "Batch ZIP download", free: false, image: true, doc: true },
  { label: "Metadata audit report", free: false, image: true, doc: true },
  { label: "Daily limit", free: "5/day", image: "None", doc: "None" },
  { label: "Account required", free: "No", image: "No", doc: "No" },
];

const TRUST_ITEMS: { icon: IconName; label: string }[] = [
  { icon: "Lock", label: "Files never uploaded" },
  { icon: "Prohibit", label: "No account required" },
  { icon: "CreditCard", label: "No subscription" },
  { icon: "ShieldCheck", label: "Stripe-secured payments" },
];

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function CheckIcon({ color }: { color: string }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="rgba(255,255,255,0.15)"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function PricingCard({
  plan,
  index,
  loading,
  onCheckout,
}: {
  plan: Plan;
  index: number;
  loading: string | null;
  onCheckout: (passType: "image" | "document") => void;
}) {
  const isLoading = loading === plan.id;
  const dollars = plan.price !== null ? Math.floor(plan.price) : null;
  const cents =
    plan.price !== null ? plan.price.toFixed(2).split(".")[1] : null;

  return (
    <div
      className="relative rounded-3xl overflow-hidden transition-all duration-[400ms] hover:-translate-y-1 animate-card-slide-in"
      style={{
        background: plan.popular
          ? "linear-gradient(135deg, rgba(124,58,237,0.06) 0%, rgba(6,182,212,0.03) 100%)"
          : "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)",
        border: plan.popular
          ? "none"
          : "1px solid rgba(255,255,255,0.06)",
        padding: plan.popular ? 2 : 0,
        animationDelay: `${0.2 + index * 0.12}s`,
      }}
    >
      {/* Animated gradient border for popular */}
      {plan.popular && (
        <div
          className="absolute inset-0 rounded-3xl pointer-events-none animate-gradient-shift"
          style={{
            padding: 1,
            background:
              "linear-gradient(135deg, #7c3aed, #06b6d4, #7c3aed)",
            backgroundSize: "200% 200%",
            WebkitMask:
              "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            WebkitMaskComposite: "xor",
            maskComposite: "exclude",
          }}
        />
      )}

      <div
        className="relative"
        style={{
          borderRadius: plan.popular ? 22 : 24,
          background: plan.popular
            ? "linear-gradient(135deg, rgba(124,58,237,0.08) 0%, rgba(9,9,11,0.98) 30%)"
            : "transparent",
          padding: "36px 28px 32px",
        }}
      >
        {/* Popular badge */}
        {plan.popular && (
          <div
            className="absolute top-[-1px] left-1/2 -translate-x-1/2 px-5 py-1.5 rounded-b-xl"
            style={{
              background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
              boxShadow: "0 4px 15px rgba(124,58,237,0.3)",
            }}
          >
            <span className="text-[10px] font-bold text-white font-[family-name:var(--font-mono)] tracking-[0.1em] uppercase">
              Most Popular
            </span>
          </div>
        )}

        {/* Plan name */}
        <div className="mb-1">
          <span
            className="text-[13px] font-semibold font-[family-name:var(--font-mono)] tracking-[0.04em]"
            style={{ color: plan.accent }}
          >
            {plan.name}
          </span>
        </div>

        {/* Tagline */}
        <p className="text-[13px] text-white/35 font-[family-name:var(--font-outfit)] mb-6 leading-[1.4]">
          {plan.tagline}
        </p>

        {/* Price */}
        <div className="mb-7">
          {dollars !== null && cents !== null ? (
            <div className="flex items-baseline gap-1">
              <span className="text-sm text-white/40 font-[family-name:var(--font-outfit)] font-medium self-start pt-2">
                $
              </span>
              <span className="text-[56px] font-extrabold -tracking-[0.04em] font-[family-name:var(--font-outfit)] text-white/95 leading-none">
                {dollars}
              </span>
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-white/95 font-[family-name:var(--font-outfit)] leading-none">
                  .{cents}
                </span>
                <span className="text-[11px] text-white/30 font-[family-name:var(--font-mono)]">
                  {plan.priceLabel}
                </span>
              </div>
            </div>
          ) : (
            <div>
              <span
                className="text-[56px] font-extrabold -tracking-[0.04em] font-[family-name:var(--font-outfit)] leading-none"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(255,255,255,0.7), rgba(255,255,255,0.4))",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                $0
              </span>
              <div className="text-[11px] text-white/30 font-[family-name:var(--font-mono)] mt-1">
                {plan.priceLabel}
              </div>
            </div>
          )}
        </div>

        {/* No subscription callout */}
        {plan.price !== null && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg mb-6 bg-success/[0.06] border border-success/10">
            <Icon name="Prohibit" size={12} weight="bold" className="text-success" />
            <span className="text-[11px] text-success font-[family-name:var(--font-mono)] font-medium">
              No subscription — pay once, use it
            </span>
          </div>
        )}

        {/* CTA button */}
        {plan.passType ? (
          <button
            onClick={() => onCheckout(plan.passType!)}
            disabled={isLoading}
            className={cn(
              "w-full py-3.5 px-6 rounded-[14px] border-none cursor-pointer text-[15px] font-semibold font-[family-name:var(--font-outfit)] tracking-[0.01em] transition-all duration-200 hover:-translate-y-px mb-7",
              isLoading && "opacity-70 cursor-wait"
            )}
            style={{
              background:
                plan.id === "document"
                  ? "linear-gradient(135deg, #0891b2, #0e7490)"
                  : "linear-gradient(135deg, #7c3aed, #6d28d9)",
              color: "#fff",
              boxShadow: plan.popular
                ? "0 0 25px rgba(124,58,237,0.25), inset 0 1px 0 rgba(255,255,255,0.1)"
                : "none",
            }}
          >
            {isLoading ? "Redirecting..." : plan.cta}
          </button>
        ) : (
          <Link
            href="/"
            className="block w-full py-3.5 px-6 rounded-[14px] border border-white/10 bg-white/[0.06] text-white/70 text-center text-[15px] font-semibold font-[family-name:var(--font-outfit)] tracking-[0.01em] transition-all duration-200 hover:-translate-y-px hover:bg-white/10 mb-7 no-underline"
          >
            {plan.cta}
          </Link>
        )}

        {/* Feature list */}
        <div className="flex flex-col gap-3.5">
          {plan.features.map((feature, i) => (
            <div key={i} className="flex items-center gap-3">
              <div
                className="w-[22px] h-[22px] rounded-[7px] shrink-0 flex items-center justify-center"
                style={{
                  background: feature.included
                    ? `${plan.accent}12`
                    : "rgba(255,255,255,0.02)",
                  border: `1px solid ${feature.included ? `${plan.accent}20` : "rgba(255,255,255,0.04)"}`,
                }}
              >
                {feature.included ? (
                  <CheckIcon color={plan.accent} />
                ) : (
                  <XIcon />
                )}
              </div>
              <span
                className={cn(
                  "text-[13px] font-[family-name:var(--font-outfit)] leading-[1.3]",
                  feature.included ? "text-white/65" : "text-white/20"
                )}
              >
                {feature.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ComparisonCell({
  value,
  color,
}: {
  value: string | boolean;
  color?: string;
}) {
  if (typeof value === "boolean") {
    return (
      <div className="flex justify-center">
        {value ? <CheckIcon color={color || "#94a3b8"} /> : <XIcon />}
      </div>
    );
  }
  return (
    <span className="text-[13px] text-white/50 font-[family-name:var(--font-mono)] text-center block">
      {value}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export function PricingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [loading, setLoading] = useState<string | null>(null);

  const handleCheckout = async (passType: "image" | "document") => {
    setLoading(passType);

    const prices = { image: 2.99, document: 4.99 };
    trackCheckoutStarted({ pass_type: passType, price: prices[passType] });

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passType }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error("Checkout error:", data.error);
        setLoading(null);
      }
    } catch (error) {
      console.error("Checkout failed:", error);
      setLoading(null);
    }
  };

  return (
    <>
      <AnimatedBackground />
      <Nav fileCount={0} />

      <div className="relative z-[1] max-w-[1100px] mx-auto px-6 pt-[110px] pb-20">
        {/* Hero */}
        <div className="text-center mb-5 animate-hero-fade-in">
          <div className="inline-block mb-4 px-4 py-1.5 rounded-full bg-purple/[0.08] border border-purple/15">
            <span className="text-xs text-purple-light font-[family-name:var(--font-mono)] font-medium tracking-[0.05em]">
              SIMPLE PRICING
            </span>
          </div>
          <h1
            className="text-4xl sm:text-5xl font-extrabold leading-[1.1] -tracking-[0.04em] font-[family-name:var(--font-outfit)] mb-4 animate-gradient-shift"
            style={{
              background:
                "linear-gradient(135deg, #f8fafc 0%, #a78bfa 60%, #06b6d4 100%)",
              backgroundSize: "200% 200%",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            No subscriptions.
            <br />
            No gotchas.
          </h1>
          <p className="text-[17px] text-white/40 max-w-[480px] mx-auto font-[family-name:var(--font-outfit)] leading-[1.7]">
            Free for single files. Buy a batch pass when you need more — use it
            once, no recurring charges, no account needed.
          </p>
        </div>

        {/* Trust bar */}
        <div className="flex justify-center gap-8 flex-wrap py-5 animate-card-slide-in" style={{ animationDelay: "0.5s" }}>
          {TRUST_ITEMS.map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <Icon name={item.icon} size={16} weight="duotone" className="text-white/50" />
              <span className="text-xs text-white/35 font-[family-name:var(--font-mono)] font-medium">
                {item.label}
              </span>
            </div>
          ))}
        </div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-8 items-start">
          {PLANS.map((plan, i) => (
            <PricingCard
              key={plan.id}
              plan={plan}
              index={i}
              loading={loading}
              onCheckout={handleCheckout}
            />
          ))}
        </div>

        {/* "Less than a coffee" callout */}
        <div
          className="text-center mt-10 animate-card-slide-in"
          style={{ animationDelay: "0.7s" }}
        >
          <div className="inline-flex items-center gap-2.5 px-6 py-3 rounded-[14px] bg-white/[0.02] border border-white/[0.05]">
            <Icon name="Coffee" size={20} weight="duotone" className="text-white/50" />
            <span className="text-sm text-white/45 font-[family-name:var(--font-outfit)]">
              Less than a flat white. Strip metadata from 50 files.
            </span>
          </div>
        </div>

        {/* Comparison table */}
        <div className="mt-20">
          <h2 className="text-[28px] font-bold text-center text-white/90 font-[family-name:var(--font-outfit)] -tracking-[0.02em] mb-2">
            Full Comparison
          </h2>
          <p className="text-sm text-white/35 text-center font-[family-name:var(--font-outfit)] mb-8">
            Everything you get at each tier
          </p>

          <div
            className="rounded-2xl overflow-hidden border border-white/[0.06] bg-white/[0.01] animate-card-slide-in hidden md:block"
            style={{ animationDelay: "0.3s" }}
          >
            {/* Header */}
            <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr] gap-3 px-5 py-3.5 border-b border-white/[0.06] bg-white/[0.02]">
              <span className="text-xs text-white/30 font-[family-name:var(--font-mono)] font-semibold">
                Feature
              </span>
              <span className="text-xs text-white/30 font-[family-name:var(--font-mono)] font-semibold text-center">
                Free
              </span>
              <span className="text-xs text-purple-light font-[family-name:var(--font-mono)] font-semibold text-center">
                Image Batch
              </span>
              <span className="text-xs text-cyan font-[family-name:var(--font-mono)] font-semibold text-center">
                Doc Batch
              </span>
            </div>
            {/* Rows */}
            {COMPARISON_ROWS.map((row, i) => (
              <div
                key={i}
                className="grid grid-cols-[1.5fr_1fr_1fr_1fr] gap-3 px-5 py-3 border-b border-white/[0.03]"
              >
                <span className="text-[13px] text-white/55 font-[family-name:var(--font-outfit)]">
                  {row.label}
                </span>
                <ComparisonCell value={row.free} color="#94a3b8" />
                <ComparisonCell value={row.image} color="#a78bfa" />
                <ComparisonCell value={row.doc} color="#06b6d4" />
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-20">
          <h2 className="text-[28px] font-bold text-center text-white/90 font-[family-name:var(--font-outfit)] -tracking-[0.02em] mb-2">
            Questions?
          </h2>
          <p className="text-sm text-white/35 text-center font-[family-name:var(--font-outfit)] mb-8">
            Everything you need to know about MetaStrip
          </p>

          <div className="max-w-[700px] mx-auto flex flex-col gap-2">
            {FAQ_ITEMS.map((item, i) => (
              <div
                key={i}
                className={cn(
                  "rounded-2xl overflow-hidden transition-all duration-300 animate-card-slide-in",
                  openFaq === i
                    ? "bg-white/[0.03] border border-purple/[0.12]"
                    : "bg-white/[0.015] border border-white/[0.04]"
                )}
                style={{ animationDelay: `${0.1 + i * 0.06}s` }}
              >
                <button
                  onClick={() =>
                    setOpenFaq(openFaq === i ? null : i)
                  }
                  className="w-full px-[22px] py-[18px] border-none cursor-pointer bg-transparent flex items-center justify-between gap-4 hover:bg-white/[0.015] transition-colors"
                >
                  <span className="text-[15px] font-medium text-white/80 font-[family-name:var(--font-outfit)] text-left">
                    {item.q}
                  </span>
                  <span
                    className="text-purple-light text-lg shrink-0 leading-none transition-transform duration-300"
                    style={{
                      transform:
                        openFaq === i
                          ? "rotate(45deg)"
                          : "rotate(0deg)",
                    }}
                  >
                    +
                  </span>
                </button>
                <div
                  className="overflow-hidden transition-all duration-[400ms]"
                  style={{
                    maxHeight: openFaq === i ? 200 : 0,
                    opacity: openFaq === i ? 1 : 0,
                  }}
                >
                  <div className="px-[22px] pb-5">
                    <p className="text-sm text-white/40 font-[family-name:var(--font-outfit)] leading-[1.7]">
                      {item.a}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div
          className="text-center mt-20 p-14 px-10 rounded-3xl animate-card-slide-in"
          style={{
            background:
              "linear-gradient(135deg, rgba(124,58,237,0.06) 0%, rgba(6,182,212,0.04) 100%)",
            border: "1px solid rgba(124,58,237,0.1)",
            animationDelay: "0.4s",
          }}
        >
          <h3 className="text-[32px] font-bold font-[family-name:var(--font-outfit)] -tracking-[0.02em] text-white/90 mb-3">
            Ready to clean up?
          </h3>
          <p className="text-[15px] text-white/40 font-[family-name:var(--font-outfit)] leading-[1.6] max-w-[420px] mx-auto mb-7">
            Start with the free tier — no account, no credit card. Upgrade to a
            batch pass only when you need it.
          </p>
          <Link
            href="/"
            className="inline-block px-10 py-4 rounded-[14px] border-none text-white text-base font-semibold font-[family-name:var(--font-outfit)] tracking-[0.01em] transition-all duration-200 hover:-translate-y-0.5 no-underline"
            style={{
              background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
              boxShadow:
                "0 0 30px rgba(124,58,237,0.3), inset 0 1px 0 rgba(255,255,255,0.1)",
            }}
          >
            Open MetaStrip — It&apos;s Free
          </Link>
        </div>
      </div>

      <Footer />
    </>
  );
}
