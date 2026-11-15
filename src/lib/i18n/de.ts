import { BATCH_LIMIT } from "../constants";
import type { Messages } from "./en";

/* German. Written by Claude for MS-6; to be checked by a native speaker
   before it ships. Du, plain and direct like the English. */

const liste = (items: string[]) =>
  items.length <= 1 ? items.join("") : `${items.slice(0, -1).join(", ")} und ${items[items.length - 1]}`;

export const de: Messages = {
  nav: {
    blog: "Blog",
    pricing: "Preise",
    about: "Über",
    github: "GitHub",
    openMenu: "Menü öffnen",
    closeMenu: "Menü schließen",
    tagline: "Nichts verlässt deinen Browser",
    language: "Sprache",
    lightMode: "Zum hellen Modus wechseln",
    darkMode: "Zum dunklen Modus wechseln",
  },

  hero: {
    scroll: "scrollen ↓",
    before: "Deine Dateien verraten ",
    items: ["GPS-Koordinaten", "Geräte-Fingerabdrücke", "Autorennamen", "KI-Kennzeichnungen", "Erstellungszeiten", "Seriennummern"],
    after: "beim Teilen.",
    intro: "GPS, EXIF, KI-Tags, Autorennamen: in Sekunden entfernt. Komplett in deinem Browser.",
    tryAbove: "Probier es oben aus",
  },

  how: {
    eyebrow: "So funktioniert es",
    title: ["Privatsphäre steckt im Detail.", "Genauer gesagt: in den Metadaten."],
    features: [
      {
        eyebrow: "Was drinsteckt",
        title: "Jede Datei, die du teilst, erzählt etwas.",
        body: "Fotos enthalten GPS-Koordinaten, Seriennummern, Kameradaten und Zeitstempel. PDFs enthalten Autorennamen, Bearbeitungsverläufe und Software-Spuren. KI-Bilder enthalten C2PA-Inhaltsnachweise, die verraten, mit welchem Tool sie erstellt wurden.",
        bullets: [
          "GPS bis auf 5 Meter genau, dort wo du standest",
          "Gerät und Seriennummer, die jedes Foto einem einzigen Handy zuordnen",
          "KI-Kennzeichnungen von DALL·E, Midjourney, ChatGPT und Firefly",
          "Autorennamen und Änderungsverfolgung in Word-, Excel- und PDF-Dokumenten",
        ],
      },
      {
        eyebrow: "So funktioniert es",
        title: "Datei ablegen. Sehen, was sie verrät. Entfernen.",
        body: "MetaStrip läuft komplett in deinem Browser. Kein Upload, kein Server, kein Zwischenspeicher. Du legst die Datei ab, das Tool liest ihre Metadaten direkt auf deinem Gerät mit eigenen Parsern und Bibliotheken wie pdf-lib, zeigt dir genau, was drinsteckt, und schreibt eine saubere Kopie.",
        bullets: [
          "Dateien verlassen nie dein Gerät, nachprüfbar in den DevTools",
          `Bis zu ${BATCH_LIMIT} Dateien auf einmal`,
          "Open Source unter MIT-Lizenz, der Code liegt auf GitHub",
          "Funktioniert auf Handy und Computer, online wie offline",
        ],
      },
      {
        eyebrow: "Wann du es brauchst",
        title: "Bevor du etwas teilst, das du nicht selbst geschrieben hast.",
        body: "Wohin eine Datei geht, dorthin folgen ihre Metadaten. Verträge an die Gegenseite, Fotos in Foren oder Kleinanzeigen, KI-Arbeiten an Kunden, journalistische Einsendungen, alles, was du unter Pseudonym veröffentlichst.",
        bullets: [
          "Bevor du Fotos postest, die du zu Hause gemacht hast",
          "Bevor du einem Kunden ein Word-Dokument mit Änderungsverlauf schickst",
          "Bevor du KI-gestützte Arbeit einreichst, wenn die Offenlegung über die Annahme entscheidet",
          "Bevor du etwas anonym veröffentlichst: Geräte hinterlassen Fingerabdrücke",
        ],
      },
    ],
  },

  faq: {
    eyebrow: "FAQ",
    title: "Fragen? Antworten.",
    intro: "Was die meisten wissen wollen: wie das Tool funktioniert, was es mit deinen Dateien macht und was mit deinen Daten passiert.",
    items: [
      {
        question: "Sind meine Dateien wirklich privat?",
        answer: "Ja. Jede Datei wird komplett in deinem Browser mit JavaScript verarbeitet. Deine Dateien werden nie hochgeladen oder auf einem Server zwischengespeichert. Du kannst das selbst prüfen: Öffne die DevTools, geh zum Tab Netzwerk und verarbeite eine Datei; keine Anfrage enthält sie. Die Seite sendet nur anonyme Nutzungsdaten, etwa welche Dateitypen bereinigt werden, nie Dateinamen, Inhalte oder Metadatenwerte. Das ganze Tool kommt beim ersten Laden mit der Seite und läuft danach lokal.",
      },
      {
        question: "Welche Metadaten entfernt MetaStrip?",
        answer: "Fotos: GPS-Koordinaten, EXIF (Kamerahersteller, Modell, Seriennummer, Einstellungen), IPTC, XMP, C2PA-Inhaltsnachweise, KI-Kennzeichnungen, eingebettete Vorschaubilder und Zeitstempel. PDFs: Autor, Ersteller-App, Producer, Titel, Betreff, Stichwörter, benutzerdefinierte Eigenschaften und Zeitstempel. Word, Excel und PowerPoint: Autor, zuletzt geändert von, Firma, Änderungsverfolgung, Kommentare, Versionsverlauf und Vorlagen-Metadaten. Video (MP4, MOV, M4V): GPS-Koordinaten, Hersteller, Modell und Software des Geräts, Hersteller-IDs, Erstellungs- und Spurzeitstempel sowie Tool-Spuren in den udta- und meta-Atomen. Audio (MP3, M4A, FLAC, WAV): ID3v1- und ID3v2-Tags, Vorbis-Kommentare, eingebettete Cover, RIFF-LIST/INFO-Blöcke, Broadcast-Wave-Erweiterungen (bext) und iXML-Metadaten. Die vollständige Aufstellung nach Dateityp steht auf der Datenschutzseite.",
      },
      {
        question: "Welche Dateitypen werden unterstützt?",
        answer: "Bilder: JPEG, PNG, WebP, HEIC (das Fotoformat des iPhones), AVIF, GIF und TIFF. Dokumente: PDF, Word (.docx), Excel (.xlsx) und PowerPoint (.pptx). Video: MP4, MOV und M4V. Audio: MP3, M4A, FLAC und WAV. RAW-Dateien von Kameras (DNG, NEF, CR2 und andere) werden noch nicht unterstützt.",
      },
      {
        question: "Ist MetaStrip wirklich kostenlos?",
        answer: "Ja. Keine Werbung, keine Cookies, keine Anmeldung, keine Upload-Grenzen, keine Premium-Version. Der Quellcode liegt offen auf GitHub unter MIT-Lizenz. Wenn dir das Tool hilft, kannst du mir auf Ko-fi einen Kaffee spendieren; das ist völlig freiwillig und nie Voraussetzung für irgendetwas.",
      },
      {
        question: "Verändert das Entfernen der Metadaten, wie meine Datei aussieht?",
        answer: "Nein. Bild- und Dokumentinhalt sowie die Qualität bleiben genau gleich. Nur die versteckten Metadaten werden entfernt. Die Datei wird etwas kleiner, weil diese Metadaten fehlen (meist ein paar KB pro Foto, bei KI-Bildern mit großen C2PA-Manifesten manchmal mehr).",
      },
      {
        question: "Was ist der Unterschied zur Option „Ort entfernen“ auf meinem Handy?",
        answer: "Die Foto-Apps von iPhone und Android entfernen die GPS-Koordinaten, behalten aber die meisten anderen Metadaten: Gerätemodell, Seriennummer, Softwareversion, Bearbeitungsverlauf, Kameraeinstellungen, KI-Kennzeichnungen und Zeitstempel. MetaStrip entfernt alles und funktioniert auch mit PDFs und Office-Dokumenten, nicht nur mit Fotos. Außerdem zeigt es dir vorher genau, was eingebettet war, damit du siehst, was deine Dateien preisgegeben haben.",
      },
      {
        question: "Was ist mit KI-generierten Bildern?",
        answer: "KI-Tools wie DALL·E, Midjourney, die Bildgenerierung von ChatGPT und Adobe Firefly betten C2PA-Inhaltsnachweise ein, die Bilder kryptografisch als KI-generiert kennzeichnen. MetaStrip entfernt sie zusammen mit den übrigen Metadaten. Gut zu wissen: Das entfernt KI-Kennzeichnungen in den Metadaten, aber keine steganografischen Wasserzeichen auf Pixelebene wie Googles SynthID; die stecken in den Bilddaten selbst, nicht in den Metadaten, und brauchen andere Verfahren.",
      },
      {
        question: "Ist MetaStrip Open Source?",
        answer: "Ja: MIT-Lizenz, Quellcode auf GitHub. Du kannst den Code prüfen, lokal ausführen, forken oder mitmachen. Das ganze Tool besteht aus eigenen Parsern und zwei öffentlichen Bibliotheken (pdf-lib und JSZip), also kannst du genau nachvollziehen, was es mit deinen Dateien macht.",
      },
      {
        question: "Kann ich mehrere Dateien auf einmal bearbeiten?",
        answer: `Ja: Leg bis zu ${BATCH_LIMIT} Dateien auf einmal ab, insgesamt bis zu 750 MB (ein einzelnes Video darf auf einem Computer bis zu 1,5 GB groß sein). Jede wird einzeln im Browser verarbeitet, und du kannst sie einzeln oder als eine ZIP-Datei herunterladen. Die Grenzen gibt es nur, weil der Arbeitsspeicher deines Browsers begrenzt ist, nicht weil wir Funktionen zurückhalten.`,
      },
      {
        question: "Funktioniert es auf dem Handy?",
        answer: "Ja. Das komplette Tool läuft in den Browsern von iOS und Android. Das Tool bleibt gleich, nur das Layout passt sich an.",
      },
    ],
    emailUs: "Schreib uns",
  },

  footer: {
    brand: "Versteckte Metadaten in deinen Dateien: GPS, EXIF, KI-Tags, Autorennamen, in Sekunden entfernt. Komplett in deinem Browser. Kostenlos und Open Source.",
    builtWith: "Gemacht mit",
    inMelbourne: "in Melbourne",
    by: "von",
    tagline: "MetaStrip · deine Dateien verlassen nie dein Gerät.",
    mitLicensed: "MIT-Lizenz",
    tools: "Tools",
    articles: "Artikel (auf Englisch)",
    site: "Seite",
    home: "Start",
    blog: "Blog",
    about: "Über",
    pricing: "Preise",
    privacy: "Datenschutz & Bedingungen",
    terminal: "Lieber im Terminal?",
    email: "E-Mail",
    toolLinks: {
      "remove-metadata-from-photos": "Metadaten aus Fotos entfernen",
      "remove-gps-location-from-photos": "GPS aus Fotos entfernen",
      "strip-exif-data": "EXIF-Daten entfernen",
      "remove-c2pa-metadata": "C2PA-Metadaten entfernen",
      "remove-author-from-pdf": "Autor aus PDF entfernen",
      "strip-metadata-from-word-document": "Word-Metadaten entfernen",
    },
  },

  categories: {
    gps: { label: "GPS & Standort", info: "Der genaue Ort, an dem das Foto oder Video entstanden ist, oft auf wenige Meter genau. Genug, um dein Zuhause, deinen Arbeitsplatz oder deinen Aufenthaltsort zu finden." },
    device: { label: "Gerät & Kamera", info: "Hersteller, Modell und Seriennummer des Geräts, mit dem die Datei entstanden ist. Wirkt wie ein Fingerabdruck, der all deine Dateien einem Gerät zuordnet." },
    dates: { label: "Datum & Uhrzeit", info: "Wann die Datei erstellt und zuletzt bearbeitet wurde, oft auf die Sekunde und mit Zeitzone. Das kann deinen Alltag und deinen ungefähren Aufenthaltsort verraten." },
    author: { label: "Autor & Identität", info: "Namen, Benutzernamen oder Urheberangaben, die dein Gerät oder deine Bearbeitungssoftware eingebettet hat." },
    software: { label: "Software & App", info: "Welche App in welcher Version die Datei verarbeitet hat. Verrät, welche Tools und welches Betriebssystem du nutzt." },
    ai: { label: "KI-Kennzeichnungen", info: "Herkunftsnachweise (wie C2PA), die die Datei als KI-generiert kennzeichnen und das Tool nennen, das sie erstellt hat." },
    copyright: { label: "Urheberrecht", info: "Urheberrechtshinweise und Rechteinformationen, die in der Datei gespeichert sind." },
    comments: { label: "Kommentare & Änderungen", info: "Kommentare, Änderungsverfolgung und Überarbeitungsnotizen, die im Dokument zurückgeblieben sind." },
    custom: { label: "Weitere Eigenschaften", info: "Andere eingebettete Felder: Auflösung, Kameraeinstellungen, Vorschaubilder, app-spezifische Tags und allerlei technische Überbleibsel." },
  },

  dropzone: {
    reading: "Deine Dateien werden gelesen…",
    dropHere: "Einfach hier ablegen.",
    prompt: "Zieh deine Dateien hierher oder klick, um sie auszuwählen. Alles wird in deinem Browser verarbeitet. Nichts wird auf fremde Server hochgeladen.",
    choose: "Dateien auswählen",
  },

  files: {
    reading: (done, total, large) => `lese ${done} von ${total}…${large ? " großer Stapel, das dauert einen Moment" : ""}`,
    count: (n) => `${n} ${n === 1 ? "Datei" : "Dateien"}`,
    tapToReview: "· zum Prüfen antippen",
    skipped: (names) => {
      const shown = names.slice(0, 2).join(", ");
      const more = names.length > 2 ? ` und ${names.length - 2} weitere` : "";
      return `${names.length} ${names.length === 1 ? "Datei" : "Dateien"} übersprungen, die MetaStrip noch nicht lesen kann: ${shown}${more}.`;
    },
    notRead: " · nicht gelesen",
    remove: (name) => `${name} entfernen`,
    processing: "Wird verarbeitet",
    done: "Fertig",
    notReadLabel: "Nicht gelesen",
  },

  review: {
    foundIn: "Gefunden in",
    removeAll: "Alle entfernen",
    locked: "Diese Datei ist gesperrt.",
    unreadable: "Diese Datei konnte nicht gelesen werden.",
    unchecked: "Es wurde nichts verändert, und wir können nicht sagen, ob sie Metadaten enthält. Behandle sie also als ungeprüft, nicht als sauber.",
    knowPassword: "Du kennst das Passwort? ",
    unlockLink: "Entsperre sie mit SanctumPDF",
    unlockRestPermissions: " und lass das Passwortfeld leer. Das ist ein kostenloses Tool vom Macher von MetaStrip, das ebenfalls in deinem Browser läuft, die Datei bleibt also auf deinem Gerät.",
    unlockRestPassword: ", einem kostenlosen Tool vom Macher von MetaStrip, das ebenfalls in deinem Browser läuft. Datei und Passwort bleiben also auf deinem Gerät.",
    lookInto: "Sollen wir uns das ansehen?",
    emailLink: (email) => `Schreib an ${email}`,
    emailRest: ". Wir füllen die Fehlerdetails aus, und du musst die Datei nicht anhängen.",
    clean: "Keine entfernbaren Metadaten gefunden. Die Datei ist schon sauber, du kannst das Original also so teilen, wie es ist.",
    fieldCount: (n) => `${n} ${n === 1 ? "Feld" : "Felder"}`,
    more: (n) => `+${n} weitere`,
    acrossAll: "deine Auswahl gilt für alle Dateien",
    removing: "Wird entfernt…",
    tryAnother: "Andere Datei versuchen",
    checkAnother: "Andere Datei prüfen",
    removeAllMetadata: "Alle Metadaten entfernen",
    removeSelected: (fileCount, selected) => `Auswahl entfernen${fileCount > 1 ? ` · ${fileCount} Dateien` : ` (${selected})`}`,
    location: "Standort",
    embeddedInFile: "in der Datei eingebettet",
    locationInfo: "Diese Karte wird in deinem Browser aus einer eingebauten Weltkarte gezeichnet; deine Koordinaten werden dafür nirgendwohin gesendet. Nichts über deinen Standort verlässt dein Gerät.",
    mapLabel: (where) => `Karte mit dem Aufnahmeort des Fotos bei ${where}`,
    whatIsThis: "Was ist das?",
  },

  report: {
    rechecking: (one) => (one ? "Die bereinigte Datei wird erneut geprüft…" : "Die bereinigten Dateien werden erneut geprüft…"),
    leftoversOne: "Die erneute Prüfung hat noch Metadaten in der bereinigten Datei gefunden. Details unten.",
    leftoversMany: (n) => `Die erneute Prüfung hat noch Metadaten in ${n} der Dateien gefunden. Details unten.`,
    couldntRecheck: (one) => (one ? "Die bereinigte Datei konnte nicht erneut geprüft werden." : "Die bereinigten Dateien konnten nicht erneut geprüft werden."),
    recheckedSummary: (one, checked, readable, kept) => {
      const what = kept ? "nur das, was du behalten wolltest, ist noch da" : "keine Metadaten mehr";
      const scope = one ? "Bereinigte Datei" : checked === readable ? `Alle ${readable} Dateien` : `${checked} von ${readable} Dateien`;
      return `${scope} erneut geprüft: ${what}.`;
    },
    markRechecking: "Wird erneut geprüft",
    markLeftovers: "Noch Metadaten gefunden",
    markRechecked: "Erneut geprüft",
    detailClean: "Bereinigte Datei erneut geprüft: keine Metadaten mehr.",
    detailKept: (n) =>
      `Bereinigte Datei erneut geprüft: nur ${n === 1 ? "das eine Feld, das du behalten wolltest, ist" : `die ${n} Felder, die du behalten wolltest, sind`} noch da.`,
    detailLeftovers: (categories) => `Die erneute Prüfung der bereinigten Datei hat noch ${liste(categories)} gefunden.`,
    detailLeftoversBug: " Verlass dich noch nicht darauf. Das ist ein Fehler in MetaStrip, und ",
    detailLeftoversIssue: "ein GitHub-Issue",
    detailLeftoversEnd: " hilft uns, ihn zu beheben.",
    detailSkipped: "Diese Datei ist zu groß, um sie automatisch erneut zu prüfen.",
    detailUnchecked: "Die bereinigte Datei konnte zur Kontrolle nicht erneut gelesen werden.",
    download: (many) => (many ? "Saubere Dateien laden (.zip)" : "Saubere Datei laden"),
    nothingCleaned: "Nichts wurde bereinigt",
    removed: "Metadaten entfernt",
    nothingLeft: "Nichts mehr zu entfernen",
    allFailed: (failed) =>
      failed === 1 ? "Diese Datei konnte nicht gelesen werden, also wurde nichts verändert." : `Alle ${failed} Dateien konnten nicht gelesen werden, also wurde nichts verändert.`,
    cleaned: (n) => `${n} ${n === 1 ? "Datei" : "Dateien"} bereinigt, in deinem Browser.`,
    someFailed: (n) => (n === 1 ? " 1 konnte nicht gelesen werden und blieb unverändert." : ` ${n} konnten nicht gelesen werden und blieben unverändert.`),
    saveOrShare: "Sichern oder teilen",
    fieldsRemoved: "Felder entfernt",
    fieldsKept: "Felder behalten",
    sizeSaved: "Gespart",
    notRead: "nicht gelesen",
    removedCount: (n) => `−${n} entfernt`,
    noneRemoved: "Aus dieser Datei wurden keine Felder entfernt.",
    startOver: "Neu starten",
    tipJar: "Kaffeekasse",
    star: "GitHub-Stern",
  },

  seoDoc: {
    whatsHidden: "Was in deinen Dateien steckt",
    category: "Kategorie",
    field: "Feld",
    example: "Beispielwert",
    formats: "Unterstützte Formate",
    footer: "metastrip v3.0; Metadaten entfernen mit Datenschutz zuerst; alles wird in deinem Browser verarbeitet",
    features: ["Metadaten im Browser entfernen", "Kein Datei-Upload nötig", "EXIF, IPTC und XMP entfernen", "GPS-Standort entfernen", "KI-Metadaten entfernen"],
  },

  errors: {
    lockedPassword: "Sie ist passwortgeschützt, und MetaStrip kann eine gesperrte Datei nicht verändern, ohne sie zu beschädigen. Entsperre sie zuerst mit ihrem Passwort und füge dann die entsperrte Kopie hinzu.",
    lockedPermissions: "Sie öffnet sich ohne Passwort, ist aber gegen Änderungen gesperrt, und MetaStrip kann eine gesperrte Datei nicht verändern, ohne sie zu beschädigen. Entferne zuerst die Sperre und füge dann die entsperrte Kopie hinzu.",
    lockedUnknown: "Sie ist verschlüsselt, und MetaStrip kann eine gesperrte Datei nicht verändern, ohne sie zu beschädigen. Entferne zuerst den Schutz und füge dann die entsperrte Kopie hinzu.",
    browser: "Dein Browser konnte sie nicht öffnen. Wenn du sie gerade heruntergeladen hast, warte, bis der Download fertig ist, oder speichere sie in einem Ordner auf diesem Gerät (nicht in einem reinen Cloud-Ordner) und versuch es noch einmal.",
    damaged: "Sie ist vielleicht beschädigt oder nutzt eine Variante des Formats, die MetaStrip noch nicht beherrscht.",
  },

  tool: {
    unsupported: (labels) =>
      labels && labels.length > 0 ? `${labels.join("- und ")}-Dateien werden noch nicht unterstützt.` : "Diese Dateitypen werden noch nicht unterstützt.",
    batchLimit: `Bis zu ${BATCH_LIMIT} Dateien auf einmal.`,
    tooBigPhone: (size, cap, computerCap) =>
      `Diese Datei ist ${size} groß. Auf dem Handy bis zu ${cap}; auf einem Computer dürfen Videos bis zu ${computerCap} groß sein.`,
    tooBigFile: (size, cap) => `Diese Datei ist ${size} groß. Bis zu ${cap} auf einmal.`,
    tooBigBatch: (size, cap) => `Dieser Stapel ist ${size} groß. Bis zu ${cap} auf einmal, versuch es also mit weniger Dateien.`,
    downloadFailed: "Der Download ist fehlgeschlagen; lade die Seite neu und versuch es noch einmal.",
    shareFailed: "Teilen hat hier nicht geklappt; nutze stattdessen Herunterladen.",
  },
};
