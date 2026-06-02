// Generates the PWA/app icons from a checkmark SVG using sharp.
// Run: node scripts/gen-icons.mjs
// Re-run after changing the colors/glyph below.
import sharp from "sharp";
import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const BG = "#14171a"; // brand near-black
const MARK = "#ffffff";

// Rounded-square icon (purpose "any") — bold check, generous corner radius.
const rounded = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="116" fill="${BG}"/>
  <path d="M148 270 L222 344 L366 168" fill="none" stroke="${MARK}" stroke-width="48" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

// Full-bleed icon with the check pulled into the maskable safe zone (~80%
// centered). Used for purpose "maskable" and the Apple touch icon (iOS masks).
const fullBleed = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="${BG}"/>
  <path d="M176 268 L236 328 L348 196" fill="none" stroke="${MARK}" stroke-width="42" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const png = (svg, size) =>
  sharp(Buffer.from(svg)).resize(size, size).png().toBuffer();

await mkdir(join(root, "public/icons"), { recursive: true });

const targets = [
  ["public/icons/icon-192.png", rounded, 192],
  ["public/icons/icon-512.png", rounded, 512],
  ["public/icons/icon-maskable.png", fullBleed, 512],
  ["src/app/apple-icon.png", fullBleed, 180],
  // PNG favicon for the browser tab (universal support, incl. Safari).
  ["src/app/icon.png", rounded, 256],
];

for (const [rel, svg, size] of targets) {
  await writeFile(join(root, rel), await png(svg, size));
  console.log("wrote", rel, `(${size}x${size})`);
}

// Crisp scalable favicon / tab icon.
await writeFile(join(root, "src/app/icon.svg"), rounded);
console.log("wrote src/app/icon.svg");
