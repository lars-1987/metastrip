/** Small, hand-built audio and video files for the processor characterisation
 *  tests. Every byte is written here rather than checked in as a binary, so a
 *  reader can see exactly which atoms, frames, blocks and chunks each file
 *  carries, and therefore why the report lists what it does. */

/* Byte helpers */

/** Latin-1 bytes, so "©" becomes the single byte 0xA9 that MP4 tag atoms use. */
export function latin1(s: string): Uint8Array {
  return Uint8Array.from(s, (ch) => ch.charCodeAt(0) & 0xff);
}

export function utf8(s: string): Uint8Array {
  return new TextEncoder().encode(s);
}

export function concat(...parts: Uint8Array[]): Uint8Array {
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let pos = 0;
  for (const p of parts) {
    out.set(p, pos);
    pos += p.length;
  }
  return out;
}

export function zeros(n: number): Uint8Array {
  return new Uint8Array(n);
}

export function u8(...values: number[]): Uint8Array {
  return Uint8Array.from(values);
}

export function u16be(n: number): Uint8Array {
  return u8((n >>> 8) & 0xff, n & 0xff);
}

export function u24be(n: number): Uint8Array {
  return u8((n >>> 16) & 0xff, (n >>> 8) & 0xff, n & 0xff);
}

export function u32be(n: number): Uint8Array {
  return u8((n >>> 24) & 0xff, (n >>> 16) & 0xff, (n >>> 8) & 0xff, n & 0xff);
}

export function u32le(n: number): Uint8Array {
  return u8(n & 0xff, (n >>> 8) & 0xff, (n >>> 16) & 0xff, (n >>> 24) & 0xff);
}

/* MP4, MOV and M4A (ISO base media) */

/** A box: 32-bit size, a four-character type, then the payload. */
export function box(type: string | Uint8Array, ...payload: Uint8Array[]): Uint8Array {
  const body = concat(...payload);
  const typeBytes = typeof type === "string" ? latin1(type) : type;
  return concat(u32be(8 + body.length), typeBytes, body);
}

/** An ftyp box with one major brand and the same brand as the only compatible
 *  one. The fixture module's ftyp() pads to 32 bytes, which would leave a run of
 *  zeros that the MP4 walker reads as a box of size 0 ("to end of file"). */
export function ftypBox(brand: string): Uint8Array {
  return box("ftyp", latin1(brand), zeros(4), latin1(brand));
}

// Non-zero creation and modification times, in seconds since 1904. Only their
// presence matters; the tests pin categories and keys, not formatted dates.
const CREATED = 3_800_000_000;
const MODIFIED = 3_800_000_600;

/** mvhd, tkhd or mdhd at version 0: version and flags, the two 32-bit times,
 *  then the rest of the box (timescale, duration...) as zeros. */
function timesBox(type: string, restLength: number): Uint8Array {
  return box(type, zeros(4), u32be(CREATED), u32be(MODIFIED), zeros(restLength));
}

/** hdlr: version and flags, pre_defined, handler type, 12 reserved bytes (where
 *  Apple writes a vendor code, which mp4.ts reports and zeroes) and a name. */
function hdlr(handler: string, vendor = ""): Uint8Array {
  const reserved = zeros(12);
  reserved.set(latin1(vendor));
  return box("hdlr", zeros(4), zeros(4), latin1(handler), reserved, u8(0));
}

/** A QuickTime user-data text atom: text length, language code, text. */
function qtText(type: string, text: string): Uint8Array {
  const t = utf8(text);
  return box(type, u16be(t.length), u16be(0x15c7), t);
}

/** An iTunes-style item: the tag atom wrapping a `data` box of UTF-8 text. */
function dataItem(type: string | Uint8Array, text: string): Uint8Array {
  return box(type, box("data", u32be(1), zeros(4), utf8(text)));
}

/** Apple's mdta metadata: a QuickTime `meta` (no version and flags) holding a
 *  handler, a `keys` list, and an `ilst` whose item types are 1-based indexes
 *  into that list. */
function mdtaMeta(entries: [key: string, value: string][]): Uint8Array {
  const keys = box(
    "keys",
    zeros(4),
    u32be(entries.length),
    ...entries.map(([k]) => box("mdta", utf8(k))),
  );
  const ilst = box("ilst", ...entries.map(([, v], i) => dataItem(u32be(i + 1), v)));
  return box("meta", hdlr("mdta"), keys, ilst);
}

function moovWith(handler: string, vendor: string, ...extra: Uint8Array[]): Uint8Array {
  return box(
    "moov",
    timesBox("mvhd", 88),
    box("trak", timesBox("tkhd", 72), box("mdia", timesBox("mdhd", 12), hdlr(handler, vendor))),
    ...extra,
  );
}

const MDAT = box("mdat", u8(0x00, 0x00, 0x00, 0x10, 0x65, 0x88, 0x84, 0x00, 0x21, 0xff, 0xfe, 0xf6));

/** An Android-style MP4: location, encoder, artist and copyright in udta, and
 *  the phone's make, model and OS version as mdta keys. No handler vendor,
 *  as ffmpeg and Android leave the reserved bytes zero. */
export function mp4Bytes(): Uint8Array {
  return concat(
    ftypBox("isom"),
    moovWith(
      "vide",
      "",
      box(
        "udta",
        qtText("©xyz", "+59.3293+018.0686/"),
        qtText("©too", "Lavf60.16.100"),
        qtText("©ART", "Lars Holmstrom"),
        box("cprt", zeros(4), u16be(0x15c7), utf8("2026 Lars"), u8(0)),
      ),
      mdtaMeta([
        ["com.android.version", "14"],
        ["com.android.manufacturer", "Google"],
        ["com.android.model", "Pixel 8"],
        ["com.android.capture.fps", "30"],
      ]),
    ),
    MDAT,
  );
}

/** An iPhone-style MOV: everything in mdta keys, an `appl` handler vendor,
 *  and a udta with the recording date and software as QuickTime text atoms. */
export function movBytes(): Uint8Array {
  return concat(
    ftypBox("qt  "),
    moovWith(
      "vide",
      "appl",
      mdtaMeta([
        ["com.apple.quicktime.location.iso6709", "+59.3293+018.0686+012.000/"],
        ["com.apple.quicktime.make", "Apple"],
        ["com.apple.quicktime.model", "iPhone 15 Pro"],
        ["com.apple.quicktime.software", "17.4.1"],
        ["com.apple.quicktime.creationdate", "2026-05-01T10:00:00+0200"],
      ]),
      box("udta", qtText("©swr", "iOS 17.4.1"), qtText("©day", "2026-05-01")),
    ),
    MDAT,
  );
}

/** An iTunes-style M4A: udta > meta (with version and flags) > hdlr + ilst,
 *  each item a © tag (or cprt) holding a `data` box. */
export function m4aBytes(): Uint8Array {
  const ilst = box(
    "ilst",
    dataItem("©nam", "Voice memo"),
    dataItem("©ART", "Lars Holmstrom"),
    dataItem("©too", "Lavf60.16.100"),
    dataItem("©day", "2026"),
    dataItem("©cmt", "Recorded at home"),
    dataItem("cprt", "2026 Lars"),
  );
  return concat(
    ftypBox("M4A "),
    moovWith("soun", "", box("udta", box("meta", zeros(4), hdlr("mdir"), ilst))),
    MDAT,
  );
}

/* MP3 */

/** An ID3v2.3 frame: four-character ID, 32-bit size, two flag bytes, payload. */
function id3Frame(id: string, payload: Uint8Array): Uint8Array {
  return concat(latin1(id), u32be(payload.length), zeros(2), payload);
}

/** A text frame: encoding byte 0 (Latin-1), then the text. */
function id3Text(id: string, text: string): Uint8Array {
  return id3Frame(id, concat(u8(0), latin1(text)));
}

/** Four bytes of synchsafe integer (7 bits per byte), as ID3v2 sizes are. */
export function synchsafe(n: number): Uint8Array {
  return u8((n >>> 21) & 0x7f, (n >>> 14) & 0x7f, (n >>> 7) & 0x7f, n & 0x7f);
}

/** The frames, then 16 bytes of padding, as taggers leave room to grow. */
export function id3v2Body(): Uint8Array {
  return concat(
    id3Text("TIT2", "Field recording"),
    id3Text("TPE1", "Lars Holmstrom"),
    id3Text("TYER", "2026"),
    id3Text("TSSE", "LAME 3.100"),
    id3Frame("COMM", concat(u8(0), latin1("eng"), u8(0), latin1("Recorded at home"))),
    id3Text("TCOP", "2026 Lars"),
    zeros(16),
  );
}

export function id3v2Header(tagSize: number): Uint8Array {
  return concat(latin1("ID3"), u8(3, 0, 0), synchsafe(tagSize));
}

/** The first bytes of an MPEG-1 Layer III frame (128 kbps, 44.1 kHz). */
export const MPEG_FRAME = concat(u8(0xff, 0xfb, 0x90, 0x64), zeros(28));

function fixed(text: string, length: number): Uint8Array {
  const out = zeros(length);
  out.set(latin1(text).subarray(0, length));
  return out;
}

/** An ID3v1.1 tag: the last 128 bytes of the file. */
export function id3v1(): Uint8Array {
  return concat(
    latin1("TAG"),
    fixed("Field recording", 30),
    fixed("Lars Holmstrom", 30),
    fixed("Demos", 30),
    fixed("2026", 4),
    fixed("Recorded at home", 30),
    u8(12),
  );
}

export function mp3Bytes(): Uint8Array {
  const body = id3v2Body();
  return concat(id3v2Header(body.length), body, MPEG_FRAME, id3v1());
}

/* FLAC */

/** A metadata block header: last-block flag and type, then a 24-bit size. */
export function flacBlock(type: number, payload: Uint8Array, last = false): Uint8Array {
  return concat(u8((last ? 0x80 : 0) | type), u24be(payload.length), payload);
}

// 34 bytes: block sizes, frame sizes, then 44.1 kHz stereo 16-bit packed in.
const STREAMINFO = concat(u16be(4096), u16be(4096), zeros(6), u8(0x0a, 0xc4, 0x42, 0xf0), zeros(20));

function vorbisComment(vendor: string, comments: string[]): Uint8Array {
  const v = utf8(vendor);
  return concat(
    u32le(v.length),
    v,
    u32le(comments.length),
    ...comments.map((c) => {
      const b = utf8(c);
      return concat(u32le(b.length), b);
    }),
  );
}

export const FLAC_VORBIS = vorbisComment("reference libFLAC 1.4.3 20230623", [
  "TITLE=Field recording",
  "ARTIST=Lars Holmstrom",
  "DATE=2026-05-01",
  "ENCODER=Audacity 3.5",
  "COMMENT=Recorded at home",
  "COPYRIGHT=2026 Lars",
]);

/** PICTURE: type 3 (front cover), MIME, empty description, dimensions, then a
 *  few bytes standing in for the JPEG. */
const FLAC_PICTURE = concat(
  u32be(3),
  u32be(10),
  latin1("image/jpeg"),
  u32be(0),
  u32be(1),
  u32be(1),
  u32be(24),
  u32be(0),
  u32be(4),
  u8(0xff, 0xd8, 0xff, 0xd9),
);

/** APPLICATION: a registered 4-byte ID and private data. flac.ts has no
 *  branch for it, so it should pass through unreported. */
export const FLAC_APPLICATION_TEXT = "Lars Holmstrom private notes";
const FLAC_APPLICATION = concat(latin1("ATCH"), latin1(FLAC_APPLICATION_TEXT));

const FLAC_FRAME = concat(u8(0xff, 0xf8, 0x69, 0x08), zeros(12));

export function flacBytes(): Uint8Array {
  return concat(
    latin1("fLaC"),
    flacBlock(0, STREAMINFO),
    flacBlock(2, FLAC_APPLICATION),
    flacBlock(4, FLAC_VORBIS),
    flacBlock(6, FLAC_PICTURE, true),
    FLAC_FRAME,
  );
}

/** STREAMINFO, then a VORBIS_COMMENT whose header claims more bytes than the
 *  (truncated) file holds. */
export function truncatedFlacBytes(): Uint8Array {
  return concat(
    latin1("fLaC"),
    flacBlock(0, STREAMINFO),
    u8(4),
    u24be(FLAC_VORBIS.length + 1000),
    FLAC_VORBIS,
  );
}

/* WAV */

/** A RIFF chunk: ID, little-endian size, payload, a pad byte if the size is odd. */
export function chunk(id: string, payload: Uint8Array): Uint8Array {
  return concat(latin1(id), u32le(payload.length), payload, payload.length % 2 ? u8(0) : zeros(0));
}

/** An INFO sub-chunk: null-terminated text. */
function info(id: string, text: string): Uint8Array {
  return chunk(id, concat(latin1(text), u8(0)));
}

// PCM, mono, 44.1 kHz, 16-bit.
const FMT = chunk("fmt ", concat(u8(1, 0, 1, 0), u32le(44100), u32le(88200), u8(2, 0, 16, 0)));

export const WAV_INFO = chunk(
  "LIST",
  concat(
    latin1("INFO"),
    info("INAM", "Field recording"),
    info("IART", "Lars Holmstrom"),
    info("ICRD", "2026-05-01"),
    info("ISFT", "Lavf60.16.100"),
    info("ICMT", "Recorded at home"),
    info("ICOP", "2026 Lars"),
  ),
);

/** bext (Broadcast Wave): description, originator, then the rest as zeros. */
const BEXT = chunk("bext", concat(fixed("Kitchen take 3", 32), fixed("Lars Holmstrom", 32)));

const IXML = chunk("iXML", utf8("<BWFXML><PROJECT>Demos</PROJECT></BWFXML>"));

const DATA = chunk("data", zeros(16));

function riff(...chunks: Uint8Array[]): Uint8Array {
  const body = concat(latin1("WAVE"), ...chunks);
  return concat(latin1("RIFF"), u32le(body.length), body);
}

export function wavBytes(): Uint8Array {
  return riff(FMT, WAV_INFO, BEXT, IXML, DATA);
}

/** fmt, then a LIST/INFO chunk whose size claims more bytes than the
 *  (truncated) file holds. */
export function truncatedWavBytes(): Uint8Array {
  const list = WAV_INFO.slice();
  list.set(u32le(WAV_INFO.length + 1000), 4);
  return riff(FMT, list);
}
