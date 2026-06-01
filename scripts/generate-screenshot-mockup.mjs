/**
 * Generate a 1280×800 mockup screenshot for the Chrome Web Store
 * listing. Looks like the ContentLoop popup floating over a faded
 * article. Not a real screenshot — meant as a placeholder so the
 * listing has the required Screenshots field filled while you take
 * real ones later.
 *
 * Output: chrome-extension/screenshot-mockup-1280x800.png
 */
import sharp from "sharp";
import { writeFile } from "node:fs/promises";

const W = 1280;
const H = 800;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="${W}" y2="${H}" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#0a0a0a"/>
      <stop offset="100%" stop-color="#000000"/>
    </linearGradient>
    <linearGradient id="mark" x1="0" y1="0" x2="56" y2="56" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#6366f1"/>
      <stop offset="55%" stop-color="#a855f7"/>
      <stop offset="100%" stop-color="#ec4899"/>
    </linearGradient>
    <radialGradient id="glow1" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0%" stop-color="#ec4899" stop-opacity="0.18"/>
      <stop offset="100%" stop-color="#ec4899" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="glow2" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0%" stop-color="#6366f1" stop-opacity="0.15"/>
      <stop offset="100%" stop-color="#6366f1" stop-opacity="0"/>
    </radialGradient>
    <filter id="cardShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="16"/>
      <feOffset dy="12"/>
      <feComponentTransfer><feFuncA type="linear" slope="0.45"/></feComponentTransfer>
      <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>

  <!-- background -->
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <circle cx="${W * 0.85}" cy="${H * 0.6}" r="500" fill="url(#glow1)"/>
  <circle cx="${W * 0.15}" cy="${H * 0.35}" r="450" fill="url(#glow2)"/>

  <!-- faded article in the background -->
  <g opacity="0.35">
    <rect x="120" y="80" width="640" height="40" rx="6" fill="#262626"/>
    <rect x="120" y="140" width="540" height="40" rx="6" fill="#262626"/>
    <rect x="120" y="220" width="720" height="14" rx="3" fill="#1f1f1f"/>
    <rect x="120" y="248" width="780" height="14" rx="3" fill="#1f1f1f"/>
    <rect x="120" y="276" width="680" height="14" rx="3" fill="#1f1f1f"/>
    <rect x="120" y="304" width="740" height="14" rx="3" fill="#1f1f1f"/>
    <rect x="120" y="350" width="700" height="14" rx="3" fill="#1f1f1f"/>
    <rect x="120" y="378" width="620" height="14" rx="3" fill="#1f1f1f"/>
    <rect x="120" y="430" width="780" height="14" rx="3" fill="#1f1f1f"/>
    <rect x="120" y="458" width="700" height="14" rx="3" fill="#1f1f1f"/>
    <rect x="120" y="486" width="740" height="14" rx="3" fill="#1f1f1f"/>
  </g>

  <!-- floating popup card -->
  <g transform="translate(810, 80)" filter="url(#cardShadow)">
    <rect width="400" height="640" rx="20" fill="#0a0a0a" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>

    <!-- popup header -->
    <g transform="translate(20, 20)">
      <rect width="40" height="40" rx="11" fill="url(#mark)"/>
      <g transform="translate(12, 12)" stroke="white" stroke-width="2.5" stroke-linecap="round" fill="none">
        <path d="M 11.5 4.5 A 5 5 0 1 0 11.5 11.5"/>
        <path d="M 9 2 L 11.5 4.5 L 9 7" stroke-linejoin="round"/>
      </g>
      <text x="56" y="27" font-family="'Segoe UI', Arial, sans-serif" font-size="17" font-weight="600" fill="#fafafa">ContentLoop</text>
    </g>

    <!-- page info card -->
    <g transform="translate(20, 88)">
      <rect width="360" height="62" rx="12" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>
      <text x="14" y="24" font-family="'Segoe UI', Arial, sans-serif" font-size="13" font-weight="500" fill="#e5e5e5">Distribution is the moat</text>
      <text x="14" y="44" font-family="'Segoe UI', Arial, sans-serif" font-size="11" fill="#737373">3,184 chars · medium.com</text>
    </g>

    <!-- "Generate:" label -->
    <text x="20" y="180" font-family="'Segoe UI', Arial, sans-serif" font-size="10" font-weight="600" fill="#a3a3a3" letter-spacing="1.2">GENERATE</text>

    <!-- format chips (2 cols) -->
    ${[
      { id: "X thread", on: true, color: "#38bdf8" },
      { id: "LinkedIn", on: true, color: "#6366f1" },
      { id: "IG caption", on: false, color: "#ec4899" },
      { id: "Newsletter", on: false, color: "#34d399" },
      { id: "Shorts", on: true, color: "#f43f5e" },
      { id: "Carousel", on: false, color: "#fbbf24" },
      { id: "Reddit", on: false, color: "#fb923c" },
    ]
      .map((f, i) => {
        const col = i % 2;
        const row = Math.floor(i / 2);
        const x = 20 + col * 188;
        const y = 196 + row * 38;
        const bg = f.on ? "rgba(217,70,239,0.08)" : "rgba(255,255,255,0.02)";
        const stroke = f.on ? "rgba(217,70,239,0.4)" : "rgba(255,255,255,0.08)";
        const txtColor = f.on ? "#fafafa" : "#a3a3a3";
        return `
          <g transform="translate(${x}, ${y})">
            <rect width="172" height="30" rx="7" fill="${bg}" stroke="${stroke}" stroke-width="1"/>
            <circle cx="12" cy="15" r="4" fill="${f.color}"/>
            <text x="24" y="19" font-family="'Segoe UI', Arial, sans-serif" font-size="12" fill="${txtColor}">${f.id}</text>
          </g>
        `;
      })
      .join("")}

    <!-- Generate button -->
    <g transform="translate(20, 380)">
      <rect width="360" height="42" rx="21" fill="#fafafa"/>
      <text x="180" y="27" font-family="'Segoe UI', Arial, sans-serif" font-size="13" font-weight="600" fill="#0a0a0a" text-anchor="middle">Generate</text>
    </g>

    <!-- Result preview -->
    <g transform="translate(20, 446)">
      <rect width="360" height="170" rx="12" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>
      <g transform="translate(14, 14)">
        <circle cx="4" cy="4" r="3" fill="#38bdf8"/>
        <text x="14" y="8" font-family="'Segoe UI', Arial, sans-serif" font-size="11" font-weight="500" fill="#e5e5e5">X / Twitter thread</text>
        <text x="296" y="8" font-family="'Segoe UI', Arial, sans-serif" font-size="10" fill="#737373">$0.012</text>
      </g>
      <g transform="translate(14, 38)" font-family="'Segoe UI', Arial, sans-serif" font-size="11" fill="#d4d4d4">
        <text y="0">1/ I built a great product for two years</text>
        <text y="16">and made roughly $0. Here&apos;s why —</text>
        <text y="32"></text>
        <text y="48">The fix wasn&apos;t a better product.</text>
        <text y="64">It was 90 days of one short post per day</text>
        <text y="80">on the platform my buyers actually used.</text>
        <text y="96"></text>
        <text y="112">By day 60, three companies emailed me…</text>
      </g>
    </g>
  </g>

  <!-- promo headline -->
  <g transform="translate(120, 600)">
    <text font-family="'Segoe UI', Arial, sans-serif" font-size="48" font-weight="600" fill="#fafafa" letter-spacing="-1.5">
      <tspan>one post</tspan>
      <tspan font-style="italic" fill="#f0abfc"> becomes ten.</tspan>
    </text>
    <text y="50" font-family="'Segoe UI', Arial, sans-serif" font-size="20" fill="#a3a3a3">
      Read an article → click the icon → ship 7 platform-native posts.
    </text>
    <text y="80" font-family="'Segoe UI', Arial, sans-serif" font-size="20" fill="#a3a3a3">
      Bring your own Anthropic key. Pay $0 to us.
    </text>
  </g>
</svg>`;

const out = "./chrome-extension/screenshot-mockup-1280x800.png";
const buf = await sharp(Buffer.from(svg))
  .png({ compressionLevel: 9 })
  .toBuffer();
await writeFile(out, buf);
console.log(`✓ ${out} (${(buf.length / 1024).toFixed(1)} KB)`);
