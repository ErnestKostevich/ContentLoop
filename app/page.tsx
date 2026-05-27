import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { UpgradeButton } from "@/components/upgrade-button";
import { FORMATS } from "@/lib/formats";
import { activeProviderServer } from "@/lib/payments";
import { hasServerKey } from "@/lib/anthropic";

export default function LandingPage() {
  const paymentsProvider = activeProviderServer();
  const paymentsEnabled = paymentsProvider !== null;
  const serverKey = hasServerKey();

  return (
    <>
      <div className="grain" aria-hidden />
      <SiteHeader />

      {/* ─────────────────────────── HERO ─────────────────────────── */}
      <section className="relative isolate overflow-hidden">
        <div className="spotlight drift" aria-hidden />
        <div className="relative z-10 mx-auto max-w-6xl px-4 pb-28 pt-24 sm:px-6 sm:pt-32 lg:pt-40">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-neutral-400 backdrop-blur">
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400 pulse-dot" />
              v0.0.1 · powered by Claude Sonnet 4.5
            </div>

            <h1 className="mt-8 text-balance text-5xl font-medium leading-[0.95] tracking-extra-tight text-white sm:text-7xl lg:text-[110px]">
              one post becomes{" "}
              <span className="font-display-italic text-gradient">ten.</span>
            </h1>

            <p className="mx-auto mt-7 max-w-2xl text-pretty text-lg leading-relaxed text-neutral-400 sm:text-xl">
              Paste a blog post, podcast transcript, or YouTube script.
              Get seven platform-native posts — a thread, a LinkedIn, an IG
              caption, a newsletter, three Shorts scripts, a carousel,
              a Reddit post — written{" "}
              <span className="font-display-italic text-white">in your voice</span>.
              You bring your own AI key. We don&apos;t take a cut.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/app"
                className="group inline-flex h-12 items-center justify-center gap-2 rounded-full bg-white px-7 text-sm font-semibold text-black shadow-2xl shadow-fuchsia-500/10 transition hover:bg-neutral-200"
              >
                {serverKey ? "Try it free →" : "Open the app →"}
              </Link>
              <Link
                href="#how"
                className="inline-flex h-12 items-center justify-center rounded-full px-5 text-sm text-neutral-400 transition hover:text-white"
              >
                See how it works
              </Link>
            </div>

            <p className="mt-5 text-xs text-neutral-500">
              No signup to try. No credit card. Bring your own Anthropic key
              (~$0.01 per run).
            </p>
          </div>

          {/* Format chips — minimal, no surrounding boxes */}
          <div className="mx-auto mt-20 flex max-w-4xl flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm">
            {FORMATS.map((f, i) => (
              <span key={f.id} className="flex items-center gap-3">
                <span
                  className={`h-1.5 w-1.5 rounded-full bg-gradient-to-br ${f.color}`}
                />
                <span className="font-medium text-neutral-300">{f.label}</span>
                {i < FORMATS.length - 1 && (
                  <span className="text-neutral-700">/</span>
                )}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────── HOW IT WORKS (3 lines, no fluff) ─────────────────────────── */}
      <section
        id="how"
        className="relative z-10 border-t border-white/5 bg-black"
      >
        <div className="mx-auto max-w-5xl px-4 py-24 sm:px-6">
          <p className="text-[11px] uppercase tracking-[0.18em] text-fuchsia-300">
            how it works
          </p>
          <h2 className="mt-3 max-w-3xl text-balance font-display text-4xl leading-[1.05] tracking-tight text-white sm:text-6xl">
            Three steps. Under a minute.{" "}
            <span className="font-display-italic text-neutral-500">
              No copywriter calls.
            </span>
          </h2>

          <ol className="mt-16 grid gap-10 sm:grid-cols-3">
            <Step
              n="01"
              title="Paste your source."
              body="An article, a transcript, a long essay. Anything past 200 words. Or paste a URL — we&rsquo;ll fetch the body."
            />
            <Step
              n="02"
              title="Pick your formats."
              body="Tap seven, tap one. Each runs in parallel. Define your own format if the built-ins don&rsquo;t fit."
            />
            <Step
              n="03"
              title="Ship in your voice."
              body="Train a voice profile with 5 past posts and the output stops sounding like a model — it sounds like you."
            />
          </ol>
        </div>
      </section>

      {/* ─────────────────────────── SAMPLE STRIP (one big preview) ─────────────────────────── */}
      <section className="relative z-10 border-t border-white/5 bg-black">
        <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-fuchsia-300">
                what you actually get
              </p>
              <h2 className="mt-3 font-display text-4xl leading-[1.05] tracking-tight text-white sm:text-5xl">
                Output that doesn&rsquo;t sound{" "}
                <span className="font-display-italic">like AI.</span>
              </h2>
              <p className="mt-5 max-w-md text-neutral-400">
                Per-platform prompt engineering kills the AI tells. Voice
                profile training takes care of the rest. Below: an actual
                Twitter thread from a single short article. Unedited.
              </p>
            </div>

            <article className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent p-6 sm:p-8">
              <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-gradient-to-br from-sky-500/20 to-blue-600/0 blur-2xl" />
              <div className="relative">
                <div className="mb-4 flex items-center gap-2 text-xs text-neutral-500">
                  <span className="inline-flex h-1.5 w-1.5 rounded-full bg-sky-400" />
                  X / Twitter thread
                  <span className="text-neutral-700">·</span>
                  <span className="font-mono text-[10px] text-neutral-600">
                    generated · unedited
                  </span>
                </div>
                <pre className="whitespace-pre-wrap font-sans text-[15px] leading-[1.55] text-neutral-100">
{`1/ I built a great product for two years and made roughly $0.

The fix wasn&apos;t a better product. It was 90 days of one short post per day, on the platform my buyers actually used.

By day 60, three companies had emailed me.
By day 90, I quit my job.

2/ Distribution is the moat.

In a market where anyone can build, the audience you patiently earn before you need them is the only durable advantage.`}
                </pre>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* ─────────────────────────── COST MATH (stat-driven) ─────────────────────────── */}
      <section className="relative z-10 border-t border-white/5 bg-black">
        <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
          <p className="text-[11px] uppercase tracking-[0.18em] text-fuchsia-300">
            the cost math
          </p>
          <h2 className="mt-3 max-w-3xl text-balance font-display text-4xl leading-[1.05] tracking-tight text-white sm:text-6xl">
            You pay Anthropic.{" "}
            <span className="font-display-italic">Never us.</span>
          </h2>

          <div className="mt-16 grid gap-px overflow-hidden rounded-3xl border border-white/10 bg-white/5 sm:grid-cols-3">
            <Stat
              big="$0"
              label="What ContentLoop charges per run"
              sub="No markup, no subscription required, no surprise bill."
            />
            <Stat
              big="$0.01"
              label="Typical Anthropic cost per run"
              sub="Sonnet 4.5 pricing. Anthropic gives every new account ~$5 free."
            />
            <Stat
              big="7"
              label="Platform-native posts per run"
              sub="Thread, LinkedIn, IG, newsletter, Shorts, carousel, Reddit."
            />
          </div>

          <p className="mx-auto mt-10 max-w-2xl text-pretty text-center text-neutral-400">
            Heavy creator posting 10 sources a month spends about{" "}
            <span className="font-display-italic text-white">$0.90 / month</span>{" "}
            on Anthropic. Paid directly to them, not to us. Pro plan
            (sync + brand kits + custom formats) is{" "}
            <span className="font-display-italic text-white">$9 / 30 days</span>,
            payable in any crypto via NOWPayments.
          </p>
        </div>
      </section>

      {/* ─────────────────────────── PRICING ─────────────────────────── */}
      <section
        id="pricing"
        className="relative z-10 border-t border-white/5 bg-black"
      >
        <div className="mx-auto max-w-5xl px-4 py-24 sm:px-6">
          <div className="text-center">
            <p className="text-[11px] uppercase tracking-[0.18em] text-fuchsia-300">
              pricing
            </p>
            <h2 className="mt-3 font-display text-5xl leading-[1.05] tracking-tight text-white sm:text-7xl">
              honest by design.
            </h2>
            <p className="mt-4 text-neutral-400">
              The tool is free forever. Pro adds premium tooling{" "}
              <span className="font-display-italic">around</span> the AI —
              not access to it.
            </p>
          </div>

          <div className="mx-auto mt-16 grid max-w-3xl gap-5 sm:grid-cols-2">
            {/* FREE */}
            <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-7">
              <div className="flex items-baseline justify-between">
                <h3 className="text-lg font-medium text-white">Free</h3>
                <span className="font-display text-3xl text-white">$0</span>
              </div>
              <p className="mt-1 text-sm text-neutral-500">
                Forever. Bring your own Anthropic key.
              </p>
              <ul className="mt-7 space-y-2.5 text-sm text-neutral-300">
                <Feature>
                  <strong className="text-white">Unlimited</strong> generations
                </Feature>
                <Feature>All 7 output formats</Feature>
                <Feature>Voice profile training</Feature>
                <Feature>URL import + history</Feature>
                <Feature>Chrome extension</Feature>
                <Feature>30,000 char source</Feature>
              </ul>
              <Link
                href="/app"
                className="mt-8 inline-flex h-11 w-full items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-sm font-medium text-white hover:bg-white/[0.08] transition"
              >
                Start free
              </Link>
            </div>

            {/* PRO */}
            <div className="relative overflow-hidden rounded-3xl border border-fuchsia-400/20 bg-gradient-to-b from-fuchsia-500/[0.07] to-transparent p-7 shadow-[0_0_80px_-30px_rgba(217,70,239,0.6)]">
              <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-gradient-to-br from-fuchsia-500/30 to-orange-500/0 blur-3xl" />
              <span className="absolute right-6 top-6 rounded-full border border-fuchsia-400/30 bg-fuchsia-500/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-fuchsia-200">
                {paymentsEnabled ? "Most popular" : "Soon"}
              </span>
              <div className="relative">
                <h3 className="text-lg font-medium text-white">Pro</h3>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="font-display text-3xl text-white">$9</span>
                  <span className="text-sm text-neutral-400">/ 30 days</span>
                </div>
                <p className="mt-1 text-sm text-neutral-500">
                  {paymentsProvider === "nowpayments"
                    ? "Pay in BTC, ETH, USDT, or 200+ other crypto."
                    : "Premium tooling. Still BYOK for AI."}
                </p>
                <ul className="mt-7 space-y-2.5 text-sm text-neutral-300">
                  <Feature>
                    <strong className="text-white">Brand kits</strong> —
                    unlimited voice profiles
                  </Feature>
                  <Feature>
                    <strong className="text-white">Custom formats</strong> —
                    up to 12 of your own
                  </Feature>
                  <Feature>
                    <strong className="text-white">Cross-device sync</strong> —
                    sign in, restore anywhere
                  </Feature>
                  <Feature>Export Markdown / JSON</Feature>
                  <Feature>Priority support</Feature>
                </ul>
                <UpgradeButton enabled={paymentsEnabled} />
              </div>
            </div>
          </div>

          <p className="mx-auto mt-8 max-w-xl text-center text-xs text-neutral-500">
            Both tiers use your own Anthropic key. Pro doesn&apos;t buy you AI
            credits — it buys you better tooling around it.
          </p>
        </div>
      </section>

      {/* ─────────────────────────── FAQ ─────────────────────────── */}
      <section
        id="faq"
        className="relative z-10 border-t border-white/5 bg-black"
      >
        <div className="mx-auto max-w-3xl px-4 py-24 sm:px-6">
          <p className="text-[11px] uppercase tracking-[0.18em] text-fuchsia-300">
            faq
          </p>
          <h2 className="mt-3 font-display text-4xl leading-[1.05] tracking-tight text-white sm:text-5xl">
            Questions, answered.
          </h2>

          <div className="mt-12 divide-y divide-white/5 border-y border-white/5">
            {[
              {
                q: "Why do I need my own Anthropic key?",
                a: "Because it's the most honest model. You pay Anthropic directly at wholesale (about $0.01 per generation). No markup, no mandatory subscription, no surprise bills. We just provide the prompt engineering.",
              },
              {
                q: "How much will my Anthropic bill be?",
                a: "Tiny. $0.005–$0.02 per run. A creator posting five sources a week spends $1–$3/month on Anthropic. New accounts get ~$5 of free credit to start.",
              },
              {
                q: "Where is my API key stored?",
                a: "Only in your browser. It's sent with each generation request and used to call Anthropic on your behalf. We never persist it server-side and never log it. Clearing your browser clears it.",
              },
              {
                q: "Does it sound like AI?",
                a: "We engineer prompts to mirror the source voice and ban the obvious AI tells (em-dash spam, generic openers, fake stats). Voice Profile takes 5 of your old posts and the output starts sounding like you, not a model.",
              },
              {
                q: "What languages are supported?",
                a: "Any language Claude speaks well — English, Russian, Spanish, German, French, Portuguese, Polish, Ukrainian, Japanese, and more. Output language matches the source.",
              },
              {
                q: "What if I clear my browser after upgrading to Pro?",
                a: "Pro is tied to your signed-in account, persisted in the database. Sign in on any device, your Pro window restores automatically.",
              },
              {
                q: "Is my source content stored?",
                a: "No. It&apos;s processed in-memory and forgotten as soon as the response is sent. We don&apos;t train on your input. Voice profile and history live in your browser (or your account when signed in).",
              },
            ].map((item) => (
              <details key={item.q} className="group">
                <summary className="flex cursor-pointer items-center justify-between px-2 py-5 text-base font-medium text-neutral-100">
                  {item.q}
                  <span className="ml-4 font-display text-2xl text-neutral-600 transition group-open:rotate-45">
                    +
                  </span>
                </summary>
                <div className="px-2 pb-6 text-neutral-400">{item.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────── FINAL CTA ─────────────────────────── */}
      <section className="relative z-10 overflow-hidden border-t border-white/5 bg-black">
        <div className="spotlight" aria-hidden />
        <div className="relative z-10 mx-auto max-w-4xl px-4 py-32 text-center sm:px-6">
          <h2 className="font-display text-5xl leading-[0.95] tracking-extra-tight text-white sm:text-7xl lg:text-8xl">
            Stop rewriting.{" "}
            <span className="font-display-italic text-gradient">
              Start looping.
            </span>
          </h2>
          <p className="mx-auto mt-7 max-w-xl text-neutral-400">
            One source, seven posts, your voice. Free to try right now.
          </p>
          <Link
            href="/app"
            className="mt-10 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-white px-7 text-sm font-semibold text-black shadow-2xl shadow-fuchsia-500/10 transition hover:bg-neutral-200"
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

/* ─────────────────────────── helpers ─────────────────────────── */

function Step({
  n,
  title,
  body,
}: {
  n: string;
  title: string;
  body: React.ReactNode;
}) {
  return (
    <li className="flex flex-col gap-4">
      <span className="font-mono text-xs text-neutral-600">{n}</span>
      <h3 className="font-display text-2xl leading-snug tracking-tight text-white">
        {title}
      </h3>
      <p className="text-neutral-400">{body}</p>
    </li>
  );
}

function Stat({
  big,
  label,
  sub,
}: {
  big: string;
  label: string;
  sub: string;
}) {
  return (
    <div className="bg-black p-8 sm:p-10">
      <div className="font-display text-6xl leading-none tracking-tight text-white sm:text-7xl">
        {big}
      </div>
      <div className="mt-5 text-sm font-medium text-neutral-200">{label}</div>
      <p className="mt-2 text-sm text-neutral-500">{sub}</p>
    </div>
  );
}

function Feature({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2.5">
      <Check className="mt-0.5 h-4 w-4 flex-none text-emerald-400" />
      <span>{children}</span>
    </li>
  );
}
