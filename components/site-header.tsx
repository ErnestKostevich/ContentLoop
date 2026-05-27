import Link from "next/link";
import { AuthButtons } from "@/components/auth-buttons";
import { BrandMark } from "@/components/brand-mark";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/5 bg-black/60 backdrop-blur supports-[backdrop-filter]:bg-black/40">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2.5 group"
          aria-label="ContentLoop home"
        >
          <BrandMark className="h-7 w-7" />
          <span className="text-base tracking-tight text-white">
            ContentLoop
          </span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm text-neutral-500 sm:flex">
          <Link href="/#how" className="hover:text-white transition">
            How
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
            className="inline-flex h-9 items-center justify-center rounded-full bg-white px-4 text-sm font-medium text-black hover:bg-neutral-200 transition"
          >
            Launch app
          </Link>
        </div>
      </div>
    </header>
  );
}
