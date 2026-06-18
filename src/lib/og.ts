/** Shared OpenGraph image. Served as a static .png so static hosts (GitHub
 *  Pages) return the correct image/* MIME type; the old extensionless
 *  /opengraph-image route was served as application/octet-stream and rejected
 *  by social scrapers. metadataBase resolves this to an absolute URL. */
export const OG_IMAGE = {
  url: "/opengraph-image.png",
  width: 1200,
  height: 630,
  alt: "MetaStrip, strip hidden metadata from files",
};
