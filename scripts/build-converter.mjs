// Builds the image converter's worker into public/convert/, before `next dev`
// and `next build` (the predev and prebuild scripts).
//
// Next 16.1's Turbopack copies a `new Worker(new URL(...))` file as it is,
// without compiling it, and libheif's Node.js branch breaks its build. So the
// worker is built here with esbuild, as a plain script the static export
// serves like any other file.
//
// libheif (LGPL-3.0) is copied beside it unmodified, with its licence: the
// worker loads it at run time, so it stays a separate library anyone can
// swap for their own build.

import { build } from "esbuild";
import { copyFileSync, mkdirSync, rmSync } from "node:fs";

const OUT = "public/convert";
const LIBHEIF = "node_modules/libheif-js/libheif-wasm";

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

await build({
  entryPoints: ["src/lib/conversion/worker.ts"],
  outfile: `${OUT}/worker.js`,
  bundle: true,
  minify: true,
  format: "iife",
  platform: "browser",
  target: ["chrome110", "firefox115", "safari16.4"],
  logLevel: "warning",
});

for (const file of ["libheif.js", "libheif.wasm"]) copyFileSync(`${LIBHEIF}/${file}`, `${OUT}/${file}`);
copyFileSync(`${LIBHEIF}/LICENSE`, `${OUT}/libheif-LICENSE.txt`);
