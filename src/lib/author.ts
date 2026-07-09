// Single source of truth for author identity. Used by the visible byline and
// bio card (ArticlePage), the /author/lars page, and the Person entity in each
// article's structured data — so the schema and the visible page never drift.
export const AUTHOR = {
  name: "Lars Holmstrom",
  firstName: "Lars",
  jobTitle: "Developer of MetaStrip",
  /** Site-relative path to the author page (for internal <Link>s). */
  path: "/author/lars",
  /** Absolute URL — used as the Person @id/url in JSON-LD. */
  url: "https://metastrip.app/author/lars",
  bio: "Lars is a cybersecurity and privacy specialist and the developer of MetaStrip, an open-source, client-side metadata-removal tool.",
  /** Site-relative portrait for <img> tags (byline avatar, bio card, author page). */
  image: "/portrait.JPG",
  /** Absolute portrait URL for JSON-LD (schema.org needs a resolvable URL). */
  imageUrl: "https://metastrip.app/portrait.JPG",
  /** Public profiles that identify the same person (schema.org sameAs). */
  sameAs: ["https://x.com/larsitodev", "https://github.com/lars-1987"],
} as const;

/** Stable @id for the Person entity, shared across every page that references
 *  Lars so crawlers resolve them to one node. */
export const AUTHOR_ID = `${AUTHOR.url}#person`;
