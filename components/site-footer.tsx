import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-white/5 bg-neutral-950">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-4 py-10 text-sm text-neutral-500 sm:flex-row sm:items-center sm:px-6">
        <div>
          © {new Date().getFullYear()} ContentLoop. Built for creators who
          ship.
        </div>
        <div className="flex items-center gap-5">
          <Link href="/#features" className="hover:text-white transition">
            Features
          </Link>
          <Link href="/#pricing" className="hover:text-white transition">
            Pricing
          </Link>
          <Link href="/app" className="hover:text-white transition">
            App
          </Link>
        </div>
      </div>
    </footer>
  );
}
