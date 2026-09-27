// GitHub Pages can't send 301s, so each old or mistyped URL gets a static page
// that redirects instantly. Google treats a zero-delay meta refresh as a
// permanent redirect and moves the URL's signals to the target.
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const OUT = "out";
const SITE = "https://metastrip.app";

const C2PA_POST = "/blog/remove-c2pa-content-credentials-from-image";

// Paths Search Console reported as 404s that still get impressions.
const REDIRECTS = {
  "/blog/remove-content-credentials-from-image": C2PA_POST,
  "/blog/remove-c2pa-content-credentials-image": C2PA_POST,
  "/blog/remove-c2pa-conent-credentials-from-image": C2PA_POST,
  "/blog/remove-c2pa-convent-credentials-from-image": C2PA_POST,
  "/blog/remove-czpa-content-credentials-from-image": C2PA_POST,
  "/blog/remove-c2px-content-credentials-from-image": C2PA_POST,
  "/remove-c2pa-metadata)": "/remove-c2pa-metadata",
};

const page = (target) => {
  const url = SITE + target;
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Moved</title>
<link rel="canonical" href="${url}">
<meta http-equiv="refresh" content="0; url=${url}">
<script>location.replace(${JSON.stringify(target)} + location.search + location.hash)</script>
</head>
<body><p>This page has moved to <a href="${url}">${url}</a>.</p></body>
</html>
`;
};

for (const [from, to] of Object.entries(REDIRECTS)) {
  if (!existsSync(join(OUT, `${to}.html`))) {
    throw new Error(`Redirect target ${to} was not built`);
  }
  const file = join(OUT, `${from}.html`);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, page(to));
}

console.log(`Wrote ${Object.keys(REDIRECTS).length} redirect pages`);
