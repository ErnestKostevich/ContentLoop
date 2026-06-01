/**
 * Generate Chrome Web Store promo tiles from brand assets.
 *
 * Produces:
 *   - chrome-extension/promo-small-440x280.png   (small promo tile)
 *   - chrome-extension/promo-marquee-1400x560.png (marquee promo tile)
 *
 * Render path: hand-built SVG → sharp/librsvg → PNG.
 * Fonts use system sans-serif (Arial / Segoe UI on Windows).
 */
import sharp from "sharp";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";

const OUT_DIR = "./chrome-extension";

/* Reusable mark + text builder.
   width, height — canvas size.
   markSize — pixel size of the brand square. */
const buildSvg = ({ width, height, markSize, fontSize, subFontSize, padding, layout }) => {
  // Position of mark + text
  let markX, markY, textX, textY1, textY2;
  if (layout === "horizontal") {
    markX = padding;
    markY = (height - markSize) / 2;
    textX = markX + markSize + padding * 0.8;
    textY1 = height / 2 - 4;
    textY2 = height / 2 + subFontSize + 8;
  } else {
    // stacked / centered
    markX = (width - markSize) / 2;
    markY = padding;
    textX = width / 2;
    textY1 = markY + markSize + padding + fontSize - 8;
    textY2 = textY1 + subFontSize + 12;
  }

  // Arrow path scales with markSize: arc from 70% to 35% of markSize
  const a = (markSize / 64).toFixed(3); // scale unit
  const arc = `M ${44 * a} ${18 * a} A ${14 * a} ${14 * a} 0 1 0 ${44 * a} ${46 * a}`;
  const head = `M ${38 * a} ${12 * a} L ${44 * a} ${18 * a} L ${38 * a} ${24 * a}`;
  const strokeW = (5 * a).toString();
  const cornerR = (14 * a).toString();

  const textAnchor = layout === "horizontal" ? "start" : "middle";

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="${width}" y2="${height}" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="#0a0a0a"/>
        <stop offset="100%" stop-color="#000000"/>
      </linearGradient>
      <linearGradient id="mark" x1="0" y1="0" x2="${markSize}" y2="${markSize}" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="#6366f1"/>
        <stop offset="55%" stop-color="#a855f7"/>
        <stop offset="100%" stop-color="#ec4899"/>
      </linearGradient>
      <radialGradient id="glow" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0%" stop-color="#ec4899" stop-opacity="0.35"/>
        <stop offset="100%" stop-color="#ec4899" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="glow2" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0%" stop-color="#6366f1" stop-opacity="0.25"/>
        <stop offset="100%" stop-color="#6366f1" stop-opacity="0"/>
      </radialGradient>
    </defs>

    <rect width="${width}" height="${height}" fill="url(#bg)"/>

    <!-- aurora blobs -->
    <circle cx="${width * 0.85}" cy="${height * 0.55}" r="${Math.max(width, height) * 0.45}" fill="url(#glow)"/>
    <circle cx="${width * 0.15}" cy="${height * 0.3}" r="${Math.max(width, height) * 0.35}" fill="url(#glow2)"/>

    <!-- brand mark -->
    <g transform="translate(${markX}, ${markY})">
      <rect width="${markSize}" height="${markSize}" rx="${cornerR}" ry="${cornerR}" fill="url(#mark)"/>
      <path d="${arc}" fill="none" stroke="white" stroke-width="${strokeW}" stroke-linecap="round"/>
      <path d="${head}" fill="none" stroke="white" stroke-width="${strokeW}" stroke-linecap="round" stroke-linejoin="round"/>
    </g>

    <!-- wordmark -->
    <text
      x="${textX}"
      y="${textY1}"
      font-family="'Segoe UI', 'Helvetica Neue', Arial, sans-serif"
      font-size="${fontSize}"
      font-weight="600"
      fill="#ffffff"
      letter-spacing="-1.5"
      text-anchor="${textAnchor}"
      dominant-baseline="middle"
    >ContentLoop</text>

    <!-- tagline -->
    <text
      x="${textX}"
      y="${textY2}"
      font-family="'Segoe UI', 'Helvetica Neue', Arial, sans-serif"
      font-size="${subFontSize}"
      font-weight="400"
      fill="#a3a3a3"
      text-anchor="${textAnchor}"
      dominant-baseline="middle"
    >Turn one post into ten.</text>
  </svg>`;
};

async function render({ name, width, height, svg }) {
  const buf = await sharp(Buffer.from(svg))
    .png({ compressionLevel: 9 })
    .resize(width, height, { fit: "fill" })
    .toBuffer();
  const path = join(OUT_DIR, name);
  await writeFile(path, buf);
  console.log(`✓ ${path} (${(buf.length / 1024).toFixed(1)} KB)`);
}

// Small promo tile — 440×280
await render({
  name: "promo-small-440x280.png",
  width: 440,
  height: 280,
  svg: buildSvg({
    width: 440,
    height: 280,
    markSize: 88,
    fontSize: 36,
    subFontSize: 16,
    padding: 24,
    layout: "horizontal",
  }),
});

// Marquee promo tile — 1400×560
await render({
  name: "promo-marquee-1400x560.png",
  width: 1400,
  height: 560,
  svg: buildSvg({
    width: 1400,
    height: 560,
    markSize: 200,
    fontSize: 92,
    subFontSize: 38,
    padding: 80,
    layout: "horizontal",
  }),
});

console.log("\nDone. Upload these in the 'Graphic assets' section of the listing form.");
