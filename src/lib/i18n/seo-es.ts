import type { SEOPageConfig } from "../seo-configs";
import type { TranslatedToolSlug } from "./index";

/* Spanish tool pages (MS-6 part 2). Written by Claude; to be checked by a native speaker. */
export const SEO_ES: Record<TranslatedToolSlug, SEOPageConfig> = {
  "remove-metadata-from-photos": {
    slug: "remove-metadata-from-photos",
    datePublished: "2026-11-15",
    keyword: "eliminar metadatos de fotos",
    title: "Eliminar metadatos de fotos",
    subtitle:
      "Quita las coordenadas GPS, los datos de la cámara, las etiquetas de generación con IA y otros datos ocultos de tus imágenes: al instante, en privado y gratis.",
    heroLabel: "ELIMINA LOS METADATOS DE TUS FOTOS: GRATIS, SIN SUBIDAS",
    metadataCategories: [
      {
        category: "gps",
        icon: "MapPin",
        color: "#ff4d6a",
        label: "GPS y ubicación",
        fields: [
          { label: "Latitud", value: "-37.8180° S" },
          { label: "Longitud", value: "144.9691° E" },
          { label: "Altitud", value: "18 m sobre el nivel del mar" },
          { label: "Datum del mapa", value: "WGS-84" },
        ],
      },
      {
        category: "device",
        icon: "DeviceMobile",
        color: "#a78bfa",
        label: "Dispositivo y cámara",
        fields: [
          { label: "Marca", value: "Apple" },
          { label: "Modelo", value: "iPhone 15 Pro Max" },
          { label: "Objetivo", value: "6.765mm f/1.78" },
          { label: "N.º de serie", value: "DNQXK4F..." },
          { label: "Resolución", value: "4032 × 3024" },
        ],
      },
      {
        category: "dates",
        icon: "CalendarBlank",
        color: "#38bdf8",
        label: "Fechas y horas",
        fields: [
          { label: "Tomada", value: "2025:01:15 14:23:07" },
          { label: "Digitalizada", value: "2025:01:15 14:23:07" },
          { label: "Modificada", value: "2025:02:20 09:11:33" },
        ],
      },
      {
        category: "software",
        icon: "Laptop",
        color: "#818cf8",
        label: "Software",
        fields: [
          { label: "Versión del sistema", value: "17.2.1" },
          { label: "Equipo", value: "iPhone 15 Pro Max" },
        ],
      },
      {
        category: "author",
        icon: "User",
        color: "#f472b6",
        label: "Autor",
        fields: [
          { label: "Artista", value: "Lars K." },
          { label: "Copyright", value: "© 2025" },
        ],
      },
    ],
    explainerTabs: [
      {
        id: "location",
        label: "Ubicación",
        icon: "MapPin",
        color: "#ff4d6a",
        title: "Tus coordenadas exactas",
        description:
          "Cada foto hecha con un móvil incrusta coordenadas GPS con precisión de unos pocos metros. Comparte una foto de la puerta de tu casa y cualquiera podrá sacar tu dirección.",
        example: {
          label: "Lo que se esconde",
          value: "-37.8180° S, 144.9691° E",
        },
        risk: "Alguien puede encontrar tu casa, tu trabajo o tu rutina diaria a partir de las fotos que compartes en internet.",
      },
      {
        id: "device",
        label: "Dispositivo",
        icon: "DeviceMobile",
        color: "#a78bfa",
        title: "La identidad de tu dispositivo",
        description:
          "La marca y el modelo de la cámara, los datos del objetivo y a veces números de serie quedan incrustados en cada foto. Eso crea una huella única que puede vincular fotos anónimas con tu dispositivo.",
        example: {
          label: "Lo que se esconde",
          value: "iPhone 15 Pro Max, S/N: DNQXK4F...",
        },
        risk: "Varias fotos «anónimas» pueden vincularse al mismo dispositivo y, por tanto, a ti.",
      },
      {
        id: "timestamps",
        label: "Fechas",
        icon: "CalendarBlank",
        color: "#38bdf8",
        title: "Cuándo estuviste allí",
        description:
          "Las fechas de creación y de modificación y la diferencia horaria revelan no solo cuándo se hizo una foto, sino tus hábitos: cuándo estás en casa, en el trabajo o de viaje.",
        example: {
          label: "Lo que se esconde",
          value: "2025:01:15 14:23:07 +11:00 (AEDT)",
        },
        risk: "Junto con los datos de ubicación, las fechas trazan tus movimientos diarios con precisión.",
      },
      {
        id: "ai",
        label: "Etiquetas de IA",
        icon: "Robot",
        color: "#c084fc",
        title: "Huellas de generación con IA",
        description:
          "Las imágenes de Midjourney, DALL-E, Stable Diffusion y Adobe Firefly ya incrustan credenciales de contenido C2PA y metadatos XMP de IA que las marcan de forma permanente como generadas con IA.",
        example: {
          label: "Lo que se esconde",
          value: "c2pa.ai_generated: true | tool: midjourney-v6",
        },
        risk: "Las redes sociales y los buscadores están empezando a señalar y relegar automáticamente el contenido etiquetado como IA.",
      },
    ],
    seoContent: {
      heading: "¿Por qué quitar los metadatos de tus fotos?",
      paragraphs: [
        "Cada foto hecha con un móvil moderno o una cámara digital contiene metadatos ocultos: coordenadas GPS, datos de la cámara, fechas y a veces incluso tu nombre. Estos datos se incrustan automáticamente y la mayoría de la gente nunca se da cuenta de que están ahí.",
        "Cuando compartes fotos por correo, almacenamiento en la nube o apps de mensajería, o las subes a páginas web, estos metadatos suelen viajar con la imagen. Aunque algunas redes sociales quitan los metadatos al subir la foto, muchas formas de compartir los conservan por completo.",
        "Las consecuencias para la privacidad son importantes. Una foto hecha en casa revela tu dirección. Las fotos a lo largo del tiempo revelan tu rutina diaria. Para periodistas, activistas y supervivientes de violencia doméstica, estos datos pueden ser realmente peligrosos.",
        "MetaStrip elimina todos los metadatos ocultos de tus fotos al instante, directamente en tu navegador. Tus archivos nunca se suben a ningún servidor; todo se procesa en tu dispositivo.",
      ],
    },
    supportedFormats: [
      {
        ext: "JPEG",
        desc: "EXIF completo, IPTC, XMP, GPS, etiquetas de IA, miniaturas",
        color: "#a78bfa",
      },
      {
        ext: "PNG",
        desc: "Bloques de metadatos tEXt, iTXt y zTXt, XMP",
        color: "#38bdf8",
      },
      {
        ext: "WebP",
        desc: "Metadatos EXIF y XMP incrustados",
        color: "#4ade80",
      },
      {
        ext: "HEIC",
        desc: "EXIF, GPS, XMP y C2PA, sin convertir la foto",
        color: "#f472b6",
      },
      {
        ext: "AVIF",
        desc: "EXIF, XMP y C2PA",
        color: "#fbbf24",
      },
      {
        ext: "TIFF",
        desc: "EXIF, GPS, XMP e IPTC en cada página",
        color: "#94a3b8",
      },
    ],
    metaTitle: "Eliminar metadatos de fotos: gratis, sin subidas | MetaStrip",
    metaDescription:
      "Quita GPS, EXIF, datos de cámara y etiquetas de IA de tus fotos en el navegador. JPG, PNG, WebP, HEIC, AVIF, TIFF. Sin subidas, sin cuenta, gratis.",
  },

  "remove-gps-location-from-photos": {
    slug: "remove-gps-location-from-photos",
    datePublished: "2026-11-15",
    keyword: "quitar ubicación GPS de fotos",
    title: "Quitar la ubicación GPS de tus fotos",
    subtitle:
      "Quita de tus fotos las coordenadas GPS incrustadas y los datos de altitud, velocidad y dirección antes de compartirlas en internet.",
    heroLabel: "QUITA LA UBICACIÓN GPS DE TUS FOTOS: GRATIS Y PRIVADO",
    metadataCategories: [
      {
        category: "gps",
        icon: "MapPin",
        color: "#ff4d6a",
        label: "Coordenadas GPS",
        fields: [
          { label: "Latitud", value: "34.0522° N" },
          { label: "Longitud", value: "118.2437° W" },
          { label: "Altitud", value: "71 m sobre el nivel del mar" },
          { label: "Dirección", value: "247.3° (OSO)" },
          { label: "Velocidad", value: "0.0 km/h" },
          { label: "Datum del mapa", value: "WGS-84" },
        ],
      },
      {
        category: "gps",
        icon: "Clock",
        color: "#f97316",
        label: "Fecha y hora GPS",
        fields: [
          { label: "Fecha GPS", value: "2025:02:15" },
          { label: "Hora GPS", value: "19:42:33 UTC" },
          { label: "Diferencia horaria", value: "-08:00 (PST)" },
        ],
      },
      {
        category: "device",
        icon: "DeviceMobile",
        color: "#a78bfa",
        label: "Dispositivo (también ligado a la ubicación)",
        fields: [
          { label: "Marca", value: "Samsung" },
          { label: "Modelo", value: "Galaxy S24 Ultra" },
          { label: "N.º de serie", value: "RF8R..." },
        ],
      },
    ],
    explainerTabs: [
      {
        id: "coords",
        label: "Coordenadas",
        icon: "MapPin",
        color: "#ff4d6a",
        title: "Precisión hasta la puerta de tu casa",
        description:
          "Los datos GPS del móvil incrustados en las fotos suelen tener una precisión de 3 a 5 metros. Basta para identificar la dirección exacta de tu casa, tu trabajo, tu gimnasio, tu colegio o cualquier otro sitio que fotografíes. Una sola foto puede revelar dónde vives.",
        example: {
          label: "Lo que se esconde",
          value: "34.0522° N, 118.2437° W, con precisión de ~3 metros",
        },
        risk: "Una foto de tu mascota, de lo que cocinas o de tu afición hecha en casa revela tu dirección a cualquiera que la mire.",
      },
      {
        id: "patterns",
        label: "Patrones",
        icon: "MapTrifold",
        color: "#f97316",
        title: "Varias fotos trazan el mapa de tu vida",
        description:
          "Una foto revela un lugar. Una docena de fotos revelan tu rutina diaria: dónde vives, trabajas, comes, haces ejercicio y quedas con gente. Junto con las fechas y horas, crean una cronología detallada de tus movimientos.",
        example: {
          label: "Lo que revelan 10 fotos",
          value:
            "Casa → Gimnasio (7:00) → Oficina (9:00) → Sitio de comida → Casa (18:00)",
        },
        risk: "Compartir fotos con regularidad durante semanas le da a cualquiera un mapa con el que predecir dónde estarás y cuándo.",
      },
      {
        id: "platforms",
        label: "¿Qué apps lo quitan?",
        icon: "MagnifyingGlass",
        color: "#38bdf8",
        title: "No todas las plataformas te protegen",
        description:
          "Instagram y Facebook quitan el GPS al subir la foto. Pero el correo, WhatsApp (cuando la envías como documento), el almacenamiento en la nube (Google Drive, Dropbox), los foros, las webs personales y muchas apps de mensajería conservan los datos GPS por completo.",
        example: {
          label: "Plataformas que NO quitan el GPS",
          value:
            "Correo, documentos de WhatsApp, Google Drive, Dropbox, foros, blogs",
        },
        risk: "Cada vez que compartas una foto fuera de Instagram o Facebook, da por hecho que los datos GPS siguen ahí.",
      },
      {
        id: "stalking",
        label: "Riesgos reales",
        icon: "Warning",
        color: "#f472b6",
        title: "Los metadatos de ubicación tienen consecuencias reales",
        description:
          "Hay casos documentados de acoso, robos en viviendas y hostigamiento facilitados por los metadatos GPS de fotos. Publicar fotos de vacaciones revela que no estás en casa. Compartir fotos de objetos de valor revela dónde los guardas.",
        example: {
          label: "Situaciones reales",
          value:
            "Fotos de vacaciones → se sabe que tu casa está vacía | Fotos de tu mascota → tu dirección",
        },
        risk: "No es teoría. Las fuerzas de seguridad extraen con frecuencia los datos GPS de fotos en sus investigaciones.",
      },
    ],
    seoContent: {
      heading: "¿Por qué quitar los datos de ubicación GPS de tus fotos?",
      paragraphs: [
        "Cada foto hecha con un móvil contiene coordenadas GPS incrustadas que señalan exactamente dónde se hizo, a menudo con precisión de unos pocos metros. Estos datos se guardan en los metadatos EXIF del archivo de imagen y viajan con la foto cuando la compartes.",
        "Aunque las grandes redes sociales como Instagram y Facebook quitan los datos de ubicación al subir la foto, muchas otras formas de compartir no lo hacen. Los adjuntos de correo, las apps de mensajería (cuando envías archivos), los enlaces de almacenamiento en la nube, las publicaciones en foros y las webs personales conservan las coordenadas GPS por defecto.",
        "Las consecuencias para la privacidad son importantes. Una foto hecha en casa revela tu dirección. Las fotos hechas a lo largo del tiempo revelan tu rutina diaria: dónde trabajas, comes, haces ejercicio y quedas con gente. Para personas públicas, periodistas, activistas y supervivientes de violencia doméstica, estos datos pueden ser realmente peligrosos.",
        "MetaStrip elimina todos los datos GPS y de ubicación de tus fotos antes de que las compartas. Todo se procesa en tu navegador; tus fotos y tus datos de ubicación nunca se suben a ningún sitio. Es la forma más privada de quitar los metadatos de ubicación de tus imágenes.",
      ],
    },
    supportedFormats: [
      {
        ext: "JPEG",
        desc: "Todo el conjunto GPS: coordenadas, altitud, velocidad, dirección, fechas y horas",
        color: "#ff4d6a",
      },
      {
        ext: "PNG",
        desc: "Datos GPS en bloques tEXt/iTXt y XMP",
        color: "#38bdf8",
      },
      {
        ext: "WebP",
        desc: "Datos GPS EXIF, metadatos de ubicación XMP",
        color: "#4ade80",
      },
      {
        ext: "HEIC",
        desc: "EXIF, GPS, XMP y C2PA, sin convertir la foto",
        color: "#f472b6",
      },
      {
        ext: "AVIF",
        desc: "EXIF, XMP y C2PA",
        color: "#fbbf24",
      },
      {
        ext: "TIFF",
        desc: "EXIF, GPS, XMP e IPTC en cada página",
        color: "#94a3b8",
      },
    ],
    metaTitle: "Quitar ubicación GPS de fotos: gratis y privado | MetaStrip",
    metaDescription:
      "Quita de tus fotos las coordenadas GPS, la altitud y la zona horaria antes de compartirlas. 100 % en tu navegador. Gratis, sin subidas, sin cuenta.",
  },

  "strip-exif-data": {
    slug: "strip-exif-data",
    datePublished: "2026-11-15",
    keyword: "eliminar datos EXIF online",
    title: "Eliminar datos EXIF online",
    subtitle:
      "Quita EXIF, IPTC, XMP y todos los metadatos incrustados de tus fotos: gratis, en privado, sin subir nada.",
    heroLabel: "ELIMINA LOS DATOS EXIF: GRATIS, 100 % EN TU NAVEGADOR",
    metadataCategories: [
      {
        category: "gps",
        icon: "MapPin",
        color: "#ff4d6a",
        label: "Ubicación GPS / EXIF",
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
        label: "Datos de cámara EXIF",
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
        label: "Fechas EXIF",
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
        label: "Software de procesado",
        fields: [
          {
            label: "Software",
            value: "Adobe Lightroom Classic 14.1",
          },
          { label: "ProcessingHistory", value: "3 ediciones aplicadas" },
        ],
      },
      {
        category: "author",
        icon: "User",
        color: "#f472b6",
        label: "Creador IPTC",
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
        title: "La especificación EXIF completa",
        description:
          "EXIF (Exchangeable Image File Format) es el estándar de metadatos más completo de la fotografía. Guarda los ajustes de la cámara, las coordenadas GPS, la orientación, el espacio de color, miniaturas y decenas de parámetros técnicos, todo incrustado de forma invisible en tu archivo de imagen.",
        example: {
          label: "Carga EXIF típica",
          value:
            "40 a 80 campos de metadatos por foto | 10 a 50 KB de datos ocultos",
        },
        risk: "Un solo volcado EXIF revela el número de serie de tu cámara, tu ubicación exacta y todos tus parámetros de disparo.",
      },
      {
        id: "iptc",
        label: "IPTC",
        icon: "NotePencil",
        color: "#38bdf8",
        title: "Datos editoriales y de copyright",
        description:
          "Las agencias de noticias y los bancos de imágenes usan los metadatos IPTC para incrustar créditos del autor, pies de foto, palabras clave y condiciones de licencia. Si alguna vez has enviado fotos a un banco de imágenes, estos datos siguen a tus imágenes a todas partes.",
        example: {
          label: "Lo que se esconde",
          value:
            "Creador: James Chen | Crédito: Shutterstock | Palabras clave: urbano, noche",
        },
        risk: "Los datos IPTC pueden vincular fotos «anónimas» con tu perfil en un banco de imágenes o con tu nombre real.",
      },
      {
        id: "xmp",
        label: "XMP",
        icon: "Package",
        color: "#06b6d4",
        title: "Los metadatos extensibles de Adobe",
        description:
          "XMP (Extensible Metadata Platform) es el sistema de metadatos de Adobe que se incrusta en las imágenes procesadas con Lightroom, Photoshop y Camera Raw. Contiene el historial de edición, valoraciones, colecciones y etiquetas personalizadas.",
        example: {
          label: "Lo que se esconde",
          value:
            "xmp:CreatorTool: Lightroom Classic 14.1 | xmp:Rating: 4",
        },
        risk: "XMP revela todo tu flujo de edición, tus versiones de software y cómo organizas tu biblioteca de fotos.",
      },
      {
        id: "thumbnail",
        label: "Miniaturas",
        icon: "ImageSquare",
        color: "#f472b6",
        title: "Imágenes de vista previa ocultas",
        description:
          "Los archivos JPEG suelen contener una miniatura incrustada que se generó cuando se hizo la foto. Si después recortaste o editaste la foto, la miniatura original sin recortar puede seguir dentro del archivo.",
        example: {
          label: "Lo que se esconde",
          value:
            "Miniatura JPEG de 160×120; puede mostrar la imagen original sin recortar",
        },
        risk: "El famoso «incidente de Cat Schwartz»: una foto recortada seguía conteniendo la miniatura completa sin recortar.",
      },
    ],
    seoContent: {
      heading: "¿Qué son los datos EXIF y por qué deberías eliminarlos?",
      paragraphs: [
        "Los datos EXIF son un estándar de metadatos que guarda información técnica y de contexto dentro de los archivos de imagen. Se diseñó para ayudar a los fotógrafos a organizar su trabajo, pero EXIF se ha convertido en un problema serio de privacidad en la era de las fotos con el móvil y de compartirlo todo en redes.",
        "Cada foto hecha con un móvil moderno o una cámara digital contiene datos EXIF. Suelen incluir coordenadas GPS con precisión de unos pocos metros, la fecha y la hora exactas, la marca y el modelo de la cámara, números de serie, datos del objetivo y los ajustes de exposición. En las fotos editadas también pueden guardarse el software usado y el historial de edición.",
        "Aunque algunas redes sociales quitan los datos EXIF al subir la foto, muchas no lo hacen; y el correo, las apps de mensajería, el almacenamiento en la nube y las páginas web suelen conservar los metadatos por completo. Cuando una foto se comparte con el EXIF intacto, cualquiera que la descargue puede sacar tu ubicación, la identidad de tu dispositivo y tus datos personales.",
        "MetaStrip elimina el EXIF de imágenes JPEG, PNG, WebP, HEIC, AVIF y TIFF. Todo se procesa en tu navegador; tus fotos nunca se suben a ningún servidor.",
      ],
    },
    supportedFormats: [
      {
        ext: "JPEG",
        desc: "EXIF completo, IPTC, XMP, GPS, miniaturas incrustadas",
        color: "#a78bfa",
      },
      {
        ext: "PNG",
        desc: "Bloques de metadatos tEXt, iTXt y zTXt, XMP sidecar",
        color: "#38bdf8",
      },
      {
        ext: "WebP",
        desc: "Metadatos EXIF y XMP incrustados",
        color: "#4ade80",
      },
      {
        ext: "HEIC",
        desc: "EXIF, GPS, XMP y C2PA, sin convertir la foto",
        color: "#f472b6",
      },
      {
        ext: "AVIF",
        desc: "EXIF, XMP y C2PA",
        color: "#fbbf24",
      },
      {
        ext: "TIFF",
        desc: "EXIF, GPS, XMP e IPTC en cada página",
        color: "#94a3b8",
      },
    ],
    metaTitle: "Eliminar EXIF: ver y quitar metadatos de fotos | MetaStrip",
    metaDescription:
      "Elimina los metadatos EXIF, IPTC, XMP y GPS de tus fotos. Mira lo que llevan incrustado y luego quítalo. Gratis, en tu navegador, sin subidas.",
  },

  "remove-c2pa-metadata": {
    slug: "remove-c2pa-metadata",
    datePublished: "2026-11-15",
    keyword: "eliminar metadatos C2PA de imágenes",
    title: "Eliminar metadatos C2PA",
    subtitle:
      "Quita las credenciales de contenido C2PA de imágenes JPEG, PNG, WebP, HEIC y AVIF y de vídeos MP4 y MOV, en tu navegador. Archivos ilimitados, sin registro, sin subir nada.",
    heroLabel: "ELIMINA LAS CREDENCIALES DE CONTENIDO C2PA: SIN LÍMITES, SIN SUBIDAS",
    metadataCategories: [
      {
        category: "ai",
        icon: "LockKey",
        color: "#c084fc",
        label: "Manifiesto C2PA",
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
        label: "Firma y procedencia",
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
        label: "Bloque de procedencia XMP",
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
        label: "Credenciales de captura",
        fields: [
          { label: "c2pa.capture_device", value: "Google Pixel 10" },
          { label: "exif:Make", value: "Google" },
          { label: "c2pa.hash.data", value: "firmado al capturar" },
        ],
      },
    ],
    explainerTabs: [
      {
        id: "what",
        label: "Qué es C2PA",
        icon: "LockKey",
        color: "#c084fc",
        title: "Un registro firmado unido a tu archivo",
        description:
          "Las credenciales de contenido C2PA (Coalition for Content Provenance and Authenticity) son un manifiesto con firma criptográfica incrustado en una imagen. Registra qué produjo el archivo, qué herramienta lo editó, cuándo y si intervino la IA. Adobe lo comercializa como Content Credentials.",
        example: {
          label: "Dónde se guarda",
          value:
            "Cajas JUMBF en JPEG, un bloque caBX en PNG, un bloque C2PA en WebP, una caja uuid en HEIC y AVIF",
        },
        risk: "El manifiesto viaja con el archivo, así que cualquiera que lo reciba puede leer tu herramienta, tus fechas y tu historial de edición.",
      },
      {
        id: "removable",
        label: "Por qué se puede quitar",
        icon: "ShieldCheck",
        color: "#a78bfa",
        title: "Son metadatos, no píxeles",
        description:
          "El manifiesto está en el contenedor de metadatos del archivo, junto a la imagen y no dentro de ella. Por eso se puede quitar sin tocar un solo píxel. Tu imagen queda visualmente idéntica, solo que sin el registro de procedencia.",
        example: {
          label: "Qué cambia",
          value:
            "Manifiesto eliminado, datos de imagen idénticos byte a byte, archivo algo más pequeño",
        },
        risk: "Volver a guardarla en otra app también puede quitarlo, pero eso suele recomprimir la imagen y te cuesta calidad.",
      },
      {
        id: "formats",
        label: "Todos los formatos",
        icon: "ImageSquare",
        color: "#38bdf8",
        title: "Incluidos HEIC, AVIF y vídeo",
        description:
          "C2PA se integra de forma distinta en cada formato, y por eso muchas herramientas solo admiten uno o dos. MetaStrip lee las cuatro integraciones: segmentos APP11 JUMBF en JPEG, el bloque caBX en PNG, el bloque RIFF C2PA en WebP y la caja uuid que comparten HEIC, el formato en el que dispara por defecto cualquier iPhone, AVIF, el formato compacto que ya exportan más herramientas de IA, y los vídeos MP4 y MOV.",
        example: {
          label: "Compatibles",
          value: "JPEG, PNG, WebP, HEIC, AVIF, MP4 y MOV, además del EXIF, XMP e IPTC que los acompañan",
        },
        risk: "Una herramienta que solo admite PNG y WebP deja intactas las fotos de tu cámara y las de tu iPhone.",
      },
      {
        id: "limits",
        label: "Lo que no puede hacer",
        icon: "Eye",
        color: "#f472b6",
        title: "Las marcas de agua en los píxeles son otra capa",
        description:
          "Quitar el manifiesto C2PA elimina la capa de metadatos. No elimina una marca de agua invisible en los píxeles como SynthID de Google, que va tejida en los propios datos de la imagen. Ninguna herramienta de metadatos puede hacerlo, y cualquiera que diga lo contrario está exagerando lo que es posible.",
        example: {
          label: "Alcance real",
          value:
            "Capa de metadatos eliminada; las marcas de agua en los píxeles quedan intactas",
        },
        risk: "Ten claro con qué capa estás tratando antes de dar por hecho que una imagen no lleva ninguna marca.",
      },
    ],
    seoContent: {
      heading: "Cómo eliminar los metadatos C2PA de una imagen",
      paragraphs: [
        "Suelta una imagen en la herramienta de arriba. MetaStrip lee el manifiesto C2PA directamente en tu navegador, te muestra exactamente qué datos de procedencia lleva incrustados y los elimina cuando lo confirmas. El archivo limpio se descarga directamente en tu dispositivo. En ningún momento se sube nada a un servidor, algo importante cuando el motivo para quitar la procedencia es precisamente que prefieres no compartirla.",
        "Cada vez más fuentes incrustan automáticamente credenciales de contenido C2PA: Adobe Firefly, las exportaciones de Photoshop y Lightroom, DALL-E y Sora de OpenAI, Google Gemini e Imagen y, a nivel de hardware, cámaras de Sony, Nikon y Leica, además del Google Pixel, que firma cada foto que hace. Si tu imagen viene de alguna de esas fuentes, es muy probable que lleve un manifiesto, lo supieras o no.",
        "Como el manifiesto está en el contenedor de metadatos del archivo y no en los píxeles, quitarlo deja la imagen visualmente idéntica. MetaStrip elimina el manifiesto C2PA junto con los datos EXIF, XMP e IPTC que lo acompañan, para que no te queden el modelo de tu cámara y tus coordenadas GPS después de borrar el registro de procedencia.",
        "Un límite, con honestidad: quitar el manifiesto C2PA elimina la marca basada en metadatos. No elimina una marca de agua a nivel de píxel como SynthID, que va incrustada en los propios datos de la imagen y que ninguna herramienta de metadatos puede quitar. La mayoría de las comprobaciones automáticas leen el manifiesto, así que quitarlo suele bastar, pero conviene conocer la diferencia.",
      ],
    },
    supportedFormats: [
      {
        ext: "JPEG",
        desc: "Manifiesto APP11 JUMBF, bloque de procedencia XMP, EXIF a su lado",
        color: "#c084fc",
      },
      {
        ext: "PNG",
        desc: "Bloque de manifiesto caBX, procedencia XMP en iTXt, bloques de texto",
        color: "#a78bfa",
      },
      {
        ext: "WebP",
        desc: "Bloque RIFF C2PA, procedencia XMP, bloque EXIF",
        color: "#38bdf8",
      },
      {
        ext: "HEIC",
        desc: "Caja uuid C2PA, elementos Exif y XMP, el formato por defecto del iPhone",
        color: "#818cf8",
      },
      {
        ext: "AVIF",
        desc: "Caja uuid C2PA, elementos Exif y XMP, marcador de IA de IPTC",
        color: "#f472b6",
      },
      {
        ext: "MP4 / MOV",
        desc: "Caja uuid C2PA y la caja uuid XMP de Adobe; vídeo y audio intactos",
        color: "#fb923c",
      },
    ],
    metaTitle: "Eliminar metadatos C2PA: gratis y sin límites | MetaStrip",
    metaDescription:
      "Quita las credenciales de contenido C2PA de imágenes JPEG, PNG, WebP, HEIC y AVIF y de vídeos MP4 y MOV. En tu navegador, sin subidas ni registro.",
  },

  "remove-author-from-pdf": {
    slug: "remove-author-from-pdf",
    datePublished: "2026-11-15",
    keyword: "eliminar autor de PDF",
    title: "Eliminar el autor de un PDF",
    subtitle:
      "Quita nombres de autor, aplicaciones de origen, datos de la empresa y propiedades ocultas del documento de tus archivos PDF, al instante, en tu navegador.",
    heroLabel: "ELIMINA EL AUTOR Y LOS METADATOS DE UN PDF: GRATIS, SIN SUBIDAS",
    metadataCategories: [
      {
        category: "author",
        icon: "User",
        color: "#f472b6",
        label: "Autor e identidad",
        fields: [
          { label: "Autor", value: "Sarah Mitchell" },
          {
            label: "Título",
            value: "Previsión de ingresos T4: CONFIDENCIAL",
          },
          { label: "Asunto", value: "Revisión financiera interna" },
          {
            label: "Palabras clave",
            value: "ingresos, previsión, consejo, confidencial",
          },
        ],
      },
      {
        category: "software",
        icon: "Laptop",
        color: "#818cf8",
        label: "Software y productor",
        fields: [
          { label: "Aplicación de origen", value: "Microsoft Word 2024" },
          { label: "Productor", value: "macOS 14.3 Quartz PDFContext" },
        ],
      },
      {
        category: "dates",
        icon: "CalendarBlank",
        color: "#38bdf8",
        label: "Fechas y horas",
        fields: [
          { label: "Creado", value: "D:20250108091422Z" },
          { label: "Modificado", value: "D:20250218164207Z" },
        ],
      },
      {
        category: "custom",
        icon: "Tag",
        color: "#fbbf24",
        label: "Propiedades personalizadas",
        fields: [
          { label: "Empresa", value: "Nexus Financial Group" },
          { label: "Departamento", value: "Estrategia corporativa" },
          { label: "Clasificación", value: "Solo uso interno" },
        ],
      },
    ],
    explainerTabs: [
      {
        id: "author",
        label: "Autor",
        icon: "User",
        color: "#f472b6",
        title: "Tu nombre está en cada PDF",
        description:
          "Los archivos PDF incrustan el nombre de autor de la cuenta de usuario de tu ordenador o de la aplicación que los creó. Cuando envías un PDF fuera de tu organización, quien lo recibe puede ver exactamente quién lo creó, y a cada persona que lo editó.",
        example: {
          label: "Lo que se esconde",
          value:
            "Autor: Sarah Mitchell | Empresa: Nexus Financial Group",
        },
        risk: "¿Envías un documento «confidencial»? El campo de autor revela exactamente quién lo escribió y dónde trabaja.",
      },
      {
        id: "software",
        label: "Software",
        icon: "Laptop",
        color: "#818cf8",
        title: "Tus herramientas delatan tu equipo",
        description:
          "Los campos de aplicación de origen y productor del PDF revelan tu sistema operativo, la versión del software y el flujo de trabajo exacto con el que se generó el archivo. Es una mina de oro para la ingeniería social.",
        example: {
          label: "Lo que se esconde",
          value:
            "Aplicación de origen: Microsoft Word 2024 | Productor: macOS 14.3 Quartz",
        },
        risk: "Un atacante puede aprovechar vulnerabilidades concretas de tu sistema operativo y de tus versiones de software.",
      },
      {
        id: "dates",
        label: "Fechas",
        icon: "CalendarBlank",
        color: "#38bdf8",
        title: "Cuándo se creó y se cambió el documento",
        description:
          "Las fechas de creación y de modificación revelan tus hábitos de trabajo, tu zona horaria y cuánto tiempo lleva en preparación un documento. Un informe «recién preparado» puede mostrar una fecha de creación de hace meses.",
        example: {
          label: "Lo que se esconde",
          value:
            "Creado: 8 ene 2025 09:14 | Modificado: 18 feb 2025 16:42",
        },
        risk: "Las fechas pueden contradecir lo que se afirma sobre cuándo se hizo un trabajo, algo arriesgado en contextos legales y de cumplimiento normativo.",
      },
      {
        id: "company",
        label: "Empresa",
        icon: "Buildings",
        color: "#fbbf24",
        title: "La huella de tu organización",
        description:
          "El nombre de la empresa, el departamento, la clasificación del documento y las propiedades personalizadas que define tu departamento de informática quedan todos incrustados. Las plantillas suelen arrastrar los metadatos de quien creó la plantilla originalmente.",
        example: {
          label: "Lo que se esconde",
          value:
            "Empresa: Nexus Financial Group | Depto.: Estrategia corporativa",
        },
        risk: "Las plantillas reutilizadas pueden filtrar el nombre de otra organización y sus clasificaciones internas a tus documentos.",
      },
    ],
    seoContent: {
      heading: "¿Por qué quitar los datos de autor de un PDF?",
      paragraphs: [
        "Los documentos PDF guardan nombres de autor, datos de la empresa y detalles de creación en campos de metadatos ocultos. Estos datos los fijan automáticamente tu sistema operativo y el software con el que se creó el archivo; la mayoría de la gente nunca se da cuenta de que están ahí.",
        "Cuando compartes un PDF con clientes, socios o el público, estos metadatos pueden revelar información sensible: quién escribió el documento, qué empresa lo produjo, qué software se usó y cuándo exactamente se creó y se modificó por última vez.",
        "Para los profesionales del derecho esto es especialmente crítico. Los escritos judiciales, los contratos y los documentos protegidos por el secreto profesional nunca deberían llevar metadatos que puedan revelar el trabajo preparatorio o comunicaciones confidenciales entre abogado y cliente. Para las empresas, los nombres de empresa que se filtran en plantillas reutilizadas pueden resultar embarazosos o incluso incumplir acuerdos de confidencialidad.",
        "MetaStrip elimina todos los metadatos de autor y del documento de tus PDF al instante, directamente en tu navegador. Tus archivos nunca se suben; todo se procesa en tu dispositivo con pdf-lib, una biblioteca PDF de JavaScript de código abierto.",
      ],
    },
    supportedFormats: [
      {
        ext: "PDF",
        desc: "Autor, título, asunto, palabras clave, aplicación de origen, productor, fechas, propiedades personalizadas",
        color: "#f472b6",
      },
    ],
    metaTitle: "Eliminar autor de PDF: gratis, sin subidas | MetaStrip",
    metaDescription:
      "Quita de un PDF el autor, la aplicación de origen y las propiedades ocultas. En tu navegador: el archivo no sale de tu dispositivo. Gratis, sin registro.",
  },

  "strip-metadata-from-word-document": {
    slug: "strip-metadata-from-word-document",
    datePublished: "2026-11-15",
    keyword: "eliminar metadatos de documento Word",
    title: "Eliminar metadatos de documentos Word",
    subtitle:
      "Quita nombres de autor, control de cambios, comentarios, datos de la empresa y propiedades ocultas de archivos DOCX, en privado, en tu navegador.",
    heroLabel: "ELIMINA LOS METADATOS DE DOCUMENTOS WORD: GRATIS, SIN SUBIDAS",
    metadataCategories: [
      {
        category: "author",
        icon: "User",
        color: "#f472b6",
        label: "Autor e identidad",
        fields: [
          { label: "Creador", value: "Michael Torres" },
          { label: "Última modificación por", value: "Jennifer Walsh" },
          { label: "Responsable", value: "David Kim" },
          {
            label: "Empresa",
            value: "Sterling & Associates LLP",
          },
        ],
      },
      {
        category: "comments",
        icon: "ChatText",
        color: "#fbbf24",
        label: "Comentarios y control de cambios",
        fields: [
          { label: "Comentarios", value: "4 comentarios de 2 autores" },
          { label: "Control de cambios", value: "12 revisiones registradas" },
          { label: "Número de revisión", value: "47" },
          { label: "people.xml", value: "3 personas identificadas" },
        ],
      },
      {
        category: "dates",
        icon: "CalendarBlank",
        color: "#38bdf8",
        label: "Fechas y tiempo de edición",
        fields: [
          { label: "Creado", value: "2024-11-22T10:08:00Z" },
          { label: "Modificado", value: "2025-03-01T14:33:00Z" },
          { label: "Tiempo total de edición", value: "842 minutos" },
        ],
      },
      {
        category: "software",
        icon: "Laptop",
        color: "#818cf8",
        label: "Aplicación y plantilla",
        fields: [
          { label: "Aplicación", value: "Microsoft Office Word" },
          { label: "Versión", value: "16.0" },
          { label: "Plantilla", value: "Legal_Brief_v3.dotx" },
        ],
      },
    ],
    explainerTabs: [
      {
        id: "tracked",
        label: "Control de cambios",
        icon: "ChatText",
        color: "#fbbf24",
        title: "El texto eliminado no está eliminado del todo",
        description:
          "El control de cambios de Word guarda cada edición, incluido el texto que se eliminó. Si usas «Aceptar todos los cambios» antes de compartir, el texto visible queda limpio, pero el historial de revisiones puede seguir incrustado en el XML. Basta con descomprimir el archivo para verlo todo.",
        example: {
          label: "Lo que se esconde",
          value:
            "12 revisiones | Texto eliminado: «se rechazó la oferta inicial de 2,4 millones de dólares»",
        },
        risk: "La parte contraria, la competencia o los clientes pueden ver tus notas de negociación, tus borradores y el contenido eliminado.",
      },
      {
        id: "comments",
        label: "Comentarios",
        icon: "PushPin",
        color: "#f472b6",
        title: "Comentarios internos a la vista",
        description:
          "Los comentarios de tus compañeros sobreviven en el XML del DOCX incluso cuando en Word parecen eliminados. Los nombres de quienes comentaron, las fechas y el texto completo de cada comentario siguen accesibles con solo descomprimir el archivo.",
        example: {
          label: "Lo que se esconde",
          value:
            "Comentario de J. Walsh: «¿Deberíamos revelar el déficit del T3?»",
        },
        risk: "De los documentos compartidos se pueden extraer debates de estrategia interna, dudas legales y decisiones editoriales.",
      },
      {
        id: "identity",
        label: "Personas",
        icon: "UsersThree",
        color: "#a78bfa",
        title: "Todos los que tocaron el documento",
        description:
          "Los documentos de Word mantienen una lista de cada persona que editó o comentó el archivo. Incluye nombres completos, en algunos casos direcciones de correo, y la hora exacta de las aportaciones de cada persona.",
        example: {
          label: "Lo que se esconde",
          value:
            "3 editores: M. Torres, J. Walsh, D. Kim | Sterling & Associates LLP",
        },
        risk: "El archivo people.xml crea un registro completo de quién participó en la creación de un documento.",
      },
      {
        id: "template",
        label: "Plantillas",
        icon: "ClipboardText",
        color: "#06b6d4",
        title: "Fugas de metadatos de plantillas",
        description:
          "Los documentos creados a partir de plantillas heredan sus metadatos, incluidos el autor original y la empresa que creó la plantilla. Los bufetes y las consultoras descubren a menudo que están enviando documentos con los metadatos de otra firma incrustados.",
        example: {
          label: "Lo que se esconde",
          value:
            "Plantilla: Legal_Brief_v3.dotx | Autor original: Baker McKenzie",
        },
        risk: "Una plantilla de un antiguo empleador o de la competencia incrusta su identidad en cada documento que creas con ella.",
      },
    ],
    seoContent: {
      heading: "¿Por qué eliminar los metadatos de un documento Word antes de compartirlo?",
      paragraphs: [
        "Los documentos de Microsoft Word (DOCX) guardan muchos metadatos ocultos en archivos XML dentro del paquete del documento. Incluyen nombres de autor, datos de la empresa, tiempo de edición, historial de revisiones, comentarios, control de cambios y detalles de cada persona que contribuyó al documento.",
        "Para los profesionales del derecho es un riesgo bien conocido. En muchas jurisdicciones, las normas procesales exigen limpiar los metadatos antes de presentar o intercambiar documentos. La American Bar Association ha emitido dictámenes de ética que subrayan el deber de los abogados de eliminar los metadatos de los documentos que comparten con la parte contraria.",
        "Fuera del ámbito legal, cualquier empresa que comparta documentos Word con terceros se arriesga a exponer nombres de autores internos, la estructura de la empresa, la cronología de edición y contenido eliminado que puede seguir en el historial de revisiones. Las plantillas heredadas de antiguos empleadores o de socios pueden incrustar sus metadatos en tus documentos.",
        "MetaStrip abre tu archivo DOCX directamente en el navegador con JSZip, elimina o limpia los archivos XML de metadatos y vuelve a empaquetar el documento limpio, sin que tu archivo salga nunca de tu dispositivo.",
      ],
    },
    supportedFormats: [
      {
        ext: "DOCX",
        desc: "Autor, comentarios, control de cambios, empresa, plantilla, tiempo de edición, revisiones, propiedades personalizadas",
        color: "#f472b6",
      },
    ],
    metaTitle: "Eliminar metadatos de Word (.docx): gratis | MetaStrip",
    metaDescription:
      "Quita autores, empresa, control de cambios, comentarios e historial de revisiones de Microsoft Word (.docx). En tu navegador, sin subidas ni registro.",
  },
};
