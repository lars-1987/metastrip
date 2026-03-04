import { useState, useCallback, useRef } from "react";

// ============================================================
// ALL SEO LANDING PAGE CONFIGS
// Each config powers a unique /slug page targeting specific keywords
// ============================================================

const PAGE_CONFIGS = {
  "remove-author-from-pdf": {
    slug: "remove-author-from-pdf",
    keyword: "remove author from PDF",
    title: "Remove Author from PDF",
    subtitle: "Strip author names, creator applications, company info, and hidden document properties from PDF files — instantly, in your browser.",
    heroLabel: "FREE TOOL — FILES STAY ON YOUR DEVICE",
    acceptedTypes: ["application/pdf"],
    acceptedLabel: "PDF files",
    fileIcon: "📄",
    metadataCategories: [
      { category: "author", icon: "👤", color: "#f472b6", label: "Author & Identity", fields: [
        { label: "Author", value: "Sarah Mitchell" },
        { label: "Title", value: "Q4 Revenue Forecast — CONFIDENTIAL" },
        { label: "Subject", value: "Internal Finance Review" },
        { label: "Keywords", value: "revenue, forecast, board, confidential" },
      ]},
      { category: "software", icon: "💻", color: "#818cf8", label: "Software & Producer", fields: [
        { label: "Creator", value: "Microsoft Word 2024" },
        { label: "Producer", value: "macOS 14.3 Quartz PDFContext" },
      ]},
      { category: "dates", icon: "📅", color: "#38bdf8", label: "Dates & Timestamps", fields: [
        { label: "Created", value: "2025-01-08T09:14:22Z" },
        { label: "Modified", value: "2025-02-18T16:42:07Z" },
      ]},
      { category: "custom", icon: "🏷️", color: "#fbbf24", label: "Custom Properties", fields: [
        { label: "Company", value: "Nexus Financial Group" },
        { label: "Department", value: "Corporate Strategy" },
        { label: "Classification", value: "Internal Only" },
      ]},
    ],
    explainerTabs: [
      {
        id: "author", label: "Author", icon: "👤", color: "#f472b6",
        title: "Your name is in every PDF",
        description: "PDF files embed the author name from your computer's user account or the application that created them. When you send a PDF externally, the recipient can see exactly who created it — and every person who edited it.",
        example: { label: "What's hidden", value: "Author: Sarah Mitchell | Company: Nexus Financial Group" },
        risk: "Sending a 'confidential' document? The author field reveals exactly who wrote it and where they work.",
      },
      {
        id: "software", label: "Software", icon: "💻", color: "#818cf8",
        title: "Your tools reveal your setup",
        description: "The creator application and PDF producer fields reveal your operating system, software version, and the exact workflow used to generate the file. This is a goldmine for social engineering.",
        example: { label: "What's hidden", value: "Creator: Microsoft Word 2024 | Producer: macOS 14.3 Quartz" },
        risk: "Attackers can target vulnerabilities specific to your OS and software versions.",
      },
      {
        id: "dates", label: "Timestamps", icon: "📅", color: "#38bdf8",
        title: "When the document was created and changed",
        description: "Creation and modification timestamps reveal your work patterns, timezone, and how long a document has been in development. A 'freshly prepared' report might show a creation date from months ago.",
        example: { label: "What's hidden", value: "Created: Jan 8, 2025 09:14 | Modified: Feb 18, 2025 16:42" },
        risk: "Timestamps can contradict claims about when work was done — risky in legal and compliance contexts.",
      },
      {
        id: "company", label: "Company", icon: "🏢", color: "#fbbf24",
        title: "Your organization's fingerprint",
        description: "Company name, department, document classification, and custom properties set by your IT department are all embedded. Templates often carry metadata from whoever created the template originally.",
        example: { label: "What's hidden", value: "Company: Nexus Financial Group | Dept: Corporate Strategy" },
        risk: "Recycled templates can leak another organization's name and internal classifications into your documents.",
      },
    ],
    seoContent: {
      heading: "Why remove author information from PDFs?",
      paragraphs: [
        "PDF documents store author names, company information, and creation details in hidden metadata fields. This data is set automatically by your operating system and the software used to create the file — most people never realize it's there.",
        "When sharing PDFs with clients, partners, or the public, this metadata can reveal sensitive information: who wrote the document, which company produced it, what software was used, and exactly when it was created and last modified.",
        "For legal professionals, this is particularly critical. Court filings, contracts, and privileged documents should never carry metadata that could reveal work product or privileged communications. For businesses, leaked company names in recycled templates can be embarrassing or even breach confidentiality agreements.",
        "MetaStrip removes all author and document metadata from PDFs instantly, directly in your browser. Your files are never uploaded — processing happens entirely on your device using pdf-lib, an open-source JavaScript PDF library.",
      ],
    },
    supportedFormats: [
      { ext: "PDF", desc: "Author, title, subject, keywords, creator, producer, dates, custom properties", color: "#f472b6" },
    ],
    batchCta: { text: "Document Batch — $4.99", subtext: "Up to 25 documents with selective removal and audit report" },
  },

  "strip-exif-data": {
    slug: "strip-exif-data",
    keyword: "strip EXIF data online",
    title: "Strip EXIF Data Online",
    subtitle: "Remove EXIF, IPTC, XMP, and all embedded metadata from photos — free, private, no upload required.",
    heroLabel: "FREE EXIF REMOVER — 100% CLIENT-SIDE",
    acceptedTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
    acceptedLabel: "JPEG · PNG · WebP · GIF",
    fileIcon: "🖼",
    metadataCategories: [
      { category: "gps", icon: "📍", color: "#ff4d6a", label: "GPS / EXIF Location", fields: [
        { label: "GPSLatitude", value: "40.7484° N" },
        { label: "GPSLongitude", value: "73.9857° W" },
        { label: "GPSAltitude", value: "86m" },
        { label: "GPSSpeed", value: "0.12 km/h" },
      ]},
      { category: "device", icon: "📱", color: "#a78bfa", label: "EXIF Camera Data", fields: [
        { label: "Make", value: "Canon" },
        { label: "Model", value: "EOS R5" },
        { label: "LensModel", value: "RF 24-70mm F2.8 L IS USM" },
        { label: "SerialNumber", value: "032024001..." },
        { label: "ShutterCount", value: "48,291" },
      ]},
      { category: "dates", icon: "📅", color: "#38bdf8", label: "EXIF Timestamps", fields: [
        { label: "DateTimeOriginal", value: "2025:03:12 08:41:22" },
        { label: "DateTimeDigitized", value: "2025:03:12 08:41:22" },
        { label: "SubSecTimeOriginal", value: "082" },
      ]},
      { category: "software", icon: "💻", color: "#818cf8", label: "Processing Software", fields: [
        { label: "Software", value: "Adobe Lightroom Classic 14.1" },
        { label: "ProcessingHistory", value: "3 edits applied" },
      ]},
      { category: "author", icon: "👤", color: "#f472b6", label: "IPTC Creator", fields: [
        { label: "Artist", value: "James Chen Photography" },
        { label: "Copyright", value: "© 2025 James Chen" },
        { label: "Credit", value: "James Chen / Shutterstock" },
      ]},
    ],
    explainerTabs: [
      {
        id: "exif", label: "EXIF", icon: "📸", color: "#a78bfa",
        title: "The full EXIF specification",
        description: "EXIF (Exchangeable Image File Format) is the most comprehensive metadata standard in photography. It stores camera settings, GPS coordinates, orientation, color space, thumbnails, and dozens of technical parameters — all embedded invisibly in your image file.",
        example: { label: "Typical EXIF payload", value: "40-80 metadata fields per photo | 10-50KB of hidden data" },
        risk: "A single EXIF dump reveals your camera serial number, exact location, and complete shooting parameters.",
      },
      {
        id: "iptc", label: "IPTC", icon: "📝", color: "#38bdf8",
        title: "Editorial and copyright data",
        description: "IPTC metadata is used by news agencies and stock photo services to embed creator credits, captions, keywords, and licensing terms. If you've ever submitted photos to a stock platform, this data follows your images everywhere.",
        example: { label: "What's hidden", value: "Creator: James Chen | Credit: Shutterstock | Keywords: urban, night" },
        risk: "IPTC data can link 'anonymous' photos back to your stock photography profile or real name.",
      },
      {
        id: "xmp", label: "XMP", icon: "📦", color: "#06b6d4",
        title: "Adobe's extensible metadata",
        description: "XMP (Extensible Metadata Platform) is Adobe's metadata framework embedded in images processed by Lightroom, Photoshop, and Camera Raw. It contains editing history, ratings, collections, and custom tags.",
        example: { label: "What's hidden", value: "xmp:CreatorTool: Lightroom Classic 14.1 | xmp:Rating: 4" },
        risk: "XMP reveals your complete editing workflow, software versions, and how you organize your photo library.",
      },
      {
        id: "thumbnail", label: "Thumbnails", icon: "🖼️", color: "#f472b6",
        title: "Hidden preview images",
        description: "JPEG files often contain an embedded thumbnail that was generated when the photo was first taken. If you cropped or edited the photo later, the original uncropped thumbnail may still be inside the file.",
        example: { label: "What's hidden", value: "160×120 JPEG thumbnail — may show original uncropped image" },
        risk: "The infamous 'Cat Schwartz incident' — a cropped photo still contained the full uncropped thumbnail.",
      },
    ],
    seoContent: {
      heading: "What is EXIF data and why should you remove it?",
      paragraphs: [
        "EXIF data is a metadata standard that stores technical and contextual information inside image files. Originally designed to help photographers organize their work, EXIF has become a significant privacy concern in the age of smartphone photography and social sharing.",
        "Every photo taken with a modern smartphone or digital camera contains EXIF data. This typically includes GPS coordinates accurate to a few meters, the exact date and time, camera make and model, serial numbers, lens information, and exposure settings. For edited photos, the software used and editing history may also be stored.",
        "While some social media platforms strip EXIF data on upload, many do not — and email, messaging apps, cloud storage, and websites often preserve metadata completely. Once a photo is shared with its EXIF intact, anyone who downloads it can extract your location, device identity, and personal information.",
        "MetaStrip provides comprehensive EXIF removal for JPEG, PNG, and WebP files. All processing happens in your browser — your photos are never uploaded to any server, making MetaStrip the most private EXIF stripping tool available.",
      ],
    },
    supportedFormats: [
      { ext: "JPEG", desc: "Full EXIF, IPTC, XMP, GPS, embedded thumbnails", color: "#a78bfa" },
      { ext: "PNG", desc: "tEXt, iTXt, zTXt metadata chunks, XMP sidecar", color: "#38bdf8" },
      { ext: "WebP", desc: "EXIF, XMP embedded metadata", color: "#4ade80" },
      { ext: "GIF", desc: "Comment extension blocks, XMP", color: "#fbbf24" },
    ],
    batchCta: { text: "Image Batch — $2.99", subtext: "Up to 50 images with selective removal and audit report" },
  },

  "remove-ai-metadata": {
    slug: "remove-ai-metadata",
    keyword: "remove AI metadata from images",
    title: "Remove AI Metadata",
    subtitle: "Strip C2PA content credentials, XMP AI generation tags, and tool fingerprints from Midjourney, DALL-E, Stable Diffusion, and Adobe Firefly images.",
    heroLabel: "STRIP AI FINGERPRINTS — LOW COMPETITION NICHE",
    acceptedTypes: ["image/jpeg", "image/png", "image/webp"],
    acceptedLabel: "JPEG · PNG · WebP",
    fileIcon: "🤖",
    metadataCategories: [
      { category: "ai", icon: "🤖", color: "#c084fc", label: "C2PA Content Credentials", fields: [
        { label: "c2pa.action", value: "c2pa.created" },
        { label: "c2pa.ai_tool", value: "Midjourney v6.1" },
        { label: "c2pa.ai_generated", value: "true" },
        { label: "c2pa.digest", value: "sha256:a4f2e8..." },
      ]},
      { category: "ai", icon: "🏷️", color: "#a78bfa", label: "XMP AI Tags", fields: [
        { label: "xmp:CreatorTool", value: "Midjourney" },
        { label: "dc:description", value: "AI-generated image" },
        { label: "photoshop:Credit", value: "Generated with AI" },
        { label: "Iptc4xmpExt:DigitalSourceType", value: "trainedAlgorithmicMedia" },
      ]},
      { category: "software", icon: "💻", color: "#818cf8", label: "Generation Parameters", fields: [
        { label: "parameters", value: "--v 6.1 --ar 16:9 --style raw" },
        { label: "prompt_hash", value: "d8f3a2b1..." },
        { label: "model_version", value: "6.1" },
      ]},
      { category: "dates", icon: "📅", color: "#38bdf8", label: "Generation Timestamps", fields: [
        { label: "Created", value: "2025-02-28T22:14:08Z" },
        { label: "xmp:MetadataDate", value: "2025-02-28T22:14:08Z" },
      ]},
    ],
    explainerTabs: [
      {
        id: "c2pa", label: "C2PA", icon: "🔐", color: "#c084fc",
        title: "Content credentials mark AI images",
        description: "C2PA (Coalition for Content Provenance and Authenticity) is a technical standard backed by Adobe, Microsoft, Google, and OpenAI. It embeds cryptographic 'content credentials' into AI-generated images that permanently mark them as machine-made.",
        example: { label: "What's embedded", value: "c2pa.ai_generated: true | tool: midjourney-v6.1 | signed manifest" },
        risk: "Social platforms, search engines, and stock sites are beginning to detect and flag C2PA-tagged content automatically.",
      },
      {
        id: "xmp", label: "XMP Tags", icon: "🏷️", color: "#a78bfa",
        title: "AI markers in standard metadata",
        description: "Beyond C2PA, AI tools embed markers in standard XMP and IPTC fields. Midjourney sets CreatorTool, DALL-E adds 'AI generated' descriptions, and Adobe Firefly marks images with the IPTC DigitalSourceType field.",
        example: { label: "What's embedded", value: "Iptc4xmpExt:DigitalSourceType: trainedAlgorithmicMedia" },
        risk: "Even without C2PA, standard metadata readers can identify AI images from these fields.",
      },
      {
        id: "steganography", label: "Invisible Marks", icon: "👁️", color: "#06b6d4",
        title: "Watermarks beyond metadata",
        description: "Some AI tools embed invisible watermarks directly into pixel data (steganographic watermarking). Google's SynthID and Meta's watermarking are examples. These survive metadata stripping, screenshots, and even mild editing.",
        example: { label: "Important note", value: "Pixel-level watermarks cannot be removed by metadata stripping" },
        risk: "MetaStrip removes metadata-based AI tags, but steganographic watermarks require different approaches.",
      },
      {
        id: "detection", label: "AI Detection", icon: "🔍", color: "#f472b6",
        title: "Who's checking for AI metadata?",
        description: "Google Search is experimenting with AI image labels. Adobe Stock rejects AI-tagged submissions. Social platforms including Facebook and Instagram now display 'AI Generated' labels on flagged content. Getty Images bans AI-generated content entirely.",
        example: { label: "Growing enforcement", value: "Google, Meta, Adobe, Getty, Shutterstock — all checking" },
        risk: "Content flagged as AI-generated may be demoted in search, labeled on social media, or rejected by platforms.",
      },
    ],
    seoContent: {
      heading: "Why remove AI metadata from generated images?",
      paragraphs: [
        "AI image generators including Midjourney, DALL-E, Stable Diffusion, and Adobe Firefly now embed metadata that identifies images as AI-generated. This includes C2PA content credentials, XMP AI tags, IPTC digital source type markers, and tool-specific generation parameters.",
        "As platforms increasingly detect and label AI content, this metadata has real consequences. Google is testing AI image labels in search results. Meta displays 'AI Generated' tags on Instagram and Facebook. Stock photo platforms reject AI-tagged submissions. Some job boards and academic institutions check for AI generation markers.",
        "MetaStrip removes all metadata-based AI identification tags from your images. This includes C2PA manifests, XMP AI markers, IPTC DigitalSourceType fields, and embedded generation parameters. Processing happens entirely in your browser — no upload required.",
        "Important note: MetaStrip removes metadata tags, not steganographic watermarks. Some AI tools embed invisible pixel-level watermarks (like Google's SynthID) that survive metadata removal. For most use cases, metadata removal is sufficient, as the majority of automated detection systems rely on metadata rather than pixel analysis.",
      ],
    },
    supportedFormats: [
      { ext: "JPEG", desc: "C2PA manifests, XMP AI tags, IPTC DigitalSourceType, generation params", color: "#c084fc" },
      { ext: "PNG", desc: "C2PA content credentials, tEXt generation parameters, XMP", color: "#a78bfa" },
      { ext: "WebP", desc: "XMP AI metadata, embedded generation data", color: "#38bdf8" },
    ],
    batchCta: { text: "Image Batch — $2.99", subtext: "Strip AI tags from up to 50 images with audit report" },
  },

  "strip-metadata-from-word-document": {
    slug: "strip-metadata-from-word-document",
    keyword: "strip metadata from Word document",
    title: "Strip Metadata from Word Documents",
    subtitle: "Remove author names, tracked changes, comments, company info, and hidden properties from DOCX files — privately, in your browser.",
    heroLabel: "FREE TOOL — NO UPLOAD, NO ACCOUNT",
    acceptedTypes: ["application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
    acceptedLabel: "DOCX files",
    fileIcon: "📝",
    metadataCategories: [
      { category: "author", icon: "👤", color: "#f472b6", label: "Author & Identity", fields: [
        { label: "Creator", value: "Michael Torres" },
        { label: "Last Modified By", value: "Jennifer Walsh" },
        { label: "Manager", value: "David Kim" },
        { label: "Company", value: "Sterling & Associates LLP" },
      ]},
      { category: "comments", icon: "💬", color: "#fbbf24", label: "Comments & Tracked Changes", fields: [
        { label: "Comments", value: "4 comments by 2 authors" },
        { label: "Tracked Changes", value: "12 revisions tracked" },
        { label: "Revision Number", value: "47" },
        { label: "people.xml", value: "3 people identified" },
      ]},
      { category: "dates", icon: "📅", color: "#38bdf8", label: "Dates & Editing Time", fields: [
        { label: "Created", value: "2024-11-22T10:08:00Z" },
        { label: "Modified", value: "2025-03-01T14:33:00Z" },
        { label: "Total Editing Time", value: "842 minutes" },
      ]},
      { category: "software", icon: "💻", color: "#818cf8", label: "Application & Template", fields: [
        { label: "Application", value: "Microsoft Office Word" },
        { label: "Version", value: "16.0" },
        { label: "Template", value: "Legal_Brief_v3.dotx" },
      ]},
    ],
    explainerTabs: [
      {
        id: "tracked", label: "Tracked Changes", icon: "💬", color: "#fbbf24",
        title: "Deleted text isn't really deleted",
        description: "Tracked changes in Word documents preserve every edit — including text that was deleted. If you 'Accept All Changes' before sharing, the visible text is clean, but the revision history may still be embedded in the XML. A simple unzip reveals everything.",
        example: { label: "What's hidden", value: "12 revisions | Deleted text: 'initial offer of $2.4M was rejected' " },
        risk: "Opposing counsel, competitors, or clients can see your negotiation notes, draft revisions, and deleted content.",
      },
      {
        id: "comments", label: "Comments", icon: "📌", color: "#f472b6",
        title: "Internal commentary exposed",
        description: "Comments from colleagues survive in the DOCX XML even after they appear deleted in Word. Names of commenters, timestamps, and the full comment text remain accessible by unzipping the file.",
        example: { label: "What's hidden", value: "Comment by J. Walsh: 'Should we disclose the Q3 shortfall?'" },
        risk: "Internal strategy discussions, legal concerns, and editorial decisions can be extracted from shared documents.",
      },
      {
        id: "identity", label: "People", icon: "👥", color: "#a78bfa",
        title: "Everyone who touched the document",
        description: "Word documents maintain a list of every person who edited or commented on the file. This includes full names, email addresses in some cases, and the exact timestamps of each person's contributions.",
        example: { label: "What's hidden", value: "3 editors: M. Torres, J. Walsh, D. Kim | Sterling & Associates LLP" },
        risk: "The people.xml file creates a complete audit trail of who was involved in creating a document.",
      },
      {
        id: "template", label: "Templates", icon: "📋", color: "#06b6d4",
        title: "Template metadata leaks",
        description: "Documents created from templates inherit the template's metadata — including the original author and company who created the template. Law firms and consultancies frequently discover they're sending documents with another firm's metadata baked in.",
        example: { label: "What's hidden", value: "Template: Legal_Brief_v3.dotx | Original Author: Baker McKenzie" },
        risk: "A template from a previous employer or competitor embeds their identity into every document you create from it.",
      },
    ],
    seoContent: {
      heading: "Why strip metadata from Word documents before sharing?",
      paragraphs: [
        "Microsoft Word documents (DOCX) store extensive hidden metadata in XML files inside the document package. This includes author names, company information, editing time, revision history, comments, tracked changes, and details about every person who contributed to the document.",
        "For legal professionals, this is a well-known hazard. Court rules in many jurisdictions require metadata scrubbing before filing or exchange. The American Bar Association has issued ethics opinions emphasizing lawyers' duty to remove metadata from documents shared with opposing parties.",
        "Beyond legal contexts, any business sharing Word documents externally risks exposing internal author names, company structure, editing timelines, and deleted content that may still exist in the revision history. Templates inherited from previous employers or partners can embed their metadata into your documents.",
        "MetaStrip opens your DOCX file directly in the browser using JSZip, removes or sanitizes the metadata XML files, and repackages the clean document — all without your file ever leaving your device.",
      ],
    },
    supportedFormats: [
      { ext: "DOCX", desc: "Author, comments, tracked changes, company, template, editing time, revisions, custom properties", color: "#f472b6" },
    ],
    batchCta: { text: "Document Batch — $4.99", subtext: "Up to 25 documents with selective removal and audit report" },
  },

  "remove-gps-location-from-photos": {
    slug: "remove-gps-location-from-photos",
    keyword: "remove GPS location from photos",
    title: "Remove GPS Location from Photos",
    subtitle: "Strip embedded GPS coordinates, altitude, speed, and direction data from your photos before sharing them online.",
    heroLabel: "PROTECT YOUR LOCATION — FREE & PRIVATE",
    acceptedTypes: ["image/jpeg", "image/png", "image/webp"],
    acceptedLabel: "JPEG · PNG · WebP",
    fileIcon: "📍",
    metadataCategories: [
      { category: "gps", icon: "📍", color: "#ff4d6a", label: "GPS Coordinates", fields: [
        { label: "Latitude", value: "34.0522° N" },
        { label: "Longitude", value: "118.2437° W" },
        { label: "Altitude", value: "71m above sea level" },
        { label: "Direction", value: "247.3° (WSW)" },
        { label: "Speed", value: "0.0 km/h" },
        { label: "Map Datum", value: "WGS-84" },
      ]},
      { category: "gps", icon: "🕐", color: "#f97316", label: "GPS Timestamps", fields: [
        { label: "GPS Date", value: "2025:02:15" },
        { label: "GPS Time", value: "19:42:33 UTC" },
        { label: "Offset", value: "-08:00 (PST)" },
      ]},
      { category: "device", icon: "📱", color: "#a78bfa", label: "Device (also location-linked)", fields: [
        { label: "Make", value: "Samsung" },
        { label: "Model", value: "Galaxy S24 Ultra" },
        { label: "Serial", value: "RF8R..." },
      ]},
    ],
    explainerTabs: [
      {
        id: "coords", label: "Coordinates", icon: "📍", color: "#ff4d6a",
        title: "Pinpoint accuracy to your front door",
        description: "Smartphone GPS data embedded in photos is typically accurate to within 3-5 meters. That's enough to identify your exact home address, workplace, gym, school, or any other location you photograph. A single photo can reveal where you live.",
        example: { label: "What's hidden", value: "34.0522° N, 118.2437° W — accurate to ~3 meters" },
        risk: "A photo of your pet, your cooking, or your hobby taken at home reveals your home address to anyone who checks.",
      },
      {
        id: "patterns", label: "Patterns", icon: "🗺️", color: "#f97316",
        title: "Multiple photos map your life",
        description: "One photo reveals one location. A dozen photos reveal your daily routine — where you live, work, eat, exercise, and socialize. Combined with timestamps, they create a detailed timeline of your movements.",
        example: { label: "What 10 photos reveal", value: "Home → Gym (7am) → Office (9am) → Lunch spot → Home (6pm)" },
        risk: "Sharing photos regularly over weeks gives anyone a predictive map of where you'll be and when.",
      },
      {
        id: "platforms", label: "Which Apps Strip?", icon: "🔍", color: "#38bdf8",
        title: "Not every platform protects you",
        description: "Instagram and Facebook strip GPS on upload. But email, WhatsApp (when sending as document), cloud storage (Google Drive, Dropbox), forums, personal websites, and many messaging apps preserve GPS data completely.",
        example: { label: "Platforms that DON'T strip GPS", value: "Email, WhatsApp docs, Google Drive, Dropbox, forums, blogs" },
        risk: "Every time you share a photo outside of Instagram/Facebook, assume the GPS data is intact.",
      },
      {
        id: "stalking", label: "Real Risks", icon: "⚠️", color: "#f472b6",
        title: "Location metadata has real consequences",
        description: "There are documented cases of stalking, burglary, and harassment enabled by photo GPS metadata. Posting vacation photos reveals you're away from home. Sharing photos of valuable items reveals where they're stored.",
        example: { label: "Real-world scenarios", value: "Vacation posts → home known to be empty | Pet photos → home address" },
        risk: "This isn't theoretical. Law enforcement agencies regularly extract GPS data from photos in investigations.",
      },
    ],
    seoContent: {
      heading: "Why remove GPS location data from your photos?",
      paragraphs: [
        "Every photo taken with a smartphone contains embedded GPS coordinates that pinpoint exactly where the photo was taken — often accurate to within a few meters. This data is stored in the EXIF metadata of the image file and travels with the photo when you share it.",
        "While major social media platforms like Instagram and Facebook strip location data on upload, many other sharing methods do not. Email attachments, messaging apps (when sending as files), cloud storage links, forum posts, and personal websites all preserve GPS coordinates by default.",
        "The privacy implications are significant. A photo taken at home reveals your home address. Photos taken over time reveal your daily patterns — where you work, eat, exercise, and socialize. For public figures, journalists, activists, and domestic abuse survivors, this data can be genuinely dangerous.",
        "MetaStrip removes all GPS and location data from your photos before you share them. Processing happens entirely in your browser — your photos and location data are never uploaded anywhere. It's the most private way to strip location metadata from images.",
      ],
    },
    supportedFormats: [
      { ext: "JPEG", desc: "Full GPS suite: coordinates, altitude, speed, direction, timestamps", color: "#ff4d6a" },
      { ext: "PNG", desc: "GPS data in tEXt/iTXt chunks and XMP", color: "#38bdf8" },
      { ext: "WebP", desc: "EXIF GPS data, XMP location metadata", color: "#4ade80" },
    ],
    batchCta: { text: "Image Batch — $2.99", subtext: "Strip GPS from up to 50 photos with full audit report" },
  },

  "remove-metadata-before-sharing": {
    slug: "remove-metadata-before-sharing",
    keyword: "remove metadata before sharing online",
    title: "Remove Metadata Before Sharing Online",
    subtitle: "Clean hidden data from photos and documents before uploading, emailing, or posting — protect your privacy in seconds.",
    heroLabel: "CLEAN YOUR FILES — SHARE SAFELY",
    acceptedTypes: ["image/jpeg", "image/png", "image/webp", "image/gif", "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation"],
    acceptedLabel: "Images · PDFs · DOCX · XLSX · PPTX",
    fileIcon: "🛡️",
    metadataCategories: [
      { category: "gps", icon: "📍", color: "#ff4d6a", label: "Location Data", fields: [
        { label: "GPS Coordinates", value: "51.5074° N, 0.1278° W" },
        { label: "Altitude", value: "24m" },
      ]},
      { category: "author", icon: "👤", color: "#f472b6", label: "Identity & Authorship", fields: [
        { label: "Photo Artist", value: "Emma Richardson" },
        { label: "Document Author", value: "Emma Richardson" },
        { label: "Company", value: "Meridian Consulting" },
        { label: "Last Editor", value: "Tom Park" },
      ]},
      { category: "device", icon: "📱", color: "#a78bfa", label: "Device Fingerprints", fields: [
        { label: "Camera", value: "Google Pixel 8 Pro" },
        { label: "Serial", value: "29ADP..." },
        { label: "Software", value: "Microsoft Word / Adobe Acrobat" },
      ]},
      { category: "dates", icon: "📅", color: "#38bdf8", label: "Timestamps", fields: [
        { label: "Photo Taken", value: "2025-02-20 11:38:00" },
        { label: "Doc Created", value: "2024-09-14 08:22:00" },
        { label: "Doc Modified", value: "2025-03-01 17:05:00" },
        { label: "Total Editing Time", value: "1,247 minutes" },
      ]},
      { category: "comments", icon: "💬", color: "#fbbf24", label: "Comments & Revisions", fields: [
        { label: "Comments", value: "6 comments across 3 reviewers" },
        { label: "Tracked Changes", value: "Revision 31" },
      ]},
    ],
    explainerTabs: [
      {
        id: "photos", label: "Photos", icon: "🖼️", color: "#a78bfa",
        title: "What photos reveal about you",
        description: "Every phone photo carries your GPS location, device model, serial number, and the exact date and time. Share a photo by email or on a forum and all of this travels with it. Major social platforms strip some data, but email, cloud storage, and most websites do not.",
        example: { label: "A single photo contains", value: "GPS coords + device serial + your name + timestamp + camera settings" },
        risk: "A casual photo shared via email can reveal your home address, device identity, and daily routine.",
      },
      {
        id: "documents", label: "Documents", icon: "📄", color: "#f472b6",
        title: "What documents reveal about you",
        description: "PDFs and Office documents embed the author's name, company, every editor's identity, creation/modification dates, total editing time, comments, tracked changes, and the software used. Templates can carry metadata from whoever originally created them.",
        example: { label: "A typical DOCX contains", value: "Author + company + 3 editors + 47 revisions + 14 hours editing time" },
        risk: "Sharing a contract or proposal can reveal your internal review process, deleted content, and colleague names.",
      },
      {
        id: "where", label: "Where It Leaks", icon: "🌐", color: "#38bdf8",
        title: "Platforms that preserve metadata",
        description: "Not all platforms strip metadata. Email (Gmail, Outlook, etc.) preserves everything. So do cloud storage links (Google Drive, Dropbox, OneDrive), messaging apps when sending as files, forums, personal websites, and job application portals.",
        example: { label: "High-risk sharing methods", value: "Email attachments, Drive links, Dropbox, forums, job portals" },
        risk: "Any file shared outside of Instagram/Facebook should be assumed to carry full metadata.",
      },
      {
        id: "gdpr", label: "Compliance", icon: "⚖️", color: "#4ade80",
        title: "GDPR and legal obligations",
        description: "Under GDPR, metadata containing personal data (names, locations, device IDs) is subject to data protection requirements. Organizations sharing documents externally may be required to scrub metadata to comply with privacy regulations.",
        example: { label: "Regulatory context", value: "GDPR Art. 5(1)(c) — data minimization principle" },
        risk: "Sharing documents with unnecessary personal metadata can constitute a GDPR compliance failure.",
      },
    ],
    seoContent: {
      heading: "Why should you remove metadata before sharing files online?",
      paragraphs: [
        "Every digital file carries hidden metadata — information about who created it, when, where, and with what tools. For photos, this includes GPS coordinates and camera details. For documents, it includes author names, company information, editing history, and sometimes deleted content that was never meant to be shared.",
        "When you share files by email, cloud storage, messaging apps, or upload them to websites, this metadata typically travels with the file. While some social media platforms strip certain metadata, most sharing methods preserve it completely.",
        "The risks range from privacy concerns (your home address extracted from a photo's GPS data) to professional embarrassment (a client discovering your document was originally created by a competitor) to legal liability (tracked changes revealing privileged negotiation strategy).",
        "MetaStrip is a universal metadata removal tool that handles photos, PDFs, and Office documents. All processing happens in your browser — your files are never uploaded anywhere. Strip metadata from any file in seconds before sharing it with the world.",
      ],
    },
    supportedFormats: [
      { ext: "JPEG", desc: "EXIF, IPTC, XMP, GPS, AI tags, thumbnails", color: "#a78bfa" },
      { ext: "PNG", desc: "tEXt, iTXt, zTXt chunks, XMP metadata", color: "#38bdf8" },
      { ext: "PDF", desc: "Author, creator, producer, dates, custom properties", color: "#f472b6" },
      { ext: "DOCX", desc: "Author, comments, tracked changes, revisions, template data", color: "#fbbf24" },
      { ext: "XLSX", desc: "Author, company, dates, custom properties", color: "#4ade80" },
      { ext: "PPTX", desc: "Author, company, dates, comments, speaker notes metadata", color: "#06b6d4" },
    ],
    batchCta: { text: "View All Batch Passes", subtext: "Image batch from $2.99 · Document batch from $4.99" },
  },
};

// ============================================================
// HELPER COMPONENTS (shared across all pages)
// ============================================================

function formatBytes(b) {
  if (b < 1024) return b + " B";
  if (b < 1048576) return (b / 1024).toFixed(1) + " KB";
  return (b / 1048576).toFixed(1) + " MB";
}

function AnimatedBackground() {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 0, overflow: "hidden", pointerEvents: "none" }}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 120% 80% at 50% -10%, #1a0533 0%, #09090b 60%)" }} />
      <div style={{ position: "absolute", width: 650, height: 650, borderRadius: "50%", background: "radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)", top: "-5%", right: "-10%", animation: "orbFloat1 22s ease-in-out infinite" }} />
      <div style={{ position: "absolute", width: 450, height: 450, borderRadius: "50%", background: "radial-gradient(circle, rgba(6,182,212,0.07) 0%, transparent 70%)", bottom: "5%", left: "-5%", animation: "orbFloat2 26s ease-in-out infinite" }} />
      <div style={{ position: "absolute", inset: 0, opacity: 0.025, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`, backgroundRepeat: "repeat", backgroundSize: "128px 128px" }} />
    </div>
  );
}

function Logo() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 20px rgba(124,58,237,0.3)" }}>
        <span style={{ fontSize: 18, fontWeight: 800, color: "#fff", fontFamily: "'Outfit', sans-serif", letterSpacing: -1 }}>M</span>
      </div>
      <span style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.03em", fontFamily: "'Outfit', sans-serif", background: "linear-gradient(135deg, #e2e8f0 30%, #a78bfa 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>MetaStrip</span>
    </div>
  );
}

function Nav({ currentSlug, onNavigate }) {
  return (
    <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 50, padding: "16px 24px", background: "rgba(9,9,11,0.7)", backdropFilter: "blur(20px) saturate(1.5)", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <div onClick={() => onNavigate(null)} style={{ cursor: "pointer" }}><Logo /></div>
      <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
        {["Tool", "Pricing", "Blog", "About"].map(link => (
          <span key={link} style={{ fontSize: 14, fontWeight: 500, fontFamily: "'Outfit', sans-serif", color: "rgba(255,255,255,0.4)", cursor: "pointer", transition: "color 0.2s ease" }}
            onMouseEnter={(e) => e.target.style.color = "rgba(255,255,255,0.8)"}
            onMouseLeave={(e) => e.target.style.color = "rgba(255,255,255,0.4)"}
          >{link}</span>
        ))}
        <button style={{ padding: "8px 20px", borderRadius: 8, border: "none", cursor: "pointer", background: "linear-gradient(135deg, #7c3aed, #6d28d9)", color: "#fff", fontSize: 13, fontWeight: 600, fontFamily: "'Outfit', sans-serif", boxShadow: "0 0 20px rgba(124,58,237,0.3), inset 0 1px 0 rgba(255,255,255,0.1)", transition: "all 0.2s ease" }}>Get Batch Pass</button>
      </div>
    </nav>
  );
}

// ============================================================
// INLINE TOOL (adapts to page config)
// ============================================================

function InlineTool({ config }) {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("idle");
  const [visibleFields, setVisibleFields] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef(null);

  const totalFields = config.metadataCategories.reduce((a, c) => a + c.fields.length, 0);

  const handleFile = useCallback((f) => {
    setFile(f); setStatus("scanning"); setVisibleFields(0);
    let count = 0;
    const interval = setInterval(() => { count++; setVisibleFields(count); if (count >= totalFields) { clearInterval(interval); setStatus("found"); } }, 70);
  }, [totalFields]);

  const handleStrip = () => { setStatus("stripping"); setTimeout(() => setStatus("done"), 1200); };
  const handleReset = () => { setFile(null); setStatus("idle"); setVisibleFields(0); };

  let fieldCounter = 0;

  return (
    <div style={{ borderRadius: 24, overflow: "hidden", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", animation: "cardSlideIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.25s both" }}>
      {!file ? (
        <div onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }} onDragLeave={() => setIsDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setIsDragOver(false); const f = Array.from(e.dataTransfer.files)[0]; if (f) handleFile(f); }}
          onClick={() => inputRef.current?.click()}
          style={{ padding: "52px 40px", textAlign: "center", cursor: "pointer", background: isDragOver ? "rgba(124,58,237,0.04)" : "transparent", transition: "all 0.3s ease" }}>
          <input ref={inputRef} type="file" accept={config.acceptedTypes.join(",")} style={{ display: "none" }}
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }} />
          <div style={{ width: 64, height: 64, borderRadius: 18, margin: "0 auto 18px", background: "linear-gradient(135deg, rgba(124,58,237,0.12), rgba(6,182,212,0.08))", border: "1px solid rgba(124,58,237,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>
            {config.fileIcon}
          </div>
          <p style={{ fontSize: 17, fontWeight: 600, color: "rgba(255,255,255,0.85)", fontFamily: "'Outfit', sans-serif", marginBottom: 6 }}>
            Drop a file here to try it
          </p>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", fontFamily: "'Outfit', sans-serif" }}>
            {config.acceptedLabel} — max 25 MB — free, no account
          </p>
        </div>
      ) : (
        <>
          <div style={{ padding: "16px 24px", display: "flex", alignItems: "center", gap: 14, borderBottom: "1px solid rgba(255,255,255,0.04)", background: status === "done" ? "rgba(34,197,94,0.03)" : "transparent", transition: "background 0.5s ease" }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, flexShrink: 0, background: status === "done" ? "rgba(34,197,94,0.1)" : "rgba(124,58,237,0.08)", border: `1px solid ${status === "done" ? "rgba(34,197,94,0.15)" : "rgba(124,58,237,0.12)"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, transition: "all 0.4s ease" }}>
              {status === "done" ? "✓" : status === "stripping" ? <div style={{ width: 16, height: 16, border: "2px solid rgba(124,58,237,0.3)", borderTopColor: "#a78bfa", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} /> : config.fileIcon}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.9)", fontFamily: "'Outfit', sans-serif", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{file.name}</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", fontFamily: "'JetBrains Mono', monospace", marginTop: 2 }}>
                {formatBytes(file.size)}
                {status === "found" && <span style={{ color: "#f87171", marginLeft: 8 }}>⚠ {totalFields} metadata fields exposed</span>}
                {status === "done" && <span style={{ color: "#4ade80", marginLeft: 8 }}>✓ All metadata stripped</span>}
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
              {status === "found" && <button onClick={handleStrip} style={{ padding: "8px 20px", borderRadius: 10, border: "none", cursor: "pointer", background: "linear-gradient(135deg, #7c3aed, #6d28d9)", color: "#fff", fontSize: 13, fontWeight: 600, fontFamily: "'Outfit', sans-serif", boxShadow: "0 0 15px rgba(124,58,237,0.3)" }}>Strip All</button>}
              {status === "done" && <button style={{ padding: "8px 20px", borderRadius: 10, border: "1px solid rgba(34,197,94,0.25)", background: "rgba(34,197,94,0.08)", cursor: "pointer", color: "#4ade80", fontSize: 13, fontWeight: 600, fontFamily: "'Outfit', sans-serif" }}>↓ Download Clean</button>}
              <button onClick={handleReset} style={{ width: 34, height: 34, borderRadius: 8, border: "1px solid rgba(255,255,255,0.06)", background: "transparent", cursor: "pointer", color: "rgba(255,255,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>×</button>
            </div>
          </div>
          <div style={{ padding: "8px 0" }}>
            {config.metadataCategories.map((cat) => {
              const catFields = cat.fields.map(f => { fieldCounter++; return { ...f, visible: fieldCounter <= visibleFields }; });
              if (!catFields.some(f => f.visible) && status === "scanning") return null;
              return (
                <div key={cat.label} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                  <div style={{ padding: "11px 24px", display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 14 }}>{cat.icon}</span>
                    <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.6)", fontFamily: "'Outfit', sans-serif" }}>{cat.label}</span>
                    <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 6, background: `${cat.color}12`, color: cat.color, fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>{catFields.filter(f => f.visible).length}</span>
                  </div>
                  <div style={{ padding: "0 24px 10px 48px" }}>
                    {catFields.map((field, i) => field.visible && (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "5px 0", animation: "fieldFadeIn 0.2s ease both", opacity: status === "done" ? 0.4 : 1, transition: "opacity 0.5s ease" }}>
                        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", fontFamily: "'Outfit', sans-serif" }}>{field.label}</span>
                        <span style={{ fontSize: 12, fontFamily: "'JetBrains Mono', monospace", color: status === "done" ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.55)", textDecoration: status === "done" ? "line-through" : "none", maxWidth: 300, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", transition: "all 0.4s ease" }}>{field.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          {status === "done" && (
            <div style={{ margin: "0 16px 16px", padding: "16px 20px", borderRadius: 14, background: "linear-gradient(135deg, rgba(124,58,237,0.06), rgba(6,182,212,0.03))", border: "1px solid rgba(124,58,237,0.1)", display: "flex", alignItems: "center", justifyContent: "space-between", animation: "cardSlideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)" }}>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.8)", fontFamily: "'Outfit', sans-serif" }}>Need to process more files?</p>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", fontFamily: "'Outfit', sans-serif", marginTop: 2 }}>{config.batchCta.subtext}</p>
              </div>
              <button style={{ padding: "8px 18px", borderRadius: 10, border: "none", cursor: "pointer", background: "linear-gradient(135deg, #7c3aed, #6d28d9)", color: "#fff", fontSize: 12, fontWeight: 600, fontFamily: "'Outfit', sans-serif", flexShrink: 0, boxShadow: "0 0 12px rgba(124,58,237,0.25)" }}>{config.batchCta.text}</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ============================================================
// EXPLAINER TABS
// ============================================================

function ExplainerTabs({ tabs }) {
  const [active, setActive] = useState(tabs[0]?.id);
  const current = tabs.find(t => t.id === active);

  return (
    <div>
      <div style={{ display: "flex", gap: 6, marginBottom: 20, padding: 4, borderRadius: 14, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActive(tab.id)} style={{
            flex: 1, padding: "10px 12px", borderRadius: 10, border: "none", cursor: "pointer",
            background: active === tab.id ? "rgba(255,255,255,0.05)" : "transparent",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 7, transition: "all 0.25s ease",
          }}
            onMouseEnter={(e) => { if (active !== tab.id) e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}
            onMouseLeave={(e) => { if (active !== tab.id) e.currentTarget.style.background = "transparent"; }}
          >
            <span style={{ fontSize: 14 }}>{tab.icon}</span>
            <span style={{ fontSize: 13, fontWeight: 500, fontFamily: "'Outfit', sans-serif", color: active === tab.id ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.35)" }}>{tab.label}</span>
          </button>
        ))}
      </div>
      {current && (
        <div key={current.id} style={{ borderRadius: 20, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", animation: "panelFadeIn 0.35s cubic-bezier(0.16, 1, 0.3, 1)" }}>
          <div style={{ padding: "32px 28px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <span style={{ fontSize: 24 }}>{current.icon}</span>
              <h3 style={{ fontSize: 20, fontWeight: 700, color: "rgba(255,255,255,0.9)", fontFamily: "'Outfit', sans-serif", letterSpacing: "-0.02em" }}>{current.title}</h3>
            </div>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", fontFamily: "'Outfit', sans-serif", lineHeight: 1.7, marginBottom: 20, maxWidth: 560 }}>{current.description}</p>
            <div style={{ padding: "14px 18px", borderRadius: 12, background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.05)", marginBottom: 16 }}>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", fontFamily: "'JetBrains Mono', monospace", marginBottom: 6, letterSpacing: "0.08em", textTransform: "uppercase" }}>{current.example.label}</div>
              <div style={{ fontSize: 14, color: current.color, fontFamily: "'JetBrains Mono', monospace", fontWeight: 500, lineHeight: 1.5, wordBreak: "break-word" }}>{current.example.value}</div>
            </div>
            <div style={{ display: "flex", gap: 10, padding: "12px 16px", borderRadius: 12, background: "rgba(248,113,113,0.04)", border: "1px solid rgba(248,113,113,0.08)" }}>
              <span style={{ fontSize: 14, flexShrink: 0, marginTop: 1 }}>⚠️</span>
              <p style={{ fontSize: 13, color: "rgba(248,113,113,0.7)", fontFamily: "'Outfit', sans-serif", lineHeight: 1.6 }}>{current.risk}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// SEO CONTENT & SUPPORTED FORMATS
// ============================================================

function SEOContent({ seo }) {
  return (
    <div style={{ padding: "36px 32px", borderRadius: 20, background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.04)" }}>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: "rgba(255,255,255,0.85)", fontFamily: "'Outfit', sans-serif", marginBottom: 16, letterSpacing: "-0.02em" }}>{seo.heading}</h2>
      <div style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", fontFamily: "'Outfit', sans-serif", lineHeight: 1.8 }}>
        {seo.paragraphs.map((p, i) => <p key={i} style={{ marginBottom: i < seo.paragraphs.length - 1 ? 14 : 0 }}>{p}</p>)}
      </div>
    </div>
  );
}

function SupportedFormats({ formats }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(formats.length, 4)}, 1fr)`, gap: 12 }}>
      {formats.map((f, i) => (
        <div key={i} style={{ padding: "20px 18px", borderRadius: 14, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", textAlign: "center", transition: "all 0.3s ease", animation: `cardSlideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) ${0.1 + i * 0.08}s both` }}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = `${f.color}30`}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = "rgba(255,255,255,0.05)"}
        >
          <div style={{ fontSize: 18, fontWeight: 700, color: f.color, fontFamily: "'JetBrains Mono', monospace", marginBottom: 6 }}>.{f.ext.toLowerCase()}</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", fontFamily: "'Outfit', sans-serif", lineHeight: 1.5 }}>{f.desc}</div>
        </div>
      ))}
    </div>
  );
}

// ============================================================
// FULL PAGE TEMPLATE
// ============================================================

function LandingPage({ config, onNavigate }) {
  return (
    <div style={{ position: "relative", zIndex: 1, maxWidth: 880, margin: "0 auto", padding: "110px 24px 80px" }}>
      {/* Hero */}
      <div style={{ textAlign: "center", marginBottom: 40, animation: "heroFadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1)" }}>
        <div style={{ display: "inline-block", marginBottom: 16, padding: "5px 16px", borderRadius: 100, background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.12)" }}>
          <span style={{ fontSize: 12, color: "#4ade80", fontFamily: "'JetBrains Mono', monospace", fontWeight: 500, letterSpacing: "0.05em" }}>{config.heroLabel}</span>
        </div>
        <h1 style={{ fontSize: 46, fontWeight: 800, lineHeight: 1.1, letterSpacing: "-0.04em", fontFamily: "'Outfit', sans-serif", marginBottom: 16, background: "linear-gradient(135deg, #f8fafc 0%, #a78bfa 50%, #06b6d4 100%)", backgroundSize: "200% 200%", animation: "gradientShift 8s ease infinite", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          {config.title}
        </h1>
        <p style={{ fontSize: 17, color: "rgba(255,255,255,0.4)", maxWidth: 540, margin: "0 auto", fontFamily: "'Outfit', sans-serif", lineHeight: 1.7 }}>{config.subtitle}</p>
      </div>

      <InlineTool config={config} />

      <section style={{ marginTop: 80 }}>
        <h2 style={{ fontSize: 28, fontWeight: 700, textAlign: "center", marginBottom: 6, fontFamily: "'Outfit', sans-serif", color: "rgba(255,255,255,0.9)", letterSpacing: "-0.02em" }}>What's hidden in your files?</h2>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.35)", textAlign: "center", marginBottom: 32, fontFamily: "'Outfit', sans-serif" }}>Tap each category to see real examples</p>
        <ExplainerTabs tabs={config.explainerTabs} />
      </section>

      <section style={{ marginTop: 80 }}>
        <h2 style={{ fontSize: 28, fontWeight: 700, textAlign: "center", marginBottom: 6, fontFamily: "'Outfit', sans-serif", color: "rgba(255,255,255,0.9)", letterSpacing: "-0.02em" }}>Supported formats</h2>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.35)", textAlign: "center", marginBottom: 32, fontFamily: "'Outfit', sans-serif" }}>Deep metadata scanning for every field</p>
        <SupportedFormats formats={config.supportedFormats} />
      </section>

      <section style={{ marginTop: 80, maxWidth: 640, marginLeft: "auto", marginRight: "auto" }}>
        <SEOContent seo={config.seoContent} />
      </section>

      <div style={{ textAlign: "center", marginTop: 64, padding: "48px 36px", borderRadius: 24, background: "linear-gradient(135deg, rgba(124,58,237,0.06) 0%, rgba(6,182,212,0.04) 100%)", border: "1px solid rgba(124,58,237,0.1)" }}>
        <h3 style={{ fontSize: 26, fontWeight: 700, marginBottom: 10, fontFamily: "'Outfit', sans-serif", color: "rgba(255,255,255,0.9)", letterSpacing: "-0.02em" }}>Need to process more files?</h3>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", marginBottom: 24, fontFamily: "'Outfit', sans-serif", lineHeight: 1.6 }}>{config.batchCta.subtext}</p>
        <div style={{ display: "flex", justifyContent: "center", gap: 12 }}>
          <button style={{ padding: "14px 32px", borderRadius: 12, border: "none", cursor: "pointer", background: "linear-gradient(135deg, #7c3aed, #6d28d9)", color: "#fff", fontSize: 15, fontWeight: 600, fontFamily: "'Outfit', sans-serif", boxShadow: "0 0 25px rgba(124,58,237,0.3), inset 0 1px 0 rgba(255,255,255,0.1)", transition: "all 0.25s ease" }}
            onMouseEnter={(e) => { e.target.style.transform = "translateY(-2px)"; e.target.style.boxShadow = "0 0 35px rgba(124,58,237,0.45)"; }}
            onMouseLeave={(e) => { e.target.style.transform = "translateY(0)"; e.target.style.boxShadow = "0 0 25px rgba(124,58,237,0.3)"; }}
          >{config.batchCta.text}</button>
          <button style={{ padding: "14px 32px", borderRadius: 12, cursor: "pointer", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.03)", color: "rgba(255,255,255,0.7)", fontSize: 15, fontWeight: 600, fontFamily: "'Outfit', sans-serif", transition: "all 0.25s ease" }}
            onMouseEnter={(e) => { e.target.style.background = "rgba(255,255,255,0.06)"; }}
            onMouseLeave={(e) => { e.target.style.background = "rgba(255,255,255,0.03)"; }}
          >View Pricing</button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// PAGE INDEX (for demo — shows all available pages)
// ============================================================

function PageIndex({ onNavigate }) {
  const pages = Object.values(PAGE_CONFIGS);
  return (
    <div style={{ position: "relative", zIndex: 1, maxWidth: 800, margin: "0 auto", padding: "120px 24px 80px" }}>
      <div style={{ textAlign: "center", marginBottom: 48, animation: "heroFadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1)" }}>
        <div style={{ display: "inline-block", marginBottom: 16, padding: "5px 16px", borderRadius: 100, background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.15)" }}>
          <span style={{ fontSize: 12, color: "#a78bfa", fontFamily: "'JetBrains Mono', monospace", fontWeight: 500, letterSpacing: "0.05em" }}>SEO LANDING PAGES — 6 VARIANTS</span>
        </div>
        <h1 style={{ fontSize: 40, fontWeight: 800, lineHeight: 1.15, letterSpacing: "-0.04em", fontFamily: "'Outfit', sans-serif", marginBottom: 12, background: "linear-gradient(135deg, #f8fafc 0%, #a78bfa 50%, #06b6d4 100%)", backgroundSize: "200% 200%", animation: "gradientShift 8s ease infinite", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          MetaStrip SEO Pages
        </h1>
        <p style={{ fontSize: 15, color: "rgba(255,255,255,0.4)", fontFamily: "'Outfit', sans-serif", lineHeight: 1.6 }}>
          Each page targets a unique keyword cluster. Click any to preview.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {pages.map((config, i) => (
          <button key={config.slug} onClick={() => onNavigate(config.slug)}
            style={{
              display: "flex", alignItems: "center", gap: 16, padding: "20px 24px",
              borderRadius: 16, border: "1px solid rgba(255,255,255,0.06)",
              background: "rgba(255,255,255,0.02)", cursor: "pointer",
              textAlign: "left", width: "100%", transition: "all 0.3s ease",
              animation: `cardSlideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) ${i * 0.08}s both`,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(124,58,237,0.2)"; e.currentTarget.style.background = "rgba(255,255,255,0.035)"; e.currentTarget.style.transform = "translateX(4px)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; e.currentTarget.style.background = "rgba(255,255,255,0.02)"; e.currentTarget.style.transform = "translateX(0)"; }}
          >
            <span style={{ fontSize: 28, flexShrink: 0 }}>{config.fileIcon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 16, fontWeight: 600, color: "rgba(255,255,255,0.85)", fontFamily: "'Outfit', sans-serif", marginBottom: 4 }}>{config.title}</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", fontFamily: "'JetBrains Mono', monospace" }}>/{config.slug}</div>
            </div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", fontFamily: "'JetBrains Mono', monospace", flexShrink: 0 }}>
              {config.metadataCategories.reduce((a, c) => a + c.fields.length, 0)} mock fields →
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// MAIN APP — with client-side routing
// ============================================================

export default function SEOPagesDemo() {
  const [currentSlug, setCurrentSlug] = useState(null);
  const config = currentSlug ? PAGE_CONFIGS[currentSlug] : null;

  const handleNavigate = (slug) => {
    setCurrentSlug(slug);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #09090b; color: #fff; overflow-x: hidden; }
        @keyframes orbFloat1 { 0%, 100% { transform: translate(0,0) scale(1); } 33% { transform: translate(40px,30px) scale(1.05); } 66% { transform: translate(-20px,-15px) scale(0.95); } }
        @keyframes orbFloat2 { 0%, 100% { transform: translate(0,0) scale(1); } 33% { transform: translate(-30px,-40px) scale(1.08); } 66% { transform: translate(25px,20px) scale(0.92); } }
        @keyframes cardSlideIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes panelFadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fieldFadeIn { from { opacity: 0; transform: translateX(-8px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes heroFadeIn { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes gradientShift { 0%, 100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
        @keyframes spin { to { transform: rotate(360deg); } }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 3px; }
      `}</style>

      <AnimatedBackground />
      <Nav currentSlug={currentSlug} onNavigate={handleNavigate} />

      {config ? <LandingPage config={config} onNavigate={handleNavigate} /> : <PageIndex onNavigate={handleNavigate} />}

      <footer style={{ position: "relative", zIndex: 1, textAlign: "center", padding: "40px 24px", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
        <div style={{ display: "flex", justifyContent: "center", gap: 32, marginBottom: 16 }}>
          {["Tool", "Pricing", "Blog", "About", "Privacy"].map(link => (
            <span key={link} style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", fontFamily: "'Outfit', sans-serif", cursor: "pointer", transition: "color 0.2s ease" }}
              onMouseEnter={(e) => e.target.style.color = "rgba(255,255,255,0.6)"}
              onMouseLeave={(e) => e.target.style.color = "rgba(255,255,255,0.3)"}
            >{link}</span>
          ))}
        </div>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.15)", fontFamily: "'JetBrains Mono', monospace" }}>Made with ☕ in Melbourne</p>
      </footer>
    </>
  );
}
