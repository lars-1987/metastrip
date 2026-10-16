import type { MetadataField, StripOptions } from "./types";

/* The processor contract: what a format's processor gives back, and how it
   says a file can't be read. The coordinator turns this into the full
   ProcessingResult, so every rule about reports and failures lives there
   once instead of in every processor. */

/** What only the processor knows. */
export interface Stripped {
  /** The cleaned file's bytes. */
  cleaned: Uint8Array;
  /** Everything found, whatever the options. The same file must give the
   *  same list however the categories are set. */
  fieldsFound: MetadataField[];
  /** The fields this strip actually took out: a subset of fieldsFound. */
  fieldsRemoved: MetadataField[];
}

/** Takes the whole file's bytes, which it may read but must not change. */
export type Processor = (bytes: Uint8Array<ArrayBuffer>, options: StripOptions) => Stripped | Promise<Stripped>;

/** Thrown when a file isn't valid for its format: a bad signature, or a size
 *  that runs past the end of the file. Any other exception is a crash, a bug
 *  in MetaStrip rather than in the file. */
export class Unreadable extends Error {
  name = "Unreadable";
}

/** Whether a block of metadata that can only be removed whole should go: yes
 *  if any field in it is in a category being removed, so nothing someone asked
 *  to remove is left behind. A kept field that shares the block goes too, and
 *  is reported removed. A block with no recognised fields always goes. */
export function blockGoes(fields: readonly MetadataField[], options: StripOptions): boolean {
  return fields.length === 0 || fields.some((f) => options[f.category]);
}
