# ContentLoop

**Turn one post into ten.** Paste an article, podcast transcript, or YouTube script.
ContentLoop gives you 7 platform-native posts — Twitter/X thread, LinkedIn post,
Instagram caption, email newsletter, Shorts scripts, LinkedIn/IG carousel,
and a Reddit post — in your voice, in one click.

Powered by [Anthropic Claude Sonnet 4.5](https://www.anthropic.com/news/claude-sonnet-4-5).

---

## Why this exists

Content repurposing is the highest-leverage skill in creator economics:
one piece of long-form work → traffic on seven different platforms.
Doing it by hand takes 2–4 hours per source. Most AI tools spit out
generic slop that screams "AI."

ContentLoop nails three things:

1. **Platform-native output.** Different lengths, hooks, structures per channel.
2. **Voice matching.** Paste 2–5 of your past posts → the model mirrors your voice.
3. **Speed.** All formats render in parallel — ~8s end-to-end.

## Features

| Feature | Status | Notes |
|---|---|---|
| 7 output formats | ✅ | Thread, LinkedIn, IG caption, newsletter, Shorts, Carousel, Reddit |
| Parallel generation | ✅ | One source → all formats at once |
| Voice profile (samples + rules) | ✅ | Saved in browser, applied per generation |
| URL import | ✅ | Paste an article URL, we fetch & extract the body |
| Generation history | ✅ | Last 30 runs, browser-local |
| BYOK | ✅ | Paste your own Anthropic key → bypass free-tier limit |
| Freemium rate-limit | ✅ | 3 generations/day per IP (in-memory) |
| Auth (Clerk) | 🔌 Scaffolded | Add keys to .env.local to turn on |
| Stripe Pro ($19/mo) | 🔌 Scaffolded | Add keys + price ID to activate checkout |
| Video repurposer (YouTube → Shorts) | ⏳ Phase 3 | Whisper + FFmpeg pipeline |
| Chrome extension | ⏳ Future | One-click repurpose for any page |

## Tech

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS v4
- Anthropic Claude Sonnet 4.5 via `@anthropic-ai/sdk`
- Cheerio (URL parsing)
- Clerk (auth, optional)
- Stripe (payments, optional)
- Lucide icons
- Zero-DB MVP — in-memory rate limiting + localStorage (upgrade path: Upstash + Postgres)

## Local setup

```powershell
# 1. Install dependencies
npm install

# 2. Create your .env.local from the example
Copy-Item .env.example .env.local
# then paste your ANTHROPIC_API_KEY (required)
# Clerk + Stripe blocks are optional — leave them commented to keep auth/payments off

# 3. Run the dev server
npm run dev
```

Open <http://localhost:3000>.

## Project structure

```
app/
  page.tsx                       # Landing (hero, samples, comparison, testimonials, pricing, FAQ)
  app/page.tsx                   # Workspace (paste → formats → generate)
  voice/page.tsx                 # Voice profile editor
  api/generate/route.ts          # POST: parallel multi-format generation
  api/fetch-url/route.ts         # POST: import article body from a URL
  api/checkout/route.ts          # POST: Stripe Checkout session (Pro plan)
  api/webhook/stripe/route.ts    # POST: Stripe webhook receiver
  layout.tsx                     # Root layout w/ optional ClerkProvider
  globals.css                    # Tailwind v4 entry + aurora bg + scrollbar polish
components/
  workspace.tsx                  # Main app — input, formats, history drawer, settings
  voice-profile-editor.tsx       # /voice page UI
  site-header.tsx
  site-footer.tsx
  auth-provider.tsx              # Conditional ClerkProvider
  auth-buttons.tsx               # Conditional Sign in / UserButton
  upgrade-button.tsx             # Stripe Checkout button
lib/
  formats.ts                     # 7 output format definitions
  prompts.ts                     # System + user prompt builders, per-format rules + voice profile
  anthropic.ts                   # SDK client (lazy)
  rate-limit.ts                  # In-memory daily limiter
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

## Enabling payments (Stripe)

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

## Roadmap

- [x] **v0.1 — MVP.** 5 formats, parallel generation, freemium rate limit.
- [x] **v0.2 — Phase 2.** Voice profile, history, URL import, BYOK, 2 extra formats, Clerk + Stripe scaffolds, polished landing.
- [ ] **v0.3 — DB layer.** Postgres + Drizzle. Sync voice profiles + history across devices.
- [ ] **v0.4 — Video repurposer.** YouTube URL → Whisper transcript → AI-picked viral clips with burned-in subtitles.
- [ ] **v0.5 — Brand kits.** Save multiple voice profiles (personal vs client vs newsletter).
- [ ] **v0.6 — Chrome extension.** One-click repurpose for any page.
- [ ] **v1.0 — Teams.** Shared workspaces + per-seat billing.

## License

Proprietary — © Ernest Kostevich, 2026. All rights reserved.
