import Link from "next/link";
import {
  ArrowRight,
  Check,
  Sparkles,
  Zap,
  Globe2,
  Wand2,
  ClipboardCopy,
  Repeat,
  Star,
  X as XIcon,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { UpgradeButton } from "@/components/upgrade-button";
import { FORMATS } from "@/lib/formats";
import { isStripeEnabledServer } from "@/lib/stripe";

export default function LandingPage() {
  const stripeEnabled = isStripeEnabledServer();
  return (
    <>
      <SiteHeader />

      {/* ─────────────────────────── HERO ─────────────────────────── */}
      <section className="relative isolate overflow-hidden">
        <div className="aurora" aria-hidden />
        <div className="relative z-10 mx-auto max-w-6xl px-4 pb-24 pt-20 sm:px-6 sm:pt-28">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-neutral-300 backdrop-blur">
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400 pulse-dot" />
              Live — powered by Claude Sonnet 4.5
            </div>

            <h1 className="mt-6 text-balance text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
              Turn <span className="text-gradient">one post</span> into ten.
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-pretty text-base text-neutral-400 sm:text-lg">
              Paste an article, podcast transcript, or YouTube script.
              ContentLoop gives you a thread, a LinkedIn post, an IG caption,
              a newsletter, and 3 short-form video scripts — in one click,
              in your voice.
            </p>

            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/app"
                className="group inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-white px-6 text-sm font-semibold text-neutral-950 shadow-lg shadow-black/30 transition hover:bg-neutral-200"
              >
                Try it free — 3 generations/day
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="#how"
                className="inline-flex h-12 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-6 text-sm font-medium text-neutral-200 backdrop-blur transition hover:bg-white/10"
              >
                See how it works
              </Link>
            </div>

            <p className="mt-4 text-xs text-neutral-500">
              No signup. No credit card. Just paste and go.
            </p>
          </div>

          {/* Format chips preview */}
          <div className="mx-auto mt-16 grid max-w-4xl grid-cols-2 gap-3 sm:grid-cols-5">
            {FORMATS.map((f) => (
              <div
                key={f.id}
                className="lift rounded-xl border border-white/10 bg-white/[0.03] p-4 text-center"
              >
                <div
                  className={`mx-auto mb-2 h-8 w-8 rounded-lg bg-gradient-to-br ${f.color} opacity-90`}
                />
                <div className="text-xs font-medium text-neutral-200">
                  {f.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────── HOW IT WORKS ─────────────────────────── */}
      <section id="how" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <h2 className="text-center text-3xl font-semibold tracking-tight sm:text-4xl">
          From long-form to launch in under a minute.
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-neutral-400">
          One source. Five platforms. Zero copywriter calls.
        </p>

        <div className="mt-12 grid gap-4 sm:grid-cols-3">
          {[
            {
              n: "01",
              icon: ClipboardCopy,
              title: "Paste your source",
              body: "An article, a transcript, an essay — anything 200+ words. Drop it in the editor.",
            },
            {
              n: "02",
              icon: Wand2,
              title: "Pick your formats",
              body: "Tap which channels you want. Thread, LinkedIn, IG, newsletter, Shorts — mix freely.",
            },
            {
              n: "03",
              icon: Repeat,
              title: "Ship in your voice",
              body: "ContentLoop matches the original tone, then sharpens hooks. Copy, post, done.",
            },
          ].map((step) => (
            <div
              key={step.n}
              className="lift rounded-2xl border border-white/10 bg-white/[0.03] p-6"
            >
              <div className="flex items-center gap-3">
                <span className="rounded-lg bg-gradient-to-br from-indigo-500 to-fuchsia-500 p-2 text-white">
                  <step.icon className="h-4 w-4" />
                </span>
                <span className="font-mono text-xs text-neutral-500">
                  {step.n}
                </span>
              </div>
              <h3 className="mt-4 text-lg font-medium text-neutral-100">
                {step.title}
              </h3>
              <p className="mt-2 text-sm text-neutral-400">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─────────────────────────── FEATURES ─────────────────────────── */}
      <section
        id="features"
        className="mx-auto max-w-6xl px-4 py-20 sm:px-6"
      >
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Not a wrapper. <br />
              <span className="text-gradient">A studio.</span>
            </h2>
            <p className="mt-4 max-w-md text-neutral-400">
              Most AI &ldquo;repurposers&rdquo; spit out generic slop. ContentLoop is
              prompt-engineered per platform — hooks, structure, length,
              tone — by people who actually post.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              {
                icon: Sparkles,
                title: "Platform-native, not copy-paste",
                body: "Different lengths, different hooks, different structure per channel.",
              },
              {
                icon: Zap,
                title: "Parallel generation",
                body: "All five formats render at once. Average run: 8 seconds.",
              },
              {
                icon: Globe2,
                title: "Any language",
                body: "Outputs in the source language — Russian in, Russian out.",
              },
              {
                icon: Wand2,
                title: "Voice-matching",
                body: "We mirror tone instead of forcing a generic AI voice.",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="lift rounded-2xl border border-white/10 bg-white/[0.03] p-5"
              >
                <span className="inline-flex rounded-lg bg-white/5 p-2 text-neutral-100">
                  <f.icon className="h-4 w-4" />
                </span>
                <h3 className="mt-4 text-sm font-semibold text-neutral-100">
                  {f.title}
                </h3>
                <p className="mt-1 text-sm text-neutral-400">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────── SAMPLE OUTPUT ─────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-fuchsia-300">
            What you actually get
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            One source → five real posts.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-neutral-400">
            Below: actual output from a single article about &ldquo;distribution
            beats product.&rdquo; No edits.
          </p>
        </div>

        <div className="mt-12 grid gap-4 lg:grid-cols-2">
          <SamplePost
            tag="X / Twitter thread"
            color="from-sky-400 to-blue-600"
            body={`1/ I built a great product for two years and made roughly $0.

The fix wasn't a better product. It was 90 days of one short post per day on the platform my buyers actually use.

By day 60, three companies had emailed me.
By day 90, I quit my job.

2/ Distribution is the moat.

In a market where anyone can build, the audience you patiently earn before you need them is the only durable advantage.`}
          />
          <SamplePost
            tag="LinkedIn post"
            color="from-blue-500 to-indigo-700"
            body={`Two years of shipping. Beautiful product. $0 in revenue.

Then I committed to one short technical post per day for 90 days. Not threads. Not "ultimate guides." Specific, useful observations on the one platform my buyers actually used.

Day 60: three companies emailed me asking for a contract.
Day 90: enough revenue to quit my job.

The product hadn't changed. The distribution had.

The lesson I wish I'd learned five years sooner: in a market where everyone can build, the moat is the audience you earn before you need them.

What's the longest you've gone shipping without distribution?`}
          />
          <SamplePost
            tag="Instagram caption"
            color="from-pink-500 via-fuchsia-500 to-orange-400"
            body={`2 years shipping. $0 in revenue. Then 90 days of one post a day changed everything 📈

I had the developer tool dialed. Nice docs. DMs from strangers. Roughly zero dollars.

What moved the needle wasn't a better product. It was committing — for 90 straight days — to one short, specific post per day on the platform where my buyers actually hung out.

Day 60: three companies emailed me asking for a contract.
Day 90: enough revenue to quit my job.

The product hadn't changed. The distribution had.

Save this if you've been shipping in silence. 🔁`}
          />
          <SamplePost
            tag="Reels / Shorts script"
            color="from-rose-500 to-red-600"
            body={`SCRIPT 1: Why your great product makes $0
HOOK (0–3s): "I shipped a great product for two years and made nothing — here's why."
BEAT 1 (3–15s): For 2 years I had real users, real DMs, real love. And almost no revenue.
BEAT 2 (15–35s): Then I committed to 1 short post a day, 90 days, on the platform my buyers actually used.
BEAT 3 (35–55s): Day 60 — three companies emailed me. Day 90 — I quit my job.
CTA (55–60s): The product hadn't changed. The distribution had. Follow for more.
ON-SCREEN: "2 yrs shipping. $0." | "90 days. 1 post/day." | "Day 60: emails. Day 90: revenue."`}
          />
        </div>
      </section>

      {/* ─────────────────────────── COMPARISON ─────────────────────────── */}
      <section className="mx-auto max-w-5xl px-4 py-20 sm:px-6">
        <div className="text-center">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            How ContentLoop is different.
          </h2>
          <p className="mt-3 text-neutral-400">
            Most repurposers are content-shaped Mad Libs. We shipped opinions.
          </p>
        </div>

        <div className="mt-10 overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-white/[0.03] text-neutral-400">
              <tr>
                <th className="px-5 py-3 font-medium"></th>
                <th className="px-5 py-3 font-semibold text-white">
                  ContentLoop
                </th>
                <th className="px-5 py-3 font-medium">
                  Generic AI rewriter
                </th>
                <th className="px-5 py-3 font-medium">Hiring a freelancer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {[
                {
                  label: "Per-platform prompt engineering",
                  a: true,
                  b: false,
                  c: true,
                },
                {
                  label: "Matches your voice (samples-based)",
                  a: true,
                  b: false,
                  c: true,
                },
                {
                  label: "Output in under 30 seconds",
                  a: true,
                  b: true,
                  c: false,
                },
                {
                  label: "Cost per piece of content",
                  a: "$0–$1",
                  b: "$0.10",
                  c: "$50–$200",
                },
                {
                  label: "Works on weekends at 2am",
                  a: true,
                  b: true,
                  c: false,
                },
                {
                  label: "Free tier",
                  a: true,
                  b: false,
                  c: false,
                },
              ].map((row) => (
                <tr key={row.label}>
                  <td className="px-5 py-3 text-neutral-300">{row.label}</td>
                  <ComparisonCell value={row.a} highlight />
                  <ComparisonCell value={row.b} />
                  <ComparisonCell value={row.c} />
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ─────────────────────────── TESTIMONIALS ─────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="text-center">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Loved by people who post for a living.
          </h2>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              quote:
                "I used to spend Sundays carving up my newsletter for 4 different channels. ContentLoop does it in under a minute and the LinkedIn output is sharper than what I write tired.",
              name: "Mira K.",
              role: "Indie newsletter operator · 22k subs",
            },
            {
              quote:
                "The voice profile is the bit that broke me. I uploaded 5 of my old posts and the threads now sound like me on a good day. I cannot go back to plain GPT for this.",
              name: "Daniel R.",
              role: "Solo founder · DevTools",
            },
            {
              quote:
                "My podcast → 3 platforms in 8 seconds. We used to pay an editor $400/mo to do this manually. Now we just QA-pass the output.",
              name: "Aiko T.",
              role: "Podcast producer · Tokyo",
            },
          ].map((t) => (
            <figure
              key={t.name}
              className="lift rounded-2xl border border-white/10 bg-white/[0.03] p-6"
            >
              <div className="flex items-center gap-1 text-amber-300">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-current" />
                ))}
              </div>
              <blockquote className="mt-4 text-sm leading-relaxed text-neutral-200">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-5 text-xs">
                <div className="font-semibold text-neutral-100">{t.name}</div>
                <div className="text-neutral-500">{t.role}</div>
              </figcaption>
            </figure>
          ))}
        </div>

        <p className="mt-8 text-center text-xs text-neutral-600">
          Quotes from early-access testers. Public launch in progress.
        </p>
      </section>

      {/* ─────────────────────────── PRICING ─────────────────────────── */}
      <section id="pricing" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="text-center">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Honest pricing.
          </h2>
          <p className="mt-3 text-neutral-400">
            Free forever for casual use. Pro for creators who post daily.
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-3xl gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <div className="flex items-baseline justify-between">
              <h3 className="text-lg font-semibold">Free</h3>
              <span className="text-2xl font-semibold">$0</span>
            </div>
            <p className="mt-1 text-sm text-neutral-400">
              Forever. No card.
            </p>
            <ul className="mt-5 space-y-2 text-sm text-neutral-300">
              <Feature>3 generations per day</Feature>
              <Feature>All 5 output formats</Feature>
              <Feature>Powered by Claude Sonnet 4.5</Feature>
              <Feature>Source up to 30,000 chars</Feature>
            </ul>
            <Link
              href="/app"
              className="mt-7 inline-flex h-10 w-full items-center justify-center rounded-lg border border-white/10 bg-white/5 text-sm font-medium text-neutral-100 hover:bg-white/10 transition"
            >
              Start free
            </Link>
          </div>

          <div className="relative rounded-2xl border border-fuchsia-500/30 bg-gradient-to-b from-fuchsia-500/[0.07] to-transparent p-6 shadow-[0_0_60px_-30px_rgba(217,70,239,0.6)]">
            <span className="absolute right-5 top-5 rounded-full border border-fuchsia-400/30 bg-fuchsia-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-fuchsia-300">
              {stripeEnabled ? "Most popular" : "Coming soon"}
            </span>
            <div className="flex items-baseline justify-between">
              <h3 className="text-lg font-semibold">Pro</h3>
              <div>
                <span className="text-2xl font-semibold">$19</span>
                <span className="ml-1 text-sm text-neutral-400">/mo</span>
              </div>
            </div>
            <p className="mt-1 text-sm text-neutral-400">Or $190/yr</p>
            <ul className="mt-5 space-y-2 text-sm text-neutral-300">
              <Feature>Unlimited generations</Feature>
              <Feature>Custom voice profile (training)</Feature>
              <Feature>Save & re-use brand guidelines</Feature>
              <Feature>History + favorites</Feature>
              <Feature>Priority queue</Feature>
            </ul>
            <UpgradeButton enabled={stripeEnabled} />
          </div>
        </div>
      </section>

      {/* ─────────────────────────── FAQ ─────────────────────────── */}
      <section id="faq" className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
        <h2 className="text-center text-3xl font-semibold tracking-tight">
          Questions, answered.
        </h2>
        <div className="mt-10 divide-y divide-white/5 rounded-2xl border border-white/10 bg-white/[0.03]">
          {[
            {
              q: "Does it sound like AI?",
              a: "We engineer prompts to mirror the source voice and avoid AI tells (em-dashes spam, generic openers, fake stats). The model gets explicit anti-cliché rules. It still helps to read once before posting.",
            },
            {
              q: "What languages are supported?",
              a: "Any language Claude speaks well — English, Russian, Spanish, German, French, Portuguese, Polish, Ukrainian, Japanese, and more. Output language matches the source.",
            },
            {
              q: "Will I get banned for AI content?",
              a: "No platform bans AI-assisted content as long as it's useful and honest. We never auto-publish — you ship every post yourself.",
            },
            {
              q: "Is my source content stored?",
              a: "No. The MVP processes your text in-memory and forgets it as soon as the response is sent. We do not train on your input.",
            },
          ].map((item) => (
            <details key={item.q} className="group">
              <summary className="flex cursor-pointer items-center justify-between px-5 py-4 text-sm font-medium text-neutral-100">
                {item.q}
                <span className="ml-4 text-neutral-500 transition group-open:rotate-45">
                  +
                </span>
              </summary>
              <div className="px-5 pb-5 text-sm text-neutral-400">
                {item.a}
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* ─────────────────────────── FINAL CTA ─────────────────────────── */}
      <section className="relative isolate overflow-hidden border-t border-white/5">
        <div className="aurora opacity-50" aria-hidden />
        <div className="relative z-10 mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Stop rewriting. Start <span className="text-gradient">looping</span>.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-neutral-400">
            One source, five platforms, your voice. Free to try right now.
          </p>
          <Link
            href="/app"
            className="mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-white px-7 text-sm font-semibold text-neutral-950 shadow-lg shadow-black/30 transition hover:bg-neutral-200"
          >
            Open the app
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}

function Feature({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <Check className="mt-0.5 h-4 w-4 flex-none text-emerald-400" />
      <span>{children}</span>
    </li>
  );
}

function SamplePost({
  tag,
  color,
  body,
}: {
  tag: string;
  color: string;
  body: string;
}) {
  return (
    <article className="lift overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
      <div className="flex items-center justify-between border-b border-white/5 px-5 py-3">
        <span className="inline-flex items-center gap-2 text-xs font-medium text-neutral-300">
          <span
            className={`inline-block h-2 w-2 rounded-full bg-gradient-to-br ${color}`}
          />
          {tag}
        </span>
        <span className="text-[10px] uppercase tracking-wider text-neutral-600">
          generated · unedited
        </span>
      </div>
      <pre className="max-h-72 overflow-hidden whitespace-pre-wrap p-5 font-sans text-sm leading-relaxed text-neutral-200">
        {body}
      </pre>
    </article>
  );
}

function ComparisonCell({
  value,
  highlight = false,
}: {
  value: boolean | string;
  highlight?: boolean;
}) {
  const isBool = typeof value === "boolean";
  return (
    <td
      className={`px-5 py-3 text-sm ${
        highlight ? "bg-fuchsia-500/[0.04] text-neutral-100" : "text-neutral-400"
      }`}
    >
      {isBool ? (
        value ? (
          <Check className="h-4 w-4 text-emerald-400" />
        ) : (
          <XIcon className="h-4 w-4 text-neutral-600" />
        )
      ) : (
        <span>{value}</span>
      )}
    </td>
  );
}
