import type { MetadataCategory } from "./types";

/**
 * Recognising AI generation records that arrive as plain text metadata.
 *
 * C2PA has its own chunk and was always classed as AI. Tools that write their
 * settings as text were not: Stable Diffusion's "parameters" chunk, a full
 * prompt with seed and model, showed up under Custom Properties, the AI toggle
 * did not cover it, and category telemetry undercounted AI files.
 */

/** Text keys only generation tools write, with a readable label. */
const AI_TEXT_KEYS: Record<string, string> = {
  parameters: "Generation parameters", // AUTOMATIC1111, Forge, SwarmUI, Fooocus
  prompt: "ComfyUI prompt",
  workflow: "ComfyUI workflow",
  invokeai_metadata: "InvokeAI metadata",
  invokeai_graph: "InvokeAI graph",
  invokeai_workflow: "InvokeAI workflow",
  "sd-metadata": "InvokeAI metadata (legacy)",
  fooocus_scheme: "Fooocus metadata scheme",
};

/** Fields that name the program that made the file. */
const SOFTWARE_KEYS = new Set(["Software", "Source", "ProcessingSoftware"]);

/** Free-text fields that ordinary files use too, so the value has to prove it. */
const FREE_TEXT_KEYS = new Set([
  "Comment", "Description", "Title", "UserComment", "ImageDescription", "XPComment", "XPTitle", "XPSubject",
]);

const XMP_KEYS = new Set(["XML:com.adobe.xmp"]);

const GENERATOR_NAMES = /\b(NovelAI|Midjourney|Stable Diffusion|ComfyUI|InvokeAI|Fooocus|DALL[·-]?E|Adobe Firefly)\b/i;

/** Midjourney packs the prompt and the job into one Description field. */
const MIDJOURNEY_JOB = /\bJob ID:\s*[0-9a-f-]{8,}/i;

const hasOwn = (o: object, k: string) => Object.prototype.hasOwnProperty.call(o, k);

/**
 * Whether a free-text value is a generation record rather than ordinary text.
 * Kept narrow on purpose, so a holiday caption is never reclassified.
 */
export function looksLikeAiGeneration(value: string): boolean {
  // EXIF UserComment is often "UNICODE\0" plus UTF-16, which reads as text
  // with a NUL between every character.
  const v = value.replace(/\0/g, "");
  // AUTOMATIC1111-style settings line: "Steps: 30, Sampler: Euler a, Seed: 1234".
  if (/\bSteps:\s*\d+/.test(v) && /\b(Sampler|Seed|CFG scale):/.test(v)) return true;
  // JSON carrying a prompt alongside sampling settings (NovelAI's Comment).
  if (/"prompt"\s*:/.test(v) && /"(steps|seed|sampler|scale|cfg_scale|n_samples)"\s*:/.test(v)) return true;
  // Midjourney packs the prompt and the job into Description.
  if (MIDJOURNEY_JOB.test(v)) return true;
  // NovelAI's fixed Title.
  if (/^AI generated image$/i.test(v.trim())) return true;
  return false;
}

/**
 * "ai" when a text field is an AI generation record, otherwise null so the
 * caller falls back to its usual category. Only a key check is possible for
 * compressed text, so pass "" as the value there.
 */
export function aiCategoryFor(key: string, value: string): MetadataCategory | null {
  if (hasOwn(AI_TEXT_KEYS, key)) return "ai";
  if (SOFTWARE_KEYS.has(key)) return GENERATOR_NAMES.test(value) ? "ai" : null;
  if (FREE_TEXT_KEYS.has(key)) return looksLikeAiGeneration(value) ? "ai" : null;
  // IPTC's official AI marker (Midjourney, Google and Adobe set it) or a
  // generator named as the creator tool.
  if (XMP_KEYS.has(key)) return /trainedAlgorithmicMedia/i.test(value) || GENERATOR_NAMES.test(value) || xmpProvenance(value) ? "ai" : null;
  return null;
}

/** A readable label for a key only generation tools write, else null. */
export function aiTextLabel(key: string): string | null {
  return hasOwn(AI_TEXT_KEYS, key) ? AI_TEXT_KEYS[key] : null;
}

/** A readable label for a generic field whose value marks it as one tool's
 *  record, else null. A Midjourney download showed its prompt and job as a
 *  bare "Description". */
export function aiValueLabel(key: string, value: string): string | null {
  if (FREE_TEXT_KEYS.has(key) && MIDJOURNEY_JOB.test(value.replace(/\0/g, ""))) return "Midjourney prompt and job ID";
  if (XMP_KEYS.has(key) && xmpProvenance(value)) return "C2PA manifest stored online";
  if (XMP_KEYS.has(key) && aiCategoryFor(key, value) === "ai") return "AI marker in XMP";
  return null;
}

const IPTC_SOURCE_TYPES: [RegExp, string][] = [
  [/compositeWithTrainedAlgorithmicMedia/i, "Edited with AI (IPTC digital source type)"],
  [/trainedAlgorithmicMedia/i, "AI-generated (IPTC digital source type)"],
];

/**
 * The online manifest an XMP packet points to, else null. Adobe Firefly's PNG
 * downloads carry no embedded manifest at all, only this link
 * (dcterms:provenance="https://cai-manifests.adobe.com/manifests/…"), which
 * showed as a Custom field whose 200-character preview cut the link off.
 */
export function xmpProvenance(xmp: string): string | null {
  const m = /dcterms:provenance\s*=\s*"([^"]+)"/.exec(xmp) ?? /<dcterms:provenance>\s*([^<\s]+)\s*</.exec(xmp);
  return m ? m[1] : null;
}

/** A better value to show than the raw text, else null. For an XMP packet the
 *  opening "<?xpacket begin=…" said nothing: show the manifest link, the IPTC
 *  source type, or the generator it names instead. */
export function aiDisplayValue(key: string, value: string): string | null {
  if (!XMP_KEYS.has(key)) return null;
  const link = xmpProvenance(value);
  if (link) return link;
  for (const [re, text] of IPTC_SOURCE_TYPES) if (re.test(value)) return text;
  const tool = GENERATOR_NAMES.exec(value);
  return tool ? `names ${tool[1]}` : null;
}
