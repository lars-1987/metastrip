function MetaStripIcon({ size = 36 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient
          id="ms-grad"
          x1="0"
          y1="0"
          x2="120"
          y2="120"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
        <linearGradient
          id="ms-fade"
          x1="30"
          y1="0"
          x2="90"
          y2="0"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#a78bfa" />
          <stop offset="35%" stopColor="#a78bfa" />
          <stop offset="100%" stopColor="#a78bfa" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width="120" height="120" rx="26" fill="#09090b" />
      <rect x="30" y="38" width="60" height="6" rx="3" fill="url(#ms-grad)" />
      <rect x="30" y="57" width="60" height="6" rx="3" fill="url(#ms-fade)" />
      <rect x="30" y="76" width="60" height="6" rx="3" fill="url(#ms-grad)" />
    </svg>
  );
}

export function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <MetaStripIcon size={36} />
      <span
        className="text-[22px] font-bold -tracking-[0.03em] font-[family-name:var(--font-outfit)]"
        style={{
          background: "linear-gradient(135deg, #e2e8f0 30%, #a78bfa 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        MetaStrip
      </span>
    </div>
  );
}
