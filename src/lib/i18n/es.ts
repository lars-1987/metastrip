import { BATCH_LIMIT } from "../constants";
import type { Messages } from "./en";

/* Spanish. Written by Claude for MS-6; to be checked by a native speaker
   before it ships. Tú, plain and direct like the English. */

const lista = (items: string[]) =>
  items.length <= 1 ? items.join("") : `${items.slice(0, -1).join(", ")} y ${items[items.length - 1]}`;

export const es: Messages = {
  nav: {
    blog: "Blog",
    pricing: "Precios",
    about: "Acerca de",
    github: "GitHub",
    openMenu: "Abrir menú",
    closeMenu: "Cerrar menú",
    tagline: "Nada sale de tu navegador",
    language: "Idioma",
    lightMode: "Cambiar a modo claro",
    darkMode: "Cambiar a modo oscuro",
  },

  hero: {
    scroll: "desliza ↓",
    before: "Tus archivos esconden ",
    items: ["coordenadas GPS", "huellas del dispositivo", "nombres de autor", "etiquetas de IA", "fechas de creación", "números de serie"],
    after: "cuando los compartes.",
    intro: "GPS, EXIF, etiquetas de IA, nombres de autor: fuera en segundos. Todo en tu navegador.",
    tryAbove: "Pruébalo arriba",
  },

  how: {
    eyebrow: "Cómo funciona",
    title: ["La privacidad está en los detalles.", "En concreto, en los metadatos."],
    features: [
      {
        eyebrow: "Qué se esconde",
        title: "Cada archivo que compartes habla.",
        body: "Las fotos llevan coordenadas GPS, números de serie del dispositivo, datos de la cámara y fechas. Los PDF llevan nombres de autor, historial de cambios y la huella del software. Las imágenes generadas con IA llevan credenciales de contenido C2PA que dicen qué herramienta las creó.",
        bullets: [
          "Un GPS con precisión de 5 metros del lugar donde estabas",
          "Dispositivo y número de serie, que vinculan cada foto a un mismo teléfono",
          "Etiquetas de IA de DALL·E, Midjourney, ChatGPT y Firefly",
          "Nombres de autor y control de cambios en Word, Excel y PDF",
        ],
      },
      {
        eyebrow: "Cómo funciona",
        title: "Suelta un archivo. Mira lo que expone. Límpialo.",
        body: "MetaStrip funciona por completo en tu navegador. No hay subida, ni servidor, ni caché temporal. Sueltas el archivo, la herramienta lee sus metadatos en tu dispositivo con sus propios analizadores y bibliotecas como pdf-lib, te muestra exactamente lo que lleva dentro y escribe una copia limpia.",
        bullets: [
          "Los archivos nunca salen de tu dispositivo, y puedes comprobarlo en DevTools",
          `Hasta ${BATCH_LIMIT} archivos a la vez`,
          "Código abierto con licencia MIT, publicado en GitHub",
          "Funciona en el móvil y en el ordenador, con o sin conexión",
        ],
      },
      {
        eyebrow: "Cuándo usarlo",
        title: "Antes de compartir cualquier cosa que no hayas escrito tú.",
        body: "Allí donde va un archivo, van sus metadatos. Contratos para la parte contraria, fotos para foros o tiendas de segunda mano, trabajos hechos con IA para clientes, envíos periodísticos, cualquier cosa publicada con seudónimo.",
        bullets: [
          "Antes de publicar fotos hechas en casa",
          "Antes de enviar a un cliente un Word con historial de revisiones",
          "Antes de entregar un trabajo hecho con IA cuando declararlo cambia si lo aceptan",
          "Antes de publicar algo de forma anónima: los dispositivos dejan huella",
        ],
      },
    ],
  },

  faq: {
    eyebrow: "Preguntas frecuentes",
    title: "¿Preguntas? Respuestas.",
    intro: "Lo que la gente suele preguntar sobre cómo funciona la herramienta, qué hace con tus archivos y qué pasa con tus datos.",
    items: [
      {
        question: "¿De verdad mis archivos son privados?",
        answer: "Sí. Cada archivo se procesa por completo en tu navegador con JavaScript. Tus archivos nunca se suben ni se guardan en un servidor. Puedes comprobarlo tú mismo: abre DevTools, ve a la pestaña Red y procesa un archivo; ninguna petición lo lleva. Lo único que envía la página son datos de uso anónimos, como qué tipos de archivo se limpian, nunca nombres de archivo, contenidos ni valores de metadatos. Toda la herramienta llega con la página la primera vez que la abres y a partir de ahí funciona en tu dispositivo.",
      },
      {
        question: "¿Qué metadatos elimina MetaStrip?",
        answer: "Fotos: coordenadas GPS, EXIF (marca, modelo, número de serie y ajustes de la cámara), IPTC, XMP, credenciales de contenido C2PA, etiquetas de IA, miniaturas incrustadas y fechas. PDF: autor, aplicación de origen, productor, título, asunto, palabras clave, propiedades personalizadas y fechas. Word, Excel y PowerPoint: autor, última persona que lo modificó, empresa, control de cambios, comentarios, historial de revisiones y metadatos de plantilla. Vídeo (MP4, MOV, M4V): coordenadas GPS, marca, modelo y software del dispositivo, identificadores del fabricante, fechas de creación y de pista, y huellas de herramientas en los átomos udta y meta. Audio (MP3, M4A, FLAC, WAV): etiquetas ID3v1 e ID3v2, comentarios Vorbis, carátulas incrustadas, bloques RIFF LIST/INFO, extensiones Broadcast Wave (bext) y metadatos iXML. El desglose completo por tipo de archivo está en la página de privacidad.",
      },
      {
        question: "¿Qué tipos de archivo admite?",
        answer: "Imágenes: JPEG, PNG, WebP, HEIC (el formato de fotos del iPhone), AVIF, GIF y TIFF. Documentos: PDF, Word (.docx), Excel (.xlsx) y PowerPoint (.pptx). Vídeo: MP4, MOV y M4V. Audio: MP3, M4A, FLAC y WAV. Los archivos RAW de cámara (DNG, NEF, CR2 y otros) todavía no son compatibles.",
      },
      {
        question: "¿MetaStrip es gratis de verdad?",
        answer: "Sí. Sin anuncios, sin cookies, sin registro, sin límites de subida y sin versión premium. El código está abierto en GitHub con licencia MIT. Si la herramienta te resulta útil, puedes invitarme a un café en Ko-fi; es totalmente opcional y nunca hace falta para usar nada.",
      },
      {
        question: "¿Quitar los metadatos cambia cómo se ve mi archivo?",
        answer: "No. El contenido de la imagen o del documento y la calidad quedan exactamente igual. Solo se eliminan los metadatos ocultos. El archivo pesa un poco menos porque esos metadatos ya no están (normalmente unos pocos KB por foto, a veces más en imágenes generadas con IA que llevan manifiestos C2PA grandes).",
      },
      {
        question: "¿En qué se diferencia de la opción de quitar la ubicación de mi móvil?",
        answer: "Las apps de fotos de iPhone y Android quitan las coordenadas GPS pero dejan casi todo lo demás: modelo del dispositivo, número de serie, versión del software, historial de edición, ajustes de la cámara, etiquetas de IA y fechas. MetaStrip lo elimina todo y funciona también con PDF y documentos de Office, no solo con fotos. Además te enseña exactamente qué llevaba el archivo antes de limpiarlo, para que veas lo que estaba revelando.",
      },
      {
        question: "¿Y las imágenes generadas con IA?",
        answer: "Herramientas de IA como DALL·E, Midjourney, la generación de imágenes de ChatGPT y Adobe Firefly incrustan credenciales de contenido C2PA que identifican de forma criptográfica una imagen como generada con IA. MetaStrip las elimina junto con el resto de metadatos. Conviene saber que esto quita las marcas de IA que van en los metadatos, pero no las marcas de agua esteganográficas a nivel de píxel, como SynthID de Google; esas van dentro de la propia imagen, no en los metadatos, y requieren otras técnicas.",
      },
      {
        question: "¿MetaStrip es de código abierto?",
        answer: "Sí: licencia MIT y código en GitHub. Puedes revisar el código, ejecutarlo en tu equipo, hacer un fork o contribuir. La herramienta está hecha con sus propios analizadores y dos bibliotecas públicas (pdf-lib y JSZip), así que puedes comprobar exactamente qué hace con tus archivos.",
      },
      {
        question: "¿Puedo procesar varios archivos a la vez?",
        answer: `Sí: suelta hasta ${BATCH_LIMIT} archivos a la vez, hasta 750 MB en total (un solo vídeo puede llegar a 1,5 GB en un ordenador). Cada uno se procesa por separado en el navegador, y puedes descargarlos uno a uno o en un único zip. Los límites existen solo porque la memoria de tu navegador es finita, no porque nos guardemos funciones.`,
      },
      {
        question: "¿Funciona en el móvil?",
        answer: "Sí. La herramienta completa funciona en los navegadores de iOS y Android. La herramienta es la misma; el diseño se adapta.",
      },
    ],
    emailUs: "Escríbenos",
  },

  footer: {
    brand: "Los metadatos ocultos de tus archivos: GPS, EXIF, etiquetas de IA, nombres de autor, fuera en segundos. Todo en tu navegador. Gratis y de código abierto.",
    builtWith: "Hecho con",
    inMelbourne: "en Melbourne",
    by: "por",
    tagline: "MetaStrip · tus archivos nunca salen de tu dispositivo.",
    mitLicensed: "Licencia MIT",
    tools: "Herramientas",
    articles: "Artículos (en inglés)",
    site: "Sitio",
    home: "Inicio",
    blog: "Blog",
    about: "Acerca de",
    pricing: "Precios",
    privacy: "Privacidad y condiciones",
    terminal: "¿Prefieres la terminal?",
    email: "Correo",
    toolLinks: {
      "remove-metadata-from-photos": "Eliminar metadatos de fotos",
      "remove-gps-location-from-photos": "Quitar el GPS de las fotos",
      "strip-exif-data": "Eliminar datos EXIF",
      "remove-c2pa-metadata": "Eliminar metadatos C2PA",
      "remove-author-from-pdf": "Quitar el autor de un PDF",
      "strip-metadata-from-word-document": "Eliminar metadatos de Word",
    },
  },

  categories: {
    gps: { label: "GPS y ubicación", info: "El lugar exacto donde se hizo la foto o el vídeo, a menudo con precisión de unos pocos metros. Suficiente para localizar tu casa, tu trabajo o dondequiera que estuvieras." },
    device: { label: "Dispositivo y cámara", info: "La marca, el modelo y el número de serie del dispositivo que creó el archivo. Funciona como una huella que vincula todos tus archivos a un mismo dispositivo." },
    dates: { label: "Fechas y horas", info: "Cuándo se creó y se editó por última vez el archivo, a menudo al segundo y con zona horaria, lo que puede revelar tu rutina y tu ubicación aproximada." },
    author: { label: "Autor e identidad", info: "Nombres, usuarios o créditos de autor incrustados por tu dispositivo o tu programa de edición." },
    software: { label: "Software y aplicación", info: "Qué aplicación y qué versión procesaron el archivo. Deja huella de las herramientas y el sistema operativo que usas." },
    ai: { label: "Etiquetas de IA", info: "Marcas de procedencia (como C2PA) que señalan el archivo como generado con IA y nombran la herramienta que lo creó." },
    copyright: { label: "Copyright y derechos", info: "Avisos de copyright e información de derechos guardados dentro del archivo." },
    comments: { label: "Comentarios y cambios", info: "Comentarios, control de cambios y notas de revisión que quedaron en el documento." },
    custom: { label: "Propiedades personalizadas", info: "Otros campos incrustados: resolución, ajustes de la cámara, miniaturas, etiquetas propias de cada aplicación y restos técnicos variados." },
  },

  dropzone: {
    reading: "Leyendo tus archivos…",
    dropHere: "Suéltalos aquí.",
    prompt: "Arrastra y suelta tus archivos, o haz clic para elegirlos. Todo se procesa en tu navegador. Nada se sube a servidores externos.",
    choose: "Elegir archivos",
  },

  files: {
    reading: (done, total, large) => `leyendo ${done} de ${total}…${large ? " lote grande, tardará un poco" : ""}`,
    count: (n) => `${n} ${n === 1 ? "archivo" : "archivos"}`,
    tapToReview: "· toca cada uno para revisarlo",
    skipped: (names) => {
      const shown = names.slice(0, 2).join(", ");
      const more = names.length > 2 ? ` y ${names.length - 2} más` : "";
      return `Se ${names.length === 1 ? "omitió 1 archivo" : `omitieron ${names.length} archivos`} que MetaStrip todavía no puede leer: ${shown}${more}.`;
    },
    notRead: " · sin leer",
    remove: (name) => `Quitar ${name}`,
    processing: "Procesando",
    done: "Hecho",
    notReadLabel: "Sin leer",
  },

  review: {
    foundIn: "Encontrado en",
    removeAll: "Quitar todo",
    locked: "Este archivo está bloqueado.",
    unreadable: "No se ha podido leer este archivo.",
    unchecked: "No se ha cambiado nada, y no podemos decirte si lleva metadatos, así que tómalo como no revisado, no como limpio.",
    knowPassword: "¿Sabes la contraseña? ",
    unlockLink: "Desbloquéalo con SanctumPDF",
    unlockRestPermissions: " dejando la contraseña en blanco. Es una herramienta gratuita del creador de MetaStrip que también funciona en tu navegador, así que el archivo no sale de tu dispositivo.",
    unlockRestPassword: ", una herramienta gratuita del creador de MetaStrip que también funciona en tu navegador, así que el archivo y la contraseña no salen de tu dispositivo.",
    lookInto: "¿Quieres que lo revisemos?",
    emailLink: (email) => `Escribe a ${email}`,
    emailRest: ". Rellenamos los detalles del error y no hace falta adjuntar el archivo.",
    clean: "No hay metadatos que quitar. Este archivo ya está limpio, así que puedes compartir el original tal cual.",
    fieldCount: (n) => `${n} ${n === 1 ? "campo" : "campos"}`,
    more: (n) => `+${n} más`,
    acrossAll: "tu selección se aplica a todos los archivos",
    removing: "Quitando…",
    tryAnother: "Probar otro archivo",
    checkAnother: "Revisar otro archivo",
    removeAllMetadata: "Quitar todos los metadatos",
    removeSelected: (fileCount, selected) => `Quitar lo seleccionado${fileCount > 1 ? ` · ${fileCount} archivos` : ` (${selected})`}`,
    location: "Ubicación",
    embeddedInFile: "incrustado en el archivo",
    locationInfo: "Este mapa se dibuja en tu navegador a partir de un mapa del mundo incluido; tus coordenadas nunca se envían a ningún sitio para mostrarlo. Nada sobre tu ubicación sale de tu dispositivo.",
    mapLabel: (where) => `Mapa con la ubicación de la foto en ${where}`,
    whatIsThis: "¿Qué es esto?",
  },

  report: {
    rechecking: (one) => (one ? "Volviendo a revisar el archivo limpio…" : "Volviendo a revisar los archivos limpios…"),
    leftoversOne: "La revisión ha encontrado metadatos que siguen en el archivo limpio. Detalles abajo.",
    leftoversMany: (n) => `La revisión ha encontrado metadatos que siguen en ${n} de los archivos. Detalles abajo.`,
    couldntRecheck: (one) => (one ? "No se ha podido volver a revisar el archivo limpio." : "No se han podido volver a revisar los archivos limpios."),
    recheckedSummary: (one, checked, readable, kept) => {
      const what = kept ? "solo queda lo que elegiste conservar" : "no queda ningún metadato";
      const scope = one ? "Archivo limpio revisado" : checked === readable ? `Los ${readable} archivos revisados` : `${checked} de ${readable} archivos revisados`;
      return `${scope} de nuevo: ${what}.`;
    },
    markRechecking: "Revisando",
    markLeftovers: "Siguen quedando metadatos",
    markRechecked: "Revisado",
    detailClean: "Archivo limpio revisado de nuevo: no queda ningún metadato.",
    detailKept: (n) =>
      `Archivo limpio revisado de nuevo: solo ${n === 1 ? "queda el campo que elegiste" : `quedan los ${n} campos que elegiste`} conservar.`,
    detailLeftovers: (categories) => `La revisión del archivo limpio todavía ha encontrado ${lista(categories)}.`,
    detailLeftoversBug: " No te fíes de él todavía. Es un fallo de MetaStrip, y ",
    detailLeftoversIssue: "abrir un issue en GitHub",
    detailLeftoversEnd: " nos ayuda a arreglarlo.",
    detailSkipped: "Este archivo es demasiado grande para revisarlo de nuevo automáticamente.",
    detailUnchecked: "No se ha podido volver a leer el archivo limpio para comprobarlo.",
    download: (many) => (many ? "Descargar archivos limpios (.zip)" : "Descargar archivo limpio"),
    nothingCleaned: "No se ha limpiado nada",
    removed: "Metadatos eliminados",
    nothingLeft: "No queda nada que quitar",
    allFailed: (failed) =>
      failed === 1 ? "No se ha podido leer este archivo, así que no se ha cambiado nada." : `No se han podido leer los ${failed} archivos, así que no se ha cambiado nada.`,
    cleaned: (n) => `${n} ${n === 1 ? "archivo limpiado" : "archivos limpiados"}, en tu navegador.`,
    someFailed: (n) => (n === 1 ? " 1 no se ha podido leer y se ha dejado igual." : ` ${n} no se han podido leer y se han dejado igual.`),
    saveOrShare: "Guardar o compartir",
    fieldsRemoved: "Campos quitados",
    fieldsKept: "Campos sin quitar",
    sizeSaved: "Espacio ahorrado",
    notRead: "sin leer",
    removedCount: (n) => `−${n} quitados`,
    noneRemoved: "No se ha quitado ningún campo de este archivo.",
    startOver: "Empezar de nuevo",
    tipJar: "Propinas",
    star: "Estrella en GitHub",
  },

  seoDoc: {
    whatsHidden: "Lo que esconden tus archivos",
    category: "Categoría",
    field: "Campo",
    example: "Valor de ejemplo",
    formats: "Formatos compatibles",
    footer: "metastrip v3.0; eliminación de metadatos con la privacidad primero; todo se procesa en tu navegador",
    features: ["Eliminación de metadatos en el navegador", "Sin subir archivos", "Eliminación de EXIF, IPTC y XMP", "Eliminación de la ubicación GPS", "Eliminación de metadatos de IA"],
  },

  errors: {
    lockedPassword: "Está protegido con contraseña, y MetaStrip no puede cambiar un archivo bloqueado sin estropearlo. Desbloquéalo primero con su contraseña y luego añade la copia desbloqueada.",
    lockedPermissions: "Se abre sin contraseña pero está bloqueado contra cambios, y MetaStrip no puede cambiar un archivo bloqueado sin estropearlo. Quita primero el bloqueo y luego añade la copia desbloqueada.",
    lockedUnknown: "Está cifrado, y MetaStrip no puede cambiar un archivo bloqueado sin estropearlo. Quita primero la protección y luego añade la copia desbloqueada.",
    browser: "Tu navegador no ha podido abrirlo. Si lo acabas de descargar, asegúrate de que la descarga ha terminado, o guárdalo en una carpeta de este dispositivo (no en una que solo esté en la nube) y vuelve a intentarlo.",
    damaged: "Puede que esté dañado, o que use una variante del formato que MetaStrip todavía no admite.",
  },

  tool: {
    unsupported: (labels) =>
      labels && labels.length > 0 ? `Los archivos ${labels.join(" y ")} todavía no son compatibles.` : "Esos tipos de archivo todavía no son compatibles.",
    batchLimit: `Hasta ${BATCH_LIMIT} archivos a la vez.`,
    tooBigPhone: (size, cap, computerCap) =>
      `Ese archivo pesa ${size}. Hasta ${cap} en un móvil; en un ordenador, los vídeos pueden llegar a ${computerCap}.`,
    tooBigFile: (size, cap) => `Ese archivo pesa ${size}. Hasta ${cap} a la vez.`,
    tooBigBatch: (size, cap) => `Ese lote pesa ${size}. Hasta ${cap} a la vez, así que prueba con menos archivos.`,
    downloadFailed: "La descarga ha fallado; recarga la página y vuelve a intentarlo.",
    shareFailed: "Compartir no ha funcionado aquí; usa Descargar.",
  },
};
