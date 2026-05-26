# ContentLoop

**Turn one post into ten.** Paste an article, podcast transcript, or YouTube script.
ContentLoop gives you 7 platform-native posts — Twitter/X thread, LinkedIn post,
Instagram caption, email newsletter, Shorts scripts, LinkedIn/IG carousel,
and a Reddit post — in your voice, in one click.

Powered by [Anthropic Claude Sonnet 4.5](https://www.anthropic.com/news/claude-sonnet-4-5),
through **your own** Anthropic API key.

---

## The model: zero-cost for the operator, transparent for users

ContentLoop is a **BYOK (Bring Your Own Key)** product. Every user pastes their
own Anthropic API key once; it lives in their browser, and ContentLoop calls
Anthropic on their behalf.

Why this matters:

- **You (the operator) pay $0 for AI usage.** No Anthropic bill at all.
  Hosting is the only meaningful cost, which is free-tier on Vercel until
  you have real traffic.
- **Users pay Anthropic directly at wholesale rates** — typically
  $0.005–$0.02 per generation. No markup, no surprise bills, no subscription
  required to use the core product.
- **Monetization comes from premium features** (sync, brand kits, custom
  formats, teams), not from gating AI access. That's what Stripe Pro is for.

## Features

| Feature | Status | Notes |
|---|---|---|
| 7 output formats | ✅ | Thread, LinkedIn, IG caption, newsletter, Shorts, Carousel, Reddit |
| Parallel generation | ✅ | One source → all formats at once |
| Voice profile (samples + rules) | ✅ | Saved in browser, applied per generation |
| URL import | ✅ | Paste an article URL, we fetch & extract the body |
| Generation history | ✅ | Last 30 runs, browser-local |
| **BYOK (default)** | ✅ | User's own Anthropic key; encrypted in `localStorage` |
| First-visit onboarding | ✅ | Modal walks new users through getting + pasting their key |
| Cost transparency | ✅ | Every run shows actual tokens used + USD cost |
| Optional server-key fallback | ✅ | Set `ANTHROPIC_API_KEY` in env for a 3/day free tier (your own cost) |
| Auth (Clerk) | 🔌 Scaffolded | Add keys to `.env.local` to turn on |
| Pro plan ($9 / 30d) | ✅ | Premium features (Custom Formats, Brand Kits, Export). KYC-free via NOWPayments OR Stripe |
| Custom Formats | ✅ | Up to 12 user-defined formats with full prompt control |
| Brand Kits | ✅ | Multiple voice profiles per browser (Pro = unlimited) |
| Export results | ✅ | Download a run as Markdown or JSON |
| Cross-device sync | 🔌 Scaffolded | Set `DATABASE_URL` (Neon free) to enable |
| Chrome extension | ✅ | Self-contained in `/chrome-extension`, MV3 |
| OG image | ✅ | Dynamic 1200×630 PNG via `/opengraph-image` |
| Sitemap + robots.txt | ✅ | `/sitemap.xml`, `/robots.txt` |
| Vercel Analytics | ✅ | Auto-enabled when deployed to Vercel |
| Tip jar | ✅ | Set `NEXT_PUBLIC_TIP_JAR_URL` for footer link |
| Cross-device sync (Pro) | ⏳ v0.3 | Postgres backed |
| Brand kits, custom formats (Pro) | ⏳ v0.3 | Multiple voice profiles, user-defined formats |
| Video repurposer | ⏳ v0.4 | YouTube → Shorts with FFmpeg + Whisper |
| Chrome extension | ⏳ v0.6 | One-click repurpose for any page |

## Two deploy modes

### Mode A — Pure BYOK (recommended, $0 cost to you)

Don't set `ANTHROPIC_API_KEY` in your env. Users **must** add their own key
on first visit (onboarding modal does this automatically). You pay nothing
for AI usage.

### Mode B — Hybrid free tier

Set `ANTHROPIC_API_KEY` in env. Users get 3 free generations/day before
needing to BYOK. You pay for those 3 runs/day/IP — typically pennies, but
not zero. Useful when you want the lowest-friction "try it now" experience.

## Tech

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS v4
- Anthropic Claude Sonnet 4.5 via `@anthropic-ai/sdk` (always called with the user's key when BYOK)
- Cheerio (URL parsing)
- Clerk (auth, optional)
- Stripe (payments, optional)
- Lucide icons
- Zero-DB MVP — `localStorage` for voice/history, in-memory rate limit for the optional free tier

## Local setup

```powershell
# 1. Install dependencies
npm install

# 2. Create your .env.local from the example
Copy-Item .env.example .env.local
# Leave ANTHROPIC_API_KEY commented for Mode A (zero-cost BYOK).
# Fill it in for Mode B (you absorb the small free-tier cost).

# 3. Run the dev server
npm run dev
```

Open <http://localhost:3000>.

## Project structure

```
app/
  page.tsx                       # Landing (hero, samples, comparison, BYOK costs, pricing, FAQ)
  app/page.tsx                   # Workspace (paste → formats → generate)
  voice/page.tsx                 # Voice profile editor
  api/generate/route.ts          # POST: parallel multi-format generation (BYOK > server key > 401)
  api/fetch-url/route.ts         # POST: import article body from a URL
  api/status/route.ts            # GET: feature flags (server key? auth? payments?)
  api/checkout/route.ts          # POST: Stripe Checkout session (Pro plan)
  api/webhook/stripe/route.ts    # POST: Stripe webhook receiver
  layout.tsx                     # Root layout w/ optional ClerkProvider
  globals.css                    # Tailwind v4 entry + aurora bg + scrollbar polish
components/
  workspace.tsx                  # Main app — input, formats, history drawer, settings
  voice-profile-editor.tsx       # /voice page UI
  onboarding-modal.tsx           # First-visit BYOK setup
  tip-jar.tsx                    # Optional "Buy me a coffee" link
  site-header.tsx
  site-footer.tsx
  auth-provider.tsx              # Conditional ClerkProvider
  auth-buttons.tsx               # Conditional Sign in / UserButton
  upgrade-button.tsx             # Stripe Checkout button
lib/
  formats.ts                     # 7 output format definitions
  prompts.ts                     # System + user prompt builders, per-format rules + voice profile
  anthropic.ts                   # SDK client (lazy) + hasServerKey() flag
  pricing.ts                     # Sonnet 4.5 pricing constants + cost helpers (client-safe)
  rate-limit.ts                  # In-memory daily limiter (Mode B only)
  storage.ts                     # Client-side localStorage helpers (voice / history / BYOK)
  stripe.ts                      # Stripe SDK + feature flag
  auth.ts                        # Clerk feature flags
  utils.ts                       # cn() helper
proxy.ts                         # Next 16 "middleware" (no-op until Clerk is configured)
```

## Enabling auth (Clerk)

1. Create a Clerk app at <https://dashboard.clerk.com>.
2. Copy the publishable + secret keys into `.env.local`:

   ```ini
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
   CLERK_SECRET_KEY=sk_test_xxx
   ```

3. The Sign-in button + UserButton appear automatically. Add protected routes to `proxy.ts`.

## Enabling payments (Pro plan, $9 for 30 days)

The Pro plan is for **premium features** (Custom Formats, Brand Kits,
Export, sync) — not AI access. Every user still brings their own
Anthropic key.

Two payment providers are wired. Pick one. If both are set, NOWPayments wins.

### Option A — NOWPayments (no KYC, crypto) — recommended

1. Sign up at <https://nowpayments.io>. No KYC for the merchant.
2. Dashboard → **Store settings → API keys** → create a key.
3. Dashboard → **Account → IPN settings** → set a strong IPN secret + set
   the IPN callback URL to `https://YOUR-DOMAIN/api/webhook/nowpayments`.
4. Add to `.env.local`:

   ```ini
   NOWPAYMENTS_API_KEY=XXXXXXX-XXXXXXX-XXXXXXX-XXXXXXX
   NOWPAYMENTS_IPN_SECRET=your-strong-secret
   NEXT_PUBLIC_PAYMENTS_PROVIDER=nowpayments
   NEXT_PUBLIC_APP_URL=https://your-domain.com
   ```

5. Done. The Pro card on `/` shows "Pay in any crypto — BTC, ETH, USDT, …"
   and the Upgrade button creates a hosted invoice on NOWPayments.

**Receiving funds:** withdraw to a crypto wallet (no KYC). Converting to
fiat may require KYC at the exchange you use — that's outside NOWPayments.

### Option B — Stripe (requires KYC)

1. Create a Stripe account and a recurring price for the Pro plan.
2. Add to `.env.local`:

   ```ini
   STRIPE_SECRET_KEY=sk_test_xxx
   STRIPE_PRICE_ID_PRO_MONTHLY=price_xxx
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
   STRIPE_WEBHOOK_SECRET=whsec_xxx
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

3. For local webhook testing:

   ```bash
   stripe listen --forward-to localhost:3000/api/webhook/stripe
   ```

## Enabling the tip jar

Set `NEXT_PUBLIC_TIP_JAR_URL` to any URL (Ko-fi, Buy Me a Coffee, PayPal,
Patreon, GitHub Sponsors). A small footer link appears automatically.

## Deployment

Recommended: Vercel.

1. Push to GitHub (already done if you're reading this in the repo).
2. Import the repo at <https://vercel.com/new>.
3. Add env vars in Vercel dashboard. For Mode A: **don't add `ANTHROPIC_API_KEY`**.
4. Deploy.

Free tier on Vercel comfortably handles thousands of users for a BYOK
product like this — there's no LLM cost, no DB cost, no background jobs.

## Roadmap

- [x] **v0.1 — MVP.** 5 formats, parallel generation, freemium rate limit.
- [x] **v0.2 — Phase 2.** Voice profile, history, URL import, BYOK, +2 formats, Clerk + Stripe scaffolds, polished landing.
- [x] **v0.3 — Zero-cost pivot.** BYOK-first architecture, onboarding flow, cost transparency, tip jar, repositioned pricing.
- [ ] **v0.4 — DB layer.** Postgres + Drizzle. Cross-device voice/history sync. Powers the Pro plan.
- [ ] **v0.5 — Brand kits + custom formats.** Pro-tier feature surface.
- [ ] **v0.6 — Video repurposer.** YouTube URL → Whisper transcript → clipped Shorts with burned subtitles.
- [ ] **v0.7 — Chrome extension.** One-click repurpose for any page.
- [ ] **v1.0 — Teams.** Shared workspaces + per-seat billing.

## License

Proprietary — © Ernest Kostevich, 2026. All rights reserved.
