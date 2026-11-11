import type { Format } from "../processing/formats";

/** What the converter takes in. Every browser decodes JPG, PNG, WebP, GIF
 *  (its first frame) and AVIF itself; HEIC is Safari's own decoder where it
 *  has one, and libheif everywhere else. TIFF only Safari decodes, so it
 *  waits for a decoder of its own. */
export const CONVERTIBLE = ["heic", "jpeg", "png", "webp", "avif", "gif"] as const satisfies readonly Format[];

export type ConvertibleFormat = (typeof CONVERTIBLE)[number];

export const isConvertible = (format: Format): format is ConvertibleFormat =>
  (CONVERTIBLE as readonly Format[]).includes(format);
