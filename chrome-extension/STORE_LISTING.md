# Chrome Web Store — ready-to-paste listing

Use these values when resubmitting at
<https://chrome.google.com/webstore/devconsole/>.

**Rejection fix (Keyword Spam):** Do not pack platform names into the
short description or a comma-separated keyword list. Describe what the
extension does in plain sentences. The texts below follow that rule.

---

## Item details

### Name
```
ContentLoop — Repurpose any page
```

### Summary  (short description, max 132 chars — must match manifest `description`)
```
Repurpose the article you're reading into social-ready posts in one click. Bring your own Anthropic API key.
```

### Description  (full — copy as-is)

```
ContentLoop helps creators repurpose long-form content without rewriting it from scratch.

You're reading an article and want shorter versions for social — but rewriting takes time and the tone drifts. ContentLoop reads the page you're on (only when you click the icon), lets you pick output formats, and generates ready-to-copy drafts using your own Anthropic API key.

How it works
1. Open any article, blog post, or long page.
2. Click the ContentLoop toolbar icon.
3. Choose which output formats you want.
4. Copy the results and publish yourself — we never auto-post.

Each format uses its own prompt so outputs fit the target medium (length, hook, structure) instead of feeling like a single copy-paste.

Voice profile
Train how you write on the web app (https://contentloop.fun/voice) with a few past posts. Generations can match your tone more closely.

Bring your own key (BYOK)
Paste your sk-ant-… key once. It stays in Chrome local storage. We don't store it on our servers, don't log it, and don't charge per generation — you pay Anthropic directly (typically a few cents per run).

Privacy
• API key: local storage only.
• Page text: read on your click, processed in memory, not kept on our servers.
• No analytics or trackers in the extension.
• Full policy: https://contentloop.fun/privacy

No account required
Works after you add your Anthropic key. New Anthropic accounts include free starter credit.

Optional Pro (web app)
Advanced tooling on https://contentloop.fun — brand kits, custom formats, export, and cross-device sync. The extension's core workflow stays free.

Questions or feedback: ernest2011kostevich@gmail.com
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

```
ContentLoop has a single purpose: when the user clicks the toolbar icon, it reads the visible article text on the current tab and uses the user's own Anthropic API key to generate short-form drafts the user can copy and publish manually. It does not run in the background, auto-post, or collect browsing history.
```

---

## Permissions justifications

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
Required because users repurpose articles from any blog or news site they are reading. We only read the active tab after explicit user interaction (clicking the popup).
```

---

## Privacy practices

### Privacy policy URL
```
https://contentloop.fun/privacy
```

### Data collection

| Data type | Collected? |
|---|---|
| Authentication information | ✅ Yes — Anthropic API key in local storage only |
| Website content | ✅ Yes — current page text on user click only |
| Everything else | ❌ No |

### Certifications — check all three:
✅ No selling user data  
✅ No unrelated use of data  
✅ No creditworthiness / lending use  

---

## Resubmission checklist

1. Upload new `chrome-extension.zip` (v0.0.3+).
2. Replace **short description** with the Summary above (no platform keyword list).
3. Replace **full description** with the Description block above.
4. Set privacy policy URL to `https://contentloop.fun/privacy`.
5. Set homepage / support URL to `https://contentloop.fun`.
6. Submit for review.