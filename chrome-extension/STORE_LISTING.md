# Chrome Web Store — ready-to-paste listing

Use these values when filling out the form at
<https://chrome.google.com/webstore/devconsole/> after uploading
`chrome-extension.zip`.

---

## Item details

### Name
```
ContentLoop — Repurpose any page
```

### Summary  (short description, max 132 chars)
```
One click: turn any article into a thread, LinkedIn post, IG caption, newsletter, Shorts script, carousel, or Reddit post.
```

### Description  (full, max 16000 chars — copy as-is)

```
ContentLoop is the fastest way to turn a long article you're reading into seven platform-native posts.

THE PROBLEM
You read a great article. You think "this would make a killer thread." Two hours later you've rewritten it three times, half the punch is lost, and you still need to make the LinkedIn version. By the time you're done, the moment is gone.

THE FIX
Open the page. Click the ContentLoop icon. Pick which formats you want. Done.

WHAT YOU GET, IN ONE CLICK
• X / Twitter thread — 8–12 punchy tweets with a real hook
• LinkedIn post — story-driven, scroll-stopping first line
• Instagram caption — body + hashtag mix that doesn't feel templated
• Email newsletter section — subject line + preview + body
• YouTube Shorts / TikTok / Reels scripts — 3 vertical-video drafts, ≤60s each
• LinkedIn / IG carousel — 8 swipeable slides with design notes
• Reddit post — title + body that survives the BS detector

HOW IT'S DIFFERENT
1. Platform-native, not copy-paste. Each format has its own prompt — different length, different hook style, different structure.
2. Your voice. Train a Voice Profile on the main app (https://contentloop-puce.vercel.app/voice) with 5 of your past posts. The output stops sounding like AI and starts sounding like you.
3. You pay Anthropic, never us. ContentLoop is BYOK — Bring Your Own Key. Paste your sk-ant-… key once; we never see it, log it, or take a cut. Typical run: $0.005–$0.02 of your own Anthropic credit.

PRIVACY
• Your API key lives in Chrome's local storage — never on our server.
• Source text is processed in-memory and forgotten as soon as the response is sent.
• We don't train on your content.
• We don't run analytics or trackers inside the extension.

Read the full policy at https://contentloop-puce.vercel.app/privacy

NO ACCOUNT NEEDED
The extension works the moment you paste your Anthropic key. Anthropic gives every new account ~$5 of free credit, which is enough for hundreds of generations on ContentLoop.

PRO (OPTIONAL, ON THE WEB APP)
$9 / 30 days, payable in any crypto via NOWPayments. Unlocks unlimited Brand Kits (multi-voice profiles), custom user-defined formats, Markdown / JSON export, and cross-device sync. Free tier already lets you do everything the extension does — Pro is just for power users.

LEARN MORE
Open the full app at https://contentloop-puce.vercel.app

Made by a solo developer. Feedback to ernest2011kostevich@gmail.com.
```

### Category
```
Productivity
```

### Language
```
English (United States)
```

---

## Single purpose statement
*(Chrome requires this for extensions with broad host permissions.)*

```
ContentLoop has a single purpose: when the user clicks the toolbar icon on a webpage, it reads that page's article text and uses the user's own Anthropic API key to generate platform-native short-form versions (a Twitter thread, a LinkedIn post, an Instagram caption, etc.) that the user can copy and post manually. It does nothing else — no background scraping, no automatic posting, no data collection.
```

---

## Permissions justifications
*(One per permission, paste verbatim into each field.)*

### `activeTab`
```
Used to read the text content of the page the user is currently looking at, only after the user explicitly clicks the extension's toolbar icon. We need the actual article body to send to the AI; activeTab is the least-privileged way to get it without persistent access.
```

### `scripting`
```
Used together with activeTab to inject a one-shot text extraction script that walks the page DOM (h1/h2/h3/p/li/blockquote) and returns the cleaned article text. Runs only on user click; we never inject persistent scripts.
```

### `storage`
```
Used to store the user's Anthropic API key (entered once in the popup) so they don't have to re-paste it every time. Stored in chrome.storage.local — never transmitted anywhere except as the auth header on our generation API call to Anthropic on the user's behalf.
```

### `contextMenus`
```
Adds a single right-click menu item ("Send to ContentLoop") that focuses the extension popup so the user can generate from the current page without reaching for the toolbar.
```

### `host_permissions: <all_urls>`
```
Required because users repurpose articles from any blog, news site, or platform. Without all-URLs access we couldn't read the page text on whichever site they happen to be reading. We only ever read the active tab and only after explicit user interaction (clicking the popup).
```

---

## Privacy practices

### Single purpose
✅ Use the single-purpose statement above.

### Data collection — check the following boxes:

| Data type | Collected? | Reason |
|---|---|---|
| Personally identifiable information | ❌ No | |
| Health information | ❌ No | |
| Financial and payment information | ❌ No | |
| Authentication information | ✅ Yes | The user's Anthropic API key is stored locally in `chrome.storage.local` so they don't re-enter it each time. Never transmitted except as the auth header on the user's own AI API calls. |
| Personal communications | ❌ No | |
| Location | ❌ No | |
| Web history | ❌ No | |
| User activity | ❌ No | |
| Website content | ✅ Yes | Text of the page the user is currently viewing — read on demand when the user clicks the extension and explicitly requests a generation. Never stored on our server. |

### Certifications — check all three:

✅ I do not sell or transfer user data to third parties, outside of the approved use cases.
✅ I do not use or transfer user data for purposes that are unrelated to my item's single purpose.
✅ I do not use or transfer user data to determine creditworthiness or for lending purposes.

### Privacy policy URL
```
https://contentloop-puce.vercel.app/privacy
```

---

## Screenshots

You need at least one. Recommended 5 at 1280×800 (or 640×400 minimum). Quick way to make them:

1. Install the extension locally (Load unpacked) so the icon shows in the toolbar.
2. Open an interesting article (Substack post, blog, news piece).
3. Click the extension icon — popup opens with the article text detected.
4. Use Windows **Snipping Tool** (`Win + Shift + S`) to grab a clean shot of the popup + article behind it.
5. Repeat for 3–5 different moments: setup screen, formats picker, result panel, copy button, etc.
6. Save as PNG and upload in the listing form.

## Promo tile (optional, 440×280)

If you want, ask me to generate one — I can render the brand mark + tagline into a PNG of the exact size.

---

## After submission

Review usually takes 1–3 days for a brand-new developer.
Once approved, the install URL will be something like:

```
https://chrome.google.com/webstore/detail/contentloop-repurpose-any-/<hash>
```

Add that link back to the main site (footer + landing) to drive installs.
