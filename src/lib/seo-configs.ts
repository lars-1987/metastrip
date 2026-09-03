// ============================================================
// SEO Landing Page Configs — drives all 7 SEO landing pages
// ============================================================

import type { IconName } from "@/components/shared/Icon";

export interface MockMetadataField {
  label: string;
  value: string;
}

export interface MockMetadataCategory {
  category: string;
  icon: IconName;
  color: string;
  label: string;
  fields: MockMetadataField[];
}

export interface ExplainerTab {
  id: string;
  label: string;
  icon: IconName;
  color: string;
  title: string;
  description: string;
  example: { label: string; value: string };
  risk: string;
}

export interface SEOContentBlock {
  heading: string;
  paragraphs: string[];
}

export interface SupportedFormatCard {
  ext: string;
  desc: string;
  color: string;
}

export interface BatchCTA {
  text: string;
  subtext: string;
}

export interface SEOPageConfig {
  slug: string;
  keyword: string;
  title: string;
  subtitle: string;
  heroLabel: string;
  acceptedTypes: string[];
  acceptedLabel: string;
  fileIcon: IconName;
  metadataCategories: MockMetadataCategory[];
  explainerTabs: ExplainerTab[];
  seoContent: SEOContentBlock;
  supportedFormats: SupportedFormatCard[];
  batchCta: BatchCTA;
  metaTitle: string;
  metaDescription: string;
}

// ============================================================
// PAGE CONFIGS
// ============================================================

export const SEO_PAGE_CONFIGS: Record<string, SEOPageConfig> = {
  "remove-metadata-from-photos": {
    slug: "remove-metadata-from-photos",
    keyword: "remove metadata from photos",
    title: "Remove Metadata from Photos",
    subtitle:
      "Strip GPS coordinates, camera info, AI generation tags, and hidden data from your images, instantly, privately, for free.",
    heroLabel: "REMOVE PHOTO METADATA: FREE, NOTHING UPLOADED",
    acceptedTypes: ["image/jpeg", "image/png", "image/webp", "image/heic"],
    acceptedLabel: "JPEG \u00b7 PNG \u00b7 WebP \u00b7 HEIC",
    fileIcon: "ImageSquare",
    metadataCategories: [
      {
        category: "gps",
        icon: "MapPin",
        color: "#ff4d6a",
        label: "GPS & Location",
        fields: [
          { label: "Latitude", value: "-37.8180\u00b0 S" },
          { label: "Longitude", value: "144.9691\u00b0 E" },
          { label: "Altitude", value: "18m above sea level" },
          { label: "Map Datum", value: "WGS-84" },
        ],
      },
      {
        category: "device",
        icon: "DeviceMobile",
        color: "#a78bfa",
        label: "Device & Camera",
        fields: [
          { label: "Make", value: "Apple" },
          { label: "Model", value: "iPhone 15 Pro Max" },
          { label: "Lens", value: "6.765mm f/1.78" },
          { label: "Serial \u2116", value: "DNQXK4F..." },
          { label: "Resolution", value: "4032 \u00d7 3024" },
        ],
      },
      {
        category: "dates",
        icon: "CalendarBlank",
        color: "#38bdf8",
        label: "Dates & Times",
        fields: [
          { label: "Taken", value: "2025-01-15 14:23:07" },
          { label: "Digitized", value: "2025-01-15 14:23:07" },
          { label: "Modified", value: "2025-02-20 09:11:33" },
        ],
      },
      {
        category: "software",
        icon: "Laptop",
        color: "#818cf8",
        label: "Software",
        fields: [
          { label: "OS Version", value: "17.2.1" },
          { label: "Host", value: "iPhone 15 Pro Max" },
        ],
      },
      {
        category: "author",
        icon: "User",
        color: "#f472b6",
        label: "Author",
        fields: [
          { label: "Artist", value: "Lars K." },
          { label: "Copyright", value: "\u00a9 2025" },
        ],
      },
    ],
    explainerTabs: [
      {
        id: "location",
        label: "Location",
        icon: "MapPin",
        color: "#ff4d6a",
        title: "Your exact coordinates",
        description:
          "Every photo taken with a smartphone embeds GPS coordinates accurate to a few meters. Share a photo of your front door and anyone can extract your home address.",
        example: {
          label: "What's hidden",
          value: "-37.8180\u00b0 S, 144.9691\u00b0 E",
        },
        risk: "Someone can find your home, workplace, or daily routine from photos you share online.",
      },
      {
        id: "device",
        label: "Device",
        icon: "DeviceMobile",
        color: "#a78bfa",
        title: "Your device identity",
        description:
          "Camera make, model, lens info, and sometimes serial numbers are embedded in every shot. This creates a unique fingerprint that can link anonymous photos back to your device.",
        example: {
          label: "What's hidden",
          value: "iPhone 15 Pro Max, S/N: DNQXK4F...",
        },
        risk: "Multiple 'anonymous' photos can be linked to the same device, and therefore to you.",
      },
      {
        id: "timestamps",
        label: "Timestamps",
        icon: "CalendarBlank",
        color: "#38bdf8",
        title: "When you were there",
        description:
          "Creation dates, modification dates, and timezone offsets reveal not just when a photo was taken, but your patterns: when you're home, at work, or traveling.",
        example: {
          label: "What's hidden",
          value: "2025-01-15 14:23:07 +11:00 (AEDT)",
        },
        risk: "Combined with location data, timestamps map your daily movements with precision.",
      },
      {
        id: "ai",
        label: "AI Tags",
        icon: "Robot",
        color: "#c084fc",
        title: "AI generation fingerprints",
        description:
          "Images from Midjourney, DALL-E, Stable Diffusion, and Adobe Firefly now embed C2PA content credentials and XMP AI metadata that permanently mark them as AI-generated.",
        example: {
          label: "What's hidden",
          value: "c2pa.ai_generated: true | tool: midjourney-v6",
        },
        risk: "Social platforms and search engines are beginning to flag and demote AI-tagged content automatically.",
      },
    ],
    seoContent: {
      heading: "Why remove metadata from your photos?",
      paragraphs: [
        "Every photo taken with a modern smartphone or digital camera contains hidden metadata: GPS coordinates, camera details, timestamps, and sometimes even your name. This data is embedded automatically and most people never realize it's there.",
        "When you share photos by email, cloud storage, messaging apps, or upload them to websites, this metadata often travels with the image. While some social media platforms strip metadata on upload, many sharing methods preserve it completely.",
        "The privacy implications are significant. A photo taken at home reveals your home address. Photos over time reveal your daily patterns. For journalists, activists, and domestic abuse survivors, this data can be genuinely dangerous.",
        "MetaStrip removes all hidden metadata from your photos instantly, directly in your browser. Your files are never uploaded to any server; processing happens entirely on your device.",
      ],
    },
    supportedFormats: [
      {
        ext: "JPEG",
        desc: "Full EXIF, IPTC, XMP, GPS, AI tags, thumbnails",
        color: "#a78bfa",
      },
      {
        ext: "PNG",
        desc: "tEXt, iTXt, zTXt metadata chunks, XMP",
        color: "#38bdf8",
      },
      {
        ext: "WebP",
        desc: "EXIF, XMP embedded metadata",
        color: "#4ade80",
      },
    ],
    batchCta: {
      text: "Strip Files Free \u2192",
      subtext:
        "Up to 20 files per batch. No account, no upload, no cost.",
    },
    metaTitle:
      "Remove Metadata from Photos Online: Free, No Upload | MetaStrip",
    metaDescription:
      "Remove GPS, EXIF, camera info, and AI tags from photos in your browser. JPG, PNG, WebP, HEIC. No upload, no account, no cost.",
  },

  "remove-author-from-pdf": {
    slug: "remove-author-from-pdf",
    keyword: "remove author from PDF",
    title: "Remove Author from PDF",
    subtitle:
      "Strip author names, creator applications, company info, and hidden document properties from PDF files, instantly, in your browser.",
    heroLabel: "REMOVE PDF AUTHOR & METADATA: FREE, NOTHING UPLOADED",
    acceptedTypes: ["application/pdf"],
    acceptedLabel: "PDF files",
    fileIcon: "FileText",
    metadataCategories: [
      {
        category: "author",
        icon: "User",
        color: "#f472b6",
        label: "Author & Identity",
        fields: [
          { label: "Author", value: "Sarah Mitchell" },
          {
            label: "Title",
            value: "Q4 Revenue Forecast: CONFIDENTIAL",
          },
          { label: "Subject", value: "Internal Finance Review" },
          {
            label: "Keywords",
            value: "revenue, forecast, board, confidential",
          },
        ],
      },
      {
        category: "software",
        icon: "Laptop",
        color: "#818cf8",
        label: "Software & Producer",
        fields: [
          { label: "Creator", value: "Microsoft Word 2024" },
          { label: "Producer", value: "macOS 14.3 Quartz PDFContext" },
        ],
      },
      {
        category: "dates",
        icon: "CalendarBlank",
        color: "#38bdf8",
        label: "Dates & Timestamps",
        fields: [
          { label: "Created", value: "2025-01-08T09:14:22Z" },
          { label: "Modified", value: "2025-02-18T16:42:07Z" },
        ],
      },
      {
        category: "custom",
        icon: "Tag",
        color: "#fbbf24",
        label: "Custom Properties",
        fields: [
          { label: "Company", value: "Nexus Financial Group" },
          { label: "Department", value: "Corporate Strategy" },
          { label: "Classification", value: "Internal Only" },
        ],
      },
    ],
    explainerTabs: [
      {
        id: "author",
        label: "Author",
        icon: "User",
        color: "#f472b6",
        title: "Your name is in every PDF",
        description:
          "PDF files embed the author name from your computer's user account or the application that created them. When you send a PDF externally, the recipient can see exactly who created it, and every person who edited it.",
        example: {
          label: "What's hidden",
          value:
            "Author: Sarah Mitchell | Company: Nexus Financial Group",
        },
        risk: "Sending a 'confidential' document? The author field reveals exactly who wrote it and where they work.",
      },
      {
        id: "software",
        label: "Software",
        icon: "Laptop",
        color: "#818cf8",
        title: "Your tools reveal your setup",
        description:
          "The creator application and PDF producer fields reveal your operating system, software version, and the exact workflow used to generate the file. This is a goldmine for social engineering.",
        example: {
          label: "What's hidden",
          value:
            "Creator: Microsoft Word 2024 | Producer: macOS 14.3 Quartz",
        },
        risk: "Attackers can target vulnerabilities specific to your OS and software versions.",
      },
      {
        id: "dates",
        label: "Timestamps",
        icon: "CalendarBlank",
        color: "#38bdf8",
        title: "When the document was created and changed",
        description:
          "Creation and modification timestamps reveal your work patterns, timezone, and how long a document has been in development. A 'freshly prepared' report might show a creation date from months ago.",
        example: {
          label: "What's hidden",
          value:
            "Created: Jan 8, 2025 09:14 | Modified: Feb 18, 2025 16:42",
        },
        risk: "Timestamps can contradict claims about when work was done, risky in legal and compliance contexts.",
      },
      {
        id: "company",
        label: "Company",
        icon: "Buildings",
        color: "#fbbf24",
        title: "Your organization's fingerprint",
        description:
          "Company name, department, document classification, and custom properties set by your IT department are all embedded. Templates often carry metadata from whoever created the template originally.",
        example: {
          label: "What's hidden",
          value:
            "Company: Nexus Financial Group | Dept: Corporate Strategy",
        },
        risk: "Recycled templates can leak another organization's name and internal classifications into your documents.",
      },
    ],
    seoContent: {
      heading: "Why remove author information from PDFs?",
      paragraphs: [
        "PDF documents store author names, company information, and creation details in hidden metadata fields. This data is set automatically by your operating system and the software used to create the file; most people never realize it's there.",
        "When sharing PDFs with clients, partners, or the public, this metadata can reveal sensitive information: who wrote the document, which company produced it, what software was used, and exactly when it was created and last modified.",
        "For legal professionals, this is particularly critical. Court filings, contracts, and privileged documents should never carry metadata that could reveal work product or privileged communications. For businesses, leaked company names in recycled templates can be embarrassing or even breach confidentiality agreements.",
        "MetaStrip removes all author and document metadata from PDFs instantly, directly in your browser. Your files are never uploaded; processing happens entirely on your device using pdf-lib, an open-source JavaScript PDF library.",
      ],
    },
    supportedFormats: [
      {
        ext: "PDF",
        desc: "Author, title, subject, keywords, creator, producer, dates, custom properties",
        color: "#f472b6",
      },
    ],
    batchCta: {
      text: "Strip Files Free \u2192",
      subtext:
        "Up to 20 files per batch. No account, no upload, no cost.",
    },
    metaTitle:
      "Remove Author from PDF Online, Free, No Upload | MetaStrip",
    metaDescription:
      "Remove the author name, creator app, and hidden properties from a PDF. Runs in your browser, so the file never leaves your device. Free, no sign-up.",
  },

  "strip-exif-data": {
    slug: "strip-exif-data",
    keyword: "strip EXIF data online",
    title: "Strip EXIF Data Online",
    subtitle:
      "Remove EXIF, IPTC, XMP, and all embedded metadata from photos, free, private, no upload required.",
    heroLabel: "STRIP EXIF DATA: FREE, 100% CLIENT-SIDE",
    acceptedTypes: ["image/jpeg", "image/png", "image/webp", "image/heic"],
    acceptedLabel: "JPEG \u00b7 PNG \u00b7 WebP \u00b7 HEIC",
    fileIcon: "ImageSquare",
    metadataCategories: [
      {
        category: "gps",
        icon: "MapPin",
        color: "#ff4d6a",
        label: "GPS / EXIF Location",
        fields: [
          { label: "GPSLatitude", value: "40.7484\u00b0 N" },
          { label: "GPSLongitude", value: "73.9857\u00b0 W" },
          { label: "GPSAltitude", value: "86m" },
          { label: "GPSSpeed", value: "0.12 km/h" },
        ],
      },
      {
        category: "device",
        icon: "DeviceMobile",
        color: "#a78bfa",
        label: "EXIF Camera Data",
        fields: [
          { label: "Make", value: "Canon" },
          { label: "Model", value: "EOS R5" },
          { label: "LensModel", value: "RF 24-70mm F2.8 L IS USM" },
          { label: "SerialNumber", value: "032024001..." },
          { label: "ShutterCount", value: "48,291" },
        ],
      },
      {
        category: "dates",
        icon: "CalendarBlank",
        color: "#38bdf8",
        label: "EXIF Timestamps",
        fields: [
          { label: "DateTimeOriginal", value: "2025:03:12 08:41:22" },
          { label: "DateTimeDigitized", value: "2025:03:12 08:41:22" },
          { label: "SubSecTimeOriginal", value: "082" },
        ],
      },
      {
        category: "software",
        icon: "Laptop",
        color: "#818cf8",
        label: "Processing Software",
        fields: [
          {
            label: "Software",
            value: "Adobe Lightroom Classic 14.1",
          },
          { label: "ProcessingHistory", value: "3 edits applied" },
        ],
      },
      {
        category: "author",
        icon: "User",
        color: "#f472b6",
        label: "IPTC Creator",
        fields: [
          { label: "Artist", value: "James Chen Photography" },
          { label: "Copyright", value: "\u00a9 2025 James Chen" },
          {
            label: "Credit",
            value: "James Chen / Shutterstock",
          },
        ],
      },
    ],
    explainerTabs: [
      {
        id: "exif",
        label: "EXIF",
        icon: "Camera",
        color: "#a78bfa",
        title: "The full EXIF specification",
        description:
          "EXIF (Exchangeable Image File Format) is the most comprehensive metadata standard in photography. It stores camera settings, GPS coordinates, orientation, color space, thumbnails, and dozens of technical parameters, all embedded invisibly in your image file.",
        example: {
          label: "Typical EXIF payload",
          value:
            "40-80 metadata fields per photo | 10-50KB of hidden data",
        },
        risk: "A single EXIF dump reveals your camera serial number, exact location, and complete shooting parameters.",
      },
      {
        id: "iptc",
        label: "IPTC",
        icon: "NotePencil",
        color: "#38bdf8",
        title: "Editorial and copyright data",
        description:
          "IPTC metadata is used by news agencies and stock photo services to embed creator credits, captions, keywords, and licensing terms. If you've ever submitted photos to a stock platform, this data follows your images everywhere.",
        example: {
          label: "What's hidden",
          value:
            "Creator: James Chen | Credit: Shutterstock | Keywords: urban, night",
        },
        risk: "IPTC data can link 'anonymous' photos back to your stock photography profile or real name.",
      },
      {
        id: "xmp",
        label: "XMP",
        icon: "Package",
        color: "#06b6d4",
        title: "Adobe's extensible metadata",
        description:
          "XMP (Extensible Metadata Platform) is Adobe's metadata framework embedded in images processed by Lightroom, Photoshop, and Camera Raw. It contains editing history, ratings, collections, and custom tags.",
        example: {
          label: "What's hidden",
          value:
            "xmp:CreatorTool: Lightroom Classic 14.1 | xmp:Rating: 4",
        },
        risk: "XMP reveals your complete editing workflow, software versions, and how you organize your photo library.",
      },
      {
        id: "thumbnail",
        label: "Thumbnails",
        icon: "ImageSquare",
        color: "#f472b6",
        title: "Hidden preview images",
        description:
          "JPEG files often contain an embedded thumbnail that was generated when the photo was first taken. If you cropped or edited the photo later, the original uncropped thumbnail may still be inside the file.",
        example: {
          label: "What's hidden",
          value:
            "160\u00d7120 JPEG thumbnail, may show original uncropped image",
        },
        risk: "The infamous 'Cat Schwartz incident': a cropped photo still contained the full uncropped thumbnail.",
      },
    ],
    seoContent: {
      heading: "What is EXIF data and why should you remove it?",
      paragraphs: [
        "EXIF data is a metadata standard that stores technical and contextual information inside image files. Originally designed to help photographers organize their work, EXIF has become a significant privacy concern in the age of smartphone photography and social sharing.",
        "Every photo taken with a modern smartphone or digital camera contains EXIF data. This typically includes GPS coordinates accurate to a few meters, the exact date and time, camera make and model, serial numbers, lens information, and exposure settings. For edited photos, the software used and editing history may also be stored.",
        "While some social media platforms strip EXIF data on upload, many do not; and email, messaging apps, cloud storage, and websites often preserve metadata completely. Once a photo is shared with its EXIF intact, anyone who downloads it can extract your location, device identity, and personal information.",
        "MetaStrip provides comprehensive EXIF removal for JPEG, PNG, and WebP files. All processing happens in your browser; your photos are never uploaded to any server, making MetaStrip the most private EXIF stripping tool available.",
      ],
    },
    supportedFormats: [
      {
        ext: "JPEG",
        desc: "Full EXIF, IPTC, XMP, GPS, embedded thumbnails",
        color: "#a78bfa",
      },
      {
        ext: "PNG",
        desc: "tEXt, iTXt, zTXt metadata chunks, XMP sidecar",
        color: "#38bdf8",
      },
      {
        ext: "WebP",
        desc: "EXIF, XMP embedded metadata",
        color: "#4ade80",
      },
    ],
    batchCta: {
      text: "Strip Files Free \u2192",
      subtext:
        "Up to 20 files per batch. No account, no upload, no cost.",
    },
    metaTitle:
      "EXIF Remover: View & Strip Photo Metadata Online | MetaStrip",
    metaDescription:
      "Remove EXIF, IPTC, XMP, and GPS metadata from photos. See what's embedded, then strip it. Free, in your browser, no upload.",
  },

  "remove-c2pa-metadata": {
    slug: "remove-c2pa-metadata",
    keyword: "remove C2PA metadata from images",
    title: "Remove C2PA Metadata",
    subtitle:
      "Strip C2PA content credentials from JPEG, PNG, WebP, and HEIC images in your browser. Unlimited files, no signup, nothing uploaded.",
    heroLabel: "REMOVE C2PA CONTENT CREDENTIALS: UNLIMITED, NOTHING UPLOADED",
    acceptedTypes: ["image/jpeg", "image/png", "image/webp", "image/heic"],
    acceptedLabel: "JPEG · PNG · WebP · HEIC",
    fileIcon: "LockKey",
    metadataCategories: [
      {
        category: "ai",
        icon: "LockKey",
        color: "#c084fc",
        label: "C2PA Manifest",
        fields: [
          { label: "c2pa.claim_generator", value: "Adobe Firefly 3.0" },
          { label: "c2pa.action", value: "c2pa.created" },
          { label: "c2pa.ai_generated", value: "true" },
          { label: "instance_id", value: "xmp:iid:9f3b2a41..." },
        ],
      },
      {
        category: "ai",
        icon: "ShieldCheck",
        color: "#a78bfa",
        label: "Signature & Provenance",
        fields: [
          { label: "signature.issuer", value: "Adobe Inc." },
          { label: "signature.alg", value: "ps256" },
          { label: "c2pa.digest", value: "sha256:a4f2e8..." },
          { label: "claim.created", value: "2026-02-28T22:14:08Z" },
        ],
      },
      {
        category: "custom",
        icon: "Tag",
        color: "#38bdf8",
        label: "XMP Provenance Block",
        fields: [
          { label: "xmp:CreatorTool", value: "Adobe Firefly" },
          {
            label: "Iptc4xmpExt:DigitalSourceType",
            value: "trainedAlgorithmicMedia",
          },
          { label: "dcterms:provenance", value: "c2pa manifest store" },
        ],
      },
      {
        category: "device",
        icon: "Camera",
        color: "#818cf8",
        label: "Capture Credentials",
        fields: [
          { label: "c2pa.capture_device", value: "Google Pixel 10" },
          { label: "exif:Make", value: "Google" },
          { label: "c2pa.hash.data", value: "signed at capture" },
        ],
      },
    ],
    explainerTabs: [
      {
        id: "what",
        label: "What C2PA Is",
        icon: "LockKey",
        color: "#c084fc",
        title: "A signed record attached to your file",
        description:
          "C2PA (Coalition for Content Provenance and Authenticity) content credentials are a cryptographically signed manifest embedded in an image. It records what produced the file, which tool edited it, when, and whether AI was involved. Adobe markets it as Content Credentials.",
        example: {
          label: "Where it lives",
          value:
            "JUMBF boxes in JPEG, a caBX chunk in PNG, a C2PA chunk in WebP, a uuid box in HEIC",
        },
        risk: "The manifest travels with the file, so anyone who receives it can read your tool, timestamps, and edit history.",
      },
      {
        id: "removable",
        label: "Why It Strips",
        icon: "ShieldCheck",
        color: "#a78bfa",
        title: "It is metadata, not pixels",
        description:
          "The manifest sits in the file's metadata container, alongside the image rather than inside it. That is what makes it removable without touching a single pixel. Your image comes out visually identical, just without the provenance record attached.",
        example: {
          label: "What changes",
          value:
            "Manifest removed, image data byte-for-byte unchanged, file slightly smaller",
        },
        risk: "Re-saving in another app can also drop it, but that usually recompresses and costs you quality.",
      },
      {
        id: "formats",
        label: "Every Format",
        icon: "ImageSquare",
        color: "#38bdf8",
        title: "Including JPEG and HEIC",
        description:
          "C2PA binds differently in each format, which is why many tools only handle one or two. MetaStrip reads all four bindings: APP11 JUMBF segments in JPEG, the caBX chunk in PNG, the C2PA RIFF chunk in WebP, and the uuid box in HEIC, the format every iPhone shoots by default.",
        example: {
          label: "Supported",
          value: "JPEG, PNG, WebP, HEIC, plus EXIF, XMP and IPTC alongside",
        },
        risk: "A tool that only supports PNG and WebP leaves your camera photos and iPhone shots untouched.",
      },
      {
        id: "limits",
        label: "What It Cannot Do",
        icon: "Eye",
        color: "#f472b6",
        title: "Pixel watermarks are a separate layer",
        description:
          "Removing the C2PA manifest removes the metadata layer. It does not remove an invisible pixel watermark such as Google's SynthID, which is woven into the image data itself. No metadata tool can, and any tool claiming otherwise is overstating what is possible.",
        example: {
          label: "Honest scope",
          value:
            "Metadata layer removed; pixel-level watermarks are untouched",
        },
        risk: "Know which layer you are dealing with before assuming an image carries no markers at all.",
      },
    ],
    seoContent: {
      heading: "How to remove C2PA metadata from an image",
      paragraphs: [
        "Drop an image into the tool above. MetaStrip reads the C2PA manifest directly in your browser, shows you exactly what provenance data is embedded, and removes it when you confirm. The cleaned file downloads straight back to you. Nothing is uploaded to a server at any point, which matters when the whole reason you are stripping provenance is that you would rather not share it.",
        "C2PA content credentials are embedded automatically by a growing list of sources: Adobe Firefly, Photoshop and Lightroom exports, OpenAI's DALL-E and Sora, Google Gemini and Imagen, and at the hardware level by cameras from Sony, Nikon and Leica, plus the Google Pixel, which signs every photo it takes. If your image came from any of those, it very likely carries a manifest whether you knew about it or not.",
        "Because the manifest lives in the file's metadata container rather than in the pixels, removing it leaves the image visually identical. MetaStrip strips the C2PA manifest along with the EXIF, XMP and IPTC data sitting beside it, so you are not left with your camera model and GPS coordinates after clearing the provenance record.",
        "One honest limit: removing the C2PA manifest removes the metadata-based marker. It does not remove a pixel-level watermark such as SynthID, which is embedded in the image data itself and cannot be stripped by any metadata tool. Most automated checks read the manifest, so removal is usually sufficient, but it is worth knowing the difference.",
      ],
    },
    supportedFormats: [
      {
        ext: "JPEG",
        desc: "APP11 JUMBF manifest, XMP provenance block, EXIF alongside",
        color: "#c084fc",
      },
      {
        ext: "PNG",
        desc: "caBX manifest chunk, iTXt XMP provenance, text chunks",
        color: "#a78bfa",
      },
      {
        ext: "WebP",
        desc: "C2PA RIFF chunk, XMP provenance, EXIF chunk",
        color: "#38bdf8",
      },
      {
        ext: "HEIC",
        desc: "C2PA uuid box, Exif and XMP items, iPhone's default format",
        color: "#818cf8",
      },
    ],
    batchCta: {
      text: "Strip C2PA Free →",
      subtext:
        "Unlimited strips, no daily cap, no account, nothing uploaded.",
    },
    metaTitle:
      "Remove C2PA Metadata from Images: Free & Unlimited | MetaStrip",
    metaDescription:
      "Remove C2PA content credentials from JPEG, PNG, WebP and HEIC images. Runs entirely in your browser, nothing uploaded, unlimited files, no signup.",
  },
  "remove-ai-metadata": {
    slug: "remove-ai-metadata",
    keyword: "remove AI metadata from images",
    title: "Remove AI Metadata",
    subtitle:
      "Strip C2PA content credentials, XMP AI generation tags, and tool fingerprints from Midjourney, DALL-E, Stable Diffusion, and Adobe Firefly images.",
    heroLabel: "STRIP AI GENERATION TAGS: FREE, 100% CLIENT-SIDE",
    acceptedTypes: ["image/jpeg", "image/png", "image/webp", "image/heic"],
    acceptedLabel: "JPEG \u00b7 PNG \u00b7 WebP \u00b7 HEIC",
    fileIcon: "Robot",
    metadataCategories: [
      {
        category: "ai",
        icon: "Robot",
        color: "#c084fc",
        label: "C2PA Content Credentials",
        fields: [
          { label: "c2pa.action", value: "c2pa.created" },
          { label: "c2pa.ai_tool", value: "Midjourney v6.1" },
          { label: "c2pa.ai_generated", value: "true" },
          { label: "c2pa.digest", value: "sha256:a4f2e8..." },
        ],
      },
      {
        category: "ai",
        icon: "Tag",
        color: "#a78bfa",
        label: "XMP AI Tags",
        fields: [
          { label: "xmp:CreatorTool", value: "Midjourney" },
          { label: "dc:description", value: "AI-generated image" },
          {
            label: "photoshop:Credit",
            value: "Generated with AI",
          },
          {
            label: "Iptc4xmpExt:DigitalSourceType",
            value: "trainedAlgorithmicMedia",
          },
        ],
      },
      {
        category: "software",
        icon: "Laptop",
        color: "#818cf8",
        label: "Generation Parameters",
        fields: [
          {
            label: "parameters",
            value: "--v 6.1 --ar 16:9 --style raw",
          },
          { label: "prompt_hash", value: "d8f3a2b1..." },
          { label: "model_version", value: "6.1" },
        ],
      },
      {
        category: "dates",
        icon: "CalendarBlank",
        color: "#38bdf8",
        label: "Generation Timestamps",
        fields: [
          { label: "Created", value: "2025-02-28T22:14:08Z" },
          {
            label: "xmp:MetadataDate",
            value: "2025-02-28T22:14:08Z",
          },
        ],
      },
    ],
    explainerTabs: [
      {
        id: "c2pa",
        label: "C2PA",
        icon: "LockKey",
        color: "#c084fc",
        title: "Content credentials mark AI images",
        description:
          "C2PA (Coalition for Content Provenance and Authenticity) is a technical standard backed by Adobe, Microsoft, Google, and OpenAI. It embeds cryptographic 'content credentials' into AI-generated images that permanently mark them as machine-made.",
        example: {
          label: "What's embedded",
          value:
            "c2pa.ai_generated: true | tool: midjourney-v6.1 | signed manifest",
        },
        risk: "Social platforms, search engines, and stock sites are beginning to detect and flag C2PA-tagged content automatically.",
      },
      {
        id: "xmp",
        label: "XMP Tags",
        icon: "Tag",
        color: "#a78bfa",
        title: "AI markers in standard metadata",
        description:
          "Beyond C2PA, AI tools embed markers in standard XMP and IPTC fields. Midjourney sets CreatorTool, DALL-E adds 'AI generated' descriptions, and Adobe Firefly marks images with the IPTC DigitalSourceType field.",
        example: {
          label: "What's embedded",
          value:
            "Iptc4xmpExt:DigitalSourceType: trainedAlgorithmicMedia",
        },
        risk: "Even without C2PA, standard metadata readers can identify AI images from these fields.",
      },
      {
        id: "steganography",
        label: "Invisible Marks",
        icon: "Eye",
        color: "#06b6d4",
        title: "Watermarks beyond metadata",
        description:
          "Some AI tools embed invisible watermarks directly into pixel data (steganographic watermarking). Google's SynthID and Meta's watermarking are examples. These survive metadata stripping, screenshots, and even mild editing.",
        example: {
          label: "Important note",
          value:
            "Pixel-level watermarks cannot be removed by metadata stripping",
        },
        risk: "MetaStrip removes metadata-based AI tags, but steganographic watermarks require different approaches.",
      },
      {
        id: "detection",
        label: "AI Detection",
        icon: "MagnifyingGlass",
        color: "#f472b6",
        title: "Who's checking for AI metadata?",
        description:
          "Google Search is experimenting with AI image labels. Adobe Stock rejects AI-tagged submissions. Social platforms including Facebook and Instagram now display 'AI Generated' labels on flagged content. Getty Images bans AI-generated content entirely.",
        example: {
          label: "Growing enforcement",
          value:
            "Google, Meta, Adobe, Getty, Shutterstock, all checking",
        },
        risk: "Content flagged as AI-generated may be demoted in search, labeled on social media, or rejected by platforms.",
      },
    ],
    seoContent: {
      heading: "Why remove AI metadata from generated images?",
      paragraphs: [
        "AI image generators including Midjourney, DALL-E, Stable Diffusion, and Adobe Firefly now embed metadata that identifies images as AI-generated. This includes C2PA content credentials, XMP AI tags, IPTC digital source type markers, and tool-specific generation parameters.",
        "As platforms increasingly detect and label AI content, this metadata has real consequences. Google is testing AI image labels in search results. Meta displays 'AI Generated' tags on Instagram and Facebook. Stock photo platforms reject AI-tagged submissions. Some job boards and academic institutions check for AI generation markers.",
        "MetaStrip removes all metadata-based AI identification tags from your images. This includes C2PA manifests, XMP AI markers, IPTC DigitalSourceType fields, and embedded generation parameters. Processing happens entirely in your browser; no upload required.",
        "Important note: MetaStrip removes metadata tags, not steganographic watermarks. Some AI tools embed invisible pixel-level watermarks (like Google's SynthID) that survive metadata removal. For most use cases, metadata removal is sufficient, as the majority of automated detection systems rely on metadata rather than pixel analysis.",
      ],
    },
    supportedFormats: [
      {
        ext: "JPEG",
        desc: "C2PA manifests, XMP AI tags, IPTC DigitalSourceType, generation params",
        color: "#c084fc",
      },
      {
        ext: "PNG",
        desc: "C2PA content credentials, tEXt generation parameters, XMP",
        color: "#a78bfa",
      },
      {
        ext: "WebP",
        desc: "XMP AI metadata, embedded generation data",
        color: "#38bdf8",
      },
    ],
    batchCta: {
      text: "Strip Files Free \u2192",
      subtext:
        "Up to 20 files per batch. No account, no upload, no cost.",
    },
    metaTitle:
      "Remove AI Metadata & Generation Tags from Images | MetaStrip",
    metaDescription:
      "Strip AI generation tags, XMP creator-tool fields and IPTC markers from Midjourney, DALL\u00b7E, ChatGPT and Firefly images. 100% browser-based. No upload, no signup.",
  },

  "strip-metadata-from-word-document": {
    slug: "strip-metadata-from-word-document",
    keyword: "strip metadata from Word document",
    title: "Strip Metadata from Word Documents",
    subtitle:
      "Remove author names, tracked changes, comments, company info, and hidden properties from DOCX files, privately, in your browser.",
    heroLabel: "STRIP WORD DOCUMENT METADATA: FREE, NOTHING UPLOADED",
    acceptedTypes: [
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
    acceptedLabel: "DOCX files",
    fileIcon: "NotePencil",
    metadataCategories: [
      {
        category: "author",
        icon: "User",
        color: "#f472b6",
        label: "Author & Identity",
        fields: [
          { label: "Creator", value: "Michael Torres" },
          { label: "Last Modified By", value: "Jennifer Walsh" },
          { label: "Manager", value: "David Kim" },
          {
            label: "Company",
            value: "Sterling & Associates LLP",
          },
        ],
      },
      {
        category: "comments",
        icon: "ChatText",
        color: "#fbbf24",
        label: "Comments & Tracked Changes",
        fields: [
          { label: "Comments", value: "4 comments by 2 authors" },
          { label: "Tracked Changes", value: "12 revisions tracked" },
          { label: "Revision Number", value: "47" },
          { label: "people.xml", value: "3 people identified" },
        ],
      },
      {
        category: "dates",
        icon: "CalendarBlank",
        color: "#38bdf8",
        label: "Dates & Editing Time",
        fields: [
          { label: "Created", value: "2024-11-22T10:08:00Z" },
          { label: "Modified", value: "2025-03-01T14:33:00Z" },
          { label: "Total Editing Time", value: "842 minutes" },
        ],
      },
      {
        category: "software",
        icon: "Laptop",
        color: "#818cf8",
        label: "Application & Template",
        fields: [
          { label: "Application", value: "Microsoft Office Word" },
          { label: "Version", value: "16.0" },
          { label: "Template", value: "Legal_Brief_v3.dotx" },
        ],
      },
    ],
    explainerTabs: [
      {
        id: "tracked",
        label: "Tracked Changes",
        icon: "ChatText",
        color: "#fbbf24",
        title: "Deleted text isn't really deleted",
        description:
          "Tracked changes in Word documents preserve every edit, including text that was deleted. If you 'Accept All Changes' before sharing, the visible text is clean, but the revision history may still be embedded in the XML. A simple unzip reveals everything.",
        example: {
          label: "What's hidden",
          value:
            "12 revisions | Deleted text: 'initial offer of $2.4M was rejected'",
        },
        risk: "Opposing counsel, competitors, or clients can see your negotiation notes, draft revisions, and deleted content.",
      },
      {
        id: "comments",
        label: "Comments",
        icon: "PushPin",
        color: "#f472b6",
        title: "Internal commentary exposed",
        description:
          "Comments from colleagues survive in the DOCX XML even after they appear deleted in Word. Names of commenters, timestamps, and the full comment text remain accessible by unzipping the file.",
        example: {
          label: "What's hidden",
          value:
            "Comment by J. Walsh: 'Should we disclose the Q3 shortfall?'",
        },
        risk: "Internal strategy discussions, legal concerns, and editorial decisions can be extracted from shared documents.",
      },
      {
        id: "identity",
        label: "People",
        icon: "UsersThree",
        color: "#a78bfa",
        title: "Everyone who touched the document",
        description:
          "Word documents maintain a list of every person who edited or commented on the file. This includes full names, email addresses in some cases, and the exact timestamps of each person's contributions.",
        example: {
          label: "What's hidden",
          value:
            "3 editors: M. Torres, J. Walsh, D. Kim | Sterling & Associates LLP",
        },
        risk: "The people.xml file creates a complete audit trail of who was involved in creating a document.",
      },
      {
        id: "template",
        label: "Templates",
        icon: "ClipboardText",
        color: "#06b6d4",
        title: "Template metadata leaks",
        description:
          "Documents created from templates inherit the template's metadata, including the original author and company who created the template. Law firms and consultancies frequently discover they're sending documents with another firm's metadata baked in.",
        example: {
          label: "What's hidden",
          value:
            "Template: Legal_Brief_v3.dotx | Original Author: Baker McKenzie",
        },
        risk: "A template from a previous employer or competitor embeds their identity into every document you create from it.",
      },
    ],
    seoContent: {
      heading: "Why strip metadata from Word documents before sharing?",
      paragraphs: [
        "Microsoft Word documents (DOCX) store extensive hidden metadata in XML files inside the document package. This includes author names, company information, editing time, revision history, comments, tracked changes, and details about every person who contributed to the document.",
        "For legal professionals, this is a well-known hazard. Court rules in many jurisdictions require metadata scrubbing before filing or exchange. The American Bar Association has issued ethics opinions emphasizing lawyers' duty to remove metadata from documents shared with opposing parties.",
        "Beyond legal contexts, any business sharing Word documents externally risks exposing internal author names, company structure, editing timelines, and deleted content that may still exist in the revision history. Templates inherited from previous employers or partners can embed their metadata into your documents.",
        "MetaStrip opens your DOCX file directly in the browser using JSZip, removes or sanitizes the metadata XML files, and repackages the clean document, all without your file ever leaving your device.",
      ],
    },
    supportedFormats: [
      {
        ext: "DOCX",
        desc: "Author, comments, tracked changes, company, template, editing time, revisions, custom properties",
        color: "#f472b6",
      },
    ],
    batchCta: {
      text: "Strip Files Free \u2192",
      subtext:
        "Up to 20 files per batch. No account, no upload, no cost.",
    },
    metaTitle:
      "Word Metadata Remover (.docx): Free | MetaStrip",
    metaDescription:
      "Remove author names, company info, tracked changes, comments, and revision history from Microsoft Word (.docx) files. Browser-based, no upload, no signup.",
  },

  "remove-gps-location-from-photos": {
    slug: "remove-gps-location-from-photos",
    keyword: "remove GPS location from photos",
    title: "Remove GPS Location from Photos",
    subtitle:
      "Strip embedded GPS coordinates, altitude, speed, and direction data from your photos before sharing them online.",
    heroLabel: "REMOVE GPS LOCATION FROM PHOTOS: FREE & PRIVATE",
    acceptedTypes: ["image/jpeg", "image/png", "image/webp", "image/heic"],
    acceptedLabel: "JPEG \u00b7 PNG \u00b7 WebP \u00b7 HEIC",
    fileIcon: "MapPin",
    metadataCategories: [
      {
        category: "gps",
        icon: "MapPin",
        color: "#ff4d6a",
        label: "GPS Coordinates",
        fields: [
          { label: "Latitude", value: "34.0522\u00b0 N" },
          { label: "Longitude", value: "118.2437\u00b0 W" },
          { label: "Altitude", value: "71m above sea level" },
          { label: "Direction", value: "247.3\u00b0 (WSW)" },
          { label: "Speed", value: "0.0 km/h" },
          { label: "Map Datum", value: "WGS-84" },
        ],
      },
      {
        category: "gps",
        icon: "Clock",
        color: "#f97316",
        label: "GPS Timestamps",
        fields: [
          { label: "GPS Date", value: "2025:02:15" },
          { label: "GPS Time", value: "19:42:33 UTC" },
          { label: "Offset", value: "-08:00 (PST)" },
        ],
      },
      {
        category: "device",
        icon: "DeviceMobile",
        color: "#a78bfa",
        label: "Device (also location-linked)",
        fields: [
          { label: "Make", value: "Samsung" },
          { label: "Model", value: "Galaxy S24 Ultra" },
          { label: "Serial", value: "RF8R..." },
        ],
      },
    ],
    explainerTabs: [
      {
        id: "coords",
        label: "Coordinates",
        icon: "MapPin",
        color: "#ff4d6a",
        title: "Pinpoint accuracy to your front door",
        description:
          "Smartphone GPS data embedded in photos is typically accurate to within 3-5 meters. That's enough to identify your exact home address, workplace, gym, school, or any other location you photograph. A single photo can reveal where you live.",
        example: {
          label: "What's hidden",
          value: "34.0522\u00b0 N, 118.2437\u00b0 W, accurate to ~3 meters",
        },
        risk: "A photo of your pet, your cooking, or your hobby taken at home reveals your home address to anyone who checks.",
      },
      {
        id: "patterns",
        label: "Patterns",
        icon: "MapTrifold",
        color: "#f97316",
        title: "Multiple photos map your life",
        description:
          "One photo reveals one location. A dozen photos reveal your daily routine: where you live, work, eat, exercise, and socialize. Combined with timestamps, they create a detailed timeline of your movements.",
        example: {
          label: "What 10 photos reveal",
          value:
            "Home \u2192 Gym (7am) \u2192 Office (9am) \u2192 Lunch spot \u2192 Home (6pm)",
        },
        risk: "Sharing photos regularly over weeks gives anyone a predictive map of where you'll be and when.",
      },
      {
        id: "platforms",
        label: "Which Apps Strip?",
        icon: "MagnifyingGlass",
        color: "#38bdf8",
        title: "Not every platform protects you",
        description:
          "Instagram and Facebook strip GPS on upload. But email, WhatsApp (when sending as document), cloud storage (Google Drive, Dropbox), forums, personal websites, and many messaging apps preserve GPS data completely.",
        example: {
          label: "Platforms that DON'T strip GPS",
          value:
            "Email, WhatsApp docs, Google Drive, Dropbox, forums, blogs",
        },
        risk: "Every time you share a photo outside of Instagram/Facebook, assume the GPS data is intact.",
      },
      {
        id: "stalking",
        label: "Real Risks",
        icon: "Warning",
        color: "#f472b6",
        title: "Location metadata has real consequences",
        description:
          "There are documented cases of stalking, burglary, and harassment enabled by photo GPS metadata. Posting vacation photos reveals you're away from home. Sharing photos of valuable items reveals where they're stored.",
        example: {
          label: "Real-world scenarios",
          value:
            "Vacation posts \u2192 home known to be empty | Pet photos \u2192 home address",
        },
        risk: "This isn't theoretical. Law enforcement agencies regularly extract GPS data from photos in investigations.",
      },
    ],
    seoContent: {
      heading: "Why remove GPS location data from your photos?",
      paragraphs: [
        "Every photo taken with a smartphone contains embedded GPS coordinates that pinpoint exactly where the photo was taken, often accurate to within a few meters. This data is stored in the EXIF metadata of the image file and travels with the photo when you share it.",
        "While major social media platforms like Instagram and Facebook strip location data on upload, many other sharing methods do not. Email attachments, messaging apps (when sending as files), cloud storage links, forum posts, and personal websites all preserve GPS coordinates by default.",
        "The privacy implications are significant. A photo taken at home reveals your home address. Photos taken over time reveal your daily patterns: where you work, eat, exercise, and socialize. For public figures, journalists, activists, and domestic abuse survivors, this data can be genuinely dangerous.",
        "MetaStrip removes all GPS and location data from your photos before you share them. Processing happens entirely in your browser; your photos and location data are never uploaded anywhere. It's the most private way to strip location metadata from images.",
      ],
    },
    supportedFormats: [
      {
        ext: "JPEG",
        desc: "Full GPS suite: coordinates, altitude, speed, direction, timestamps",
        color: "#ff4d6a",
      },
      {
        ext: "PNG",
        desc: "GPS data in tEXt/iTXt chunks and XMP",
        color: "#38bdf8",
      },
      {
        ext: "WebP",
        desc: "EXIF GPS data, XMP location metadata",
        color: "#4ade80",
      },
    ],
    batchCta: {
      text: "Strip Files Free \u2192",
      subtext:
        "Up to 20 files per batch. No account, no upload, no cost.",
    },
    metaTitle:
      "Remove GPS Location from Photos: Free & Private | MetaStrip",
    metaDescription:
      "Strip GPS coordinates, altitude, and timezone from photos before sharing. 100% in your browser. Free, no upload, no account.",
  },

  "remove-metadata-before-sharing": {
    slug: "remove-metadata-before-sharing",
    keyword: "remove metadata before sharing online",
    title: "Remove Metadata Before Sharing Online",
    subtitle:
      "Clean hidden data from photos and documents before uploading, emailing, or posting; protect your privacy in seconds.",
    heroLabel: "CLEAN FILES BEFORE SHARING: FREE, NOTHING UPLOADED",
    acceptedTypes: [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/heic",
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ],
    acceptedLabel: "Images \u00b7 PDFs \u00b7 DOCX \u00b7 XLSX \u00b7 PPTX",
    fileIcon: "ShieldCheck",
    metadataCategories: [
      {
        category: "gps",
        icon: "MapPin",
        color: "#ff4d6a",
        label: "Location Data",
        fields: [
          {
            label: "GPS Coordinates",
            value: "51.5074\u00b0 N, 0.1278\u00b0 W",
          },
          { label: "Altitude", value: "24m" },
        ],
      },
      {
        category: "author",
        icon: "User",
        color: "#f472b6",
        label: "Identity & Authorship",
        fields: [
          { label: "Photo Artist", value: "Emma Richardson" },
          { label: "Document Author", value: "Emma Richardson" },
          { label: "Company", value: "Meridian Consulting" },
          { label: "Last Editor", value: "Tom Park" },
        ],
      },
      {
        category: "device",
        icon: "DeviceMobile",
        color: "#a78bfa",
        label: "Device Fingerprints",
        fields: [
          { label: "Camera", value: "Google Pixel 8 Pro" },
          { label: "Serial", value: "29ADP..." },
          {
            label: "Software",
            value: "Microsoft Word / Adobe Acrobat",
          },
        ],
      },
      {
        category: "dates",
        icon: "CalendarBlank",
        color: "#38bdf8",
        label: "Timestamps",
        fields: [
          { label: "Photo Taken", value: "2025-02-20 11:38:00" },
          { label: "Doc Created", value: "2024-09-14 08:22:00" },
          { label: "Doc Modified", value: "2025-03-01 17:05:00" },
          { label: "Total Editing Time", value: "1,247 minutes" },
        ],
      },
      {
        category: "comments",
        icon: "ChatText",
        color: "#fbbf24",
        label: "Comments & Revisions",
        fields: [
          {
            label: "Comments",
            value: "6 comments across 3 reviewers",
          },
          { label: "Tracked Changes", value: "Revision 31" },
        ],
      },
    ],
    explainerTabs: [
      {
        id: "photos",
        label: "Photos",
        icon: "ImageSquare",
        color: "#a78bfa",
        title: "What photos reveal about you",
        description:
          "Every phone photo carries your GPS location, device model, serial number, and the exact date and time. Share a photo by email or on a forum and all of this travels with it. Major social platforms strip some data, but email, cloud storage, and most websites do not.",
        example: {
          label: "A single photo contains",
          value:
            "GPS coords + device serial + your name + timestamp + camera settings",
        },
        risk: "A casual photo shared via email can reveal your home address, device identity, and daily routine.",
      },
      {
        id: "documents",
        label: "Documents",
        icon: "FileText",
        color: "#f472b6",
        title: "What documents reveal about you",
        description:
          "PDFs and Office documents embed the author's name, company, every editor's identity, creation/modification dates, total editing time, comments, tracked changes, and the software used. Templates can carry metadata from whoever originally created them.",
        example: {
          label: "A typical DOCX contains",
          value:
            "Author + company + 3 editors + 47 revisions + 14 hours editing time",
        },
        risk: "Sharing a contract or proposal can reveal your internal review process, deleted content, and colleague names.",
      },
      {
        id: "where",
        label: "Where It Leaks",
        icon: "Globe",
        color: "#38bdf8",
        title: "Platforms that preserve metadata",
        description:
          "Not all platforms strip metadata. Email (Gmail, Outlook, etc.) preserves everything. So do cloud storage links (Google Drive, Dropbox, OneDrive), messaging apps when sending as files, forums, personal websites, and job application portals.",
        example: {
          label: "High-risk sharing methods",
          value:
            "Email attachments, Drive links, Dropbox, forums, job portals",
        },
        risk: "Any file shared outside of Instagram/Facebook should be assumed to carry full metadata.",
      },
      {
        id: "gdpr",
        label: "Compliance",
        icon: "Scales",
        color: "#4ade80",
        title: "GDPR and legal obligations",
        description:
          "Under GDPR, metadata containing personal data (names, locations, device IDs) is subject to data protection requirements. Organizations sharing documents externally may be required to scrub metadata to comply with privacy regulations.",
        example: {
          label: "Regulatory context",
          value:
            "GDPR Art. 5(1)(c), data minimization principle",
        },
        risk: "Sharing documents with unnecessary personal metadata can constitute a GDPR compliance failure.",
      },
    ],
    seoContent: {
      heading:
        "Why should you remove metadata before sharing files online?",
      paragraphs: [
        "Every digital file carries hidden metadata: information about who created it, when, where, and with what tools. For photos, this includes GPS coordinates and camera details. For documents, it includes author names, company information, editing history, and sometimes deleted content that was never meant to be shared.",
        "When you share files by email, cloud storage, messaging apps, or upload them to websites, this metadata typically travels with the file. While some social media platforms strip certain metadata, most sharing methods preserve it completely.",
        "The risks range from privacy concerns (your home address extracted from a photo's GPS data) to professional embarrassment (a client discovering your document was originally created by a competitor) to legal liability (tracked changes revealing privileged negotiation strategy).",
        "MetaStrip is a universal metadata removal tool that handles photos, PDFs, and Office documents. All processing happens in your browser; your files are never uploaded anywhere. Strip metadata from any file in seconds before sharing it with the world.",
      ],
    },
    supportedFormats: [
      {
        ext: "JPEG",
        desc: "EXIF, IPTC, XMP, GPS, AI tags, thumbnails",
        color: "#a78bfa",
      },
      {
        ext: "PNG",
        desc: "tEXt, iTXt, zTXt chunks, XMP metadata",
        color: "#38bdf8",
      },
      {
        ext: "PDF",
        desc: "Author, creator, producer, dates, custom properties",
        color: "#f472b6",
      },
      {
        ext: "DOCX",
        desc: "Author, comments, tracked changes, revisions, template data",
        color: "#fbbf24",
      },
      {
        ext: "XLSX",
        desc: "Author, company, dates, custom properties",
        color: "#4ade80",
      },
      {
        ext: "PPTX",
        desc: "Author, company, dates, comments, speaker notes metadata",
        color: "#06b6d4",
      },
    ],
    batchCta: {
      text: "Strip Files Free \u2192",
      subtext:
        "Up to 20 files per batch. No account, no upload, no cost.",
    },
    metaTitle:
      "Remove Metadata Before Sharing: Photos, PDFs & Docs | MetaStrip",
    metaDescription:
      "Clean hidden metadata from photos, PDFs, and Office docs before sharing. GPS, author, timestamps, gone in seconds. Free, browser-based.",
  },
};

// ============================================================
// HELPERS
// ============================================================

export const SEO_SLUGS = Object.keys(SEO_PAGE_CONFIGS);

export function getSEOConfig(slug: string): SEOPageConfig | null {
  return SEO_PAGE_CONFIGS[slug] ?? null;
}
