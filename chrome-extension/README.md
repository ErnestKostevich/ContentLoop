# ContentLoop — Chrome extension

One-click repurposing of whatever article / blog post / page you're
reading. Uses the same `/api/generate` endpoint as the web app, with
your own Anthropic API key stored in Chrome's local storage.

## Install locally (dev)

1. Open `chrome://extensions/`
2. Toggle **Developer mode** (top right)
3. Click **Load unpacked**
4. Pick the `chrome-extension/` folder
5. Pin the extension to the toolbar

First time you open it, it'll ask for your Anthropic key (just like the web app).

## Files

| File | What it does |
|---|---|
| `manifest.json` | Manifest V3 declaration |
| `popup.html` / `popup.css` / `popup.js` | The UI that opens when you click the toolbar icon |
| `background.js` | Service worker — installs the right-click "Send to ContentLoop" menu |
| `content.js` | No-op for now (reserved for in-page UI later) |

The popup scrapes the current tab via `chrome.scripting.executeScript`
(same article-extraction heuristic as the server-side `/api/fetch-url`),
shows a tiny formats picker, then calls
`https://contentloop-puce.vercel.app/api/generate` with `apiKey` set.

## Icons (TODO)

Chrome MV3 requires PNGs (not SVGs) in `manifest.json`'s `icons` map.
Until we generate them, the extension uses Chrome's default icon. To add:

1. Open `public/icon.svg` from the main app in any vector editor (Figma, Inkscape, etc.)
2. Export at 16 / 32 / 48 / 128 px PNG
3. Drop them next to this README as `icon-16.png`, `icon-32.png`, `icon-48.png`, `icon-128.png`
4. Re-add to `manifest.json`:
   ```json
   "icons": {
     "16": "icon-16.png",
     "32": "icon-32.png",
     "48": "icon-48.png",
     "128": "icon-128.png"
   }
   ```

## Publishing to Chrome Web Store

1. Pay the one-time $5 developer fee at <https://chrome.google.com/webstore/devconsole/>
2. Zip the `chrome-extension/` folder
3. Upload, fill in store listing, submit for review (1–3 days)

The store listing copy should reuse the description in `manifest.json`.
