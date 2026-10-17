/** Small image files built byte by byte for the image processor tests.
 *
 *  No binary fixtures: every file is assembled here from its container's
 *  grammar (JPEG segments, PNG chunks, RIFF chunks, GIF blocks, ISOBMFF boxes)
 *  so a reviewer can see exactly which metadata each one carries. None of the
 *  processors decode pixels, so the image data is only shaped right, not a
 *  picture anyone could open. */

import piexif from "piexifjs";

export type Bytes = Uint8Array<ArrayBuffer>;
type Part = Uint8Array | number[] | string;

/** Strings are written one byte per character (Latin-1), which is how every
 *  ASCII keyword, FourCC and box type in these formats is stored. */
export function concat(...parts: Part[]): Bytes {
  const arrays = parts.map((p) =>
    typeof p === "string" ? Uint8Array.from(p, (c) => c.charCodeAt(0) & 0xff) : Uint8Array.from(p)
  );
  const out = new Uint8Array(arrays.reduce((n, a) => n + a.length, 0));
  let o = 0;
  for (const a of arrays) {
    out.set(a, o);
    o += a.length;
  }
  return out;
}

export const u16be = (v: number) => [(v >>> 8) & 0xff, v & 0xff];
export const u32be = (v: number) => [(v >>> 24) & 0xff, (v >>> 16) & 0xff, (v >>> 8) & 0xff, v & 0xff];
const u32le = (v: number) => [v & 0xff, (v >>> 8) & 0xff, (v >>> 16) & 0xff, (v >>> 24) & 0xff];
const zeros = (n: number) => new Array<number>(n).fill(0);

/* ── Shared metadata payloads ──────────────────────────────────────── */

/** One EXIF block reused by every format that can carry one, spread across
 *  device, software, dates, author, copyright, custom and GPS tags so each
 *  category toggle has something to act on. Software names GIMP and Make
 *  names Canon because the WebP reader only spots those by string search. */
function exifBinaryString(): string {
  return piexif.dump({
    "0th": {
      [piexif.ImageIFD.Make]: "Canon",
      [piexif.ImageIFD.Model]: "Canon EOS R5",
      [piexif.ImageIFD.Software]: "GIMP 2.10",
      [piexif.ImageIFD.DateTime]: "2026:07:01 12:00:00",
      [piexif.ImageIFD.Artist]: "Jane Doe",
      [piexif.ImageIFD.Copyright]: "(c) Jane Doe",
      [piexif.ImageIFD.ImageDescription]: "Holiday",
    },
    Exif: {
      [piexif.ExifIFD.DateTimeOriginal]: "2026:07:01 12:00:00",
      [piexif.ExifIFD.LensModel]: "RF 24-70mm",
    },
    GPS: {
      [piexif.GPSIFD.GPSVersionID]: [2, 3, 0, 0],
      [piexif.GPSIFD.GPSLatitudeRef]: "N",
      [piexif.GPSIFD.GPSLatitude]: [[59, 1], [19, 1], [0, 1]],
      [piexif.GPSIFD.GPSLongitudeRef]: "E",
      [piexif.GPSIFD.GPSLongitude]: [[18, 1], [4, 1], [0, 1]],
    },
  });
}

/** "Exif\0\0" plus the TIFF block: the payload of a JPEG APP1 segment. */
export const exifApp1Payload = (): Bytes => concat(exifBinaryString());

/** The bare TIFF block, as PNG eXIf, WebP EXIF and HEIF Exif items store it. */
export const exifTiff = (): Bytes => exifApp1Payload().slice(6);

/** An XMP packet in the shape Photoshop and exiftool write: dc:creator in an
 *  rdf:Seq and dc:rights in an rdf:Alt, the rest as plain elements. */
export const XMP_PACKET = [
  '<?xpacket begin="" id="W5M0MpCehiHzreSzNTczkc9d"?>',
  '<x:xmpmeta xmlns:x="adobe:ns:meta/"><rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">',
  '<rdf:Description rdf:about="" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:xmp="http://ns.adobe.com/xap/1.0/" xmlns:tiff="http://ns.adobe.com/tiff/1.0/">',
  "<dc:creator><rdf:Seq><rdf:li>Jane Doe</rdf:li></rdf:Seq></dc:creator>",
  '<dc:rights><rdf:Alt><rdf:li xml:lang="x-default">(c) Jane Doe</rdf:li></rdf:Alt></dc:rights>',
  "<xmp:CreatorTool>GIMP 2.10</xmp:CreatorTool>",
  "<xmp:CreateDate>2026-07-01T12:00:00</xmp:CreateDate>",
  "<tiff:Make>Canon</tiff:Make>",
  "</rdf:Description></rdf:RDF></x:xmpmeta>",
  '<?xpacket end="w"?>',
].join("");

/** XMP as an AI generator writes it: IPTC's digital source type marker, which
 *  the readers file under AI, beside an ordinary creator. */
export const AI_XMP_PACKET = [
  '<x:xmpmeta xmlns:x="adobe:ns:meta/"><rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">',
  '<rdf:Description rdf:about="" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:Iptc4xmpExt="http://iptc.org/std/Iptc4xmpExt/2008-02-29/">',
  "<Iptc4xmpExt:DigitalSourceType>http://cv.iptc.org/newscodes/digitalsourcetype/trainedAlgorithmicMedia</Iptc4xmpExt:DigitalSourceType>",
  "<dc:creator><rdf:Seq><rdf:li>Jane Doe</rdf:li></rdf:Seq></dc:creator>",
  "</rdf:Description></rdf:RDF></x:xmpmeta>",
].join("");

/* ── C2PA manifest store (JUMBF) ───────────────────────────────────── */

/** An ISOBMFF/JUMBF box: 32-bit size, type, payload. */
export const box = (type: string, ...payload: Part[]): Bytes => {
  const body = concat(...payload);
  return concat(u32be(8 + body.length), type, body);
};

const fullBox = (type: string, version: number, flags: number, ...payload: Part[]): Bytes =>
  box(type, [version, (flags >>> 16) & 0xff, (flags >>> 8) & 0xff, flags & 0xff], ...payload);

/** A labelled JUMBF superbox. The description box holds a 16-byte content
 *  type (never read) and toggles 0x03, which says a label follows. */
const superbox = (label: string, ...children: Part[]): Bytes =>
  box("jumb", box("jumd", zeros(16), [0x03], label, [0]), ...children);

/** The smallest manifest store that makes describeC2pa produce more than its
 *  one-line fallback: a claim naming the generator and a c2pa.created action
 *  with a model and an AI source type. JSON content boxes keep it readable;
 *  the reader takes JSON as well as CBOR. No signature, so no signer. */
export function c2paStore(): Bytes {
  const json = (v: unknown) => box("json", JSON.stringify(v));
  return superbox(
    "c2pa",
    superbox(
      "urn:uuid:metastrip-test",
      superbox(
        "c2pa.assertions",
        superbox(
          "c2pa.actions",
          json({
            actions: [{
              action: "c2pa.created",
              softwareAgent: "Test Model 2",
              digitalSourceType: "http://cv.iptc.org/newscodes/digitalsourcetype/trainedAlgorithmicMedia",
            }],
          })
        )
      ),
      superbox("c2pa.claim", json({ claim_generator: "Test_Generator/1.0" }))
    )
  );
}

/* ── JPEG ──────────────────────────────────────────────────────────── */

const segment = (marker: number, ...payload: Part[]): Bytes => {
  const body = concat(...payload);
  return concat([0xff, marker], u16be(2 + body.length), body);
};

const JFIF = () => segment(0xe0, "JFIF", [0, 1, 1, 0, 0, 1, 0, 1, 0, 0]);
// A 1x1 greyscale frame header and a scan header, then a few entropy-coded
// bytes and EOI. Enough structure for piexif and the segment walker.
const FRAME_AND_SCAN = () =>
  concat(
    segment(0xc0, [8], u16be(1), u16be(1), [1, 1, 0x11, 0]),
    segment(0xda, [1, 1, 0x00, 0, 63, 0]),
    [0x7f, 0x00, 0x3f],
    [0xff, 0xd9]
  );

/** A JPEG carrying every metadata layer the processor knows: EXIF (APP1), XMP
 *  (APP1), IPTC (APP13), a C2PA manifest (APP11) and a comment (COM). */
export function jpegWithMetadata(): Bytes {
  return concat(
    [0xff, 0xd8],
    JFIF(),
    segment(0xe1, exifApp1Payload()),
    segment(0xe1, "http://ns.adobe.com/xap/1.0/\0", XMP_PACKET),
    // APP13 is reported as one opaque IPTC block, so its body need not parse.
    segment(0xed, "Photoshop 3.0\0", "8BIM", [0x04, 0x04, 0, 0], u32be(0)),
    // APP11 JUMBF: "JP", box instance 1, packet sequence 1, then the store.
    segment(0xeb, "JP", u16be(1), u32be(1), c2paStore()),
    segment(0xfe, "Shot on holiday"),
    FRAME_AND_SCAN()
  );
}

/** A JPEG holding one EXIF block and, optionally, an XMP packet beside it. */
export const jpegWithExif = (tiff: Uint8Array, { xmp = false } = {}): Bytes =>
  concat(
    [0xff, 0xd8],
    JFIF(),
    segment(0xe1, "Exif\0\0", tiff),
    xmp ? segment(0xe1, "http://ns.adobe.com/xap/1.0/\0", XMP_PACKET) : [],
    FRAME_AND_SCAN()
  );

/* ── PNG ───────────────────────────────────────────────────────────── */

const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();

function crc32(data: Uint8Array): number {
  let c = 0xffffffff;
  for (const b of data) c = CRC_TABLE[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

/** A PNG chunk with a correct CRC, so the fixture is a valid file even though
 *  the processor never checks CRCs. */
const chunk = (type: string, ...payload: Part[]): Bytes => {
  const body = concat(type, ...payload);
  return concat(u32be(body.length - 4), body, u32be(crc32(body)));
};

const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
// 1x1, 8-bit greyscale.
const IHDR = () => chunk("IHDR", u32be(1), u32be(1), [8, 0, 0, 0, 0]);

/** The PNG fixture's chunks, so the broken-file case can corrupt one. */
export function pngChunks(): Bytes[] {
  return [
    IHDR(),
    chunk("tEXt", "Author\0Jane Doe"),
    chunk("tEXt", "Software\0GIMP 2.10"),
    chunk("tEXt", "Comment\0Shot on holiday"),
    chunk("tEXt", "Copyright\0(c) Jane Doe"),
    // A Stable Diffusion record: its keyword alone makes it AI.
    chunk("iTXt", "parameters\0\0\0\0\0a cat\nSteps: 20, Sampler: Euler a, Seed: 1"),
    // zTXt is compressed, so only its keyword is read; the body is never inflated.
    chunk("zTXt", "Title\0\0", [0x78, 0x9c, 0x03, 0x00]),
    chunk("tIME", u16be(2026), [7, 1, 12, 0, 0]),
    chunk("eXIf", exifTiff()),
    chunk("caBX", c2paStore()),
    chunk("IDAT", [0x78, 0x9c, 0x63, 0x60, 0x00, 0x00, 0x00, 0x02, 0x00, 0x01]),
    chunk("IEND"),
  ];
}

export const pngWithMetadata = (): Bytes => concat(PNG_SIGNATURE, ...pngChunks());

/** A PNG whose only metadata is one eXIf chunk. */
export const pngWithExif = (tiff: Uint8Array): Bytes =>
  concat(
    PNG_SIGNATURE,
    IHDR(),
    chunk("eXIf", tiff),
    chunk("IDAT", [0x78, 0x9c, 0x63, 0x60, 0x00, 0x00, 0x00, 0x02, 0x00, 0x01]),
    chunk("IEND")
  );

/** The same PNG with the second chunk's length field overwritten with a value
 *  far past the end of the file. */
export function pngWithBadChunkLength(): Bytes {
  const [ihdr, text, ...rest] = pngChunks();
  const broken = text.slice();
  broken.set(u32be(0x7ffffff0), 0);
  return concat(PNG_SIGNATURE, ihdr, broken, ...rest);
}

/* ── WebP ──────────────────────────────────────────────────────────── */

/** A RIFF chunk, padded to an even length as RIFF requires. */
const riffChunk = (fourcc: string, ...payload: Part[]): Bytes => {
  const body = concat(...payload);
  return concat(fourcc, u32le(body.length), body, body.length % 2 ? [0] : []);
};

/** VP8X with the EXIF (0x08) and XMP (0x04) flags set, canvas 1x1. */
const VP8X = (flags = 0x0c) => riffChunk("VP8X", [flags, 0, 0, 0], [0, 0, 0], [0, 0, 0]);
// A VP8L header for a 1x1 image; the bitstream after it is never read.
const VP8L = () => riffChunk("VP8L", [0x2f, 0, 0, 0, 0, 0x07, 0x10, 0x11, 0x00]);

export function webpFromChunks(...chunks: Bytes[]): Bytes {
  const body = concat("WEBP", ...chunks);
  return concat("RIFF", u32le(body.length), body);
}

export const webpWithMetadata = (): Bytes =>
  webpFromChunks(VP8X(), VP8L(), riffChunk("EXIF", exifTiff()), riffChunk("XMP ", XMP_PACKET), riffChunk("C2PA", c2paStore()));

/** A WebP whose only metadata is one EXIF chunk, flagged in VP8X. */
export const webpWithExif = (tiff: Uint8Array): Bytes => webpFromChunks(VP8X(0x08), VP8L(), riffChunk("EXIF", tiff));

/** VP8X intact, then an image chunk whose size runs past the end of the file. */
export function webpWithBadChunkSize(): Bytes {
  const vp8l = VP8L();
  vp8l.set(u32le(0x7ffffff0), 4);
  return webpFromChunks(VP8X(), vp8l, riffChunk("XMP ", XMP_PACKET));
}

/* ── GIF ───────────────────────────────────────────────────────────── */

/** Data split into GIF sub-blocks of at most 255 bytes, then the terminator. */
const subBlocks = (data: Bytes): Bytes => {
  const parts: Part[] = [];
  for (let i = 0; i < data.length; i += 255) {
    const piece = data.subarray(i, i + 255);
    parts.push([piece.length], piece);
  }
  return concat(...parts, [0]);
};

// GIF89a, 1x1 screen, a two-colour global colour table (packed 0x80).
const GIF_HEAD = () => concat("GIF89a", [1, 0, 1, 0], [0x80, 0, 0], [0, 0, 0, 255, 255, 255]);
// One 1x1 frame: image descriptor, LZW minimum code size 2, one data sub-block.
const GIF_FRAME = () => concat([0x2c], zeros(4), [1, 0, 1, 0, 0], [2], [2, 0x44, 0x01], [0]);

/** XMP as GIF writers embed it: the raw packet straight after the app id, not
 *  in sub-blocks, then the 258-byte "magic trailer" (0x01, 0xFF down to 0x00,
 *  then the terminator) that steers a sub-block walker onto the real end. */
const gifXmp = () => {
  const trailer = [1];
  for (let v = 0xff; v >= 0; v--) trailer.push(v);
  trailer.push(0);
  return concat([0x21, 0xff, 11], "XMP DataXMP", XMP_PACKET, trailer);
};

export function gifWithMetadata(): Bytes {
  return concat(
    GIF_HEAD(),
    // NETSCAPE2.0 loop count: kept by the processor, so it is not metadata.
    [0x21, 0xff, 11], "NETSCAPE2.0", [3, 1, 0, 0, 0],
    [0x21, 0xfe], subBlocks(concat("Shot on holiday")),
    gifXmp(),
    // Any other application extension is reported under Custom.
    [0x21, 0xff, 11], "MSOFFICE9.0", subBlocks(concat("opaque")),
    // Graphic control: timing and transparency, which must survive.
    [0x21, 0xf9, 4, 0, 0, 0, 0, 0],
    GIF_FRAME(),
    [0x3b]
  );
}

/** A valid header and screen descriptor followed by a byte that starts no
 *  known block (0x00 where 0x21, 0x2C or 0x3B should be). */
export const gifWithUnknownBlock = (): Bytes => concat(GIF_HEAD(), [0x00], GIF_FRAME(), [0x3b]);

/* ── HEIF (HEIC and AVIF) ──────────────────────────────────────────── */

export interface HeifItem {
  id: number;
  type: string;
  /** Only for "mime" items, e.g. application/rdf+xml for XMP. */
  contentType?: string;
  data: Bytes;
  /** Store the item in the meta box's idat (iloc construction method 1)
   *  instead of mdat. Needs ilocVersion 1. */
  inIdat?: boolean;
}

export interface HeifSpec {
  brands: string[]; // major brand first, then the compatible brands
  items: HeifItem[];
  ilocVersion: 0 | 1;
  /** A C2PA manifest store for a top-level uuid box. */
  c2pa?: Bytes;
}

const C2PA_UUID = [0xd8, 0xfe, 0xc3, 0xd6, 0x1b, 0x0e, 0x48, 0x3c, 0x92, 0x97, 0x58, 0x28, 0x87, 0x7e, 0xc4, 0x81];

/** An HEIF Exif item: a 4-byte offset to the TIFF header (0 here), then TIFF. */
export const heifExifItem = (tiff: Uint8Array = exifTiff()): Bytes => concat(u32be(0), tiff);

/** The smallest HEIF the processor accepts: ftyp, then meta holding hdlr,
 *  iinf (one infe v2 per item) and iloc (4-byte offsets and lengths, no base
 *  offset), an optional C2PA uuid box, and mdat holding the item bytes.
 *  iloc offsets are absolute, so the meta box is built once to measure it and
 *  again with the real offsets; its size does not depend on their values. */
export function heif(spec: HeifSpec): Bytes {
  const ftyp = box("ftyp", spec.brands[0], u32be(0), ...spec.brands.slice(1));
  const hdlr = fullBox("hdlr", 0, 0, u32be(0), "pict", zeros(12), [0]);
  const infes = spec.items.map((it) =>
    fullBox("infe", 2, 0, u16be(it.id), u16be(0), it.type, [0], it.contentType ? `${it.contentType}\0` : [])
  );
  const iinf = fullBox("iinf", 0, 0, u16be(infes.length), ...infes);
  const idatItems = spec.items.filter((it) => it.inIdat);
  const mdatItems = spec.items.filter((it) => !it.inIdat);
  const idatData = concat(...idatItems.map((it) => it.data));
  const idat = idatItems.length ? box("idat", idatData) : new Uint8Array(0);
  const uuid = spec.c2pa
    ? box("uuid", C2PA_UUID, [0, 0, 0, 0], "manifest\0", zeros(8), spec.c2pa)
    : new Uint8Array(0);

  const buildMeta = (offsets: Map<number, number>) => {
    const entries = spec.items.map((it) =>
      concat(
        u16be(it.id),
        spec.ilocVersion === 1 ? u16be(it.inIdat ? 1 : 0) : [],
        u16be(0), // data_reference_index
        u16be(1), // extent_count
        u32be(offsets.get(it.id) ?? 0),
        u32be(it.data.length)
      )
    );
    const iloc = fullBox("iloc", spec.ilocVersion, 0, [0x44, 0x00], u16be(entries.length), ...entries);
    return fullBox("meta", 0, 0, hdlr, iinf, iloc, idat);
  };

  const metaLength = buildMeta(new Map()).length;
  const offsets = new Map<number, number>();
  let mdatPos = ftyp.length + metaLength + uuid.length + 8;
  for (const it of mdatItems) {
    offsets.set(it.id, mdatPos);
    mdatPos += it.data.length;
  }
  let idatPos = 0; // construction method 1 offsets are relative to idat's content
  for (const it of idatItems) {
    offsets.set(it.id, idatPos);
    idatPos += it.data.length;
  }
  return concat(ftyp, buildMeta(offsets), uuid, box("mdat", ...mdatItems.map((it) => it.data)));
}

/** An HEIC with an image item, an Exif item and an XMP item in mdat, and a
 *  C2PA manifest in a uuid box. */
export const heicWithMetadata = (): Bytes =>
  heif({
    brands: ["heic", "mif1", "heic"],
    ilocVersion: 0,
    items: [
      { id: 1, type: "hvc1", data: concat([0, 0, 0, 0, 0x26, 0x01, 0xaf]) },
      { id: 2, type: "Exif", data: heifExifItem() },
      { id: 3, type: "mime", contentType: "application/rdf+xml", data: concat(XMP_PACKET) },
    ],
    c2pa: c2paStore(),
  });

/** An AVIF laid out the other common way: iloc version 1 with the XMP in the
 *  meta box's idat, and an AI-marked XMP packet instead of a C2PA box. */
export const avifWithMetadata = (): Bytes =>
  heif({
    brands: ["avif", "mif1", "miaf"],
    ilocVersion: 1,
    items: [
      { id: 1, type: "av01", data: concat([0x12, 0x00, 0x0a, 0x0a]) },
      { id: 2, type: "Exif", data: heifExifItem() },
      { id: 3, type: "mime", contentType: "application/rdf+xml", data: concat(AI_XMP_PACKET), inIdat: true },
    ],
  });

/** An HEIC whose only metadata is one Exif item. */
export const heicWithExif = (tiff: Uint8Array): Bytes =>
  heif({
    brands: ["heic", "mif1", "heic"],
    ilocVersion: 0,
    items: [
      { id: 1, type: "hvc1", data: concat([0, 0, 0, 0, 0x26, 0x01, 0xaf]) },
      { id: 2, type: "Exif", data: heifExifItem(tiff) },
    ],
  });
