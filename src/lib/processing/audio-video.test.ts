import { describe, expect, it } from "vitest";
import { processFile } from "./coordinator";
import type { MetadataField, ProcessingResult, StripOptions } from "./types";
import {
  MPEG_FRAME,
  box,
  concat,
  flacBytes,
  ftypBox,
  id3v2Body,
  id3v2Header,
  m4aBytes,
  movBytes,
  mp3Bytes,
  mp4Bytes,
  truncatedFlacBytes,
  truncatedWavBytes,
  utf8,
  u16be,
  wavBytes,
} from "./audio-video-files.fixture";

// Characterisation tests: they pin what the audio and video processors do
// today, quirks and bugs included, so the move to a shared processor contract
// shows every behaviour change as a failing, reviewed line. A test named
// "today" or commented "BUG" pins something the contract is expected to change.

const ALL: StripOptions = {
  gps: true,
  device: true,
  dates: true,
  author: true,
  software: true,
  copyright: true,
  ai: true,
  comments: true,
  custom: true,
};

const summary = (fields: MetadataField[]) => fields.map((f) => `${f.category}:${f.key}`).sort();

const fileOf = (data: Uint8Array | Blob, name: string, type: string) =>
  new File([data as BlobPart], name, { type });

/** Runs the cleaned output back through processFile with everything on: what
 *  a second pass (or the verify step) would still find. */
async function reread(result: ProcessingResult, name: string, type: string) {
  const again = await processFile(fileOf(result.cleanedBlob, name, type), ALL);
  expect(again.error).toBeUndefined();
  return summary(again.report.fieldsFound);
}

/** Whether a string survives anywhere in the bytes, zeroed or not. */
async function contains(blob: Blob, text: string): Promise<boolean> {
  const bytes = new Uint8Array(await blob.arrayBuffer());
  return new TextDecoder("latin1").decode(bytes).includes(text);
}

/** The browser losing the file between identification (which reads a slice)
 *  and the processor's full read, as with a cloud placeholder or a download
 *  that was still being written. */
function failFullRead(file: File): File {
  file.arrayBuffer = () => Promise.reject(new DOMException("gone", "NotFoundError"));
  return file;
}

describe("MP4 (Android-style: udta tags plus mdta keys)", () => {
  const name = "clip.mp4";
  const type = "video/mp4";
  const FOUND = [
    "author:©ART",
    "copyright:cprt",
    "custom:com.android.capture.fps",
    "dates:mdhd_timestamps",
    "dates:mvhd_timestamps",
    "dates:tkhd_timestamps",
    "device:com.android.manufacturer",
    "device:com.android.model",
    "gps:ISO6709",
    "software:com.android.version",
    "software:©too",
  ];

  it("strips everything with all categories on", async () => {
    const result = await processFile(fileOf(mp4Bytes(), name, type), ALL);
    expect(result.error).toBeUndefined();
    expect(result.report.fileType).toBe("mp4");
    expect(summary(result.report.fieldsFound)).toEqual(FOUND);
    expect(summary(result.report.fieldsRemoved)).toEqual(FOUND);
    // Boxes become `free` of the same size, so the file length is unchanged.
    expect(result.cleanedBlob.size).toBe(mp4Bytes().length);
    expect(await contains(result.cleanedBlob, "Lars Holmstrom")).toBe(false);
    expect(await reread(result, name, type)).toEqual([]);
  });

  it("removes the location anyway with gps off, today", async () => {
    const result = await processFile(fileOf(mp4Bytes(), name, type), { ...ALL, gps: false });
    expect(result.error).toBeUndefined();
    // BUG: udta goes whole when any category in it is on, so the ©xyz location
    // is removed (and reported removed) although gps was switched off.
    expect(summary(result.report.fieldsRemoved)).toEqual(FOUND);
    expect(summary(result.report.fieldsKept)).toEqual([]);
    expect(await contains(result.cleanedBlob, "+59.3293+018.0686")).toBe(false);
    expect(await reread(result, name, type)).toEqual([]);
  });

  it("silently skips a moov that runs past the end of a truncated file", async () => {
    // Cut the last 10 bytes of moov and all of mdat: moov's declared size now
    // runs past the end, so the walker stops at it without a word.
    const full = mp4Bytes();
    const cut = full.slice(0, full.length - 20 - 10);
    const file = fileOf(cut, name, type);
    const result = await processFile(file, ALL);
    // BUG: no error, nothing found, and the metadata is handed back untouched
    // as a "cleaned" file.
    expect(result.error).toBeUndefined();
    expect(result.crashed).toBeUndefined();
    expect(summary(result.report.fieldsFound)).toEqual([]);
    expect(result.cleanedBlob === file).toBe(false);
    expect(result.cleanedBlob.size).toBe(cut.length);
    expect(await contains(result.cleanedBlob, "Lars Holmstrom")).toBe(true);
  });

  it("returns an empty Blob and the raw parser error when a box has no room for its fields, today", async () => {
    // An mvhd of bare header as the last 8 bytes: reading its version byte
    // goes one past the end of the DataView and throws a RangeError, which
    // mp4.ts catches and wraps.
    const bytes = concat(
      ftypBox("isom"),
      box("moov", box("udta", box("©ART", u16be(4), u16be(0), utf8("Lars"))), box("mvhd")),
    );
    const file = fileOf(bytes, name, type);
    const result = await processFile(file, ALL);
    // The contract will replace the empty Blob and the raw engine text.
    expect(result.error).toMatch(/^MP4 processing failed: /);
    expect(result.crashed).toBeUndefined();
    expect(result.cleanedBlob === file).toBe(false);
    expect(result.cleanedBlob.size).toBe(0);
    expect(result.report.fileType).toBe("mp4");
  });

  it("lets a failed full read escape to the coordinator's crash guard", async () => {
    // mp4.ts reads the file before its try, so unlike the audio processors the
    // rejection reaches processFile, which reports a crash and hands back the
    // original file.
    const file = failFullRead(fileOf(mp4Bytes(), name, type));
    const result = await processFile(file, ALL);
    expect(result.error).toBe(
      "Your browser couldn't open it. If you just downloaded it, make sure the download has finished, or save it to a folder on this device (not a cloud-only one) and try again.",
    );
    expect(result.crashed).toBe("NotFoundError");
    expect(result.cleanedBlob === file).toBe(true);
  });

  it("refuses a file over the 1.5 GB cap with an empty Blob, today", async () => {
    const file = fileOf(mp4Bytes(), name, type);
    Object.defineProperty(file, "size", { value: 2 * 1024 ** 3 });
    const result = await processFile(file, ALL);
    expect(result.error).toBe("Video too large (2.0 GB). Maximum 1.5 GB. Trim or compress first.");
    expect(result.crashed).toBeUndefined();
    // The contract will hand back the original file instead of 0 bytes.
    expect(result.cleanedBlob === file).toBe(false);
    expect(result.cleanedBlob.size).toBe(0);
    expect(result.report.fileSize).toBe(2 * 1024 ** 3);
  });
});

describe("MOV (iPhone-style: mdta keys, handler vendor, udta text atoms)", () => {
  const name = "IMG_0001.MOV";
  const type = "video/quicktime";
  const FOUND = [
    "dates:com.apple.quicktime.creationdate",
    "dates:mdhd_timestamps",
    "dates:mvhd_timestamps",
    "dates:tkhd_timestamps",
    "dates:©day",
    "device:com.apple.quicktime.make",
    "device:com.apple.quicktime.model",
    "gps:ISO6709",
    "software:com.apple.quicktime.software",
    "software:hdlr_vendor",
    "software:©swr",
  ];

  it("strips everything with all categories on", async () => {
    const result = await processFile(fileOf(movBytes(), name, type), ALL);
    expect(result.error).toBeUndefined();
    expect(result.report.fileType).toBe("mov");
    expect(summary(result.report.fieldsFound)).toEqual(FOUND);
    expect(summary(result.report.fieldsRemoved)).toEqual(FOUND);
    expect(result.cleanedBlob.size).toBe(movBytes().length);
    expect(await contains(result.cleanedBlob, "iPhone")).toBe(false);
    expect(await reread(result, name, type)).toEqual([]);
  });

  it("keeps the header timestamps but not the other dates with dates off, today", async () => {
    const result = await processFile(fileOf(movBytes(), name, type), { ...ALL, dates: false });
    expect(result.error).toBeUndefined();
    // BUG: the mvhd/tkhd/mdhd times are honoured as kept, but the creation date
    // in mdta and ©day in udta go with their containers and are reported removed.
    expect(summary(result.report.fieldsRemoved)).toEqual([
      "dates:com.apple.quicktime.creationdate",
      "dates:©day",
      "device:com.apple.quicktime.make",
      "device:com.apple.quicktime.model",
      "gps:ISO6709",
      "software:com.apple.quicktime.software",
      "software:hdlr_vendor",
      "software:©swr",
    ]);
    expect(summary(result.report.fieldsKept)).toEqual([
      "dates:mdhd_timestamps",
      "dates:mvhd_timestamps",
      "dates:tkhd_timestamps",
    ]);
    expect(await reread(result, name, type)).toEqual([
      "dates:mdhd_timestamps",
      "dates:mvhd_timestamps",
      "dates:tkhd_timestamps",
    ]);
  });

  it("silently skips a moov that runs past the end of a truncated file", async () => {
    const full = movBytes();
    const cut = full.slice(0, full.length - 20 - 10);
    const file = fileOf(cut, name, type);
    const result = await processFile(file, ALL);
    // BUG: as for MP4, no error and the location goes back out untouched.
    expect(result.error).toBeUndefined();
    expect(result.crashed).toBeUndefined();
    expect(summary(result.report.fieldsFound)).toEqual([]);
    expect(result.cleanedBlob === file).toBe(false);
    expect(result.cleanedBlob.size).toBe(cut.length);
    expect(await contains(result.cleanedBlob, "+59.3293+018.0686")).toBe(true);
  });
});

describe("M4A (iTunes-style: udta > meta > ilst)", () => {
  const name = "voice.m4a";
  const type = "audio/mp4";
  const FOUND = [
    "author:©ART",
    "comments:©cmt",
    "copyright:cprt",
    "custom:©nam",
    "dates:mdhd_timestamps",
    "dates:mvhd_timestamps",
    "dates:tkhd_timestamps",
    "dates:©day",
    "software:©too",
  ];

  it("strips everything with all categories on", async () => {
    const result = await processFile(fileOf(m4aBytes(), name, type), ALL);
    expect(result.error).toBeUndefined();
    // BUG: mp4.ts sets fileType from the MIME type (only video/quicktime gives
    // "mov"), so a file the registry identified as m4a reports "mp4".
    expect(result.report.fileType).toBe("mp4");
    expect(summary(result.report.fieldsFound)).toEqual(FOUND);
    expect(summary(result.report.fieldsRemoved)).toEqual(FOUND);
    expect(result.cleanedBlob.size).toBe(m4aBytes().length);
    expect(await contains(result.cleanedBlob, "Lars Holmstrom")).toBe(false);
    expect(await reread(result, name, type)).toEqual([]);
  });

  it("removes the artist anyway with author off, today", async () => {
    const result = await processFile(fileOf(m4aBytes(), name, type), { ...ALL, author: false });
    expect(result.error).toBeUndefined();
    // BUG: the whole udta goes, ©ART included, and is reported removed.
    expect(summary(result.report.fieldsRemoved)).toEqual(FOUND);
    expect(summary(result.report.fieldsKept)).toEqual([]);
    expect(await contains(result.cleanedBlob, "Lars Holmstrom")).toBe(false);
    expect(await reread(result, name, type)).toEqual([]);
  });

  it("silently skips a moov that runs past the end of a truncated file", async () => {
    const full = m4aBytes();
    const cut = full.slice(0, full.length - 20 - 10);
    const file = fileOf(cut, name, type);
    const result = await processFile(file, ALL);
    expect(result.error).toBeUndefined();
    expect(result.crashed).toBeUndefined();
    expect(summary(result.report.fieldsFound)).toEqual([]);
    expect(result.cleanedBlob === file).toBe(false);
    expect(result.cleanedBlob.size).toBe(cut.length);
    expect(await contains(result.cleanedBlob, "Lars Holmstrom")).toBe(true);
  });
});

describe("MP3 (ID3v2.3 at the front, ID3v1 at the end)", () => {
  const name = "song.mp3";
  const type = "audio/mpeg";
  const FOUND = [
    "author:ID3v1_artist",
    "author:TPE1",
    "comments:COMM",
    "comments:ID3v1_comment",
    "copyright:TCOP",
    "custom:ID3v1_album",
    "custom:ID3v1_title",
    "custom:TIT2",
    "dates:ID3v1_year",
    "dates:TYER",
    "software:TSSE",
  ];

  it("strips both tags with all categories on", async () => {
    const result = await processFile(fileOf(mp3Bytes(), name, type), ALL);
    expect(result.error).toBeUndefined();
    expect(result.report.fileType).toBe("mp3");
    expect(summary(result.report.fieldsFound)).toEqual(FOUND);
    expect(summary(result.report.fieldsRemoved)).toEqual(FOUND);
    // Both tags are sliced off, leaving only the audio frame.
    expect(result.cleanedBlob.size).toBe(MPEG_FRAME.length);
    expect(await reread(result, name, type)).toEqual([]);
  });

  it("removes the artist anyway with author off, today", async () => {
    const result = await processFile(fileOf(mp3Bytes(), name, type), { ...ALL, author: false });
    expect(result.error).toBeUndefined();
    // BUG: each tag goes whole if any category in it is on, so TPE1 and the
    // ID3v1 artist are removed and reported removed although author was off.
    expect(summary(result.report.fieldsRemoved)).toEqual(FOUND);
    expect(summary(result.report.fieldsKept)).toEqual([]);
    expect(result.cleanedBlob.size).toBe(MPEG_FRAME.length);
    expect(await reread(result, name, type)).toEqual([]);
  });

  it("hands back an empty file without an error when the tag size runs past the end, today", async () => {
    // The header claims a 10,000-byte tag; the frames it does hold are still
    // listed, then everything up to the claimed end (the whole file) is cut.
    const body = id3v2Body();
    const bytes = concat(id3v2Header(10_000), body, MPEG_FRAME);
    const file = fileOf(bytes, name, type);
    const result = await processFile(file, ALL);
    // BUG: a 0-byte "cleaned" file with no error; the audio is gone.
    expect(result.error).toBeUndefined();
    expect(result.crashed).toBeUndefined();
    expect(summary(result.report.fieldsFound)).toEqual([
      "author:TPE1",
      "comments:COMM",
      "copyright:TCOP",
      "custom:TIT2",
      "dates:TYER",
      "software:TSSE",
    ]);
    expect(result.cleanedBlob === file).toBe(false);
    expect(result.cleanedBlob.size).toBe(0);
  });

  it("returns an empty Blob and the raw error text when the full read fails, today", async () => {
    // mp3.ts wraps everything, its read included, in a try with no throw paths
    // left for malformed tags, so a failed read is the way to reach that catch.
    const file = failFullRead(fileOf(mp3Bytes(), name, type));
    const result = await processFile(file, ALL);
    // The contract will replace the empty Blob and the raw text.
    expect(result.error).toBe("MP3 processing failed: gone");
    expect(result.crashed).toBeUndefined();
    expect(result.cleanedBlob === file).toBe(false);
    expect(result.cleanedBlob.size).toBe(0);
  });
});

describe("FLAC (STREAMINFO, APPLICATION, VORBIS_COMMENT, PICTURE)", () => {
  const name = "track.flac";
  const type = "audio/flac";
  const FOUND = [
    "author:ARTIST",
    "comments:COMMENT",
    "copyright:COPYRIGHT",
    "custom:FLAC_PICTURE",
    "custom:TITLE",
    "dates:DATE",
    "software:ENCODER",
  ];

  it("strips the comments and picture with all categories on", async () => {
    const result = await processFile(fileOf(flacBytes(), name, type), ALL);
    expect(result.error).toBeUndefined();
    expect(result.report.fileType).toBe("flac");
    expect(summary(result.report.fieldsFound)).toEqual(FOUND);
    expect(summary(result.report.fieldsRemoved)).toEqual(FOUND);
    // Blocks become PADDING of the same size.
    expect(result.cleanedBlob.size).toBe(flacBytes().length);
    // The vendor string is zeroed with its block, though it was never reported.
    expect(await contains(result.cleanedBlob, "libFLAC")).toBe(false);
    // BUG: APPLICATION blocks are neither reported nor removed, so the private
    // data in this one (which names the author) survives.
    expect(await contains(result.cleanedBlob, "Lars Holmstrom private notes")).toBe(true);
    expect(await reread(result, name, type)).toEqual([]);
  });

  it("keeps the picture but not the title with custom off, today", async () => {
    const result = await processFile(fileOf(flacBytes(), name, type), { ...ALL, custom: false });
    expect(result.error).toBeUndefined();
    // BUG: PICTURE is its own block and is honoured as kept, but TITLE (also
    // custom) goes with the rest of VORBIS_COMMENT and is reported removed.
    expect(summary(result.report.fieldsRemoved)).toEqual([
      "author:ARTIST",
      "comments:COMMENT",
      "copyright:COPYRIGHT",
      "custom:TITLE",
      "dates:DATE",
      "software:ENCODER",
    ]);
    expect(summary(result.report.fieldsKept)).toEqual(["custom:FLAC_PICTURE"]);
    expect(await reread(result, name, type)).toEqual(["custom:FLAC_PICTURE"]);
  });

  it("silently skips a VORBIS_COMMENT block that runs past the end", async () => {
    const bytes = truncatedFlacBytes();
    const file = fileOf(bytes, name, type);
    const result = await processFile(file, ALL);
    // BUG: no error, nothing found, and the comments go back out untouched.
    expect(result.error).toBeUndefined();
    expect(result.crashed).toBeUndefined();
    expect(summary(result.report.fieldsFound)).toEqual([]);
    expect(result.cleanedBlob === file).toBe(false);
    expect(result.cleanedBlob.size).toBe(bytes.length);
    expect(await contains(result.cleanedBlob, "ARTIST=Lars Holmstrom")).toBe(true);
  });

  it("returns an empty Blob and the raw error text when the full read fails, today", async () => {
    // As with MP3, flac.ts bounds every read, so a failed read is the way into
    // its catch.
    const file = failFullRead(fileOf(flacBytes(), name, type));
    const result = await processFile(file, ALL);
    // The contract will replace the empty Blob and the raw text.
    expect(result.error).toBe("FLAC processing failed: gone");
    expect(result.crashed).toBeUndefined();
    expect(result.cleanedBlob === file).toBe(false);
    expect(result.cleanedBlob.size).toBe(0);
  });
});

describe("WAV (fmt, LIST/INFO, bext, iXML, data)", () => {
  const name = "take.wav";
  const type = "audio/wav";
  const FOUND = [
    "author:IART",
    // bext also carries a description, an origination date and coding
    // history, but is filed under author as a whole.
    "author:bext",
    "comments:ICMT",
    "copyright:ICOP",
    "custom:INAM",
    "custom:iXML",
    "dates:ICRD",
    "software:ISFT",
  ];

  it("strips every metadata chunk with all categories on", async () => {
    const result = await processFile(fileOf(wavBytes(), name, type), ALL);
    expect(result.error).toBeUndefined();
    expect(result.report.fileType).toBe("wav");
    expect(summary(result.report.fieldsFound)).toEqual(FOUND);
    expect(summary(result.report.fieldsRemoved)).toEqual(FOUND);
    // Chunks are renamed JUNK and zeroed, so the length is unchanged.
    expect(result.cleanedBlob.size).toBe(wavBytes().length);
    expect(await contains(result.cleanedBlob, "Lars Holmstrom")).toBe(false);
    expect(await reread(result, name, type)).toEqual([]);
  });

  it("keeps bext but not the INFO artist with author off, today", async () => {
    const result = await processFile(fileOf(wavBytes(), name, type), { ...ALL, author: false });
    expect(result.error).toBeUndefined();
    // BUG: bext (author only) is kept, but IART goes with the rest of
    // LIST/INFO and is reported removed although author was off.
    expect(summary(result.report.fieldsRemoved)).toEqual([
      "author:IART",
      "comments:ICMT",
      "copyright:ICOP",
      "custom:INAM",
      "custom:iXML",
      "dates:ICRD",
      "software:ISFT",
    ]);
    expect(summary(result.report.fieldsKept)).toEqual(["author:bext"]);
    expect(await reread(result, name, type)).toEqual(["author:bext"]);
  });

  it("silently skips a LIST chunk that runs past the end", async () => {
    const bytes = truncatedWavBytes();
    const file = fileOf(bytes, name, type);
    const result = await processFile(file, ALL);
    // BUG: no error, nothing found, and the INFO text goes back out untouched.
    expect(result.error).toBeUndefined();
    expect(result.crashed).toBeUndefined();
    expect(summary(result.report.fieldsFound)).toEqual([]);
    expect(result.cleanedBlob === file).toBe(false);
    expect(result.cleanedBlob.size).toBe(bytes.length);
    expect(await contains(result.cleanedBlob, "Lars Holmstrom")).toBe(true);
  });

  it("returns an empty Blob and the raw error text when the full read fails, today", async () => {
    const file = failFullRead(fileOf(wavBytes(), name, type));
    const result = await processFile(file, ALL);
    // The contract will replace the empty Blob and the raw text.
    expect(result.error).toBe("WAV processing failed: gone");
    expect(result.crashed).toBeUndefined();
    expect(result.cleanedBlob === file).toBe(false);
    expect(result.cleanedBlob.size).toBe(0);
  });
});
