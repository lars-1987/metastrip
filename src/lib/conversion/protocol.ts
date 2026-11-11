import type { Colour } from "./colour";

/** The messages between the page and the conversion worker. */

export interface Job {
  id: number;
  /** The whole source file, handed over (transferred), not copied. */
  bytes: ArrayBuffer;
  /** Try the browser's decoder first, then libheif if it can't. */
  heif: boolean;
  colour: Colour;
  /** JPG quality, 0 to 1. */
  quality: number;
}

export type Decoder = "browser" | "libheif";

export type Reply =
  | {
      id: number;
      ok: true;
      jpeg: ArrayBuffer;
      width: number;
      height: number;
      decoder: Decoder;
      /** The colour space the JPG was encoded in: sRGB where the browser
       *  can't hold P3, whatever the source. */
      colour: Colour;
    }
  | { id: number; ok: false; error: "undecodable" | "failed"; detail: string };
