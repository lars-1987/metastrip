import { identify } from "../processing/formats";
import type { MetadataField, StripOptions } from "../processing/types";
import { sourceColour, type Colour } from "./colour";
import { isConvertible } from "./formats";
import { finishJpeg, sourceExif } from "./metadata";
import type { Decoder, Job, Reply } from "./protocol";

/* Converting images to JPG in the browser: nothing is uploaded.

   One Converter runs one worker, one file at a time: a 48 MP photo takes
   about 200 MB to decode, and two at once is how a phone's tab gets killed.
   libheif's memory grows to fit the largest photo and never shrinks, so a
   batch ends with dispose(), and the next batch starts a fresh worker. */

/** Built by scripts/build-converter.mjs before `next dev` and `next build`. */
export const WORKER_URL = "/convert/worker.js";

/** JPG quality: indistinguishable from the original at a normal viewing size,
 *  and about the size the iPhone's own "Most Compatible" setting makes. */
export const QUALITY = 0.9;

export type ConversionFailure =
  | "unsupported" //  not an image the converter takes
  | "undecodable" //  no decoder in this browser could read it
  | "worker" //       the worker couldn't start or stopped
  | "failed"; //      decoded, but encoding failed (often memory)

export class ConversionError extends Error {
  name = "ConversionError";
  /** `detail`: an error name, for telemetry; never text from the file. */
  constructor(readonly reason: ConversionFailure, readonly detail = "") {
    super(reason);
  }
}

export interface Converted {
  blob: Blob;
  /** The source's name with a .jpg extension. */
  name: string;
  width: number;
  height: number;
  decoder: Decoder;
  /** The colour space of the JPG. */
  colour: Colour;
  /** Source EXIF fields carried into the JPG, because their category was kept. */
  kept: MetadataField[];
}

type Pending = { resolve: (reply: Reply) => void; reject: (err: Error) => void };

export class Converter {
  private worker: Worker | null = null;
  private pending = new Map<number, Pending>();
  private nextId = 0;
  private queue: Promise<unknown> = Promise.resolve();

  constructor(private readonly workerUrl = WORKER_URL) {}

  /** Convert one file to JPG. Calls queue: one file is converted at a time. */
  convert(file: File, strip: StripOptions, { quality = QUALITY } = {}): Promise<Converted> {
    const run = this.queue.then(() => this.convertNow(file, strip, quality));
    this.queue = run.catch(() => undefined);
    return run;
  }

  /** Stop the worker and free its memory. Anything still queued fails with
   *  "worker"; the next convert() starts a new one. */
  dispose(): void {
    this.worker?.terminate();
    this.worker = null;
    this.failAll(new ConversionError("worker", "disposed"));
  }

  private async convertNow(file: File, strip: StripOptions, quality: number): Promise<Converted> {
    const identity = await identify(file);
    if (identity.status !== "supported" || !isConvertible(identity.format)) throw new ConversionError("unsupported");
    const format = identity.format;

    const bytes = new Uint8Array(await file.arrayBuffer());
    const colour = await sourceColour(bytes, format);
    // Copied out: the file's bytes are handed to the worker, not shared.
    const keepsAny = Object.values(strip).some((on) => !on);
    const exif = keepsAny ? (sourceExif(bytes, format)?.slice() ?? null) : null;

    const reply = await this.send({ bytes: bytes.buffer, heif: format === "heic", colour, quality });
    if (!reply.ok) throw new ConversionError(reply.error, reply.detail);

    const { bytes: jpeg, kept } = finishJpeg(new Uint8Array(reply.jpeg), exif, strip, reply.width, reply.height);
    return {
      blob: new Blob([jpeg as Uint8Array<ArrayBuffer>], { type: "image/jpeg" }),
      name: jpgName(file.name),
      width: reply.width,
      height: reply.height,
      decoder: reply.decoder,
      colour: reply.colour,
      kept,
    };
  }

  private send(job: Omit<Job, "id">): Promise<Reply> {
    const worker = this.start();
    const id = ++this.nextId;
    return new Promise<Reply>((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      worker.postMessage({ ...job, id } satisfies Job, [job.bytes]);
    });
  }

  private start(): Worker {
    if (this.worker) return this.worker;
    const worker = new Worker(this.workerUrl);
    worker.onmessage = ({ data }: MessageEvent<Reply>) => {
      const p = this.pending.get(data.id);
      this.pending.delete(data.id);
      p?.resolve(data);
    };
    // The script didn't load, or the worker died: whatever it held is lost.
    worker.onerror = (event) => {
      event.preventDefault();
      worker.terminate();
      if (this.worker === worker) this.worker = null;
      this.failAll(new ConversionError("worker", "error"));
    };
    this.worker = worker;
    return worker;
  }

  private failAll(err: Error) {
    for (const p of this.pending.values()) p.reject(err);
    this.pending.clear();
  }
}

/** "IMG_0001.HEIC" → "IMG_0001.jpg". */
export function jpgName(name: string): string {
  const dot = name.lastIndexOf(".");
  return `${dot > 0 ? name.slice(0, dot) : name}.jpg`;
}
