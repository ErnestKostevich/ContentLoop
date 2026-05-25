import Link from "next/link";
import { AuthButtons } from "@/components/auth-buttons";
import { BrandMark } from "@/components/brand-mark";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/5 bg-neutral-950/70 backdrop-blur supports-[backdrop-filter]:bg-neutral-950/50">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 group" aria-label="ContentLoop home">
          <BrandMark className="h-8 w-8" />
          <span className="text-base font-semibold tracking-tight">
            ContentLoop
          </span>
        </Link>

        <nav className="hidden items-center gap-7 text-sm text-neutral-400 sm:flex">
          <Link href="/#features" className="hover:text-white transition">
            Features
          </Link>
          <Link href="/#pricing" className="hover:text-white transition">
            Pricing
          </Link>
          <Link href="/voice" className="hover:text-white transition">
            Voice
          </Link>
          <Link href="/formats" className="hover:text-white transition">
            Formats
          </Link>
          <Link href="/#faq" className="hover:text-white transition">
            FAQ
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <AuthButtons />
          <Link
            href="/app"
            className="inline-flex h-9 items-center justify-center rounded-lg bg-white px-4 text-sm font-medium text-neutral-950 shadow-sm hover:bg-neutral-200 transition"
          >
            Launch app
          </Link>
        </div>
      </div>
    </header>
  );
}
