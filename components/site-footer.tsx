import Link from "next/link";
import { TipJar } from "@/components/tip-jar";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-white/5 bg-neutral-950">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-4 py-10 text-sm text-neutral-500 sm:flex-row sm:items-center sm:px-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-5">
          <span>
            © {new Date().getFullYear()} ContentLoop. Built for creators who
            ship.
          </span>
          <TipJar variant="footer" />
        </div>
        <div className="flex items-center gap-5">
          <Link href="/#pricing" className="hover:text-white transition">
            Pricing
          </Link>
          <Link href="/voice" className="hover:text-white transition">
            Voice
          </Link>
          <Link href="/app" className="hover:text-white transition">
            App
          </Link>
          <Link href="/privacy" className="hover:text-white transition">
            Privacy
          </Link>
        </div>
      </div>
    </footer>
  );
}
