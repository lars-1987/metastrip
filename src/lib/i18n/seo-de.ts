import type { SEOPageConfig } from "../seo-configs";
import type { TranslatedToolSlug } from "./index";

/* German tool pages (MS-6 part 2). Written by Claude; to be checked by a native speaker. */
export const SEO_DE: Record<TranslatedToolSlug, SEOPageConfig> = {
  "remove-metadata-from-photos": {
    slug: "remove-metadata-from-photos",
    datePublished: "2026-11-15",
    keyword: "Metadaten aus Fotos entfernen",
    title: "Metadaten aus Fotos entfernen",
    subtitle:
      "Entferne GPS-Koordinaten, Kameradaten, KI-Kennzeichnungen und versteckte Daten aus deinen Bildern: sofort, privat und kostenlos.",
    heroLabel: "FOTO-METADATEN ENTFERNEN: KOSTENLOS, OHNE UPLOAD",
    metadataCategories: [
      {
        category: "gps",
        icon: "MapPin",
        color: "#ff4d6a",
        label: "GPS & Standort",
        fields: [
          { label: "Breitengrad", value: "-37.8180° S" },
          { label: "Längengrad", value: "144.9691° E" },
          { label: "Höhe", value: "18 m über dem Meeresspiegel" },
          { label: "Kartendatum", value: "WGS-84" },
        ],
      },
      {
        category: "device",
        icon: "DeviceMobile",
        color: "#a78bfa",
        label: "Gerät & Kamera",
        fields: [
          { label: "Hersteller", value: "Apple" },
          { label: "Modell", value: "iPhone 15 Pro Max" },
          { label: "Objektiv", value: "6.765mm f/1.78" },
          { label: "Seriennr.", value: "DNQXK4F..." },
          { label: "Auflösung", value: "4032 × 3024" },
        ],
      },
      {
        category: "dates",
        icon: "CalendarBlank",
        color: "#38bdf8",
        label: "Datum & Uhrzeit",
        fields: [
          { label: "Aufgenommen", value: "2025:01:15 14:23:07" },
          { label: "Digitalisiert", value: "2025:01:15 14:23:07" },
          { label: "Geändert", value: "2025:02:20 09:11:33" },
        ],
      },
      {
        category: "software",
        icon: "Laptop",
        color: "#818cf8",
        label: "Software",
        fields: [
          { label: "OS-Version", value: "17.2.1" },
          { label: "Host-Gerät", value: "iPhone 15 Pro Max" },
        ],
      },
      {
        category: "author",
        icon: "User",
        color: "#f472b6",
        label: "Autor",
        fields: [
          { label: "Urheber", value: "Lars K." },
          { label: "Copyright", value: "© 2025" },
        ],
      },
    ],
    explainerTabs: [
      {
        id: "location",
        label: "Standort",
        icon: "MapPin",
        color: "#ff4d6a",
        title: "Deine genauen Koordinaten",
        description:
          "Jedes Foto, das du mit einem Smartphone machst, enthält GPS-Koordinaten, die auf wenige Meter genau sind. Teil ein Foto deiner Haustür, und jeder kann deine Wohnadresse daraus auslesen.",
        example: {
          label: "Was drinsteckt",
          value: "-37.8180° S, 144.9691° E",
        },
        risk: "Aus Fotos, die du online teilst, lassen sich dein Zuhause, dein Arbeitsplatz oder dein Tagesablauf herausfinden.",
      },
      {
        id: "device",
        label: "Gerät",
        icon: "DeviceMobile",
        color: "#a78bfa",
        title: "Die Identität deines Geräts",
        description:
          "Kamerahersteller, Modell, Objektivdaten und manchmal Seriennummern stecken in jeder Aufnahme. Das ergibt einen eindeutigen Fingerabdruck, über den sich anonyme Fotos deinem Gerät zuordnen lassen.",
        example: {
          label: "Was drinsteckt",
          value: "iPhone 15 Pro Max, S/N: DNQXK4F...",
        },
        risk: "Mehrere „anonyme“ Fotos lassen sich demselben Gerät zuordnen und damit dir.",
      },
      {
        id: "timestamps",
        label: "Zeitstempel",
        icon: "CalendarBlank",
        color: "#38bdf8",
        title: "Wann du dort warst",
        description:
          "Erstellungsdatum, Änderungsdatum und Zeitzone verraten nicht nur, wann ein Foto entstanden ist, sondern auch deine Gewohnheiten: wann du zu Hause bist, bei der Arbeit oder auf Reisen.",
        example: {
          label: "Was drinsteckt",
          value: "2025:01:15 14:23:07 +11:00 (AEDT)",
        },
        risk: "Zusammen mit Standortdaten zeichnen Zeitstempel deine täglichen Wege genau nach.",
      },
      {
        id: "ai",
        label: "KI-Tags",
        icon: "Robot",
        color: "#c084fc",
        title: "Fingerabdrücke der KI-Erzeugung",
        description:
          "Bilder von Midjourney, DALL-E, Stable Diffusion und Adobe Firefly enthalten inzwischen C2PA-Inhaltsnachweise und KI-Metadaten in XMP, die sie dauerhaft als KI-generiert kennzeichnen.",
        example: {
          label: "Was drinsteckt",
          value: "c2pa.ai_generated: true | tool: midjourney-v6",
        },
        risk: "Soziale Netzwerke und Suchmaschinen fangen an, KI-gekennzeichnete Inhalte automatisch zu markieren und herabzustufen.",
      },
    ],
    seoContent: {
      heading: "Warum solltest du Metadaten aus deinen Fotos entfernen?",
      paragraphs: [
        "Jedes Foto von einem modernen Smartphone oder einer Digitalkamera enthält versteckte Metadaten: GPS-Koordinaten, Kameradaten, Zeitstempel und manchmal sogar deinen Namen. Diese Daten werden automatisch eingebettet, und die meisten Menschen merken nie, dass sie da sind.",
        "Wenn du Fotos per E-Mail, über Cloud-Speicher oder Messenger teilst oder sie auf Websites hochlädst, reisen diese Metadaten oft mit. Manche sozialen Netzwerke entfernen Metadaten beim Hochladen, doch viele Wege des Teilens lassen sie vollständig drin.",
        "Für deine Privatsphäre hat das große Folgen. Ein Foto, das du zu Hause machst, verrät deine Wohnadresse. Viele Fotos über längere Zeit verraten deinen Alltag. Für Journalistinnen und Journalisten, Aktivistinnen und Aktivisten und Menschen, die häusliche Gewalt überlebt haben, können diese Daten wirklich gefährlich sein.",
        "MetaStrip entfernt alle versteckten Metadaten sofort aus deinen Fotos, direkt in deinem Browser. Deine Dateien werden nie auf einen Server hochgeladen; die Verarbeitung läuft komplett auf deinem Gerät.",
      ],
    },
    supportedFormats: [
      {
        ext: "JPEG",
        desc: "Komplettes EXIF, IPTC, XMP, GPS, KI-Tags, Vorschaubilder",
        color: "#a78bfa",
      },
      {
        ext: "PNG",
        desc: "Metadaten-Chunks tEXt, iTXt, zTXt, XMP",
        color: "#38bdf8",
      },
      {
        ext: "WebP",
        desc: "Eingebettete EXIF- und XMP-Metadaten",
        color: "#4ade80",
      },
      {
        ext: "HEIC",
        desc: "EXIF, GPS, XMP und C2PA, ohne Umwandlung",
        color: "#f472b6",
      },
      {
        ext: "AVIF",
        desc: "EXIF, XMP und C2PA",
        color: "#fbbf24",
      },
      {
        ext: "TIFF",
        desc: "EXIF, GPS, XMP und IPTC auf jeder Seite",
        color: "#94a3b8",
      },
    ],
    metaTitle: "Metadaten aus Fotos entfernen: online & gratis | MetaStrip",
    metaDescription:
      "Entferne GPS, EXIF, Kameradaten und KI-Tags aus Fotos, direkt im Browser. JPG, PNG, WebP, HEIC, AVIF, TIFF. Kein Upload, kein Konto, kostenlos.",
  },

  "remove-gps-location-from-photos": {
    slug: "remove-gps-location-from-photos",
    datePublished: "2026-11-15",
    keyword: "Standort aus Fotos entfernen",
    title: "GPS-Standort aus Fotos entfernen",
    subtitle:
      "Entferne eingebettete GPS-Koordinaten, Höhe, Geschwindigkeit und Richtung aus deinen Fotos, bevor du sie online teilst.",
    heroLabel: "GPS-STANDORT AUS FOTOS ENTFERNEN: KOSTENLOS & PRIVAT",
    metadataCategories: [
      {
        category: "gps",
        icon: "MapPin",
        color: "#ff4d6a",
        label: "GPS-Koordinaten",
        fields: [
          { label: "Breitengrad", value: "34.0522° N" },
          { label: "Längengrad", value: "118.2437° W" },
          { label: "Höhe", value: "71 m über dem Meeresspiegel" },
          { label: "Richtung", value: "247.3° (WSW)" },
          { label: "Geschwindigkeit", value: "0.0 km/h" },
          { label: "Kartendatum", value: "WGS-84" },
        ],
      },
      {
        category: "gps",
        icon: "Clock",
        color: "#f97316",
        label: "GPS-Zeitstempel",
        fields: [
          { label: "GPS-Datum", value: "2025:02:15" },
          { label: "GPS-Uhrzeit", value: "19:42:33 UTC" },
          { label: "UTC-Versatz", value: "-08:00 (PST)" },
        ],
      },
      {
        category: "device",
        icon: "DeviceMobile",
        color: "#a78bfa",
        label: "Gerät (auch mit Ortsbezug)",
        fields: [
          { label: "Hersteller", value: "Samsung" },
          { label: "Modell", value: "Galaxy S24 Ultra" },
          { label: "Seriennr.", value: "RF8R..." },
        ],
      },
    ],
    explainerTabs: [
      {
        id: "coords",
        label: "Koordinaten",
        icon: "MapPin",
        color: "#ff4d6a",
        title: "Genau bis vor deine Haustür",
        description:
          "Die GPS-Daten, die ein Smartphone in Fotos einbettet, sind meist auf 3 bis 5 Meter genau. Das reicht, um deine genaue Wohnadresse, deinen Arbeitsplatz, dein Fitnessstudio, deine Schule oder jeden anderen Ort zu bestimmen, den du fotografierst. Ein einziges Foto kann verraten, wo du wohnst.",
        example: {
          label: "Was drinsteckt",
          value: "34.0522° N, 118.2437° W, auf ca. 3 Meter genau",
        },
        risk: "Ein Foto von deinem Haustier, deinem Essen oder deinem Hobby, zu Hause aufgenommen, verrät jedem, der nachsieht, deine Wohnadresse.",
      },
      {
        id: "patterns",
        label: "Muster",
        icon: "MapTrifold",
        color: "#f97316",
        title: "Mehrere Fotos kartieren dein Leben",
        description:
          "Ein Foto verrät einen Ort. Ein Dutzend Fotos verrät deinen Alltag: wo du wohnst, arbeitest, isst, trainierst und Leute triffst. Zusammen mit Zeitstempeln ergibt das eine genaue Zeitleiste deiner Wege.",
        example: {
          label: "Was 10 Fotos verraten",
          value:
            "Zuhause → Fitnessstudio (7 Uhr) → Büro (9 Uhr) → Mittagessen → Zuhause (18 Uhr)",
        },
        risk: "Wer über Wochen regelmäßig Fotos teilt, gibt anderen eine Karte, die vorhersagt, wo er wann sein wird.",
      },
      {
        id: "platforms",
        label: "Welche Apps entfernen?",
        icon: "MagnifyingGlass",
        color: "#38bdf8",
        title: "Nicht jede Plattform schützt dich",
        description:
          "Instagram und Facebook entfernen GPS beim Hochladen. Aber E-Mail, WhatsApp (beim Senden als Dokument), Cloud-Speicher (Google Drive, Dropbox), Foren, private Websites und viele Messenger behalten die GPS-Daten vollständig bei.",
        example: {
          label: "Plattformen, die GPS NICHT entfernen",
          value:
            "E-Mail, WhatsApp-Dokumente, Google Drive, Dropbox, Foren, Blogs",
        },
        risk: "Jedes Mal, wenn du ein Foto außerhalb von Instagram oder Facebook teilst, geh davon aus, dass die GPS-Daten noch drin sind.",
      },
      {
        id: "stalking",
        label: "Echte Risiken",
        icon: "Warning",
        color: "#f472b6",
        title: "Standort-Metadaten haben echte Folgen",
        description:
          "Es gibt dokumentierte Fälle von Stalking, Einbrüchen und Belästigung, die durch GPS-Metadaten in Fotos möglich wurden. Urlaubsfotos verraten, dass du nicht zu Hause bist. Fotos von Wertsachen verraten, wo sie aufbewahrt werden.",
        example: {
          label: "Szenarien aus der Praxis",
          value:
            "Urlaubsposts → Wohnung bekanntermaßen leer | Haustierfotos → Wohnadresse",
        },
        risk: "Das ist keine Theorie. Ermittlungsbehörden lesen bei Ermittlungen regelmäßig GPS-Daten aus Fotos aus.",
      },
    ],
    seoContent: {
      heading: "Warum solltest du GPS-Standortdaten aus deinen Fotos entfernen?",
      paragraphs: [
        "Jedes Foto, das du mit einem Smartphone machst, enthält eingebettete GPS-Koordinaten, die genau zeigen, wo es aufgenommen wurde, oft auf wenige Meter genau. Diese Daten stehen in den EXIF-Metadaten der Bilddatei und reisen mit, wenn du das Foto teilst.",
        "Große soziale Netzwerke wie Instagram und Facebook entfernen Standortdaten beim Hochladen, viele andere Wege des Teilens aber nicht. E-Mail-Anhänge, Messenger (beim Senden als Datei), Links zu Cloud-Speichern, Forenbeiträge und private Websites behalten GPS-Koordinaten standardmäßig bei.",
        "Für deine Privatsphäre hat das große Folgen. Ein Foto, das du zu Hause machst, verrät deine Wohnadresse. Fotos über längere Zeit verraten deinen Alltag: wo du arbeitest, isst, trainierst und Leute triffst. Für Personen des öffentlichen Lebens, Journalistinnen und Journalisten, Aktivistinnen und Aktivisten und Menschen, die häusliche Gewalt überlebt haben, können diese Daten wirklich gefährlich sein.",
        "MetaStrip entfernt alle GPS- und Standortdaten aus deinen Fotos, bevor du sie teilst. Die Verarbeitung läuft komplett in deinem Browser; deine Fotos und Standortdaten werden nirgendwohin hochgeladen. Du brauchst kein Konto, und der Quellcode ist öffentlich auf GitHub, sodass du nachprüfen kannst, wie es funktioniert.",
      ],
    },
    supportedFormats: [
      {
        ext: "JPEG",
        desc: "Alle GPS-Daten: Koordinaten, Höhe, Geschwindigkeit, Richtung, Zeitstempel",
        color: "#ff4d6a",
      },
      {
        ext: "PNG",
        desc: "GPS-Daten in tEXt-/iTXt-Chunks und XMP",
        color: "#38bdf8",
      },
      {
        ext: "WebP",
        desc: "EXIF-GPS-Daten, XMP-Standortmetadaten",
        color: "#4ade80",
      },
      {
        ext: "HEIC",
        desc: "EXIF, GPS, XMP und C2PA, ohne Umwandlung",
        color: "#f472b6",
      },
      {
        ext: "AVIF",
        desc: "EXIF, XMP und C2PA",
        color: "#fbbf24",
      },
      {
        ext: "TIFF",
        desc: "EXIF, GPS, XMP und IPTC auf jeder Seite",
        color: "#94a3b8",
      },
    ],
    metaTitle: "Standort aus Fotos entfernen: gratis & privat | MetaStrip",
    metaDescription:
      "Entferne GPS-Koordinaten, Höhe und Zeitzone aus Fotos, bevor du sie teilst. Komplett in deinem Browser. Kostenlos, kein Upload, kein Konto.",
  },

  "strip-exif-data": {
    slug: "strip-exif-data",
    datePublished: "2026-11-15",
    keyword: "EXIF-Daten entfernen",
    title: "EXIF-Daten online entfernen",
    subtitle:
      "Entferne EXIF, IPTC, XMP und alle eingebetteten Metadaten aus Fotos: kostenlos, privat, ohne Upload.",
    heroLabel: "EXIF-DATEN ENTFERNEN: KOSTENLOS, 100 % IM BROWSER",
    metadataCategories: [
      {
        category: "gps",
        icon: "MapPin",
        color: "#ff4d6a",
        label: "GPS / EXIF-Standort",
        fields: [
          { label: "GPSLatitude", value: "40.7484° N" },
          { label: "GPSLongitude", value: "73.9857° W" },
          { label: "GPSAltitude", value: "86m" },
          { label: "GPSSpeed", value: "0.12 km/h" },
        ],
      },
      {
        category: "device",
        icon: "DeviceMobile",
        color: "#a78bfa",
        label: "EXIF-Kameradaten",
        fields: [
          { label: "Make", value: "Canon" },
          { label: "Model", value: "EOS R5" },
          { label: "LensModel", value: "RF 24-70mm F2.8 L IS USM" },
          { label: "SerialNumber", value: "032024001..." },
          { label: "ShutterCount", value: "48.291" },
        ],
      },
      {
        category: "dates",
        icon: "CalendarBlank",
        color: "#38bdf8",
        label: "EXIF-Zeitstempel",
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
        label: "Bearbeitungssoftware",
        fields: [
          {
            label: "Software",
            value: "Adobe Lightroom Classic 14.1",
          },
          { label: "ProcessingHistory", value: "3 Bearbeitungen angewendet" },
        ],
      },
      {
        category: "author",
        icon: "User",
        color: "#f472b6",
        label: "IPTC-Urheber",
        fields: [
          { label: "Artist", value: "James Chen Photography" },
          { label: "Copyright", value: "© 2025 James Chen" },
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
        title: "Die komplette EXIF-Spezifikation",
        description:
          "EXIF (Exchangeable Image File Format) ist der umfassendste Metadatenstandard in der Fotografie. Er speichert Kameraeinstellungen, GPS-Koordinaten, Ausrichtung, Farbraum, Vorschaubilder und Dutzende technische Parameter, alles unsichtbar in deiner Bilddatei eingebettet.",
        example: {
          label: "Typischer EXIF-Inhalt",
          value:
            "40 bis 80 Metadatenfelder pro Foto | 10 bis 50 KB versteckte Daten",
        },
        risk: "Ein einziger EXIF-Auszug verrät die Seriennummer deiner Kamera, deinen genauen Standort und alle Aufnahmeparameter.",
      },
      {
        id: "iptc",
        label: "IPTC",
        icon: "NotePencil",
        color: "#38bdf8",
        title: "Redaktions- und Urheberrechtsdaten",
        description:
          "Nachrichtenagenturen und Stockfoto-Dienste nutzen IPTC-Metadaten, um Urhebernachweise, Bildunterschriften, Stichwörter und Lizenzbedingungen einzubetten. Wenn du schon einmal Fotos bei einer Stockplattform eingereicht hast, folgen diese Daten deinen Bildern überallhin.",
        example: {
          label: "Was drinsteckt",
          value:
            "Urheber: James Chen | Bildnachweis: Shutterstock | Stichwörter: Stadt, Nacht",
        },
        risk: "Über IPTC-Daten lassen sich „anonyme“ Fotos deinem Stockfoto-Profil oder deinem echten Namen zuordnen.",
      },
      {
        id: "xmp",
        label: "XMP",
        icon: "Package",
        color: "#06b6d4",
        title: "Adobes erweiterbare Metadaten",
        description:
          "XMP (Extensible Metadata Platform) ist Adobes Metadaten-Framework, das in Bilder eingebettet wird, die mit Lightroom, Photoshop und Camera Raw bearbeitet wurden. Es enthält Bearbeitungsverlauf, Bewertungen, Sammlungen und eigene Tags.",
        example: {
          label: "Was drinsteckt",
          value:
            "xmp:CreatorTool: Lightroom Classic 14.1 | xmp:Rating: 4",
        },
        risk: "XMP verrät deinen kompletten Bearbeitungsablauf, deine Softwareversionen und wie du deine Fotobibliothek organisierst.",
      },
      {
        id: "thumbnail",
        label: "Vorschaubilder",
        icon: "ImageSquare",
        color: "#f472b6",
        title: "Versteckte Vorschaubilder",
        description:
          "JPEG-Dateien enthalten oft ein eingebettetes Vorschaubild, das bei der Aufnahme erzeugt wurde. Wenn du das Foto später zugeschnitten oder bearbeitet hast, steckt das ursprüngliche, unbeschnittene Vorschaubild womöglich noch in der Datei.",
        example: {
          label: "Was drinsteckt",
          value:
            "160×120-JPEG-Vorschaubild, zeigt womöglich das unbeschnittene Original",
        },
        risk: "Der berüchtigte „Cat-Schwartz-Vorfall“: Ein zugeschnittenes Foto enthielt noch das vollständige, unbeschnittene Vorschaubild.",
      },
    ],
    seoContent: {
      heading: "Was sind EXIF-Daten, und warum solltest du sie entfernen?",
      paragraphs: [
        "EXIF ist ein Metadatenstandard, der technische Angaben und Kontextinformationen in Bilddateien speichert. Ursprünglich sollte er Fotografen helfen, ihre Arbeit zu ordnen; im Zeitalter von Smartphone-Fotos und sozialen Netzwerken ist EXIF zu einem ernsten Datenschutzproblem geworden.",
        "Jedes Foto von einem modernen Smartphone oder einer Digitalkamera enthält EXIF-Daten. Typischerweise gehören dazu GPS-Koordinaten, die auf wenige Meter genau sind, das genaue Datum und die Uhrzeit, Kamerahersteller und Modell, Seriennummern, Objektivdaten und Belichtungseinstellungen. Bei bearbeiteten Fotos können auch die verwendete Software und der Bearbeitungsverlauf gespeichert sein.",
        "Manche sozialen Netzwerke entfernen EXIF-Daten beim Hochladen, viele aber nicht; und E-Mail, Messenger, Cloud-Speicher und Websites behalten Metadaten oft vollständig bei. Sobald ein Foto mit intakten EXIF-Daten geteilt ist, kann jeder, der es herunterlädt, deinen Standort, die Identität deines Geräts und persönliche Angaben auslesen.",
        "MetaStrip entfernt EXIF-Daten aus JPEG-, PNG-, WebP-, HEIC-, AVIF- und TIFF-Bildern. Die gesamte Verarbeitung läuft in deinem Browser; deine Fotos werden nie auf einen Server hochgeladen.",
      ],
    },
    supportedFormats: [
      {
        ext: "JPEG",
        desc: "Komplettes EXIF, IPTC, XMP, GPS, eingebettete Vorschaubilder",
        color: "#a78bfa",
      },
      {
        ext: "PNG",
        desc: "Metadaten-Chunks tEXt, iTXt, zTXt, XMP-Sidecar",
        color: "#38bdf8",
      },
      {
        ext: "WebP",
        desc: "Eingebettete EXIF- und XMP-Metadaten",
        color: "#4ade80",
      },
      {
        ext: "HEIC",
        desc: "EXIF, GPS, XMP und C2PA, ohne Umwandlung",
        color: "#f472b6",
      },
      {
        ext: "AVIF",
        desc: "EXIF, XMP und C2PA",
        color: "#fbbf24",
      },
      {
        ext: "TIFF",
        desc: "EXIF, GPS, XMP und IPTC auf jeder Seite",
        color: "#94a3b8",
      },
    ],
    metaTitle: "EXIF-Daten entfernen: online ansehen & löschen | MetaStrip",
    metaDescription:
      "Entferne EXIF-, IPTC-, XMP- und GPS-Metadaten aus Fotos. Sieh, was drinsteckt, und lösch es. Kostenlos, im Browser, ohne Upload.",
  },

  "remove-c2pa-metadata": {
    slug: "remove-c2pa-metadata",
    datePublished: "2026-11-15",
    keyword: "C2PA-Metadaten aus Bildern entfernen",
    title: "C2PA-Metadaten entfernen",
    subtitle:
      "Entferne C2PA-Inhaltsnachweise aus JPEG-, PNG-, WebP-, HEIC- und AVIF-Bildern sowie MP4- und MOV-Videos, in deinem Browser. Beliebig viele Dateien, keine Anmeldung, kein Upload.",
    heroLabel: "C2PA-INHALTSNACHWEISE ENTFERNEN: UNBEGRENZT, OHNE UPLOAD",
    metadataCategories: [
      {
        category: "ai",
        icon: "LockKey",
        color: "#c084fc",
        label: "C2PA-Manifest",
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
        label: "Signatur & Herkunft",
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
        label: "XMP-Herkunftsblock",
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
        label: "Nachweise der Aufnahme",
        fields: [
          { label: "c2pa.capture_device", value: "Google Pixel 10" },
          { label: "exif:Make", value: "Google" },
          { label: "c2pa.hash.data", value: "bei der Aufnahme signiert" },
        ],
      },
    ],
    explainerTabs: [
      {
        id: "what",
        label: "Was C2PA ist",
        icon: "LockKey",
        color: "#c084fc",
        title: "Ein signierter Eintrag, der an deiner Datei hängt",
        description:
          "C2PA-Inhaltsnachweise (Coalition for Content Provenance and Authenticity) sind ein kryptografisch signiertes Manifest, das in ein Bild eingebettet ist. Es hält fest, womit die Datei erstellt wurde, welches Tool sie bearbeitet hat, wann und ob KI beteiligt war. Adobe vermarktet es als Content Credentials.",
        example: {
          label: "Wo es steckt",
          value:
            "JUMBF-Boxen in JPEG, ein caBX-Chunk in PNG, ein C2PA-Chunk in WebP, eine uuid-Box in HEIC und AVIF",
        },
        risk: "Das Manifest reist mit der Datei, also kann jeder, der sie bekommt, dein Tool, deine Zeitstempel und deinen Bearbeitungsverlauf lesen.",
      },
      {
        id: "removable",
        label: "Warum entfernbar",
        icon: "ShieldCheck",
        color: "#a78bfa",
        title: "Es sind Metadaten, keine Pixel",
        description:
          "Das Manifest liegt im Metadaten-Container der Datei, neben dem Bild und nicht darin. Genau deshalb lässt es sich entfernen, ohne ein einziges Pixel anzufassen. Dein Bild sieht danach genauso aus wie vorher, nur ohne den angehängten Herkunftsnachweis.",
        example: {
          label: "Was sich ändert",
          value:
            "Manifest entfernt, Bilddaten Byte für Byte unverändert, Datei etwas kleiner",
        },
        risk: "Auch Neuspeichern in einer anderen App kann es entfernen, aber dabei wird meist neu komprimiert, und das kostet Qualität.",
      },
      {
        id: "formats",
        label: "Alle Formate",
        icon: "ImageSquare",
        color: "#38bdf8",
        title: "Auch HEIC, AVIF und Video",
        description:
          "C2PA wird in jedem Format anders eingebunden, deshalb kommen viele Tools nur mit einem oder zwei Formaten klar. MetaStrip liest alle vier Varianten: APP11-JUMBF-Segmente in JPEG, den caBX-Chunk in PNG, den C2PA-RIFF-Chunk in WebP und die uuid-Box, die sich HEIC (das Format, in dem jedes iPhone standardmäßig fotografiert), AVIF (das kompakte Format, das immer mehr KI-Tools exportieren) sowie MP4- und MOV-Videos teilen.",
        example: {
          label: "Unterstützt",
          value: "JPEG, PNG, WebP, HEIC, AVIF, MP4 und MOV, dazu EXIF, XMP und IPTC gleich mit",
        },
        risk: "Ein Tool, das nur PNG und WebP kann, lässt deine Kamerafotos und iPhone-Aufnahmen unangetastet.",
      },
      {
        id: "limits",
        label: "Was es nicht kann",
        icon: "Eye",
        color: "#f472b6",
        title: "Pixel-Wasserzeichen sind eine eigene Ebene",
        description:
          "Wenn du das C2PA-Manifest entfernst, entfernst du die Metadatenebene. Ein unsichtbares Pixel-Wasserzeichen wie Googles SynthID, das in die Bilddaten selbst eingewoben ist, bleibt dabei erhalten. Das kann kein Metadaten-Tool, und jedes Tool, das etwas anderes behauptet, verspricht mehr, als möglich ist.",
        example: {
          label: "Ehrlich gesagt",
          value:
            "Metadatenebene entfernt; Wasserzeichen auf Pixelebene bleiben unangetastet",
        },
        risk: "Wisse, mit welcher Ebene du es zu tun hast, bevor du annimmst, dass ein Bild überhaupt keine Kennzeichnung mehr trägt.",
      },
    ],
    seoContent: {
      heading: "So entfernst du C2PA-Metadaten aus einem Bild",
      paragraphs: [
        "Leg ein Bild oben im Tool ab. MetaStrip liest das C2PA-Manifest direkt in deinem Browser, zeigt dir genau, welche Herkunftsdaten eingebettet sind, und entfernt sie, sobald du bestätigst. Die bereinigte Datei wird direkt wieder bei dir heruntergeladen. Zu keinem Zeitpunkt wird etwas auf einen Server hochgeladen, und das zählt, wenn der ganze Grund fürs Entfernen ist, dass du die Herkunftsdaten lieber nicht teilen willst.",
        "C2PA-Inhaltsnachweise werden automatisch von immer mehr Quellen eingebettet: Adobe Firefly, Exporte aus Photoshop und Lightroom, DALL-E und Sora von OpenAI, Google Gemini und Imagen sowie auf Hardware-Ebene von Kameras von Sony, Nikon und Leica, dazu das Google Pixel, das jedes Foto signiert, das es aufnimmt. Wenn dein Bild aus einer dieser Quellen stammt, trägt es sehr wahrscheinlich ein Manifest, ob du davon wusstest oder nicht.",
        "Weil das Manifest im Metadaten-Container der Datei liegt und nicht in den Pixeln, sieht das Bild nach dem Entfernen genauso aus wie vorher. MetaStrip entfernt das C2PA-Manifest zusammen mit den EXIF-, XMP- und IPTC-Daten daneben, damit nach dem Löschen des Herkunftsnachweises nicht noch dein Kameramodell und deine GPS-Koordinaten übrig bleiben.",
        "Eine ehrliche Grenze: Wenn du das C2PA-Manifest entfernst, entfernst du die Kennzeichnung in den Metadaten. Ein Wasserzeichen auf Pixelebene wie SynthID, das in den Bilddaten selbst steckt, bleibt erhalten; das kann kein Metadaten-Tool entfernen. Die meisten automatischen Prüfungen lesen das Manifest, daher reicht das Entfernen meist aus, aber den Unterschied solltest du kennen.",
      ],
    },
    supportedFormats: [
      {
        ext: "JPEG",
        desc: "APP11-JUMBF-Manifest, XMP-Herkunftsblock, EXIF gleich mit",
        color: "#c084fc",
      },
      {
        ext: "PNG",
        desc: "caBX-Manifest-Chunk, XMP-Herkunftsdaten in iTXt, Text-Chunks",
        color: "#a78bfa",
      },
      {
        ext: "WebP",
        desc: "C2PA-RIFF-Chunk, XMP-Herkunftsdaten, EXIF-Chunk",
        color: "#38bdf8",
      },
      {
        ext: "HEIC",
        desc: "C2PA-uuid-Box, Exif- und XMP-Items, Standardformat des iPhones",
        color: "#818cf8",
      },
      {
        ext: "AVIF",
        desc: "C2PA-uuid-Box, Exif- und XMP-Items, IPTC-KI-Kennzeichnung",
        color: "#f472b6",
      },
      {
        ext: "MP4 / MOV",
        desc: "C2PA-uuid-Box und Adobes XMP-uuid-Box, Video und Audio bleiben unangetastet",
        color: "#fb923c",
      },
    ],
    metaTitle: "C2PA-Metadaten entfernen: gratis & unbegrenzt | MetaStrip",
    metaDescription:
      "Entferne C2PA-Inhaltsnachweise aus JPEG, PNG, WebP, HEIC, AVIF sowie MP4- und MOV-Videos. Läuft im Browser, kein Upload, keine Anmeldung.",
  },

  "remove-author-from-pdf": {
    slug: "remove-author-from-pdf",
    datePublished: "2026-11-15",
    keyword: "Autor aus PDF entfernen",
    title: "Autor aus PDF entfernen",
    subtitle:
      "Entferne Autorennamen, Ersteller-Apps, Firmenangaben und versteckte Dokumenteigenschaften aus PDF-Dateien: sofort, in deinem Browser.",
    heroLabel: "PDF-AUTOR & METADATEN ENTFERNEN: KOSTENLOS, OHNE UPLOAD",
    metadataCategories: [
      {
        category: "author",
        icon: "User",
        color: "#f472b6",
        label: "Autor & Identität",
        fields: [
          { label: "Autor", value: "Sarah Mitchell" },
          {
            label: "Titel",
            value: "Umsatzprognose Q4: VERTRAULICH",
          },
          { label: "Betreff", value: "Interne Finanzprüfung" },
          {
            label: "Stichwörter",
            value: "Umsatz, Prognose, Vorstand, vertraulich",
          },
        ],
      },
      {
        category: "software",
        icon: "Laptop",
        color: "#818cf8",
        label: "Software & Producer",
        fields: [
          { label: "Ersteller-App", value: "Microsoft Word 2024" },
          { label: "Producer", value: "macOS 14.3 Quartz PDFContext" },
        ],
      },
      {
        category: "dates",
        icon: "CalendarBlank",
        color: "#38bdf8",
        label: "Datum & Uhrzeit",
        fields: [
          { label: "Erstellt", value: "D:20250108091422Z" },
          { label: "Geändert", value: "D:20250218164207Z" },
        ],
      },
      {
        category: "custom",
        icon: "Tag",
        color: "#fbbf24",
        label: "Eigene Eigenschaften",
        fields: [
          { label: "Firma", value: "Nexus Financial Group" },
          { label: "Abteilung", value: "Unternehmensstrategie" },
          { label: "Einstufung", value: "Nur intern" },
        ],
      },
    ],
    explainerTabs: [
      {
        id: "author",
        label: "Autor",
        icon: "User",
        color: "#f472b6",
        title: "Dein Name steckt in jedem PDF",
        description:
          "PDF-Dateien übernehmen den Autorennamen aus dem Benutzerkonto deines Computers oder aus der App, mit der sie erstellt wurden. Wenn du ein PDF nach außen schickst, sieht der Empfänger genau, wer es erstellt hat und jede Person, die es bearbeitet hat.",
        example: {
          label: "Was drinsteckt",
          value:
            "Autor: Sarah Mitchell | Firma: Nexus Financial Group",
        },
        risk: "Du verschickst ein „vertrauliches“ Dokument? Das Autorfeld verrät genau, wer es geschrieben hat und wo diese Person arbeitet.",
      },
      {
        id: "software",
        label: "Software",
        icon: "Laptop",
        color: "#818cf8",
        title: "Deine Tools verraten dein System",
        description:
          "Die Felder für Ersteller-App und PDF-Producer verraten dein Betriebssystem, deine Softwareversion und den genauen Arbeitsablauf, mit dem die Datei entstanden ist. Für Social Engineering ist das eine Goldgrube.",
        example: {
          label: "Was drinsteckt",
          value:
            "Ersteller-App: Microsoft Word 2024 | Producer: macOS 14.3 Quartz",
        },
        risk: "Angreifer können gezielt Schwachstellen deines Betriebssystems und deiner Softwareversionen ausnutzen.",
      },
      {
        id: "dates",
        label: "Zeitstempel",
        icon: "CalendarBlank",
        color: "#38bdf8",
        title: "Wann das Dokument erstellt und geändert wurde",
        description:
          "Erstellungs- und Änderungszeitstempel verraten deine Arbeitszeiten, deine Zeitzone und wie lange an einem Dokument gearbeitet wurde. Ein „frisch erstellter“ Bericht kann ein Erstellungsdatum von vor Monaten zeigen.",
        example: {
          label: "Was drinsteckt",
          value:
            "Erstellt: 8. Jan. 2025, 09:14 | Geändert: 18. Feb. 2025, 16:42",
        },
        risk: "Zeitstempel können Angaben dazu widersprechen, wann eine Arbeit erledigt wurde; riskant in rechtlichen und Compliance-Zusammenhängen.",
      },
      {
        id: "company",
        label: "Firma",
        icon: "Buildings",
        color: "#fbbf24",
        title: "Der Fingerabdruck deiner Organisation",
        description:
          "Firmenname, Abteilung, Einstufung des Dokuments und eigene Eigenschaften, die deine IT-Abteilung festgelegt hat, sind alle eingebettet. Vorlagen tragen oft die Metadaten der Person, die die Vorlage ursprünglich erstellt hat.",
        example: {
          label: "Was drinsteckt",
          value:
            "Firma: Nexus Financial Group | Abt.: Unternehmensstrategie",
        },
        risk: "Wiederverwendete Vorlagen können den Namen und interne Einstufungen einer anderen Organisation in deine Dokumente tragen.",
      },
    ],
    seoContent: {
      heading: "Warum solltest du Autorenangaben aus PDFs entfernen?",
      paragraphs: [
        "PDF-Dokumente speichern Autorennamen, Firmenangaben und Details zur Erstellung in versteckten Metadatenfeldern. Diese Daten setzen dein Betriebssystem und die Software, mit der die Datei erstellt wurde, automatisch; die meisten Menschen merken nie, dass sie da sind.",
        "Wenn du PDFs mit Kunden, Partnern oder der Öffentlichkeit teilst, können diese Metadaten sensible Informationen preisgeben: wer das Dokument geschrieben hat, welche Firma es erstellt hat, welche Software verwendet wurde und wann genau es erstellt und zuletzt geändert wurde.",
        "Für Juristinnen und Juristen ist das besonders heikel. Schriftsätze, Verträge und vertrauliche Dokumente sollten nie Metadaten enthalten, die Arbeitsergebnisse oder vertrauliche Kommunikation offenlegen könnten. Für Unternehmen kann ein fremder Firmenname in einer wiederverwendeten Vorlage peinlich sein oder sogar gegen Vertraulichkeitsvereinbarungen verstoßen.",
        "MetaStrip entfernt alle Autoren- und Dokument-Metadaten sofort aus PDFs, direkt in deinem Browser. Deine Dateien werden nie hochgeladen; die Verarbeitung läuft komplett auf deinem Gerät mit pdf-lib, einer Open-Source-PDF-Bibliothek für JavaScript.",
      ],
    },
    supportedFormats: [
      {
        ext: "PDF",
        desc: "Autor, Titel, Betreff, Stichwörter, Ersteller-App, Producer, Datumsangaben, eigene Eigenschaften",
        color: "#f472b6",
      },
    ],
    metaTitle: "Autor aus PDF entfernen: gratis, ohne Upload | MetaStrip",
    metaDescription:
      "Entferne Autorennamen, Ersteller-App und versteckte Eigenschaften aus einem PDF. Läuft im Browser, die Datei bleibt auf deinem Gerät. Gratis, ohne Konto.",
  },

  "strip-metadata-from-word-document": {
    slug: "strip-metadata-from-word-document",
    datePublished: "2026-11-15",
    keyword: "Metadaten aus Word-Dokument entfernen",
    title: "Metadaten aus Word-Dokumenten entfernen",
    subtitle:
      "Entferne Autorennamen, Änderungsverfolgung, Kommentare, Firmenangaben und versteckte Eigenschaften aus DOCX-Dateien: privat, in deinem Browser.",
    heroLabel: "WORD-METADATEN ENTFERNEN: KOSTENLOS, OHNE UPLOAD",
    metadataCategories: [
      {
        category: "author",
        icon: "User",
        color: "#f472b6",
        label: "Autor & Identität",
        fields: [
          { label: "Autor", value: "Michael Torres" },
          { label: "Zuletzt geändert von", value: "Jennifer Walsh" },
          { label: "Manager", value: "David Kim" },
          {
            label: "Firma",
            value: "Sterling & Associates LLP",
          },
        ],
      },
      {
        category: "comments",
        icon: "ChatText",
        color: "#fbbf24",
        label: "Kommentare & Änderungen",
        fields: [
          { label: "Kommentare", value: "4 Kommentare von 2 Personen" },
          { label: "Änderungsverfolgung", value: "12 Änderungen verfolgt" },
          { label: "Revisionsnummer", value: "47" },
          { label: "people.xml", value: "3 Personen erkannt" },
        ],
      },
      {
        category: "dates",
        icon: "CalendarBlank",
        color: "#38bdf8",
        label: "Datum & Bearbeitungszeit",
        fields: [
          { label: "Erstellt", value: "2024-11-22T10:08:00Z" },
          { label: "Geändert", value: "2025-03-01T14:33:00Z" },
          { label: "Bearbeitungszeit gesamt", value: "842 Minuten" },
        ],
      },
      {
        category: "software",
        icon: "Laptop",
        color: "#818cf8",
        label: "Anwendung & Vorlage",
        fields: [
          { label: "Anwendung", value: "Microsoft Office Word" },
          { label: "Version", value: "16.0" },
          { label: "Vorlage", value: "Legal_Brief_v3.dotx" },
        ],
      },
    ],
    explainerTabs: [
      {
        id: "tracked",
        label: "Änderungen",
        icon: "ChatText",
        color: "#fbbf24",
        title: "Gelöschter Text ist nicht wirklich gelöscht",
        description:
          "Die Änderungsverfolgung in Word-Dokumenten bewahrt jede Bearbeitung auf, auch gelöschten Text. Wenn du vor dem Teilen „Alle Änderungen annehmen“ wählst, ist der sichtbare Text sauber, aber der Änderungsverlauf kann noch im XML stecken. Einfaches Entpacken bringt alles ans Licht.",
        example: {
          label: "Was drinsteckt",
          value:
            "12 Änderungen | Gelöschter Text: „Erstangebot von 2,4 Mio. $ wurde abgelehnt“",
        },
        risk: "Die Gegenseite, Wettbewerber oder Kunden können deine Verhandlungsnotizen, Entwurfsfassungen und gelöschten Inhalte sehen.",
      },
      {
        id: "comments",
        label: "Kommentare",
        icon: "PushPin",
        color: "#f472b6",
        title: "Interne Kommentare offengelegt",
        description:
          "Kommentare von Kollegen bleiben im DOCX-XML erhalten, auch wenn sie in Word gelöscht scheinen. Namen der Kommentierenden, Zeitstempel und der vollständige Kommentartext lassen sich durch Entpacken der Datei auslesen.",
        example: {
          label: "Was drinsteckt",
          value:
            "Kommentar von J. Walsh: „Sollen wir das Defizit im Q3 offenlegen?“",
        },
        risk: "Interne Strategiediskussionen, rechtliche Bedenken und redaktionelle Entscheidungen lassen sich aus geteilten Dokumenten auslesen.",
      },
      {
        id: "identity",
        label: "Personen",
        icon: "UsersThree",
        color: "#a78bfa",
        title: "Alle, die das Dokument angefasst haben",
        description:
          "Word-Dokumente führen eine Liste aller Personen, die die Datei bearbeitet oder kommentiert haben. Dazu gehören vollständige Namen, in manchen Fällen E-Mail-Adressen und die genauen Zeitstempel jedes Beitrags.",
        example: {
          label: "Was drinsteckt",
          value:
            "3 Bearbeiter: M. Torres, J. Walsh, D. Kim | Sterling & Associates LLP",
        },
        risk: "Die Datei people.xml ergibt einen lückenlosen Prüfpfad, wer an der Erstellung eines Dokuments beteiligt war.",
      },
      {
        id: "template",
        label: "Vorlagen",
        icon: "ClipboardText",
        color: "#06b6d4",
        title: "Metadaten aus Vorlagen",
        description:
          "Dokumente, die aus Vorlagen erstellt wurden, erben deren Metadaten, auch den ursprünglichen Autor und die Firma, die die Vorlage erstellt hat. Kanzleien und Beratungen stellen immer wieder fest, dass sie Dokumente mit den Metadaten einer anderen Firma verschicken.",
        example: {
          label: "Was drinsteckt",
          value:
            "Vorlage: Legal_Brief_v3.dotx | Ursprünglicher Autor: Baker McKenzie",
        },
        risk: "Eine Vorlage von einem früheren Arbeitgeber oder einem Wettbewerber bettet dessen Identität in jedes Dokument ein, das du daraus erstellst.",
      },
    ],
    seoContent: {
      heading: "Warum solltest du Metadaten aus Word-Dokumenten entfernen, bevor du sie teilst?",
      paragraphs: [
        "Microsoft-Word-Dokumente (DOCX) speichern umfangreiche versteckte Metadaten in XML-Dateien innerhalb des Dokumentpakets. Dazu gehören Autorennamen, Firmenangaben, Bearbeitungszeit, Änderungsverlauf, Kommentare, Änderungsverfolgung und Angaben zu jeder Person, die am Dokument mitgewirkt hat.",
        "Für Juristinnen und Juristen ist das ein bekanntes Risiko. In vielen Rechtsordnungen schreiben Gerichtsregeln vor, Metadaten vor dem Einreichen oder Austauschen zu entfernen. Die American Bar Association hat in Ethik-Stellungnahmen die Pflicht von Anwälten betont, Metadaten aus Dokumenten zu entfernen, die sie mit der Gegenseite teilen.",
        "Auch außerhalb des Rechtswesens riskiert jedes Unternehmen, das Word-Dokumente nach außen gibt, interne Autorennamen, die Firmenstruktur, Bearbeitungszeiträume und gelöschte Inhalte preiszugeben, die womöglich noch im Änderungsverlauf stehen. Vorlagen von früheren Arbeitgebern oder Partnern können deren Metadaten in deine Dokumente tragen.",
        "MetaStrip öffnet deine DOCX-Datei direkt im Browser mit JSZip, entfernt oder bereinigt die Metadaten-XML-Dateien und packt das saubere Dokument neu, ohne dass deine Datei jemals dein Gerät verlässt.",
      ],
    },
    supportedFormats: [
      {
        ext: "DOCX",
        desc: "Autor, Kommentare, Änderungsverfolgung, Firma, Vorlage, Bearbeitungszeit, Revisionen, eigene Eigenschaften",
        color: "#f472b6",
      },
    ],
    metaTitle: "Word-Metadaten entfernen (.docx): kostenlos | MetaStrip",
    metaDescription:
      "Entferne Autorennamen, Firmenangaben, Änderungsverfolgung, Kommentare und Änderungsverlauf aus Word-Dateien (.docx). Im Browser, ohne Upload, ohne Konto.",
  },
};
