import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata = {
  title: "Privacy Policy — ContentLoop",
  description:
    "What ContentLoop collects, what it doesn't, where your data lives, and how to delete it.",
};

const LAST_UPDATED = "May 27, 2026";

export default function PrivacyPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24">
          <Link
            href="/"
            className="text-sm text-neutral-500 hover:text-white transition"
          >
            ← Back to home
          </Link>

          <h1 className="mt-8 font-display text-5xl leading-[1.05] tracking-tight text-white sm:text-6xl">
            Privacy policy.
          </h1>
          <p className="mt-4 text-sm text-neutral-500">
            Last updated: {LAST_UPDATED}
          </p>

          <div className="mt-10 space-y-10 text-neutral-300 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:text-white [&_h2]:mt-10 [&_h2]:mb-4 [&_p]:leading-relaxed [&_p]:mt-3 [&_li]:mt-2 [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:pl-6 [&_strong]:text-white [&_code]:font-mono [&_code]:text-xs [&_code]:rounded [&_code]:bg-white/5 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-neutral-200">
            <section>
              <h2>The short version</h2>
              <p>
                ContentLoop is a BYOK (Bring Your Own Key) tool. We don&apos;t
                charge you for AI usage, we don&apos;t mark up Anthropic, and we
                don&apos;t make money by selling, training on, or analyzing your
                content. We collect the bare minimum to make the product work
                and try to make most data live in your browser instead of our
                servers.
              </p>
            </section>

            <section>
              <h2>What we collect</h2>

              <p>
                <strong>Your Anthropic API key (BYOK).</strong> Stored in your
                browser&apos;s <code>localStorage</code> only. It is sent with
                each generation request from your browser to our{" "}
                <code>/api/generate</code> endpoint, which uses it solely to
                call Anthropic on your behalf. We never log it, persist it on
                our servers, or transmit it anywhere except Anthropic.
              </p>

              <p>
                <strong>Source content you paste.</strong> The text you submit
                for generation passes through our server in-memory only. We do
                not store it after the response is returned. We never train on
                it. We never share it.
              </p>

              <p>
                <strong>Voice profile and custom formats.</strong> Stored
                locally in your browser by default. If you sign in (via Clerk),
                they sync to our Postgres database (Neon) bound to your Clerk
                user ID, so you can access them across devices.
              </p>

              <p>
                <strong>Generation history.</strong> Last 30 runs are stored in
                your browser. If you sign in, history can sync to our DB
                bound to your Clerk user ID.
              </p>

              <p>
                <strong>Auth (when used).</strong> If you sign in, we use Clerk
                for identity. Clerk stores your email, name, and avatar if you
                provide them. We only see your Clerk user ID server-side; we
                never see your password.
              </p>

              <p>
                <strong>Payments (when used).</strong> If you upgrade to Pro,
                NOWPayments handles the crypto transaction. We receive a
                webhook with the order ID and payment status, and persist a row
                in our <code>pro_subscriptions</code> table tying your Clerk
                user ID to a 30-day validity window. We never see your wallet
                address, your card, or your personal billing info.
              </p>

              <p>
                <strong>Analytics.</strong> We use Vercel Analytics, which
                records anonymized page views, country, and browser type. No
                personal data, no cookies, no cross-site tracking.
              </p>
            </section>

            <section>
              <h2>What we do not collect</h2>
              <ul>
                <li>We do not sell, rent, or share your data with third parties.</li>
                <li>We do not train AI models on your input or output.</li>
                <li>We do not run third-party advertising or tracking pixels.</li>
                <li>We do not log your Anthropic API key.</li>
                <li>We do not log the content you generate.</li>
              </ul>
            </section>

            <section>
              <h2>The Chrome extension</h2>
              <p>
                The ContentLoop Chrome extension uses the following permissions:
              </p>
              <ul>
                <li>
                  <strong>activeTab + scripting</strong> — when you click the
                  extension icon, we read the visible page&apos;s text (article
                  body, headings) so we can pass it to the generator. We never
                  read pages you didn&apos;t open the popup on.
                </li>
                <li>
                  <strong>storage</strong> — your Anthropic key is stored in
                  Chrome&apos;s extension storage (which is local to your
                  browser). Same security model as <code>localStorage</code>.
                </li>
                <li>
                  <strong>contextMenus</strong> — adds a right-click menu
                  &ldquo;Send to ContentLoop&rdquo;. No data leaves your machine
                  until you actually click Generate.
                </li>
                <li>
                  <strong>host_permissions: &lt;all_urls&gt;</strong> — required
                  so the popup can scrape the article on whichever site you
                  open. Scraping only happens after you explicitly open the
                  popup; we never proactively access any URL.
                </li>
              </ul>
              <p>
                The extension sends scraped page text + your Anthropic key
                directly to{" "}
                <code>https://contentloop-puce.vercel.app/api/generate</code>,
                which forwards it to Anthropic and returns the result. No
                analytics, no telemetry, no third-party calls.
              </p>
            </section>

            <section>
              <h2>Data storage and retention</h2>
              <p>
                <strong>Browser-local data</strong> (voice profile, history,
                BYOK key, custom formats) lives in your browser. Clearing your
                browser clears it. We have no copy.
              </p>
              <p>
                <strong>Server-side data</strong> (Clerk user, Pro subscription
                records, optionally synced voice/format/history when signed in)
                lives in our Neon Postgres database, hosted in AWS us-east-1.
                We retain it as long as your account is active.
              </p>
            </section>

            <section>
              <h2>How to delete your data</h2>
              <ul>
                <li>
                  <strong>Local data:</strong> clear your browser&apos;s
                  storage for <code>contentloop-puce.vercel.app</code>, or use
                  the &ldquo;Clear all&rdquo; buttons in the workspace.
                </li>
                <li>
                  <strong>Account data:</strong> email{" "}
                  <a
                    href="mailto:ernest2011kostevich@gmail.com"
                    className="text-fuchsia-300 hover:text-fuchsia-200"
                  >
                    ernest2011kostevich@gmail.com
                  </a>{" "}
                  with the subject &ldquo;Delete my data&rdquo; and the email
                  you signed in with. We delete your Clerk user + all linked DB
                  rows within 7 days.
                </li>
              </ul>
            </section>

            <section>
              <h2>Subprocessors</h2>
              <ul>
                <li>
                  <strong>Anthropic</strong> — Claude API, called with your own
                  key. See <a href="https://www.anthropic.com/legal" className="text-fuchsia-300 hover:text-fuchsia-200" target="_blank" rel="noreferrer">Anthropic privacy</a>.
                </li>
                <li>
                  <strong>Vercel</strong> — hosting + analytics. See{" "}
                  <a href="https://vercel.com/legal/privacy-policy" className="text-fuchsia-300 hover:text-fuchsia-200" target="_blank" rel="noreferrer">Vercel privacy</a>.
                </li>
                <li>
                  <strong>Neon</strong> — Postgres for opt-in sync. See{" "}
                  <a href="https://neon.tech/privacy" className="text-fuchsia-300 hover:text-fuchsia-200" target="_blank" rel="noreferrer">Neon privacy</a>.
                </li>
                <li>
                  <strong>Clerk</strong> — auth (only if you sign in). See{" "}
                  <a href="https://clerk.com/legal/privacy" className="text-fuchsia-300 hover:text-fuchsia-200" target="_blank" rel="noreferrer">Clerk privacy</a>.
                </li>
                <li>
                  <strong>NOWPayments</strong> — crypto checkout (only if you
                  upgrade). See{" "}
                  <a href="https://nowpayments.io/privacy-and-policy" className="text-fuchsia-300 hover:text-fuchsia-200" target="_blank" rel="noreferrer">NOWPayments privacy</a>.
                </li>
              </ul>
            </section>

            <section>
              <h2>Contact</h2>
              <p>
                Questions? Email{" "}
                <a
                  href="mailto:ernest2011kostevich@gmail.com"
                  className="text-fuchsia-300 hover:text-fuchsia-200"
                >
                  ernest2011kostevich@gmail.com
                </a>
                .
              </p>
            </section>

            <section>
              <h2>Changes to this policy</h2>
              <p>
                If we change anything material, we&apos;ll update the date at
                the top and (where possible) note the change in the product
                release notes.
              </p>
            </section>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
