import piexif from "piexifjs";
import type {
  StripOptions,
  ProcessingResult,
  MetadataField,
  MetadataCategory,
} from "../types";

const TAG_CATEGORIES: Record<string, MetadataCategory> = {
  GPSLatitude: "gps",
  GPSLongitude: "gps",
  GPSAltitude: "gps",
  GPSDateStamp: "gps",
  GPSTimeStamp: "gps",
  GPSLatitudeRef: "gps",
  GPSLongitudeRef: "gps",
  GPSAltitudeRef: "gps",
  GPSSpeed: "gps",
  GPSSpeedRef: "gps",
  GPSImgDirection: "gps",
  GPSImgDirectionRef: "gps",
  GPSDestBearing: "gps",
  GPSDestBearingRef: "gps",
  GPSHPositioningError: "gps",
  Make: "device",
  Model: "device",
  BodySerialNumber: "device",
  LensModel: "device",
  LensMake: "device",
  LensSerialNumber: "device",
  CameraOwnerName: "device",
  HostComputer: "device",
  Software: "software",
  ProcessingSoftware: "software",
  DateTime: "dates",
  DateTimeOriginal: "dates",
  DateTimeDigitized: "dates",
  OffsetTime: "dates",
  OffsetTimeOriginal: "dates",
  OffsetTimeDigitized: "dates",
  SubSecTime: "dates",
  SubSecTimeOriginal: "dates",
  SubSecTimeDigitized: "dates",
  Artist: "author",
  XPAuthor: "author",
  Copyright: "copyright",
  ImageDescription: "custom",
  UserComment: "custom",
  XPComment: "custom",
  XPTitle: "custom",
  XPSubject: "custom",
  XPKeywords: "custom",
  ImageUniqueID: "custom",
};

// Map IFD name to piexif constant
const IFD_MAP: Record<string, string> = {
  "0th": "ImageIFD",
  Exif: "ExifIFD",
  GPS: "GPSIFD",
  "1st": "ImageIFD",
  Interop: "InteropIFD",
};

export async function processJpeg(
  file: File,
  options: StripOptions
): Promise<ProcessingResult> {
  const dataUrl = await readFileAsDataUrl(file);
  const fieldsFound: MetadataField[] = [];
  const fieldsRemoved: MetadataField[] = [];
  const fieldsKept: MetadataField[] = [];

  let exifObj: Record<string, Record<string, unknown>>;
  try {
    exifObj = piexif.load(dataUrl);
  } catch {
    // No EXIF data or corrupt — return file as-is
    const blob = new Blob([await file.arrayBuffer()], { type: file.type });
    return {
      originalFile: file,
      cleanedBlob: blob,
      report: {
        fileName: file.name,
        fileType: "jpeg",
        fileSize: file.size,
        cleanedFileSize: blob.size,
        fieldsFound: [],
        fieldsRemoved: [],
        fieldsKept: [],
        processedAt: new Date(),
      },
    };
  }

  // Catalogue all found metadata fields
  for (const ifd of ["0th", "Exif", "GPS", "1st", "Interop"]) {
    if (exifObj[ifd]) {
      for (const [tagId, value] of Object.entries(exifObj[ifd])) {
        if (value === undefined || value === null) continue;
        const ifdKey = IFD_MAP[ifd] || "ImageIFD";
        const tagInfo =
          piexif.TAGS[ifd]?.[tagId] ?? piexif.TAGS[ifdKey]?.[tagId];
        const tagName = tagInfo?.["name"] ?? `Unknown_${ifd}_${tagId}`;
        const category = TAG_CATEGORIES[tagName as string] || "custom";

        const field: MetadataField = {
          category,
          key: tagName as string,
          label: (tagName as string).replace(/([A-Z])/g, " $1").trim(),
          value: formatExifValue(value),
          removable: true,
        };
        fieldsFound.push(field);
      }
    }
  }

  // Determine which categories to strip
  const categoriesToStrip = (
    Object.entries(options) as [MetadataCategory, boolean][]
  )
    .filter(([, enabled]) => enabled)
    .map(([cat]) => cat);

  // Check if we're stripping everything (free tier fast path)
  const allCategories = Object.keys(options) as MetadataCategory[];
  const strippingAll = allCategories.every((cat) =>
    categoriesToStrip.includes(cat)
  );

  if (strippingAll || fieldsFound.length === 0) {
    // Nuke everything — fastest path
    let stripped: string;
    try {
      stripped = piexif.remove(dataUrl);
    } catch {
      // If removal fails, return original
      stripped = dataUrl;
    }
    const cleanedBlob = dataUrlToBlob(stripped);

    return {
      originalFile: file,
      cleanedBlob,
      report: {
        fileName: file.name,
        fileType: "jpeg",
        fileSize: file.size,
        cleanedFileSize: cleanedBlob.size,
        fieldsFound,
        fieldsRemoved: [...fieldsFound],
        fieldsKept: [],
        processedAt: new Date(),
      },
    };
  }

  // Selective removal
  for (const field of fieldsFound) {
    if (categoriesToStrip.includes(field.category)) {
      fieldsRemoved.push(field);
    } else {
      fieldsKept.push(field);
    }
  }

  // Remove GPS section entirely if requested
  if (options.gps) {
    exifObj["GPS"] = {};
  }

  // Selectively remove tags from other IFDs
  for (const ifd of ["0th", "Exif", "1st"]) {
    if (exifObj[ifd]) {
      for (const tagId of Object.keys(exifObj[ifd])) {
        const ifdKey = IFD_MAP[ifd] || "ImageIFD";
        const tagInfo =
          piexif.TAGS[ifd]?.[tagId] ?? piexif.TAGS[ifdKey]?.[tagId];
        const tagName = tagInfo?.["name"] ?? `Unknown_${ifd}_${tagId}`;
        const category = TAG_CATEGORIES[tagName as string] || "custom";
        if (categoriesToStrip.includes(category)) {
          delete exifObj[ifd][tagId];
        }
      }
    }
  }

  let cleanedBlob: Blob;
  try {
    const newExifBytes = piexif.dump(exifObj);
    const newDataUrl = piexif.insert(newExifBytes, dataUrl);
    cleanedBlob = dataUrlToBlob(newDataUrl);
  } catch {
    // Fallback: nuke all EXIF if selective removal fails
    try {
      const stripped = piexif.remove(dataUrl);
      cleanedBlob = dataUrlToBlob(stripped);
    } catch {
      cleanedBlob = new Blob([await file.arrayBuffer()], { type: file.type });
    }
  }

  return {
    originalFile: file,
    cleanedBlob,
    report: {
      fileName: file.name,
      fileType: "jpeg",
      fileSize: file.size,
      cleanedFileSize: cleanedBlob.size,
      fieldsFound,
      fieldsRemoved,
      fieldsKept,
      processedAt: new Date(),
    },
  };
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function dataUrlToBlob(dataUrl: string): Blob {
  const [header, data] = dataUrl.split(",");
  const mime = header.match(/:(.*?);/)?.[1] || "image/jpeg";
  const binary = atob(data);
  const array = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    array[i] = binary.charCodeAt(i);
  }
  return new Blob([array], { type: mime });
}

function formatExifValue(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (Array.isArray(value)) {
    return value
      .map((v) => {
        if (Array.isArray(v) && v.length === 2) return `${v[0]}/${v[1]}`;
        return String(v);
      })
      .join(", ");
  }
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}
