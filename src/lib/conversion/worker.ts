/* The conversion worker: decodes one image and encodes it as a JPG, off the
   page's thread so a batch of 48 MP photos never freezes the tool.

   Not bundled by Next: scripts/build-converter.mjs builds it with esbuild to
   public/convert/worker.js, a classic worker, and copies libheif's own two
   files beside it unchanged (libheif is LGPL; it stays a separate,
   replaceable library). They load only when a HEIC needs them, so a visitor
   in Safari, which decodes HEIC itself, never downloads them. */

import { p3ToSrgb } from "./p3";
import type { Colour } from "./colour";
import type { Job, Reply } from "./protocol";

/* ── The worker's globals, which the DOM types don't describe ──────── */

interface HeifImage {
  get_width(): number;
  get_height(): number;
  is_primary(): boolean;
  has_alpha_channel(): boolean;
  /** Fills `target` with RGBA in the image's own colour space, rotated and
   *  mirrored as the file says; calls back with null when decoding fails. */
  display(target: ImageData, done: (result: ImageData | null) => void): void;
  free(): void;
}

interface Libheif {
  HeifDecoder: new () => { decoder: unknown; decode(bytes: Uint8Array): HeifImage[] };
  heif_context_free(context: unknown): void;
}

interface LibheifOptions {
  locateFile(file: string): string;
  onRuntimeInitialized(): void;
  onAbort(reason: unknown): void;
}

declare const importScripts: (...urls: string[]) => void;
declare const libheif: (options: LibheifOptions) => Libheif;

const scope = globalThis as unknown as {
  location: { href: string };
  onmessage: ((event: MessageEvent<Job>) => void) | null;
  postMessage(message: Reply, transfer?: Transferable[]): void;
};

/* ── Decoding ──────────────────────────────────────────────────────── */

/** Neither decoder could read the file. */
class Undecodable extends Error {
  name = "Undecodable";
}

/** Whether this browser holds P3 pixels. Firefox doesn't: there the canvas
 *  is sRGB, and libheif's P3 values are converted before they go in. */
const P3_OK = (() => {
  try {
    return new ImageData(1, 1, { colorSpace: "display-p3" }).colorSpace === "display-p3";
  } catch {
    return false;
  }
})();

let loading: Promise<Libheif> | undefined;

/** libheif, loaded the first time a file needs it. */
function libheifModule(): Promise<Libheif> {
  loading ??= new Promise<Libheif>((resolve, reject) => {
    const here = (file: string) => new URL(file, scope.location.href).href;
    importScripts(here("libheif.js"));
    const lib: { ready?: Libheif } = {};
    lib.ready = libheif({
      locateFile: here,
      // Can fire before libheif() has returned, so wait a tick for it.
      onRuntimeInitialized: () => setTimeout(() => resolve(lib.ready!)),
      onAbort: (reason) => reject(new Error(String(reason))),
    });
  }).catch((err) => {
    loading = undefined; // a failed download can be retried with the next file
    throw err;
  });
  return loading;
}

async function viaLibheif(bytes: ArrayBuffer, colour: Colour): Promise<{ pixels: ImageData; alpha: boolean }> {
  const m = await libheifModule();
  const decoder = new m.HeifDecoder();
  let images: HeifImage[] = [];
  try {
    images = decoder.decode(new Uint8Array(bytes));
    const image = images.find((i) => i.is_primary()) ?? images[0];
    if (!image) throw new Undecodable();
    const width = image.get_width();
    const height = image.get_height();
    const p3 = colour === "display-p3";
    const pixels = p3 && P3_OK ? new ImageData(width, height, { colorSpace: "display-p3" }) : new ImageData(width, height);
    const done = await new Promise<ImageData | null>((resolve) => image.display(pixels, resolve));
    if (!done) throw new Undecodable();
    if (p3 && !P3_OK) p3ToSrgb(pixels.data);
    return { pixels, alpha: image.has_alpha_channel() };
  } finally {
    for (const image of images) image.free();
    m.heif_context_free(decoder.decoder);
  }
}

/* ── Encoding ──────────────────────────────────────────────────────── */

/** A JPG of what `paint` draws, on white: JPG has no transparency, and white
 *  is what a transparent PNG shows on almost every page. */
async function encode(
  width: number,
  height: number,
  colour: Colour,
  quality: number,
  paint: (ctx: OffscreenCanvasRenderingContext2D) => void | Promise<void>
): Promise<ArrayBuffer> {
  const canvas = new OffscreenCanvas(width, height);
  try {
    const ctx = canvas.getContext("2d", { colorSpace: colour, alpha: false });
    if (!ctx) throw new Error("no 2d context");
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, width, height);
    await paint(ctx);
    const blob = await canvas.convertToBlob({ type: "image/jpeg", quality });
    return await blob.arrayBuffer();
  } finally {
    // Hand the pixels back now rather than whenever the canvas is collected.
    canvas.width = 0;
    canvas.height = 0;
  }
}

/* ── One job ───────────────────────────────────────────────────────── */

async function convert(job: Job): Promise<Extract<Reply, { ok: true }>> {
  const colour: Colour = P3_OK ? job.colour : "srgb";

  // The browser's own decoder first: it's fastest, and Safari's reads HEIC.
  // It also turns the picture upright from the file's orientation.
  let bitmap: ImageBitmap | null = null;
  try {
    bitmap = await createImageBitmap(new Blob([job.bytes]), { imageOrientation: "from-image" });
  } catch {
    if (!job.heif) throw new Undecodable();
  }
  if (bitmap) {
    const { width, height } = bitmap;
    try {
      const jpeg = await encode(width, height, colour, job.quality, (ctx) => ctx.drawImage(bitmap, 0, 0));
      return { id: job.id, ok: true, jpeg, width, height, decoder: "browser", colour };
    } finally {
      bitmap.close();
    }
  }

  const { pixels, alpha } = await viaLibheif(job.bytes, job.colour);
  const { width, height } = pixels;
  const jpeg = await encode(width, height, colour, job.quality, async (ctx) => {
    if (!alpha) return ctx.putImageData(pixels, 0, 0);
    // putImageData replaces pixels, transparency and all; drawing composites
    // them over the white.
    const layer = await createImageBitmap(pixels);
    ctx.drawImage(layer, 0, 0);
    layer.close();
  });
  return { id: job.id, ok: true, jpeg, width, height, decoder: "libheif", colour };
}

scope.onmessage = async ({ data: job }) => {
  try {
    const reply = await convert(job);
    scope.postMessage(reply, [reply.jpeg]);
  } catch (err) {
    // The error's name only: a message could quote the file.
    const detail = err instanceof Error ? err.name : "unknown";
    scope.postMessage({ id: job.id, ok: false, error: err instanceof Undecodable ? "undecodable" : "failed", detail });
  }
};
