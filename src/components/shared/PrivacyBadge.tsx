export function PrivacyBadge() {
  return (
    <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-success-dark/[0.08] border border-success-dark/15">
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#22c55e"
        strokeWidth="2.5"
        strokeLinecap="round"
      >
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
      <span className="text-[11px] text-success font-medium font-[family-name:var(--font-mono)] tracking-tight">
        Files never leave your device
      </span>
    </div>
  );
}
