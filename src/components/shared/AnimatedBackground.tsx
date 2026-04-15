export function AnimatedBackground() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      {/* Base wallpaper gradient — macOS Sequoia-ish dark mode */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(160deg, #0f0b1f 0%, #131033 35%, #1a1442 60%, #24113d 85%, #2a0f30 100%)",
        }}
      />
      {/* Warm glow — top-left, magenta/pink */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 55% at 15% 10%, rgba(217,70,239,0.22) 0%, transparent 60%)",
        }}
      />
      {/* Cool glow — bottom-right, cyan/indigo */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 75% 60% at 85% 90%, rgba(56,189,248,0.18) 0%, transparent 60%)",
        }}
      />
      {/* Centre lift — subtle violet to keep the middle from going flat */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 90% 60% at 50% 50%, rgba(139,92,246,0.10) 0%, transparent 65%)",
        }}
      />
      {/* Floating orbs for slow motion */}
      <div
        className="absolute w-[620px] h-[620px] rounded-full animate-orb-float-1"
        style={{
          background:
            "radial-gradient(circle, rgba(168,85,247,0.18) 0%, transparent 70%)",
          top: "-12%",
          left: "-8%",
        }}
      />
      <div
        className="absolute w-[520px] h-[520px] rounded-full animate-orb-float-2"
        style={{
          background:
            "radial-gradient(circle, rgba(34,211,238,0.12) 0%, transparent 70%)",
          bottom: "-18%",
          right: "-6%",
        }}
      />
      <div
        className="absolute w-[320px] h-[320px] rounded-full animate-orb-float-3"
        style={{
          background:
            "radial-gradient(circle, rgba(236,72,153,0.10) 0%, transparent 70%)",
          top: "42%",
          right: "22%",
        }}
      />
      {/* Noise overlay */}
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "128px 128px",
        }}
      />
      {/* Scan line effect */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          background:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)",
        }}
      />
    </div>
  );
}
