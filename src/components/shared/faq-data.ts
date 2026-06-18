export interface FAQItem {
  question: string;
  answer: string;
}

export const FAQS: FAQItem[] = [
  {
    question: "Are my files actually private?",
    answer:
      "Yes. Every file is processed entirely in your browser using JavaScript. Nothing is uploaded, nothing is cached on a server, nothing is sent anywhere. You can verify this yourself: open DevTools → Network tab → process a file → watch zero requests fire. The whole tool ships with the page on first load and runs locally from then on.",
  },
  {
    question: "What metadata does MetaStrip remove?",
    answer:
      "Photos: GPS coordinates, EXIF (camera make, model, serial number, settings), IPTC, XMP, C2PA content credentials, AI generation tags, embedded thumbnails, and timestamps. PDFs: author, creator app, producer, title, subject, keywords, custom properties, and timestamps. Word/Excel/PowerPoint: author, last-modified-by, company, tracked changes, comments, revision history, and template metadata. Video (MP4/MOV/M4V): GPS coordinates, device make/model/software, handler vendor IDs, creation and track timestamps, and tool fingerprints in udta/meta atoms. Audio (MP3/M4A/FLAC/WAV): ID3v1 and ID3v2 tags, Vorbis comments, embedded album art, RIFF LIST/INFO chunks, Broadcast Wave (bext) extensions, and iXML metadata. The full per-file-type breakdown is on the privacy page.",
  },
  {
    question: "What file types are supported?",
    answer:
      "Images: JPEG, PNG, WebP. Documents: PDF, Word (.docx), Excel (.xlsx), PowerPoint (.pptx). Video: MP4, MOV, M4V. Audio: MP3, M4A, FLAC, WAV. HEIC, TIFF, GIF, and additional document formats are on the roadmap.",
  },
  {
    question: "Is MetaStrip really free?",
    answer:
      "Yes. No ads, no tracking, no signup, no upload limits, no premium tier. The source is open on GitHub under MIT license. If the tool helps you, you can buy me a coffee on Ko-fi, completely optional, never required to use anything.",
  },
  {
    question: "Will stripping metadata change how my file looks?",
    answer:
      "No. Image content, document content, and quality stay exactly the same. Only the hidden metadata is removed. File size will drop slightly because that metadata is no longer present (typically a few KB per photo, sometimes more for AI-generated images that carry large C2PA manifests).",
  },
  {
    question: "How is this different from my phone's built-in 'remove location' option?",
    answer:
      "iPhone and Android photo apps remove GPS coordinates but keep most other metadata: device model, serial number, software version, edit history, camera settings, AI generation tags, and timestamps. MetaStrip removes all of it, and works on PDFs and Office documents too, not just photos. It also shows you exactly what was embedded before you strip it, so you can see what your files were leaking.",
  },
  {
    question: "What about AI-generated images?",
    answer:
      "AI tools like DALL·E, Midjourney, ChatGPT image generation, and Adobe Firefly embed C2PA 'content credentials' that cryptographically identify images as AI-generated. MetaStrip strips these alongside the rest of the metadata. Worth knowing: this removes metadata-based AI markers but does not remove pixel-level steganographic watermarks like Google's SynthID; those are embedded in the image data itself, not in the metadata, and require different techniques.",
  },
  {
    question: "Is MetaStrip open source?",
    answer:
      "Yes: MIT licensed, source code on GitHub. You can audit the code, run it locally, fork it, or contribute. The whole tool is built with public libraries (piexifjs, pdf-lib, jszip) so you can verify exactly what it does to your files.",
  },
  {
    question: "Can I batch process multiple files?",
    answer:
      "Yes: drop up to 20 files at once. Each is processed independently in the browser, and you can download them individually or as a single zip. Batch limits exist purely because browser memory is finite, not because we're holding back features.",
  },
  {
    question: "Does it work on mobile?",
    answer:
      "Yes. The full tool runs on iOS and Android browsers. The tool stays the same, the layout adapts.",
  },
];
