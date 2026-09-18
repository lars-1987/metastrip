import Link from "next/link";
import { MetaStripIcon } from "@/components/shared/Logo";

/** Everything on the desktop that opens a joke window rather than a terminal
 *  tab, keyed by the id the desktop icons, dock and menus use. */
export interface DesktopWindow {
  title: string;
  width: number;
  content: React.ReactNode;
}

const mono = "text-[12px] font-[family-name:var(--font-mono)]";

function Listing({ path, color, children, footer }: { path: string; color: string; children: React.ReactNode; footer: React.ReactNode }) {
  return (
    <div className={`${mono} leading-snug`}>
      <div className="flex items-center gap-1.5 mb-3 pb-2 border-b border-white/[0.06] text-[11px]">
        <span className="text-white/40">~/metastrip/</span>
        <span className={color}>{path}</span>
      </div>
      <div className="space-y-0.5">{children}</div>
      <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/[0.06] text-[10px]">{footer}</div>
    </div>
  );
}

export const DESKTOP_WINDOWS: Record<string, DesktopWindow> = {
  about: {
    title: "About This MetaStrip",
    width: 320,
    content: (
      <div className={`${mono} text-center`}>
        <div className="mx-auto mb-3 w-fit drop-shadow-[0_6px_14px_rgba(124,58,237,0.35)]">
          <MetaStripIcon size={64} />
        </div>
        <div className="text-[15px] text-white/90">MetaStrip Classic</div>
        <div className="mb-4 text-[11px] text-white/40">Version 2.0, the terminal one</div>
        <dl className="space-y-1.5 text-left text-[11.5px]">
          {[
            ["Chip", "your browser"],
            ["Memory", "0 bytes of your files kept"],
            ["Storage", "your device, and only your device"],
            ["Uploads", "none, ever"],
            ["Serial number", "[stripped]"],
          ].map(([k, v]) => (
            <div key={k} className="flex gap-3">
              <dt className="w-28 shrink-0 text-right text-white/45">{k}</dt>
              <dd className="text-white/80">{v}</dd>
            </div>
          ))}
        </dl>
        <Link
          href="/"
          className="mt-5 inline-block rounded-md bg-white/[0.08] px-3 py-1.5 text-[11px] text-white/85 hover:bg-white/[0.14] transition-colors"
        >
          Take me to the new one
        </Link>
      </div>
    ),
  },
  env: {
    title: ".env",
    width: 380,
    content: (
      <pre className={`${mono} leading-relaxed text-white/80 whitespace-pre-wrap`}>
        <span className="text-white/40"># DO NOT COMMIT THIS FILE</span>{"\n"}
        <span className="text-white/40"># ...seriously, we mean it this time</span>{"\n\n"}
        <span className="text-purple-400">SECRET_KEY</span>=<span className="text-emerald-400">nice-try-buddy</span>{"\n"}
        <span className="text-purple-400">DATABASE_URL</span>=<span className="text-emerald-400">localhost:5432/we-dont-have-one</span>{"\n"}
        <span className="text-purple-400">AWS_ACCESS_KEY</span>=<span className="text-emerald-400">lol-everything-is-client-side</span>{"\n"}
        <span className="text-purple-400">ADS_ENABLED</span>=<span className="text-red-400">false</span>{"\n"}
        <span className="text-purple-400">USER_DATA_SOLD</span>=<span className="text-red-400">false</span>{"\n"}
        <span className="text-purple-400">UPLOAD_TO_SERVER</span>=<span className="text-red-400">false</span>{"\n"}
        <span className="text-purple-400">COOKIES</span>=<span className="text-emerald-400">chocolate-chip-only</span>{"\n\n"}
        <span className="text-white/40"># the only env vars you need when</span>{"\n"}
        <span className="text-white/40"># everything runs in the browser</span>
      </pre>
    ),
  },
  nodemodules: {
    title: "node_modules/ (47.3 GB)",
    width: 380,
    content: (
      <Listing
        path="node_modules"
        color="text-amber-400"
        footer={
          <>
            <span className="text-white/30">9 items, 47.3 GB total</span>
            <span className="text-amber-400/50">rm -rf not recommended</span>
          </>
        }
      >
        {[
          ["is-odd/", "2.1 GB"],
          ["is-even/", "2.1 GB"],
          ["is-number/", "1.8 GB"],
          ["left-pad/", "1.2 GB"],
          ["is-is-odd/", "900 MB"],
          ["is-thirteen/", "750 MB"],
          ["pad-left-right-center/", "450 MB"],
          ["is-positive-negative-zero-maybe/", "380 MB"],
          [".package-lock.json", "94 MB"],
        ].map(([name, size]) => (
          <div key={name} className="flex items-center gap-2 px-2 py-1 rounded hover:bg-white/[0.04] group cursor-default">
            <span className="text-[13px]">{name.endsWith("/") ? "📁" : "📄"}</span>
            <span className={`flex-1 truncate ${name.endsWith("/") ? "text-[#6CB4EE]" : "text-white/60"} group-hover:text-white/90`}>{name}</span>
            <span className="text-white/30 text-[10px] shrink-0">{size}</span>
          </div>
        ))}
      </Listing>
    ),
  },
  uploads: {
    title: "uploads/",
    width: 400,
    content: (
      <Listing
        path="uploads"
        color="text-purple-400"
        footer={
          <>
            <span className="text-white/30">7 items, 18.1 MB</span>
            <span className="text-emerald-400/60">drag into metastrip to clean →</span>
          </>
        }
      >
        {[
          ["🖼️", "vacation_2026.jpg", "4.2 MB", "GPS: 35.6762° N, 139.6503° E"],
          ["🖼️", "selfie_cafe.jpg", "3.8 MB", "Device: iPhone 15 Pro"],
          ["📄", "resume_final_FINAL_v3.pdf", "2.1 MB", "Author: John Smith"],
          ["📝", "quarterly_report.docx", "890 KB", "Creator: Microsoft Word"],
          ["📊", "budget_2026.xlsx", "1.4 MB", "Last saved by: Admin"],
          ["🖼️", "cat_sleeping.png", "5.7 MB", "GPS: your living room"],
          ["📁", "definitely_not_memes/", "?", "nice try"],
        ].map(([icon, name, size, meta]) => (
          <div key={name} className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-white/[0.04] group cursor-default">
            <span className="text-[13px]">{icon}</span>
            <div className="flex-1 min-w-0">
              <div className="text-white/80 group-hover:text-white/95 truncate">{name}</div>
              <div className={`text-[10px] truncate ${meta === "nice try" ? "text-white/30" : "text-red-400/60"}`}>{meta}</div>
            </div>
            <span className="text-white/30 text-[10px] shrink-0">{size}</span>
          </div>
        ))}
      </Listing>
    ),
  },
  photo: {
    title: "photo.jpg: Properties",
    width: 360,
    content: (
      <div className={`${mono} leading-relaxed`}>
        <div
          className="w-full h-28 rounded-lg mb-3 flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)" }}
        >
          <span className="text-3xl">📸</span>
        </div>
        <div className="text-white/50 mb-2">EXIF Metadata:</div>
        <div className="text-white/70 space-y-1">
          <div><span className="text-red-400">GPS:</span> 37.7749° N, 122.4194° W</div>
          <div><span className="text-red-400">Device:</span> iPhone 15 Pro Max</div>
          <div><span className="text-red-400">Serial:</span> DNQXYZ123456</div>
          <div><span className="text-red-400">Time:</span> 2026-03-19 08:42:17</div>
          <div><span className="text-red-400">Software:</span> iOS 19.3.1</div>
          <div><span className="text-red-400">Author:</span> John Privacy-Doesn&apos;t-Care</div>
        </div>
        <div className="mt-3 pt-3 border-t border-white/[0.06] text-amber-400/80 text-[11px]">
          ^ drag photo.jpg onto the terminal and watch it go
        </div>
      </div>
    ),
  },
  trash: {
    title: "Trash",
    width: 340,
    content: (
      <div className={`${mono} leading-relaxed text-center`}>
        <div className="flex items-center justify-center h-28 mb-3 text-5xl opacity-40">🗑️</div>
        <div className="text-white/60 mb-1">Trash is empty</div>
        <div className="text-white/40 text-[11px] mb-3">0 items &middot; 0 B</div>
        <div className="pt-3 border-t border-white/[0.06] text-emerald-400/70 text-[11px]">
          nothing to delete: we never kept any of it
        </div>
      </div>
    ),
  },
  music: {
    title: "Now Playing",
    width: 340,
    content: (
      <div className={`${mono} leading-relaxed`}>
        <div
          className="w-full h-28 rounded-lg mb-3 flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, #a855f7 0%, #ec4899 50%, #f472b6 100%)" }}
        >
          <span className="text-4xl">♪</span>
        </div>
        <div className="text-white/90 text-[13px] mb-0.5">silence.mp3</div>
        <div className="text-white/50 text-[11px] mb-3">by metastrip &middot; Privacy, Vol. 1</div>
        <div className="h-0.5 bg-white/10 rounded-full mb-1 overflow-hidden">
          <div className="h-full w-1/3 bg-white/50 rounded-full" />
        </div>
        <div className="flex justify-between text-white/40 text-[10px] mb-3">
          <span>1:03</span>
          <span>3:14</span>
        </div>
        <div className="flex justify-center gap-5 text-white/70 text-lg mb-2">
          <span>⏮</span>
          <span>⏸</span>
          <span>⏭</span>
        </div>
        <div className="pt-3 border-t border-white/[0.06] text-white/50 text-[11px] text-center italic">
          the sound of your data not being uploaded
        </div>
      </div>
    ),
  },
};
