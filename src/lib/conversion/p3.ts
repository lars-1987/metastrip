/* Display P3 to sRGB, for browsers that can't hold P3 pixels.

   An iPhone photo is Display P3: the same transfer curve as sRGB with wider
   primaries. Chrome and Safari keep it (P3 ImageData and a P3 canvas, which
   embeds a Display P3 profile in the JPG). Firefox has neither, and putting
   P3 values into an sRGB canvas as they are dulls and shifts every colour.
   So there the worker converts: undo the curve, change primaries, clip what
   sRGB can't show, and put the curve back. */

/** Linear P3 to linear sRGB, both D65 (rows: r, g, b). */
const P3_TO_SRGB = [
  1.2249401, -0.2249404, 0,
  -0.0420569, 1.0420571, 0,
  -0.0196376, -0.0786361, 1.0982735,
];

/** Steps in the table that puts the curve back: enough that a round trip of
 *  an sRGB colour lands on its own 8-bit value. */
const STEPS = 4096;

let tables: { linear: Float32Array; encode: Uint8ClampedArray } | undefined;

function curveTables() {
  if (tables) return tables;
  const linear = new Float32Array(256);
  for (let i = 0; i < 256; i++) {
    const c = i / 255;
    linear[i] = c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  }
  const encode = new Uint8ClampedArray(STEPS + 1);
  for (let i = 0; i <= STEPS; i++) {
    const l = i / STEPS;
    encode[i] = Math.round(255 * (l <= 0.0031308 ? 12.92 * l : 1.055 * l ** (1 / 2.4) - 0.055));
  }
  tables = { linear, encode };
  return tables;
}

/** Convert RGBA pixels from Display P3 to sRGB in place. Alpha is untouched. */
export function p3ToSrgb(rgba: Uint8ClampedArray): void {
  const { linear, encode } = curveTables();
  const m = P3_TO_SRGB;
  const out = (v: number) => encode[v <= 0 ? 0 : v >= 1 ? STEPS : (v * STEPS + 0.5) | 0];
  for (let i = 0; i < rgba.length; i += 4) {
    const r = linear[rgba[i]];
    const g = linear[rgba[i + 1]];
    const b = linear[rgba[i + 2]];
    rgba[i] = out(m[0] * r + m[1] * g + m[2] * b);
    rgba[i + 1] = out(m[3] * r + m[4] * g + m[5] * b);
    rgba[i + 2] = out(m[6] * r + m[7] * g + m[8] * b);
  }
}
