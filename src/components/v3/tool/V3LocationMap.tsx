"use client";

import { formatLatLng, type LatLng } from "@/lib/gps";
import { WORLD_VIEWBOX, WORLD_LAND_PATH } from "./world-land";
import { InfoTip } from "../ui/InfoTip";

const LOCATION_INFO =
  "This map is drawn in your browser from a built-in world map; your coordinates are never sent anywhere to render it. Nothing about your location leaves your device.";

/**
 * Offline location map. Plots a decoded GPS fix on a real world map rendered
 * entirely inline — continents are a bundled SVG path, so there is zero network
 * request. Sized to sit as one cell in the metadata grid, alongside the other
 * category cards.
 *
 * Equirectangular projection: x = (lng+180)/360·1000, y = (90-lat)/180·500
 */

const W = 1000;
const H = 500;

export function V3LocationMap({ coords }: { coords: LatLng }) {
  const x = ((coords.lng + 180) / 360) * W;
  const y = ((90 - coords.lat) / 180) * H;
  const hemisphere = `${coords.lat >= 0 ? "N" : "S"} · ${coords.lng >= 0 ? "E" : "W"}`;

  return (
    <figure className="m-0 rounded-[var(--radius-sm)] bg-[var(--card)] p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <span className="grid h-9 w-9 place-items-center rounded-[10px]" style={{ background: "color-mix(in srgb, var(--danger) 18%, transparent)" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M12 21s7-6.3 7-11a7 7 0 10-14 0c0 4.7 7 11 7 11z" stroke="var(--danger)" strokeWidth="1.6" />
              <circle cx="12" cy="10" r="2.4" fill="var(--danger)" />
            </svg>
          </span>
          <div className="min-w-0">
            <p className="text-[15px] text-[var(--text)]">Location</p>
            <p className="v3-mono text-[12px] text-[var(--danger)]">{formatLatLng(coords)}</p>
          </div>
        </div>
        <InfoTip text={LOCATION_INFO} />
      </div>

      <div className="aspect-[2/1] w-full overflow-hidden rounded-[10px] bg-[var(--bg)]">
        <svg
          viewBox={WORLD_VIEWBOX}
          role="img"
          aria-label={`Map showing the photo's location at ${formatLatLng(coords)}`}
          preserveAspectRatio="xMidYMid meet"
          className="block h-full w-full"
        >
          <path d={WORLD_LAND_PATH} fill="var(--card-elevated)" />
          <path d={WORLD_LAND_PATH} fill="none" stroke="var(--primary)" strokeWidth={0.6} opacity={0.5} />
          <g stroke="var(--danger)" strokeWidth={0.7} strokeDasharray="4 5" opacity={0.4}>
            <line x1={0} y1={y} x2={W} y2={y} />
            <line x1={x} y1={0} x2={x} y2={H} />
          </g>
          <circle cx={x} cy={y} r={9} fill="var(--danger)" opacity={0.2}>
            <animate attributeName="r" values="7;16;7" dur="2.6s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.3;0;0.3" dur="2.6s" repeatCount="indefinite" />
          </circle>
          <circle cx={x} cy={y} r={5} fill="none" stroke="var(--danger)" strokeWidth={1.6} />
          <circle cx={x} cy={y} r={2.4} fill="#fff" />
        </svg>
      </div>

      <p className="v3-mono mt-2 text-right text-[11px] text-[var(--text-muted)]">
        {hemisphere} · embedded in file
      </p>
    </figure>
  );
}
