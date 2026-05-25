# ContentLoop

**Turn one post into ten.** Paste an article, podcast transcript, or YouTube script.
ContentLoop gives you a Twitter/X thread, a LinkedIn post, an Instagram caption,
a newsletter section, and 3 short-form video scripts — in your voice, in one click.

Powered by [Anthropic Claude Sonnet 4.5](https://www.anthropic.com/news/claude-sonnet-4-5).

---

## Why this exists

Content repurposing is the highest-leverage skill in creator economics:
one piece of long-form work → traffic on five different platforms.
Doing it by hand takes 2–4 hours per source. Most AI tools spit out
generic slop that screams "AI."

ContentLoop is a thin, sharp tool that nails three things:

1. **Platform-native output.** Different lengths, hooks, structures per channel.
2. **Voice matching.** Mirrors the source tone instead of forcing a generic AI voice.
3. **Speed.** All five formats render in parallel — ~8s end-to-end.

## Tech

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS v4
- Anthropic Claude Sonnet 4.5 via `@anthropic-ai/sdk`
- Lucide icons
- Zero-DB MVP — in-memory rate limiting (upgrade path: Upstash Redis)
- Deployed on Vercel

## Local setup

```bash
# 1. Install dependencies
npm install

# 2. Create your .env.local
cp .env.example .env.local
# then paste your Anthropic API key

# 3. Run the dev server
npm run dev
```

Open <http://localhost:3000>.

## Project structure

```
app/
  page.tsx                # Landing
  app/page.tsx            # Main workspace
  api/generate/route.ts   # POST /api/generate
  layout.tsx
  globals.css
components/
  site-header.tsx
  site-footer.tsx
  workspace.tsx           # Main interactive UI (client component)
lib/
  formats.ts              # 5 output format definitions
  prompts.ts              # System + user prompt builders, per-format rules
  anthropic.ts            # SDK client (lazy)
  rate-limit.ts           # In-memory daily limiter
  utils.ts                # cn() helper
```

## Roadmap

- [x] MVP: 5 formats, parallel generation, freemium rate limit
- [ ] Auth (Clerk) + persistent history
- [ ] Stripe — Pro plan ($19/mo) with unlimited generations
- [ ] Voice profile training (paste your past posts → custom system prompt)
- [ ] Phase 2: video repurposer — YouTube URL → clipped Shorts with subtitles
- [ ] Chrome extension: repurpose any page in one click
- [ ] Team plans

## License

Proprietary — © Ernest Kostevich, 2026. All rights reserved.
