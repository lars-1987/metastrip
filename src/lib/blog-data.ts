// ============================================================
// Blog data — types, articles, categories, helpers
// ============================================================

import type { IconName } from "@/components/shared/Icon";

export interface BlogCategory {
  id: string;
  label: string;
}

export interface ArticleSection {
  heading: string;
  body: string; // paragraphs separated by \n\n
}

export interface ArticleContent {
  intro: string;
  sections: ArticleSection[];
}

export interface BlogArticle {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  readTime: string;
  featured: boolean;
  tags: string[];
  coverGradient: string;
  coverIcon: IconName;
  content?: ArticleContent;
}

export const CATEGORIES: BlogCategory[] = [
  { id: "all", label: "All Posts" },
  { id: "privacy", label: "Privacy" },
  { id: "guides", label: "Guides" },
  { id: "technical", label: "Technical" },
  { id: "news", label: "News" },
];

export const ARTICLES: BlogArticle[] = [
  {
    id: "building-terminal-in-browser",
    slug: "how-i-built-a-terminal-that-lives-in-the-browser",
    title: "How I Built a Terminal That Lives in the Browser (And Why It Has Neofetch)",
    excerpt:
      "The story of scrapping a perfectly fine landing page to rebuild a metadata removal tool inside a fake terminal \u2014 complete with draggable desktop icons, vim jokes, and a neofetch easter egg.",
    category: "technical",
    date: "Mar 20, 2026",
    readTime: "6 min read",
    featured: true,
    tags: ["terminal", "design", "react", "easter-eggs"],
    coverGradient: "linear-gradient(135deg, #7c3aed 0%, #f472b6 100%)",
    coverIcon: "Laptop",
    content: {
      intro:
        "Most developer tools have a landing page with a hero section, a feature grid, and a big purple \"Get Started\" button. MetaStrip had one too. It was clean, it was functional, and it was boring. So I threw it away and rebuilt the entire app inside a terminal emulator.\n\nThis is the story of how that happened, what it took to build, and why the photo.jpg on the desktop is actually draggable.",
      sections: [
        {
          heading: "It started with a metadata problem",
          body: "I needed to strip EXIF data from a batch of photos before uploading them to a marketplace. Every tool I found was either abandoned, ugly, or wanted me to upload my files to someone else\u2019s server \u2014 which kind of defeats the purpose when the whole point is privacy.\n\nThe CLI tools worked fine, but they required installing dependencies and reading man pages. I wanted something that worked in the browser, processed everything client-side, and didn\u2019t look like it was last updated when Ubuntu still shipped with Unity.\n\nSo I built a clean, modern web app. It worked. Files never left the browser. The metadata got stripped. Job done.\n\nThen I stared at it and thought: **this is just another landing page.**",
        },
        {
          heading: "The terminal idea",
          body: "The best metadata tools have always been CLI programs. ExifTool, mat2, ImageMagick \u2014 they all live in the terminal. The irony of wrapping that functionality in a generic web UI felt wrong. What if the web app **was** a terminal?\n\nNot a real terminal \u2014 a theatrical one. Something that looks and feels like Warp or iTerm2, with tabs, a powerline prompt, and actual interactive commands \u2014 but runs in the browser and processes your files client-side.\n\nThe terminal became the entire UI. The drop zone is a command prompt. The file list renders like `ls -la`. The stripping process animates like a real CLI program running through each metadata category with progress bars. Even the download button lives inside the terminal output.",
        },
        {
          heading: "Building the terminal layer by layer",
          body: "The terminal is a stack of React components pretending to be a window manager. At the top, macOS-style traffic lights and a draggable title bar. Below that, a tab bar where each tab is its own session \u2014 metastrip, ko-fi, privacy policy, about, and blog all render inside the same terminal window.\n\nThe powerline prompt was one of the most satisfying details. It mimics a real Zsh setup with Powerline symbols: the MetaStrip icon, a directory breadcrumb, and a git branch indicator. The blinking cursor sits at the end, waiting for input. When you drag files in, the prompt updates with the `metastrip` command and your selected flags. When you execute, a typewriter effect types out the full command before the stripping animation begins.\n\nEach file gets its own processing block that looks like a real CLI log \u2014 tree-branch characters, per-category progress bars that fill with a purple-to-cyan gradient, and status labels that flip from \"stripping...\" to \"removed\" as the animation plays through. The actual processing happens instantly (it\u2019s JavaScript in your browser), but the animation creates a satisfying sense of work being done.",
        },
        {
          heading: "The desktop easter eggs",
          body: "The background behind the terminal isn\u2019t just a gradient \u2014 it\u2019s a desktop. Scattered around the edges are draggable file and folder icons: privacy.txt, .env, node_modules (47 GB, naturally), uploads, README.md, and photo.jpg.\n\nEach one is a real interactive element. Double-click node_modules and a floating window opens showing is-odd, is-even, and is-thirteen with absurd file sizes. Open .env and you\u2019ll find `SECRET_KEY=nice-try-buddy` and `UPLOAD_TO_SERVER=false`. The uploads folder shows files with their exposed metadata highlighted in red \u2014 GPS coordinates, device info, author names \u2014 a subtle reminder of why the tool exists.\n\nThe wildest one: you can drag photo.jpg from the desktop directly into the terminal, and it actually works. The app generates a real JPEG with injected EXIF metadata using a canvas element and piexifjs, creates a File object, and feeds it into the processor. The terminal picks it up, runs the strip animation, and offers a download. A desktop icon became a functional demo.",
        },
        {
          heading: "The interactive terminal commands",
          body: "Since it looks like a terminal, people are going to type into it. So I made it actually work. The prompt accepts real commands.\n\n`help` lists everything available. `neofetch` displays system info in ASCII art \u2014 your OS, browser, the MetaStrip \"shell\" version, uptime, installed packages (piexifjs, pdf-lib, jszip), and privacy status. `whoami` returns \"anonymous \u2014 as it should be.\" `ls` shows your uploaded files. `clear` clears the terminal. `version` and `status` give you app info.\n\nThen there are the vim jokes. Type `vim` and you get: \"Error: vim detected. This is a safe space. Use a real editor.\" Type `:wq` and it responds: \"You\u2019re not in vim. You\u2019re free. Breathe.\" `:q!` gets you \"There is nothing to quit. You\u2019re already in the best metadata tool ever made.\" `emacs` triggers \"We don\u2019t talk about emacs here.\"\n\n`sudo rm -rf /` returns a dramatic pause followed by \"nice try. all your metadata are belong to us.\" And `exit` tells you \"There is no escape. Only metadata removal.\"",
        },
        {
          heading: "Content pages as terminal tabs",
          body: "The privacy policy, about page, and blog all render inside terminal tabs, styled like you\u2019re reading man pages or README files. The privacy policy opens with a `cat privacy.txt` prompt. The about page reads like a `--verbose` flag output. Blog articles render with markdown-style headers and monospace text.\n\nThis means the entire app is a single page. There\u2019s no navigation, no route changes, no loading screens. You click a tab and the content appears in the same terminal window. It feels like switching between tmux panes.",
        },
        {
          heading: "What I'd do differently",
          body: "The animation timing was the hardest part to get right. Each file\u2019s stripping animation needs to feel fast enough to be satisfying but slow enough to actually read. Too fast and it looks broken; too slow and it feels like the tool is actually slow. The sweet spot was about 150ms between category lines with 300ms progress bar fills.\n\nMobile was tricky. The terminal metaphor works beautifully on desktop where you have gutter space for the desktop icons and the window feels like it\u2019s floating. On mobile, the terminal goes full-screen and the desktop icons hide. It\u2019s still a terminal, just without the desktop theater around it.\n\nIf I built it again, I\u2019d probably add more commands. A `man metastrip` page. Maybe `cat` to preview file metadata before stripping. The terminal metaphor is infinitely extensible \u2014 every feature can be a command.",
        },
        {
          heading: "The point of all this",
          body: "MetaStrip started as a simple problem: strip metadata without uploading files. The solution could have stayed simple too. But somewhere between \"this works\" and \"this is fun,\" the terminal idea took over.\n\nThe result is a privacy tool that feels like a toy \u2014 in the best way. It does exactly one thing (remove metadata), does it entirely in your browser, and wraps the whole experience in enough nerdy details to make the process genuinely enjoyable.\n\nAnd if you type `neofetch`, you\u2019ll see exactly where your files don\u2019t go: nowhere. That\u2019s the point.",
        },
      ],
    },
  },
  {
    id: "metadata-privacy-risks",
    slug: "what-metadata-reveals-about-you",
    title:
      "What Your Photo Metadata Reveals About You (And How to Stop It)",
    excerpt:
      "Every photo you take carries invisible data \u2014 GPS coordinates, device serial numbers, timestamps, and more. Here\u2019s exactly what\u2019s exposed and why it matters.",
    category: "privacy",
    date: "Feb 28, 2026",
    readTime: "8 min read",
    featured: false,
    tags: ["EXIF", "GPS", "privacy", "photos"],
    coverGradient: "linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%)",
    coverIcon: "MapPin",
    content: {
      intro: "You snapped a photo of your morning coffee, posted it to a forum, and moved on with your day. What you didn\u2019t realize is that the image file you uploaded contained your exact home coordinates, your phone\u2019s serial number, and the precise second the photo was taken.\n\nWelcome to the world of photo metadata.",
      sections: [
        {
          heading: "What is photo metadata?",
          body: "Every digital photo contains embedded data called EXIF (Exchangeable Image File Format) metadata. Originally designed in 1995 to help photographers catalogue their work, EXIF has become one of the most significant \u2014 and least understood \u2014 privacy risks in everyday digital life.\n\nWhen your smartphone takes a photo, it automatically records dozens of data points and embeds them directly into the image file. This data is invisible when you view the photo, but trivially easy to extract with free tools or a simple right-click in most operating systems.\n\nYour photos have been carrying this data for years. Most people have no idea it\u2019s there.",
        },
        {
          heading: "The data hiding in your photos",
          body: "A typical smartphone photo contains somewhere between 30 and 80 metadata fields. Here\u2019s what\u2019s embedded in almost every photo you take:\n\n**GPS coordinates** accurate to 3-5 meters \u2014 enough to identify your exact address, workplace, or the caf\u00e9 you\u2019re sitting in right now. Your phone records latitude, longitude, altitude, and sometimes even the direction you were facing and your speed at the time of capture.\n\n**Device information** including make, model, lens specifications, and in some cases the device serial number. This creates a unique fingerprint that can link every photo you\u2019ve ever taken back to one specific device \u2014 and therefore to you.\n\n**Timestamps** with timezone offsets that reveal not just when a photo was taken, but your timezone and daily patterns. A photo taken at 7:14 AM with a +11:00 offset tells someone you\u2019re probably in eastern Australia, even before they look at the GPS data.\n\n**Software information** showing which app processed the photo, what edits were made, and what operating system version you\u2019re running. If you edited the photo in Lightroom, that\u2019s recorded. If you cropped it in the iOS Photos app, that\u2019s recorded too.\n\n**Author and copyright data** including your name (if set in your phone\u2019s settings or editing software), copyright notices, and creator credits.\n\nFor photos processed through AI tools, there\u2019s now an additional layer: C2PA content credentials and XMP AI generation tags that permanently mark images as machine-made.",
        },
        {
          heading: "Why this matters more than you think",
          body: "One photo reveals one location. That\u2019s bad enough \u2014 a photo taken at home reveals your home address. But the real risk compounds across multiple photos shared over time.\n\nTen photos shared across a month reveal your daily routine. Where you live, where you work, where you eat lunch, where you exercise, what time you leave the house and what time you get home. Combined with timestamps, anyone with access to these photos can build a predictive model of where you\u2019ll be and when.\n\nThis isn\u2019t a theoretical concern. In 2012, tech journalist John McAfee was located by authorities in Guatemala after a Vice magazine reporter posted an interview photo with intact GPS metadata. The coordinates in the EXIF data led directly to his hideout.\n\nMore commonly, people unknowingly share their home address every time they post a photo taken at home to forums, dating profiles, marketplace listings, or community groups. A photo of your dog, your cooking, or your hobby \u2014 taken on your couch \u2014 contains your exact address embedded in the file.",
        },
        {
          heading: "The device serial number problem",
          body: "GPS data gets most of the attention, but your device serial number might be the more insidious risk.\n\nEvery photo your phone takes embeds the same device identifier. If you post a photo anonymously on a forum and separately post a photo on your public social media profile \u2014 both from the same phone \u2014 anyone who extracts the EXIF data from both can link them. Your \u201canonymous\u201d post is no longer anonymous.\n\nThis is how digital forensics investigators routinely link anonymous images to known individuals. The device serial number is a persistent identifier that follows you across every photo and every platform.",
        },
        {
          heading: "Which platforms strip metadata?",
          body: "Not all sharing methods are created equal. Some platforms strip EXIF data automatically, while others preserve everything.\n\n**Platforms that strip most metadata on upload:** Instagram, Facebook, Twitter/X, and Snapchat all remove GPS coordinates and most identifying EXIF data from the files other users can download. However \u2014 and this is important \u2014 these platforms typically read and store your metadata internally before stripping it. Instagram knows the GPS coordinates of every photo you\u2019ve ever uploaded, even though other users can\u2019t see them.\n\n**Platforms and methods that preserve metadata:** Email attachments preserve everything. WhatsApp preserves metadata when you send photos as documents (not compressed images). Google Drive and Dropbox links preserve full metadata. Forum uploads, personal websites, blog posts, and most messaging apps when sharing original quality files all preserve metadata completely.\n\nThe safest assumption: unless you\u2019ve specifically verified that a platform strips metadata, assume it doesn\u2019t. And even platforms that do strip metadata for other users still collect it for themselves.",
        },
        {
          heading: "How to protect yourself",
          body: "The only reliable approach is to strip metadata before sharing. Disabling location services for your camera app prevents GPS data from being embedded, but device information, timestamps, serial numbers, and software data will still be recorded. The camera app isn\u2019t the only source of metadata \u2014 your operating system and any editing software add their own layers.\n\nThe most complete protection is stripping metadata from the file itself after taking the photo and before sharing it. This removes all embedded data regardless of its source.\n\nMetaStrip processes photos entirely in your browser \u2014 your files are never uploaded to any server. Drop a photo, see exactly what metadata it contains, strip it, and download the clean file. It takes about three seconds and costs nothing for single files.\n\nThe first time you drop a photo from your phone into MetaStrip and see your home coordinates staring back at you, you\u2019ll understand why this matters. That visceral reaction \u2014 seeing your exact location, your device serial number, and your name embedded in what you thought was just a picture of your lunch \u2014 is usually enough to make metadata stripping a permanent habit.",
        },
        {
          heading: "What to do right now",
          body: "Take a photo with your phone right now. Any photo. Then check what metadata it contains \u2014 you can use MetaStrip, or right-click the file on your computer and check the properties. Look for the GPS coordinates, the device model, and any author information.\n\nNow think about every photo you\u2019ve ever shared online without checking first.\n\nThat\u2019s why this matters.",
        },
      ],
    },
  },
  {
    id: "ai-metadata-guide",
    slug: "ai-metadata-c2pa-explained",
    title:
      "C2PA and AI Image Tagging: What Creators Need to Know in 2026",
    excerpt:
      "AI-generated images now carry invisible content credentials. Here\u2019s how C2PA works, who\u2019s checking for it, and what it means for your content.",
    category: "technical",
    date: "Feb 22, 2026",
    readTime: "10 min read",
    featured: false,
    tags: ["AI", "C2PA", "Midjourney", "DALL-E"],
    coverGradient: "linear-gradient(135deg, #c084fc 0%, #818cf8 100%)",
    coverIcon: "Robot",
    content: {
      intro: "If you\u2019ve generated an image with Midjourney, DALL-E, Adobe Firefly, or ChatGPT in 2026, that image almost certainly contains invisible metadata identifying it as AI-generated. It\u2019s not a watermark you can see. It\u2019s not a label on the image. It\u2019s cryptographic data embedded directly in the file \u2014 and a growing number of platforms, search engines, and stock sites are checking for it.\n\nHere\u2019s what you need to understand.",
      sections: [
        {
          heading: "What is C2PA?",
          body: "C2PA stands for the Coalition for Content Provenance and Authenticity. It\u2019s a technical standard developed by Adobe, Microsoft, Google, Intel, the BBC, and other industry heavyweights under the Linux Foundation. The standard defines how to embed verifiable \u201ccontent credentials\u201d into digital files \u2014 essentially a tamper-evident record of where a piece of content came from and how it was created.\n\nThink of it as a nutrition label for digital content. Just as a food label tells you what\u2019s inside the package, C2PA content credentials tell you what\u2019s inside the file: who made it, what tools they used, whether AI was involved, and what edits were applied along the way.\n\nThe credentials are cryptographically signed, which means they can\u2019t be altered without breaking the signature. If someone modifies the image without using a C2PA-enabled tool, the original signature becomes invalid \u2014 immediately flagging the content as tampered.",
        },
        {
          heading: "What gets embedded in AI-generated images",
          body: "When you generate an image with a major AI tool in 2026, the file typically contains several layers of metadata identifying its origin:\n\n**C2PA manifest data** \u2014 a cryptographically signed record containing the claim generator (e.g., \u201cMidjourney v6.1\u201d), the digital source type (typically `trainedAlgorithmicMedia` for fully AI-generated content), a timestamp, and an action history showing `c2pa.created` as the origin event.\n\n**XMP AI markers** \u2014 standard metadata fields used by the wider ecosystem. These include `Iptc4xmpExt:DigitalSourceType` set to `trainedAlgorithmicMedia`, `xmp:CreatorTool` identifying the AI platform, and sometimes `dc:description` fields noting AI generation.\n\n**Tool-specific data** \u2014 some platforms embed additional information like generation parameters, prompt hashes, model versions, and configuration flags. The specifics vary by platform, but the presence of AI identification is increasingly universal.\n\nAs of early 2026, Midjourney, OpenAI\u2019s DALL-E and ChatGPT image generation, Adobe Firefly, and Stability AI\u2019s official tools all embed C2PA content credentials by default. This is a significant shift from even a year ago, when C2PA adoption was optional and inconsistent.",
        },
        {
          heading: "Who\u2019s checking for AI metadata?",
          body: "This is where it gets consequential for creators.\n\n**Google Search** has integrated C2PA metadata into its \u201cAbout this image\u201d feature. When an image in search results contains C2PA credentials indicating AI generation, Google can surface that information to users. Google\u2019s ad systems have also begun integrating C2PA signals to inform policy enforcement.\n\n**Social media platforms** are moving quickly. Meta displays \u201cAI Generated\u201d labels on Instagram and Facebook for content with AI metadata markers. The detection isn\u2019t limited to C2PA \u2014 Meta also uses its own classifiers \u2014 but the metadata makes detection trivially easy.\n\n**Stock photo platforms** have taken the hardest line. Getty Images bans AI-generated content entirely and uses metadata to enforce it. Adobe Stock requires creators to disclose AI use. Shutterstock has integrated content credential checking into its submission pipeline.\n\n**News organizations** including the AP, Reuters, and the New York Times are members of the Content Authenticity Initiative and are implementing credential verification in their editorial workflows. Content without verifiable provenance is increasingly viewed with suspicion.\n\nThe trajectory is clear: in 2026 and beyond, platforms that consume visual content are actively looking for AI generation markers, and the consequences of having them range from labels to outright rejection.",
        },
        {
          heading: "Metadata-based tags vs. invisible watermarks",
          body: "It\u2019s important to understand the distinction between what MetaStrip can remove and what it can\u2019t.\n\n**Metadata-based AI tags** \u2014 C2PA manifests, XMP fields, IPTC markers, and embedded generation parameters \u2014 are all data stored alongside the image content. They can be read, modified, and removed with metadata processing tools. This is what MetaStrip handles.\n\n**Steganographic watermarks** \u2014 like Google\u2019s SynthID \u2014 are entirely different. These are modifications to the actual pixel data of the image. The watermark is invisible to the human eye but detectable by specialized algorithms. Because it\u2019s embedded in the pixels themselves, not in the metadata, it survives metadata stripping, screenshots, re-encoding, and mild editing.\n\nThe honest assessment: stripping C2PA metadata removes the most common and easily-detectable AI identification markers. Most automated systems checking for AI content in 2026 rely on metadata signals rather than pixel analysis, because metadata checking is fast, reliable, and binary. Steganographic detection is computationally expensive and less widely deployed.\n\nHowever, as detection technology matures, pixel-level analysis will become more common. Removing metadata is a meaningful step, not a complete solution.",
        },
        {
          heading: "The legal and ethical landscape",
          body: "This is a topic where reasonable people disagree, and the legal framework is still developing.\n\nIn the United States, removing metadata could potentially intersect with Section 1202 of the Digital Millennium Copyright Act, which prohibits removing \u201ccopyright management information\u201d from copyrighted works. However, C2PA content credentials are provenance information, not copyright information per se, and the application of DMCA Section 1202 to AI-generated content (which may not be copyrightable in the first place) is legally untested.\n\nThe European Union\u2019s AI Act requires certain disclosures for AI-generated content, but the requirements apply primarily to deployers and providers of AI systems, not to individual users of those systems.\n\nFrom a practical standpoint, the most common reasons people strip AI metadata are benign: avoiding algorithmic demotion on platforms, using AI-assisted images in commercial contexts where AI labels create friction, or simply maintaining creative privacy about their workflow.\n\nMetaStrip doesn\u2019t make ethical judgments about why you\u2019re removing metadata. We provide the tool; how you use it is your decision. We do encourage users to be transparent about AI use where it matters \u2014 especially in journalism, academic work, and contexts where authenticity is a reasonable expectation.",
        },
        {
          heading: "What to expect going forward",
          body: "C2PA adoption is accelerating. Camera manufacturers including Leica, Nikon, Sony, and Canon are building content credential signing directly into hardware. Within a few years, most professional cameras will sign every photo with cryptographic provenance data at the moment of capture.\n\nThis means the absence of C2PA data will itself become a signal. In a world where legitimate cameras embed credentials and AI tools embed credentials, a file with no credentials at all may be viewed with more suspicion than one with clear provenance.\n\nThe standard is also expanding beyond still images. Video, audio, and document formats are all within C2PA\u2019s scope. OpenAI has committed to embedding credentials in AI-generated video, and Adobe\u2019s tools already support credential embedding across their creative suite.\n\nFor creators, the practical takeaway is this: understand what\u2019s embedded in your files, make intentional decisions about what you share, and use tools that give you control over your own metadata. Whether you choose to keep, modify, or remove content credentials should be your choice \u2014 not a default you didn\u2019t know about.",
        },
      ],
    },
  },
  {
    id: "word-doc-metadata",
    slug: "hidden-data-word-documents",
    title:
      "The Hidden Data in Your Word Documents (And Why Lawyers Should Care)",
    excerpt:
      "Tracked changes, author names, editing time, and deleted text \u2014 Word documents carry more hidden data than most people realize.",
    category: "privacy",
    date: "Feb 15, 2026",
    readTime: "7 min read",
    featured: false,
    tags: ["DOCX", "legal", "tracked changes", "compliance"],
    coverGradient: "linear-gradient(135deg, #f472b6 0%, #a78bfa 100%)",
    coverIcon: "NotePencil",
    content: {
      intro: "A law firm sends a settlement proposal to opposing counsel. The document looks clean \u2014 no visible comments, no tracked changes, neatly formatted. But the opposing lawyer downloads the file, unzips it (because every DOCX file is just a ZIP archive), opens the XML inside, and finds the complete revision history: every draft, every deleted paragraph, every internal comment, and the names of every person who touched the document.\n\nThis isn\u2019t a hypothetical. Metadata leaks from legal documents are well-documented and have led to bar disciplinary actions, blown negotiations, and malpractice claims.",
      sections: [
        {
          heading: "What\u2019s inside a DOCX file",
          body: "A Microsoft Word document with the .docx extension isn\u2019t a single file \u2014 it\u2019s a ZIP archive containing a collection of XML files. You can verify this yourself: rename any .docx file to .zip, extract it, and browse the contents. Inside you\u2019ll find the document content, style definitions, relationships, and critically, several metadata files that most users never think about.\n\n**core.xml** contains the document\u2019s core properties: creator name, last modified by, creation date, modification date, revision number, and the total editing time in minutes. If three people collaborated on a document over two weeks, all of their names and the exact timestamps of their contributions are recorded here.\n\n**app.xml** contains application properties: the software that created the document (including version number), the template used, the company name (pulled from your Office installation or Active Directory), page count, word count, and paragraph count.\n\n**custom.xml** contains any custom document properties \u2014 classification levels, department names, project codes, or any other custom metadata your organization\u2019s templates inject automatically.\n\n**comments.xml** and **people.xml** contain every comment ever added to the document and a list of every person who commented, including their full names and in some cases email addresses. Even comments that appear deleted in Word may persist in the XML.\n\nAnd then there\u2019s the most dangerous one of all.",
        },
        {
          heading: "Tracked changes: deleted text that isn\u2019t really deleted",
          body: "Word\u2019s Track Changes feature is essential for collaborative editing. But it creates a permanent record of every edit \u2014 including deletions. When you delete a sentence with Track Changes on, Word doesn\u2019t actually remove the text. It wraps it in a `<w:del>` XML tag and marks it as deleted, but the full original text remains in the file.\n\nHere\u2019s what most people miss: clicking \u201cAccept All Changes\u201d in Word cleans the visible document, but depending on how and when it was done, remnants of the revision history can persist in the XML. Third-party document inspection tools sometimes find revision data that Word\u2019s own \u201cCheck for Issues\u201d inspector missed.\n\nThe classic scenario: a lawyer drafts a contract with an initial offer of $2.4 million. The client decides to negotiate down to $1.8 million. The lawyer edits the figure, accepts all changes, and sends the document. But the revision history \u2014 complete with the original $2.4 million figure \u2014 may still be recoverable from the file\u2019s XML.\n\nThis isn\u2019t limited to financial figures. Internal strategy notes (\u201cshould we disclose the Q3 shortfall?\u201d), alternative language that was considered and rejected, and commentary from colleagues about the document\u2019s content can all survive in tracked change data.",
        },
        {
          heading: "The template inheritance problem",
          body: "One of the most overlooked sources of metadata contamination is templates. When you create a document from a template, the new document inherits the template\u2019s metadata \u2014 including the original author and company who created the template.\n\nThis creates bizarre situations where a document prepared by Firm A carries metadata identifying Firm B as the creator, because Firm A\u2019s template was originally built by someone at Firm B years ago. It happens constantly in legal and consulting environments where templates get shared, copied, and repurposed across organizations.\n\nThe template name itself can also be revealing. A document created from `Legal_Brief_Litigation_Template_v4.dotx` tells the recipient something about your workflow and practice area before they\u2019ve even read the content.",
        },
        {
          heading: "Who\u2019s at risk",
          body: "**Legal professionals** face the most acute risk. The American Bar Association has published multiple ethics opinions addressing lawyers\u2019 duty to remove metadata before sharing documents with opposing parties. Many state bar associations have issued similar guidance. Several courts have held that inadvertently disclosed metadata can constitute waiver of privilege.\n\n**Corporate teams** sharing proposals, contracts, and reports externally risk exposing internal author names, department structures, editing timelines, and the total time invested in preparing a document. A client receiving a proposal that shows 14 hours of total editing time and 47 revisions may form different expectations about pricing than one that appears freshly prepared.\n\n**HR departments** sending employment documents, offer letters, or termination notices carry particular risk. A rejection letter that contains revision history showing the position was originally offered to the candidate before being rescinded tells a very different story than the final document alone.\n\n**Government agencies** and regulated industries face compliance requirements around document metadata. GDPR treats author names and other personally identifying metadata as personal data, meaning it\u2019s subject to data minimization requirements when documents are shared externally.",
        },
        {
          heading: "How to actually clean a document",
          body: "Word has a built-in Document Inspector (File \u2192 Check for Issues \u2192 Inspect Document) that can find and remove some metadata categories. It\u2019s a reasonable first step for casual use, but it has limitations: it doesn\u2019t always catch everything in the XML, and it requires you to remember to run it every time.\n\nFor reliable, comprehensive metadata removal, dedicated tools that operate on the underlying XML are more thorough. MetaStrip opens your DOCX file in the browser using JSZip, accesses the XML files directly, sanitizes or removes the metadata entries, and repackages the clean document \u2014 all without your file ever leaving your device.\n\nThe key principle: metadata removal should be a step in your document sharing workflow, not something you remember to do occasionally. For legal professionals, it should be as automatic as running spell-check before sending.",
        },
        {
          heading: "A quick checklist before sharing any document",
          body: "Before sending a Word document externally, consider whether you\u2019ve addressed each of these: author and \u201clast modified by\u201d names, company name and template information, total editing time and revision count, comments and tracked changes (both visible and hidden), custom properties set by your organization\u2019s templates, and embedded objects that might carry their own metadata.\n\nOr you can drop the file into MetaStrip and handle all of them in about two seconds.\n\nThe three seconds it takes to strip metadata is a lot less painful than the conversation you\u2019ll have if opposing counsel finds your negotiation notes buried in the XML.",
        },
      ],
    },
  },
  {
    id: "pdf-metadata-strip",
    slug: "how-to-remove-metadata-from-pdf",
    title: "How to Remove Metadata from PDFs: A Complete Guide",
    excerpt:
      "Step-by-step guide to stripping author names, timestamps, and hidden properties from PDF files before sharing externally.",
    category: "guides",
    date: "Feb 8, 2026",
    readTime: "6 min read",
    featured: false,
    tags: ["PDF", "how-to", "author", "metadata"],
    coverGradient: "linear-gradient(135deg, #06b6d4 0%, #4ade80 100%)",
    coverIcon: "FileText",
    content: {
      intro: "PDF files are everywhere \u2014 contracts, invoices, reports, presentations, r\u00e9sum\u00e9s. They feel like sealed, finished documents. But every PDF carries hidden metadata that reveals who created it, when, with what software, and sometimes much more.\n\nHere\u2019s how to find it and remove it.",
      sections: [
        {
          heading: "What metadata do PDFs contain?",
          body: "PDF files store metadata in a document information dictionary and optionally in an XMP (Extensible Metadata Platform) stream. The standard fields include:\n\n**Author** \u2014 the name of the person who created the document. This is typically pulled from your operating system\u2019s user account name or your Office application\u2019s settings. If your computer login is \u201cSarah Mitchell,\u201d every PDF you create will carry that name, whether you want it to or not.\n\n**Creator** \u2014 the application that originally created the content before PDF conversion. If you wrote the document in Microsoft Word and exported to PDF, the creator field will say \u201cMicrosoft Word.\u201d If you used Google Docs, it\u2019ll say that instead. This tells the recipient exactly what software you use.\n\n**Producer** \u2014 the application or library that actually generated the PDF file. This often reveals your operating system and its version. A PDF produced on a Mac might show \u201cmacOS 14.3 Quartz PDFContext.\u201d One generated on Windows might show \u201cMicrosoft Print to PDF.\u201d\n\n**Title, Subject, and Keywords** \u2014 fields that may contain the document\u2019s original title (which might differ from the filename), a subject line, and keywords. These are often set automatically from the source document\u2019s properties and can contain surprisingly revealing internal classifications.\n\n**Creation and Modification Dates** \u2014 precise timestamps showing when the PDF was first created and when it was last modified. The timestamps include timezone offsets, revealing your approximate geographic location.\n\n**Custom Properties** \u2014 some organizations configure their PDF workflows to embed additional metadata like department names, document classification levels, project codes, or security markings.",
        },
        {
          heading: "Why it matters",
          body: "The most common real-world issue with PDF metadata is the **author field**. Consider these scenarios:\n\nA freelancer creates a proposal for a client using their personal computer. The PDF carries the freelancer\u2019s full name as the author \u2014 fine, that\u2019s expected. But two years later, the freelancer uses the same template to create a proposal for a different client. The first client\u2019s company name might still be embedded in the custom properties from the original template.\n\nA company\u2019s HR department sends a rejection letter. The author field shows the name of the HR coordinator, but the title field still reads \u201cDraft \u2014 Offer Letter v3\u201d from when the document started its life as an offer before the hiring decision changed.\n\nAn anonymous whistleblower submits a PDF documenting corporate misconduct. The author field identifies them by name, and the producer field reveals they\u2019re running a specific version of macOS on a MacBook \u2014 narrowing the pool of possible authors within the organization.",
        },
        {
          heading: "Method 1: Adobe Acrobat Pro",
          body: "If you have Acrobat Pro, you can manually inspect and remove metadata:\n\nOpen the PDF in Acrobat Pro. Go to File \u2192 Properties. The Description tab shows the basic metadata fields \u2014 you can edit or clear each one manually. For a more thorough clean, go to Protection \u2192 Remove Hidden Information or use File \u2192 Save As Other \u2192 Optimized PDF and uncheck everything under \u201cDiscard Objects\u201d and \u201cDiscard User Data.\u201d\n\nThe limitation: Acrobat Pro costs money, the process is manual, and you need to remember to do it every time. It also doesn\u2019t process documents in batch.",
        },
        {
          heading: "Method 2: Command line with Exiftool",
          body: "Exiftool is a free, powerful command-line tool that can read and strip metadata from PDFs:\n\n`exiftool -all= document.pdf`\n\nThis removes all metadata fields. You can also target specific fields:\n\n`exiftool -Author=\"\" -Creator=\"\" -Producer=\"\" document.pdf`\n\nThe limitation: it requires installing software and using the command line, which isn\u2019t practical for most people. It also operates on the file in place, which some users find nerve-wracking.",
        },
        {
          heading: "Method 3: MetaStrip (browser-based, no install)",
          body: "MetaStrip processes PDFs entirely in your browser using pdf-lib, an open-source JavaScript PDF library. Drop a PDF, see every metadata field it contains, strip what you want, and download the clean file.\n\nBecause it\u2019s client-side, your PDF never leaves your device \u2014 which matters a lot when you\u2019re dealing with contracts, legal filings, or confidential business documents.\n\nFor single files, it\u2019s free and instant. For batches of up to 25 documents with selective removal and an audit report, there\u2019s a one-time $4.99 document pass.",
        },
        {
          heading: "What about PDF/A and digitally signed PDFs?",
          body: "PDF/A (archival) documents have specific metadata requirements \u2014 some fields are mandatory for PDF/A compliance. If you\u2019re working with PDF/A files for archival or regulatory purposes, stripping all metadata may invalidate the PDF/A conformance. In this case, selective removal (clearing the author and producer while preserving conformance metadata) is the better approach.\n\nDigitally signed PDFs are a different consideration entirely. Modifying any part of a signed PDF \u2014 including its metadata \u2014 invalidates the digital signature. If document authenticity needs to be verifiable through the signature, don\u2019t modify the file at all. The metadata is part of what the signature authenticates.\n\nFor the vast majority of everyday PDF sharing \u2014 sending proposals, contracts, invoices, reports, and r\u00e9sum\u00e9s \u2014 full metadata removal is safe and recommended.",
        },
        {
          heading: "Building it into your workflow",
          body: "The most effective approach to PDF metadata hygiene isn\u2019t remembering to strip metadata from each individual file. It\u2019s building the step into your process:\n\nIf you regularly send PDFs externally, make metadata stripping the last step before attaching the file to an email or uploading it to a portal. It takes seconds and eliminates an entire category of unforced information disclosure.\n\nIf you\u2019re creating PDFs from templates, check the template\u2019s metadata first. A template created by a previous employee or copied from another organization might carry their name and company in the author field of every document you produce from it.\n\nIf you work in a regulated industry or legal practice, consider establishing a metadata stripping policy for all externally-shared documents. The cost of cleaning metadata is negligible. The cost of a metadata leak can be significant.",
        },
      ],
    },
  },
  {
    id: "gdpr-metadata",
    slug: "gdpr-metadata-compliance",
    title:
      "GDPR and File Metadata: What Your Organisation Needs to Know",
    excerpt:
      "Metadata containing personal data falls under GDPR. Here\u2019s what that means for document sharing, data minimization, and compliance.",
    category: "news",
    date: "Jan 30, 2026",
    readTime: "9 min read",
    featured: false,
    tags: ["GDPR", "compliance", "legal", "enterprise"],
    coverGradient: "linear-gradient(135deg, #4ade80 0%, #06b6d4 100%)",
    coverIcon: "Scales",
    content: {
      intro: "Here\u2019s a question most organisations haven\u2019t considered: when you email a PDF to a client, and that PDF contains your employee\u2019s full name, your company name, and a creation timestamp in its metadata, have you just processed personal data without a clear legal basis?\n\nUnder GDPR, the answer is almost certainly yes.",
      sections: [
        {
          heading: "Metadata is personal data",
          body: "The GDPR defines personal data broadly: any information relating to an identified or identifiable natural person. File metadata frequently contains exactly this.\n\nA Word document\u2019s author field contains an employee\u2019s name. A photo\u2019s EXIF data contains GPS coordinates precise enough to identify a home address. A PDF\u2019s producer field reveals the specific software version and operating system running on an employee\u2019s machine. Timestamps with timezone offsets can narrow someone\u2019s geographic location. Device serial numbers embedded in photos create a persistent identifier linkable to an individual.\n\nAll of this constitutes personal data under GDPR. And every time a file containing this metadata is shared externally, that personal data is being transmitted \u2014 often without the data subject\u2019s knowledge or meaningful consent.",
        },
        {
          heading: "The data minimization principle",
          body: "Article 5(1)(c) of GDPR establishes data minimization as a core principle: personal data shall be adequate, relevant, and limited to what is necessary in relation to the purposes for which it is processed.\n\nWhen you send a contract to a client, the purpose is conveying the contractual terms. The author\u2019s name in the PDF metadata, the total editing time, and the template filename are not relevant to that purpose. Including them violates the data minimization principle.\n\nThis isn\u2019t an aggressive reading of the regulation. The European Data Protection Board has consistently emphasized that data minimization applies to all personal data processing, including incidental processing that organisations might not think of as intentional data sharing.",
        },
        {
          heading: "Real compliance scenarios",
          body: "**Outbound document sharing.** Every document your organisation sends externally \u2014 contracts, proposals, reports, invoices \u2014 potentially contains employee names, company metadata, and editing history. If your standard practice is to email Word documents and PDFs without stripping metadata, you\u2019re systematically sharing personal data beyond what\u2019s necessary for the business purpose.\n\n**Published reports and filings.** Documents published on your website or submitted to regulators carry metadata that becomes publicly accessible. An annual report PDF with seventeen different author names embedded in its metadata exposes those individuals\u2019 involvement in the document\u2019s creation to anyone who downloads it.\n\n**Photography and marketing materials.** Product photos, event photos, and marketing images carry EXIF data including GPS coordinates (where was the photo taken?), device information (whose phone or camera?), and timestamps. If your marketing team shares photos on your website or social channels without stripping metadata, you may be publishing employee location data.\n\n**Cross-border document transfers.** When documents carrying employee metadata are sent to recipients outside the EU/EEA, the metadata constitutes a cross-border transfer of personal data, potentially triggering additional GDPR requirements around international data transfers.",
        },
        {
          heading: "What the regulators expect",
          body: "No GDPR enforcement action has yet centred exclusively on file metadata. But several DPA guidance documents and decisions touch on the issue:\n\nMultiple European data protection authorities have included document metadata in their guidance on data minimization in practice. The Irish DPC\u2019s guidance on data protection by design specifically mentions document metadata as an area where organisations should implement technical measures to prevent unnecessary data disclosure.\n\nThe principle of data protection by design and by default (Article 25) is directly relevant. An organisation that has no process for metadata management is arguably failing to implement data protection by design \u2014 the default behaviour of their document workflow exposes personal data unnecessarily.\n\nIn practice, regulators are more likely to cite metadata issues as an aggravating factor in a broader investigation than to pursue standalone enforcement. But the principle is clear: if you\u2019re sharing files externally, the metadata in those files should be considered as part of your data processing activities.",
        },
        {
          heading: "Practical steps for compliance",
          body: "**Establish a metadata policy.** Define which document types require metadata stripping before external sharing. At minimum, this should cover all client-facing documents, publicly published files, and any documents sent to third parties.\n\n**Implement technical controls.** Rather than relying on individual employees to remember to strip metadata, implement it as a workflow step. This could be a document management system that strips metadata on export, a designated tool that employees use before sending files, or automated metadata removal in your email gateway.\n\n**Audit your templates.** Document templates are a common source of inherited metadata. Review your organisation\u2019s templates to ensure they don\u2019t carry metadata from previous authors, other organisations, or sensitive internal classifications.\n\n**Include metadata in your data processing records.** If you\u2019re maintaining records of processing activities under Article 30, consider whether file metadata should be included as a category of personal data that your organisation processes.\n\n**Train your people.** Most employees have no idea that the documents they create carry hidden metadata. A brief awareness session \u2014 showing them what their own documents contain \u2014 is usually sufficient to change behaviour. The moment someone sees their home address embedded in a photo they took at their kitchen table, the lesson sticks.",
        },
        {
          heading: "A proportionate approach",
          body: "GDPR compliance doesn\u2019t mean treating every metadata field as a crisis. The regulation is principles-based and expects proportionate responses to data protection risks.\n\nFor most organisations, a reasonable approach is: strip metadata from documents and images before sharing them externally, audit and clean templates regularly, and include metadata in your data protection training. You don\u2019t need to strip metadata from internal documents shared among colleagues (though there may be other reasons to do so), and you don\u2019t need to retroactively clean every file your organisation has ever shared.\n\nThe key is demonstrating that you\u2019ve considered the issue, implemented appropriate measures, and can show that your approach is consistent with data minimization principles.\n\nMetaStrip processes files entirely in the browser, meaning your documents never leave your infrastructure \u2014 an important consideration for organisations handling confidential or regulated data. For teams processing documents regularly, the document batch pass handles up to 25 files at once with selective removal options.\n\nMetadata compliance is one of those areas where the gap between what organisations should be doing and what they are doing is wide. The organisations that close that gap now will be better positioned when a regulator eventually asks the question.",
        },
      ],
    },
  },
  {
    id: "exif-data-explained",
    slug: "what-is-exif-data",
    title: "What Is EXIF Data? A Plain-English Explanation",
    excerpt:
      "EXIF data is stored in every digital photo. Here\u2019s what it contains, where it lives, and why you should care about it.",
    category: "guides",
    date: "Jan 22, 2026",
    readTime: "5 min read",
    featured: false,
    tags: ["EXIF", "beginner", "explainer", "photos"],
    coverGradient: "linear-gradient(135deg, #fbbf24 0%, #f97316 100%)",
    coverIcon: "Camera",
    content: {
      intro: "EXIF stands for Exchangeable Image File Format. It\u2019s a standard for storing information inside digital image files \u2014 and every photo you take with a smartphone or digital camera contains it.\n\nThis guide explains what EXIF data is, what it contains, and why you should know about it, in plain language without unnecessary jargon.",
      sections: [
        {
          heading: "The basics",
          body: "When you take a photo, your camera or phone doesn\u2019t just capture the image. It also records a set of information about the photo and embeds it directly into the image file. This information is the EXIF data.\n\nYou can\u2019t see EXIF data by looking at the photo. It\u2019s stored in a structured format within the file itself \u2014 think of it as hidden text attached to the image that requires specific tools to read. But reading it is trivially easy: right-clicking a file on Windows and checking Properties, using the Get Info option on Mac, or using any number of free online tools will display the full EXIF contents.\n\nThe EXIF standard was originally published in 1995 by the Japan Electronic Industries Development Association. It was designed to help photographers organize and catalogue their work. At the time, sharing photos online wasn\u2019t really a thing, so the privacy implications of embedding personal data in every image weren\u2019t a major consideration.\n\nThree decades later, we carry high-resolution cameras in our pockets, share photos constantly, and the EXIF standard hasn\u2019t fundamentally changed. The same metadata that was designed for professional photo cataloguing now creates privacy risks for billions of casual smartphone users.",
        },
        {
          heading: "What\u2019s stored in EXIF data",
          body: "A typical smartphone photo contains between 30 and 80 EXIF fields. They fall into several categories:\n\n**Location data.** If your phone\u2019s location services are enabled for the camera app, every photo records GPS coordinates \u2014 latitude, longitude, altitude, and sometimes speed and direction. The accuracy is typically within 3-5 meters. This is the most privacy-sensitive category of EXIF data, because it reveals exactly where you were standing when you took the photo.\n\n**Camera and device information.** The make and model of your device (e.g., \u201cApple iPhone 15 Pro Max\u201d or \u201cSamsung Galaxy S24 Ultra\u201d), lens specifications, and sometimes the device serial number. This information identifies your specific device and creates a fingerprint that links all your photos together.\n\n**Capture settings.** The technical parameters of the photograph: shutter speed, aperture (f-stop), ISO sensitivity, focal length, white balance, flash status, and metering mode. These are the fields that photographers actually use for cataloguing. For most casual users, they\u2019re not privacy-sensitive.\n\n**Timestamps.** The date and time the photo was taken, the date and time it was digitized, and the date and time the file was last modified. Timestamps often include timezone offsets, which reveal your approximate geographic region even without GPS data.\n\n**Software information.** If the photo has been processed or edited, the software used is recorded. This might show your phone\u2019s operating system version, the editing app you used, or the version of Lightroom that processed the file.\n\n**Author and copyright.** Your name (if set in your device or software settings), copyright notices, and creator credits. Many photographers configure these fields intentionally, but casual users are often surprised to find their name embedded in every photo they take.\n\n**Thumbnail.** JPEG files often contain a small embedded preview image \u2014 a thumbnail. This thumbnail is generated when the photo is first taken. If you later crop or edit the photo, the original uncropped thumbnail may still be embedded in the file, potentially revealing content you intended to remove.",
        },
        {
          heading: "Where EXIF data lives in the file",
          body: "EXIF data is stored at the beginning of a JPEG file, before the actual image data. It occupies a dedicated section of the file structure and typically accounts for a few kilobytes to a few tens of kilobytes of the total file size.\n\nFor JPEG files, EXIF data is stored in the APP1 marker segment. PNG files use text chunks (tEXt, iTXt, zTXt) for metadata. WebP files can contain EXIF data in a dedicated chunk. Each format handles metadata differently, but the principle is the same: information about the image is stored alongside the image itself.\n\nIn addition to EXIF, photos may also contain IPTC (International Press Telecommunications Council) metadata \u2014 used primarily by news agencies and stock photography services for captions, credits, and keywords \u2014 and XMP (Extensible Metadata Platform) data, Adobe\u2019s extensible metadata framework. A single photo can contain all three types simultaneously.",
        },
        {
          heading: "Why you should care",
          body: "If you share photos by email, post them on forums or community sites, upload them to cloud storage, or send them through messaging apps as original files, the EXIF data usually travels with the photo. Anyone who receives the file can read every field.\n\nThe GPS coordinates are the most immediately concerning. A photo taken at home and shared online reveals your home address. A photo taken at work reveals your workplace. A series of photos taken over time reveals your daily routine.\n\nThe device serial number creates a persistent identifier. If you post a photo anonymously and also post a photo publicly \u2014 both from the same device \u2014 the serial number can link them. Your anonymous post is no longer anonymous.\n\nThe timestamps and timezone data reveal when and roughly where you are, even without GPS. A photo taken at 2:15 PM with a +11:00 timezone offset places you in eastern Australia at that specific time.\n\nSome social media platforms strip EXIF data on upload, but many sharing methods don\u2019t. The safest assumption is that any photo you share retains its full EXIF data unless you\u2019ve specifically verified otherwise.",
        },
        {
          heading: "How to check and remove EXIF data",
          body: "On Windows, right-click an image file, select Properties, and look at the Details tab. You\u2019ll see a subset of the EXIF fields. There\u2019s a \u201cRemove Properties and Personal Information\u201d link at the bottom that lets you strip some fields.\n\nOn macOS, select the file in Finder, press Command+I, and look at the \u201cMore Info\u201d section. For complete EXIF details, you\u2019ll need a third-party tool or the Preview app\u2019s inspector.\n\nOn your phone, iOS and Android both allow you to view and share photos without location data through their built-in photo apps, but the options aren\u2019t always obvious or comprehensive.\n\nFor a complete view of every metadata field in a photo \u2014 and the ability to strip all of it before sharing \u2014 you can use MetaStrip. Drop a photo, see every field, strip what you want, and download the clean file. It runs in your browser, takes a few seconds, and your photo never leaves your device.\n\nThe first time you check a photo from your phone and see your home coordinates displayed in the GPS fields, you\u2019ll understand why EXIF awareness matters. It\u2019s the kind of thing you can\u2019t unsee.",
        },
      ],
    },
  },
  {
    id: "social-media-metadata",
    slug: "which-social-media-strips-metadata",
    title:
      "Which Social Media Platforms Strip Photo Metadata? (2026 Update)",
    excerpt:
      "We tested every major platform to see which ones remove EXIF data on upload and which ones don\u2019t. The results may surprise you.",
    category: "privacy",
    date: "Jan 15, 2026",
    readTime: "6 min read",
    featured: false,
    tags: ["social media", "Instagram", "Facebook", "Twitter"],
    coverGradient: "linear-gradient(135deg, #f87171 0%, #f472b6 100%)",
    coverIcon: "DeviceMobile",
    content: {
      intro: "The conventional wisdom is that social media platforms strip metadata from your photos when you upload them. For some platforms, this is true \u2014 sort of. For others, it\u2019s not true at all. And for nearly all of them, the reality is more nuanced than a simple yes or no.\n\nHere\u2019s what actually happens to your photo metadata on every major platform in 2026.",
      sections: [
        {
          heading: "The platforms that strip (mostly)",
          body: "**Instagram** strips GPS coordinates and most identifying EXIF data from the versions of your photos that other users can download. This includes device information, timestamps, and camera settings. What other people see is a re-encoded image with minimal metadata. However, Instagram reads and retains your original metadata internally before stripping it from the public file. Your location data feeds Instagram\u2019s ad targeting and content recommendation systems. So Instagram protects your metadata from other users \u2014 but not from Instagram itself.\n\n**Facebook** behaves similarly to Instagram (both are owned by Meta). Photos posted to your feed, profile, cover photos, and Stories are stripped of GPS and most EXIF data in the files that other users can access. Facebook Messenger also strips metadata from images sent in chats. But like Instagram, Facebook processes and stores your original metadata internally. The distinction matters: Facebook knows where every photo was taken, even if your friends can\u2019t see that information.\n\n**Twitter/X** removes GPS data and most identifying metadata from uploaded images. Downloaded images from Twitter contain minimal metadata \u2014 typically just basic image dimensions and encoding information. Twitter\u2019s approach has been consistent since 2015 when they began stripping GPS data.\n\n**Snapchat** strips EXIF data from snaps. Given the ephemeral nature of the platform, metadata stripping is consistent with their general approach to content privacy.\n\n**TikTok** strips most metadata from uploaded images and video thumbnails. However, as with other platforms, TikTok\u2019s own data collection practices are extensive and the original metadata is processed server-side before being stripped from content served to other users.",
        },
        {
          heading: "The platforms that preserve (or partially preserve)",
          body: "**WhatsApp** has a split behaviour that catches people off guard. When you send a photo through WhatsApp\u2019s standard image sharing (which compresses the image), most metadata is stripped. But when you send a photo as a document \u2014 which many people do to preserve image quality \u2014 the original file is sent with full metadata intact. This means the recipient gets your GPS coordinates, device information, and everything else. The same photo, two sharing methods, completely different privacy outcomes.\n\n**Telegram** behaves similarly to WhatsApp. Compressed photo sharing strips most metadata, but sending as a file preserves everything.\n\n**Email** (Gmail, Outlook, Apple Mail, etc.) preserves all metadata in attachments. When you attach a photo to an email, the recipient receives the original file with every EXIF field intact. This is the most common way people accidentally share their location data \u2014 emailing a photo taken at home sends their home coordinates along with it.\n\n**Google Drive, Dropbox, and OneDrive** all preserve metadata in stored and shared files. When you share a link to a photo in cloud storage, the person who downloads it gets the full original file with all metadata. These services are designed for file fidelity, not privacy scrubbing.\n\n**iCloud shared links** preserve original file metadata. When you share photos via an iCloud link, recipients can download the original files with full EXIF data.\n\n**Flickr** historically preserved EXIF data intentionally, as it\u2019s primarily used by photographers who want their camera settings visible. Users can toggle whether EXIF data is publicly displayed, but the data remains in the downloaded file regardless of the display setting.\n\n**Discord** strips most metadata from images uploaded to chat channels. However, the behaviour can vary depending on how images are shared (direct upload vs. link), and Discord\u2019s metadata handling has changed over time.\n\n**Reddit** strips EXIF data from images uploaded directly through Reddit\u2019s image hosting. However, if you link to an externally hosted image, the original metadata is preserved in the source file.\n\n**LinkedIn** strips GPS data from uploaded images, though some other EXIF fields may be partially preserved.",
        },
        {
          heading: "The platforms that collect internally",
          body: "This is the part that most people miss. Even platforms that strip metadata from the files other users download still process your original metadata server-side. Facebook, Instagram, TikTok, and others read your GPS coordinates, device information, and timestamps before discarding them from the public file.\n\nThis means these platforms build a location history for you based on your uploaded photos \u2014 separate from any location sharing you\u2019ve explicitly enabled. A photo taken at home tells the platform where you live. A photo taken at a restaurant tells the platform where you eat. Over time, your photo metadata creates a detailed profile of your movements, even if no other user can see that data.\n\nThe only way to prevent platforms from collecting your metadata is to remove it before uploading. Once the file hits their servers, the metadata has already been read and processed.",
        },
        {
          heading: "The exception cases",
          body: "Several scenarios break the general patterns:\n\n**Embedded links vs. native uploads.** Many platforms only strip metadata from natively uploaded images. If you post a link to an image hosted elsewhere, the source file retains its original metadata. The platform might strip metadata from its cached preview, but anyone clicking through to the original source gets the full file.\n\n**High-quality or original sharing modes.** Several messaging apps offer \u201coriginal quality\u201d or \u201cdocument\u201d sharing modes that bypass compression and metadata stripping. Users often select these modes to avoid quality loss, not realizing they\u2019re also preserving GPS data.\n\n**API and third-party uploads.** Photos uploaded through platform APIs or third-party apps may be processed differently than photos uploaded through the official app. Metadata stripping policies sometimes apply only to the official upload pipeline.\n\n**Screenshots and screen recordings.** Taking a screenshot of a photo creates a new image with the screenshot\u2019s own metadata (typically your device info and timestamp, but without the original photo\u2019s GPS data). This is sometimes used as a manual metadata stripping technique, though it degrades image quality.",
        },
        {
          heading: "The bottom line",
          body: "If your goal is preventing other users from accessing your photo metadata, most major social platforms provide reasonable protection for standard uploads. But if your goal is preventing the platform itself from collecting your location and device data, or if you share photos through email, messaging apps, cloud storage, or any other non-social channel, the only reliable approach is stripping metadata before sharing.\n\nPlatform policies change without notice. A platform that strips metadata today might preserve it tomorrow, or might change how different sharing modes handle metadata. Building your privacy on platform behaviour means trusting decisions you can\u2019t control and might not even hear about.\n\nMetaStrip works regardless of where you\u2019re sharing, which platform\u2019s policy changed this week, or whether you\u2019re sending via email, chat, cloud link, or social media upload. Three seconds of metadata stripping gives you certainty that no platform policy change can take away.",
        },
      ],
    },
  },
];

export const BLOG_SLUGS: string[] = ARTICLES.map((a) => a.slug);

export function getArticleBySlug(slug: string): BlogArticle | null {
  return ARTICLES.find((a) => a.slug === slug) ?? null;
}

export function getFeaturedArticle(): BlogArticle | undefined {
  return ARTICLES.find((a) => a.featured);
}

export function getRelatedArticles(
  currentId: string,
  count = 3
): BlogArticle[] {
  return ARTICLES.filter((a) => a.id !== currentId).slice(0, count);
}

export function getCategoryLabel(categoryId: string): string {
  return CATEGORIES.find((c) => c.id === categoryId)?.label ?? categoryId;
}
