# MetaStrip

MetaStrip removes hidden metadata from files in the browser. This glossary pins down the words used for the files it handles and the metadata it finds in them.

## Formats

**Format**:
A kind of file MetaStrip can tell apart from others, such as JPEG, HEIC, DOCX or TIFF. One format can arrive under several MIME types and extensions.
_Avoid_: file type, type (when you mean the format), MIME type (that is one clue to the format, not the format)

**Supported format**:
A format MetaStrip can strip.

**Recognised format**:
A format MetaStrip can name but not yet strip, so it can say so plainly instead of reporting a parser error.
_Avoid_: unsupported format (too broad: it also covers files nobody can identify)

**Identify**:
To decide a file's format. The file's leading bytes decide first; the MIME type and then the extension decide only when the bytes are ambiguous.
_Avoid_: detect, sniff (each names only one of the clues)

**Format registry**:
The single place that knows every format: how to identify it, what to call it, and whether it is supported or recognised.

## Categories

**File category**:
The broad family a format belongs to: image, document, video or audio.
_Avoid_: category (alone), media type

**Metadata category**:
A family of metadata fields a user can choose to keep or remove, such as GPS, device, dates or author.
_Avoid_: category (alone)

## Stripping

**Metadata field**:
One piece of metadata found in a file, such as a camera model or a GPS position. Every field belongs to exactly one metadata category.
_Avoid_: tag, property, entry (each is one format's word for it)

**Removed field**:
A metadata field a strip took out of the file.

**Kept field**:
A metadata field still in the file after a strip, because the user chose to keep its category or because it could not be removed on its own.

**Unreadable file**:
A file in a supported format whose contents are not valid for that format, so MetaStrip hands it back untouched.
_Avoid_: corrupt file (we can't always tell damage from a variant we don't handle)

**Leftover**:
A metadata field that verify clean still finds in a cleaned file, in a category the user asked to remove.
