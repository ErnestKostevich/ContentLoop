# ContentLoop — Chrome extension

One-click repurposing of whatever article / blog post / page you're reading.
Uses the same `/api/generate` endpoint as the web app, with your own
Anthropic API key stored in Chrome's local storage.

## Install locally (dev)

1. Open `chrome://extensions/`
2. Toggle **Developer mode** (top right)
3. Click **Load unpacked**
4. Pick the `chrome-extension/` folder
5. Pin the extension to the toolbar
6. Click the icon, paste your `sk-ant-…` key, generate

## Files

| File | Role |
|---|---|
| `manifest.json` | Manifest V3 declaration |
| `popup.html` / `popup.css` / `popup.js` | Toolbar popup UI |
| `background.js` | Service worker — installs right-click "Send to ContentLoop" menu |
| `content.js` | No-op placeholder (reserved for future in-page UI) |
| `icon-{16,32,48,128}.png` | Brand mark in 4 sizes — rasterized from `public/icon.svg` via `scripts/generate-extension-icons.mjs` |

## Build the publishable ZIP

From the repo root:

```powershell
$files = Get-ChildItem -Path 'chrome-extension\*' -Exclude 'README.md'
Compress-Archive -Path $files -DestinationPath 'chrome-extension.zip' -Force
```

Result: `chrome-extension.zip` (≈13 KB) ready to upload to the
Chrome Web Store developer console.

## Publishing to the Chrome Web Store

1. Sign in at <https://chrome.google.com/webstore/devconsole/>
   (one-time $5 developer fee).
2. **New item → Upload** → pick `chrome-extension.zip`.
3. Fill in the store listing using `STORE_LISTING.md` in this folder.
4. Add a privacy policy URL: `https://contentloop-puce.vercel.app/privacy`.
5. Justify each permission in the "Privacy practices" tab — copy from
   `STORE_LISTING.md`.
6. Submit for review. Approval takes 1–3 days for new developers.

## Regenerating icons

If the brand SVG changes:

```powershell
node scripts\generate-extension-icons.mjs
```

This rasterizes `public/icon.svg` into 16/32/48/128 px PNGs straight
into `chrome-extension/`.
