/**
 * Generate PNG icons for the Chrome extension at 16/32/48/128 px
 * from the brand SVG. Chrome Web Store rejects SVG icons, so we
 * rasterize once and ship the PNGs alongside the manifest.
 *
 * Usage:
 *   node scripts/generate-extension-icons.mjs
 */
import sharp from "sharp";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";

const SVG_PATH = "./public/icon.svg";
const OUT_DIR = "./chrome-extension";
const SIZES = [16, 32, 48, 128];

if (!existsSync(OUT_DIR)) await mkdir(OUT_DIR, { recursive: true });

const svg = await readFile(SVG_PATH);

for (const size of SIZES) {
  const buf = await sharp(svg, { density: size * 4 })
    .resize(size, size, { fit: "contain" })
    .png({ compressionLevel: 9 })
    .toBuffer();
  const out = join(OUT_DIR, `icon-${size}.png`);
  await writeFile(out, buf);
  console.log(`✓ ${out} (${buf.length} bytes)`);
}

console.log("\nDone. Re-add the `icons` block in manifest.json:");
console.log(
  JSON.stringify(
    {
      icons: Object.fromEntries(SIZES.map((s) => [s, `icon-${s}.png`])),
    },
    null,
    2
  )
);
