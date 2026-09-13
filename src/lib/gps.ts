import type { MetadataField } from "./processing/types";

/**
 * Decode EXIF GPS metadata fields into decimal lat/lng for an offline map.
 *
 * The JPEG processor emits GPS coordinates as joined fraction strings, e.g.
 * GPSLatitude = "40/1, 26/1, 4612/100" (degrees, minutes, seconds), paired
 * with GPSLatitudeRef = "N" | "S" (and the same for longitude with "E"|"W").
 *
 * Videos store a point as an ISO 6709 string ("+37.7749-122.4194+012.345/"):
 * Apple's com.apple.quicktime.location.ISO6709 key, Android's ©xyz atom, and
 * 3GPP loci once the MP4 processor converts it. The processor emits those under
 * the key "ISO6709", so a video's location reaches the same map.
 */

export interface LatLng {
  lat: number;
  lng: number;
}

function parseFraction(token: string): number {
  const t = token.trim();
  if (t.includes("/")) {
    const [num, den] = t.split("/").map(Number);
    if (!den || Number.isNaN(num) || Number.isNaN(den)) return NaN;
    return num / den;
  }
  const n = Number(t);
  return Number.isNaN(n) ? NaN : n;
}

/** "40/1, 26/1, 4612/100" -> 40.7686… (degrees + minutes/60 + seconds/3600). */
function dmsToDecimal(value: string): number | null {
  const parts = value.split(",").map(parseFraction);
  if (parts.length === 0 || parts.some(Number.isNaN)) return null;
  const [d = 0, m = 0, s = 0] = parts;
  return d + m / 60 + s / 3600;
}

function fieldValue(fields: MetadataField[], key: string): string | null {
  const f = fields.find((x) => x.key === key);
  if (!f || f.value == null) return null;
  return String(f.value);
}

/** "+37.7749-122.4194+012.345/" -> { lat: 37.7749, lng: -122.4194 }. Decimal
 *  degrees, the form phones write; altitude and the trailing "/" are ignored. */
export function parseIso6709(value: string): LatLng | null {
  const m = /^([+-]\d{1,2}(?:\.\d+)?)([+-]\d{1,3}(?:\.\d+)?)/.exec(value.trim());
  if (!m) return null;
  const lat = Number(m[1]);
  const lng = Number(m[2]);
  if (Number.isNaN(lat) || Number.isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
  return { lat, lng };
}

/** Returns decimal coordinates if the fields carry a parseable GPS fix: EXIF
 *  for photos, ISO 6709 for video. */
export function extractGpsCoordinates(fields: MetadataField[]): LatLng | null {
  const iso = fieldValue(fields, "ISO6709");
  const latRaw = fieldValue(fields, "GPSLatitude");
  const lngRaw = fieldValue(fields, "GPSLongitude");
  if (!latRaw || !lngRaw) return iso ? parseIso6709(iso) : null;

  let lat = dmsToDecimal(latRaw);
  let lng = dmsToDecimal(lngRaw);
  if (lat == null || lng == null) return null;

  const latRef = (fieldValue(fields, "GPSLatitudeRef") ?? "N").toUpperCase();
  const lngRef = (fieldValue(fields, "GPSLongitudeRef") ?? "E").toUpperCase();
  if (latRef.startsWith("S")) lat = -lat;
  if (lngRef.startsWith("W")) lng = -lng;

  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
  return { lat, lng };
}

/** Pretty decimal string, e.g. "-37.8136°, 144.9631°". */
export function formatLatLng({ lat, lng }: LatLng): string {
  return `${lat.toFixed(4)}°, ${lng.toFixed(4)}°`;
}
