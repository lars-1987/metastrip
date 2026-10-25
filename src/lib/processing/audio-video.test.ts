import { describe, expect, it } from "vitest";
import { batchByteCap, processFile } from "./coordinator";
import { expectFoundIgnoresOptions } from "./contract-checks.fixture";
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

// Behaviour tests for the audio and video processors, driven through
// processFile as the app drives them. They began as characterisation tests
// pinning the old behaviour; where the processor contract changed it, a
// comment says what it used to do.

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

const DAMAGED = "It may be damaged, or use a variant of the format MetaStrip doesn't handle yet.";
const COULD_NOT_OPEN =
  "Your browser couldn't open it. If you just downloaded it, make sure the download has finished, or save it to a folder on this device (not a cloud-only one) and try again.";

/** The contract's one failure shape: the original file handed back untouched,
 *  a plain message for the person, and a stable reason for telemetry. */
function expectFailed(file: File, result: ProcessingResult, error: string, reason: string) {
  expect(result.error).toBe(error);
  expect(result.reason).toBe(reason);
  expect(result.cleanedBlob).toBe(file);
  expect(result.report.cleanedFileSize).toBe(file.size);
  expect(result.report.fieldsFound).toEqual([]);
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

  it("removes the location with udta when gps is off but udta's other fields go", async () => {
    const result = await processFile(fileOf(mp4Bytes(), name, type), { ...ALL, gps: false });
    expect(result.error).toBeUndefined();
    // udta can only go whole, and its other categories are being removed, so
    // the ©xyz location goes too and is reported removed (the whole-block
    // rule: never leave behind something asked to be removed).
    expect(summary(result.report.fieldsRemoved)).toEqual(FOUND);
    expect(summary(result.report.fieldsKept)).toEqual([]);
    expect(await contains(result.cleanedBlob, "+59.3293+018.0686")).toBe(false);
    expect(await reread(result, name, type)).toEqual([]);
  });

  // Cut the last 10 bytes of moov and all of mdat, so moov's declared size
  // runs past the end.
  it("refuses a file whose moov runs past the end", async () => {
    const full = mp4Bytes();
    const cut = full.slice(0, full.length - 20 - 10);
    const file = fileOf(cut, name, type);
    const result = await processFile(file, ALL);
    // This used to pass as clean, with the metadata (the artist) still in the
    // "cleaned" file.
    expectFailed(file, result, DAMAGED, "unreadable: mp4");
  });

  it("refuses a header box with no room for its fields", async () => {
    // An mvhd of bare header as the last 8 bytes. Reading its version byte
    // used to throw a RangeError that came back as an empty Blob and the raw
    // engine text.
    const bytes = concat(
      ftypBox("isom"),
      box("moov", box("udta", box("©ART", u16be(4), u16be(0), utf8("Lars"))), box("mvhd")),
    );
    const file = fileOf(bytes, name, type);
    expectFailed(file, await processFile(file, ALL), DAMAGED, "unreadable: mp4");
  });

  it("explains a failed full read", async () => {
    const file = failFullRead(fileOf(mp4Bytes(), name, type));
    expectFailed(file, await processFile(file, ALL), COULD_NOT_OPEN, "crash: NotFoundError");
  });

  it("refuses a file over the 1.5 GB cap without reading it", async () => {
    const file = fileOf(mp4Bytes(), name, type);
    Object.defineProperty(file, "size", { value: 2 * 1024 ** 3 });
    // Never read: the full read would crash the tab, so make it fail loudly.
    file.arrayBuffer = () => Promise.reject(new Error("read"));
    const result = await processFile(file, ALL);
    expect(result.error).toBe("Too large (2.00 GB). The maximum is 1.50 GB; trim or compress it first.");
    expect(result.reason).toBe("too_large");
    // It used to hand back 0 bytes.
    expect(result.cleanedBlob).toBe(file);
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

  it("keeps the header timestamps but not the dates inside removed containers with dates off", async () => {
    const result = await processFile(fileOf(movBytes(), name, type), { ...ALL, dates: false });
    expect(result.error).toBeUndefined();
    // The mvhd/tkhd/mdhd times are zeroed per box, so they stay. The creation
    // date in mdta and ©day in udta share containers with fields being removed,
    // so they go whole with them and are reported removed.
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

  it("refuses a file whose moov runs past the end", async () => {
    const full = movBytes();
    const cut = full.slice(0, full.length - 20 - 10);
    const file = fileOf(cut, name, type);
    const result = await processFile(file, ALL);
    // This used to pass as clean, with the metadata (the location) still in the
    // "cleaned" file.
    expectFailed(file, result, DAMAGED, "unreadable: mov");
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
    // The report names the format the registry identified; mp4.ts used to set
    // it from the MIME type, which reported every M4A as "mp4".
    expect(result.report.fileType).toBe("m4a");
    expect(summary(result.report.fieldsFound)).toEqual(FOUND);
    expect(summary(result.report.fieldsRemoved)).toEqual(FOUND);
    expect(result.cleanedBlob.size).toBe(m4aBytes().length);
    expect(await contains(result.cleanedBlob, "Lars Holmstrom")).toBe(false);
    expect(await reread(result, name, type)).toEqual([]);
  });

  it("removes the artist with udta when author is off but udta's other fields go", async () => {
    const result = await processFile(fileOf(m4aBytes(), name, type), { ...ALL, author: false });
    expect(result.error).toBeUndefined();
    // The whole udta goes, ©ART included, and is reported removed.
    expect(summary(result.report.fieldsRemoved)).toEqual(FOUND);
    expect(summary(result.report.fieldsKept)).toEqual([]);
    expect(await contains(result.cleanedBlob, "Lars Holmstrom")).toBe(false);
    expect(await reread(result, name, type)).toEqual([]);
  });

  it("refuses a file whose moov runs past the end", async () => {
    const full = m4aBytes();
    const cut = full.slice(0, full.length - 20 - 10);
    const file = fileOf(cut, name, type);
    const result = await processFile(file, ALL);
    // This used to pass as clean, with the metadata (the artist) still in the
    // "cleaned" file.
    expectFailed(file, result, DAMAGED, "unreadable: m4a");
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

  it("removes the artist with each tag when author is off but the tag's other fields go", async () => {
    const result = await processFile(fileOf(mp3Bytes(), name, type), { ...ALL, author: false });
    expect(result.error).toBeUndefined();
    // Each tag goes whole when any field in it is being removed, so TPE1 and
    // the ID3v1 artist go with them and are reported removed.
    expect(summary(result.report.fieldsRemoved)).toEqual(FOUND);
    expect(summary(result.report.fieldsKept)).toEqual([]);
    expect(result.cleanedBlob.size).toBe(MPEG_FRAME.length);
    expect(await reread(result, name, type)).toEqual([]);
  });

  it("refuses a tag whose size runs past the end", async () => {
    // The header claims a 10,000-byte tag. Cutting it off used to take the
    // whole file with it: a 0-byte "cleaned" file and no error.
    const bytes = concat(id3v2Header(10_000), id3v2Body(), MPEG_FRAME);
    const file = fileOf(bytes, name, type);
    expectFailed(file, await processFile(file, ALL), DAMAGED, "unreadable: mp3");
  });

  it("refuses a file that is only a tag, rather than handing back nothing", async () => {
    // A tag with no audio after it: removing the tag leaves 0 bytes, which the
    // contract treats as a failure whatever the processor says.
    const body = id3v2Body();
    const file = fileOf(concat(id3v2Header(body.length), body), name, type);
    expectFailed(file, await processFile(file, ALL), DAMAGED, "empty_output: mp3");
  });

  it("explains a failed full read", async () => {
    // This used to come back as an empty Blob and the raw text "MP3 processing
    // failed: gone".
    const file = failFullRead(fileOf(mp3Bytes(), name, type));
    expectFailed(file, await processFile(file, ALL), COULD_NOT_OPEN, "crash: NotFoundError");
  });
});

describe("FLAC (STREAMINFO, APPLICATION, VORBIS_COMMENT, PICTURE)", () => {
  const name = "track.flac";
  const type = "audio/flac";
  const FOUND = [
    "author:ARTIST",
    "comments:COMMENT",
    "copyright:COPYRIGHT",
    "custom:FLAC_APPLICATION:ATCH",
    "custom:FLAC_PICTURE",
    "custom:TITLE",
    "dates:DATE",
    "software:ENCODER",
  ];

  it("strips the comments, picture and application data with all categories on", async () => {
    const result = await processFile(fileOf(flacBytes(), name, type), ALL);
    expect(result.error).toBeUndefined();
    expect(result.report.fileType).toBe("flac");
    expect(summary(result.report.fieldsFound)).toEqual(FOUND);
    expect(summary(result.report.fieldsRemoved)).toEqual(FOUND);
    // Blocks become PADDING of the same size.
    expect(result.cleanedBlob.size).toBe(flacBytes().length);
    // The vendor string is zeroed with its block, though it was never reported.
    expect(await contains(result.cleanedBlob, "libFLAC")).toBe(false);
    // APPLICATION blocks used to be neither reported nor removed, so the
    // private data in this one (which names the author) survived.
    expect(await contains(result.cleanedBlob, "Lars Holmstrom private notes")).toBe(false);
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
    expect(summary(result.report.fieldsKept)).toEqual(["custom:FLAC_APPLICATION:ATCH", "custom:FLAC_PICTURE"]);
    expect(await reread(result, name, type)).toEqual(["custom:FLAC_APPLICATION:ATCH", "custom:FLAC_PICTURE"]);
  });

  it("refuses a file whose VORBIS_COMMENT block runs past the end", async () => {
    const file = fileOf(truncatedFlacBytes(), name, type);
    const result = await processFile(file, ALL);
    // This used to pass as clean, with the metadata (the comments) still in the
    // "cleaned" file.
    expectFailed(file, result, DAMAGED, "unreadable: flac");
  });

  it("explains a failed full read", async () => {
    // This used to come back as an empty Blob and the raw text "FLAC processing
    // failed: gone".
    const file = failFullRead(fileOf(flacBytes(), name, type));
    expectFailed(file, await processFile(file, ALL), COULD_NOT_OPEN, "crash: NotFoundError");
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

  it("refuses a file whose LIST chunk runs past the end", async () => {
    const file = fileOf(truncatedWavBytes(), name, type);
    const result = await processFile(file, ALL);
    // This used to pass as clean, with the metadata (the INFO text) still in the
    // "cleaned" file.
    expectFailed(file, result, DAMAGED, "unreadable: wav");
  });

  it("explains a failed full read", async () => {
    // This used to come back as an empty Blob and the raw text "WAV processing
    // failed: gone".
    const file = failFullRead(fileOf(wavBytes(), name, type));
    expectFailed(file, await processFile(file, ALL), COULD_NOT_OPEN, "crash: NotFoundError");
  });
});

describe("every audio and video format", () => {
  it.each([
    ["MP4", mp4Bytes, "clip.mp4", "video/mp4"],
    ["MOV", movBytes, "IMG_0001.MOV", "video/quicktime"],
    ["M4A", m4aBytes, "voice.m4a", "audio/mp4"],
    ["MP3", mp3Bytes, "song.mp3", "audio/mpeg"],
    ["FLAC", flacBytes, "track.flac", "audio/flac"],
    ["WAV", wavBytes, "take.wav", "audio/wav"],
  ] as const)("%s finds the same fields whatever the options", async (_, make, name, type) => {
    await expectFoundIgnoresOptions(() => fileOf(make(), name, type));
  });
});

describe("how many bytes one drop can add", () => {
  const MB = 1024 ** 2;

  it("holds a single video to the video limit, not the batch cap", () => {
    // The 750 MB batch cap used to refuse 800 MB to 1.1 GB videos that the
    // video processor accepts.
    expect(batchByteCap(["mp4"])).toBe(1.5 * 1024 ** 3);
    expect(batchByteCap(["mov"])).toBe(1.5 * 1024 ** 3);
  });

  it("holds several files, and a single file of another kind, to the batch cap", () => {
    expect(batchByteCap(["mp4", "mp4"])).toBe(750 * MB);
    expect(batchByteCap(["jpeg"])).toBe(750 * MB);
    expect(batchByteCap(["pdf"])).toBe(750 * MB);
  });

  it("holds a single video on a phone to the batch cap", () => {
    expect(batchByteCap(["mp4"], { onPhone: true })).toBe(750 * MB);
    expect(batchByteCap(["mp4", "jpeg"], { onPhone: true })).toBe(750 * MB);
  });
});
