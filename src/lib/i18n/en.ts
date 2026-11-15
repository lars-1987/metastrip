import { BATCH_LIMIT } from "../constants";
import { FAQS } from "../../components/shared/faq-data";

/* The site's interface text, in English: the source the other languages
   follow. es.ts and de.ts are typed as `Messages`, so a string missing from
   either fails the typecheck. English here must read exactly as the page did
   before translation (MS-6): the homepage copy is fixed while MS-5 runs.

   Functions are for text built around numbers or names. They never receive
   file contents, only counts and the file's own name. */

const list = (items: string[]) =>
  items.length <= 1 ? items.join("") : `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;

export const en = {
  nav: {
    blog: "Blog",
    pricing: "Pricing",
    about: "About",
    github: "GitHub",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    tagline: "Nothing ever leaves your browser",
    language: "Language",
    lightMode: "Switch to light mode",
    darkMode: "Switch to dark mode",
  },

  hero: {
    scroll: "scroll ↓",
    /** "Hidden in every [item] / you share." The item cycles; `after` is underlined. */
    before: "Hidden in every ",
    items: ["GPS coordinate", "device fingerprint", "author name", "AI generation tag", "creation timestamp", "camera serial"],
    after: "you share.",
    intro: "GPS, EXIF, AI tags, author names, gone in seconds. 100% in your browser.",
    tryAbove: "Try it above",
  },

  how: {
    eyebrow: "How it works",
    title: ["Privacy is in the details.", "Specifically, the metadata."],
    features: [
      {
        eyebrow: "What's hidden",
        title: "Every file you share is talking.",
        body: "Photos carry GPS coordinates, device serial numbers, camera info, and timestamps. PDFs carry author names, edit history, and software fingerprints. AI-generated images carry C2PA content credentials identifying which tool made them.",
        bullets: [
          "GPS to within 5 metres of where you stood",
          "Device + serial number that fingerprints every photo to one phone",
          "AI generation tags from DALL·E, Midjourney, ChatGPT, Firefly",
          "Author names + tracked changes in Word, Excel, and PDF documents",
        ],
      },
      {
        eyebrow: "How it works",
        title: "Drop a file. See what's exposed. Strip it.",
        body: "MetaStrip runs entirely in your browser. There is no upload, no server, no temporary cache. You drop the file in, the tool reads its metadata locally with its own parsers and libraries like pdf-lib, shows you exactly what's embedded, and writes a clean copy back out.",
        bullets: [
          "Files never leave your device, verifiable in DevTools",
          `Batch up to ${BATCH_LIMIT} files at once`,
          "Open source under MIT. The code is on GitHub.",
          "Works on mobile and desktop, online or offline",
        ],
      },
      {
        eyebrow: "When to use it",
        title: "Before you share anything you didn't write yourself.",
        body: "Anywhere a file leaves your device is somewhere your metadata follows. Contracts to opposing counsel, photos to forums or marketplaces, AI-generated work to clients, journalism submissions, anything posted under a pseudonym.",
        bullets: [
          "Before posting photos taken at home",
          "Before sending a Word doc with revision history to a client",
          "Before submitting AI-assisted work where disclosure changes acceptance",
          "Before publishing anything anonymously: devices fingerprint themselves",
        ],
      },
    ],
  },

  faq: {
    eyebrow: "FAQ",
    title: "Questions? Answers.",
    intro: "Everything people usually ask about how the tool works, what it does to your files, and what happens to your data.",
    items: FAQS,
    emailUs: "Email us",
  },

  footer: {
    brand: "Hidden metadata in your files: GPS, EXIF, AI tags, author names, gone in seconds. 100% in your browser. Free, open source.",
    builtWith: "Built with",
    inMelbourne: "in Melbourne",
    by: "by",
    tagline: "MetaStrip · your files never leave your device.",
    mitLicensed: "MIT licensed",
    tools: "Tools",
    articles: "Articles",
    site: "Site",
    home: "Home",
    blog: "Blog",
    about: "About",
    pricing: "Pricing",
    privacy: "Privacy & Terms",
    terminal: "Prefer the terminal?",
    email: "Email",
  },

  categories: {
    gps: { label: "GPS & Location", info: "The exact spot the photo or video was taken, often accurate to a few metres. Enough to pinpoint your home, workplace, or wherever you were." },
    device: { label: "Device & Camera", info: "The make, model, and serial of the device that made the file. Acts as a fingerprint that links all your files back to one device." },
    dates: { label: "Dates & Timestamps", info: "When the file was created and last edited, often down to the second and timezone, which can reveal your routine and rough location." },
    author: { label: "Author & Identity", info: "Names, usernames, or creator credits embedded by your device or editing software." },
    software: { label: "Software & App Info", info: "Which app and version processed the file. Fingerprints the tools and operating system you use." },
    ai: { label: "AI Generation Tags", info: "Provenance markers (like C2PA) that flag the file as AI-generated and name the tool that produced it." },
    copyright: { label: "Copyright & Rights", info: "Copyright notices and rights information stored inside the file." },
    comments: { label: "Comments & Changes", info: "Comments, tracked changes, and revision notes left behind in the document." },
    custom: { label: "Custom Properties", info: "Other embedded fields: resolution, camera settings, thumbnails, app-specific tags, and assorted technical leftovers." },
  },

  dropzone: {
    reading: "Reading your files…",
    dropHere: "Drop them right here.",
    prompt: "Drag & drop your files, or click to browse. Everything is processed in your browser. No uploads to external servers.",
    choose: "Choose files",
  },

  files: {
    reading: (done: number, total: number, large: boolean) =>
      `reading ${done} of ${total}…${large ? " large batch, this takes a moment" : ""}`,
    count: (n: number) => `${n} ${n === 1 ? "file" : "files"}`,
    tapToReview: "· tap to review each",
    skipped: (names: string[]) => {
      const shown = names.slice(0, 2).join(", ");
      const more = names.length > 2 ? ` and ${names.length - 2} more` : "";
      return `Skipped ${names.length} ${names.length === 1 ? "file" : "files"} MetaStrip can't read yet: ${shown}${more}.`;
    },
    notRead: " · not read",
    remove: (name: string) => `Remove ${name}`,
    processing: "Processing",
    done: "Done",
    notReadLabel: "Not read",
  },

  review: {
    foundIn: "Found in",
    removeAll: "Remove all",
    locked: "This file is locked.",
    unreadable: "This file could not be read.",
    unchecked: "Nothing was changed, and we cannot tell you whether it carries metadata, so treat it as unchecked rather than clean.",
    knowPassword: "Know the password? ",
    unlockLink: "Unlock it with SanctumPDF",
    unlockRestPermissions: ", leaving the password blank. It's a free tool from the maker of MetaStrip that also runs in your browser, so the file stays on your device.",
    unlockRestPassword: ", which is a free tool from the maker of MetaStrip that also runs in your browser, so the file and password stay on your device.",
    lookInto: "Want us to look into it?",
    emailLink: (email: string) => `Email ${email}`,
    emailRest: ". We fill in the error details, and you don't need to attach the file.",
    clean: "No removable metadata found. This file is already clean, so you can share the original as it is.",
    fieldCount: (n: number) => `${n} field${n !== 1 ? "s" : ""}`,
    more: (n: number) => `+${n} more`,
    acrossAll: "applies your selection across all files",
    removing: "Removing…",
    tryAnother: "Try another file",
    checkAnother: "Check another file",
    removeAllMetadata: "Remove all metadata",
    removeSelected: (fileCount: number, selected: number) =>
      `Remove selected${fileCount > 1 ? ` · ${fileCount} files` : ` (${selected})`}`,
    location: "Location",
    embeddedInFile: "embedded in file",
    locationInfo: "This map is drawn in your browser from a built-in world map; your coordinates are never sent anywhere to render it. Nothing about your location leaves your device.",
    mapLabel: (where: string) => `Map showing the photo's location at ${where}`,
    whatIsThis: "What is this?",
  },

  report: {
    rechecking: (one: boolean) => `Re-checking the cleaned ${one ? "file" : "files"}…`,
    leftoversOne: "Re-checking found metadata still in the cleaned file. Details below.",
    leftoversMany: (n: number) => `Re-checking found metadata still in ${n} of the files. Details below.`,
    couldntRecheck: (one: boolean) => `The cleaned ${one ? "file" : "files"} couldn't be re-checked.`,
    recheckedSummary: (one: boolean, checked: number, readable: number, kept: boolean) => {
      const what = kept ? "only what you chose to keep is left" : "no metadata left";
      const scope = one ? "the cleaned file" : checked === readable ? `all ${readable} files` : `${checked} of ${readable} files`;
      return `Re-checked ${scope}: ${what}.`;
    },
    markRechecking: "Re-checking",
    markLeftovers: "Metadata still found",
    markRechecked: "Re-checked",
    detailClean: "Re-checked the cleaned file: no metadata left.",
    detailKept: (n: number) =>
      `Re-checked the cleaned file: only the ${n} field${n !== 1 ? "s" : ""} you chose to keep ${n !== 1 ? "are" : "is"} left.`,
    detailLeftovers: (categories: string[]) => `Re-checking the cleaned file still found ${list(categories)}.`,
    detailLeftoversBug: " Don't rely on it yet. This is a MetaStrip bug, and ",
    detailLeftoversIssue: "a GitHub issue",
    detailLeftoversEnd: " helps us fix it.",
    detailSkipped: "This file is too large to re-check automatically.",
    detailUnchecked: "The cleaned file couldn't be re-read to double-check it.",
    download: (many: boolean) => `Download clean ${many ? "files (.zip)" : "file"}`,
    nothingCleaned: "Nothing was cleaned",
    removed: "Metadata removed",
    nothingLeft: "Nothing left to remove",
    allFailed: (failed: number) => `${failed === 1 ? "This file" : `All ${failed} files`} could not be read, so nothing was changed.`,
    cleaned: (n: number) => `${n} file${n !== 1 ? "s" : ""} cleaned, in your browser.`,
    someFailed: (n: number) => ` ${n} could not be read and ${n === 1 ? "was" : "were"} left unchanged.`,
    saveOrShare: "Save or share",
    fieldsRemoved: "Fields removed",
    fieldsKept: "Fields kept",
    sizeSaved: "Size saved",
    notRead: "not read",
    removedCount: (n: number) => `−${n} removed`,
    noneRemoved: "No fields were removed from this file.",
    startOver: "Start over",
    tipJar: "Tip jar",
    star: "Star on GitHub",
  },

  /** Why a file couldn't be read, by kind. English shows the processor's own
   *  message instead (often more specific); the other languages use these. */
  errors: {
    lockedPassword: "It's password-protected, and MetaStrip can't change a locked file without breaking it. Unlock it with its password first, then add the unlocked copy.",
    lockedPermissions: "It opens without a password but is locked against changes, and MetaStrip can't change a locked file without breaking it. Remove the lock first, then add the unlocked copy.",
    lockedUnknown: "It's encrypted, and MetaStrip can't change a locked file without breaking it. Remove the protection first, then add the unlocked copy.",
    browser: "Your browser couldn't open it. If you just downloaded it, make sure the download has finished, or save it to a folder on this device (not a cloud-only one) and try again.",
    damaged: "It may be damaged, or use a variant of the format MetaStrip doesn't handle yet.",
  },

  /** Messages the tool's hook shows: what it couldn't take, and saving. */
  tool: {
    /** Format labels when every refused file was a format MetaStrip knows by
     *  name ("TIFF"), null when any wasn't. Same words as notSupportedYet. */
    unsupported: (labels: string[] | null) =>
      labels && labels.length > 0 ? `${labels.join(" and ")} files aren't supported yet.` : "Those file types aren't supported yet.",
    batchLimit: `Up to ${BATCH_LIMIT} files at a time.`,
    tooBigPhone: (size: string, cap: string, computerCap: string) =>
      `That file is ${size}. Up to ${cap} on a phone; on a computer, videos can be up to ${computerCap}.`,
    tooBigFile: (size: string, cap: string) => `That file is ${size}. Up to ${cap} at a time.`,
    tooBigBatch: (size: string, cap: string) => `That batch is ${size}. Up to ${cap} at a time, so try fewer files at once.`,
    downloadFailed: "Download failed; please reload and try again.",
    shareFailed: "Sharing didn't work here; use Download instead.",
  },
};

export type Messages = typeof en;
