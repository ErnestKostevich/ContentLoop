import { cn } from "@/lib/utils";

/**
 * ContentLoop brand mark — a looping arrow on the brand gradient.
 *
 * Used in the site header, hero, onboarding, and as the favicon
 * (public/icon.svg + app/icon.svg are kept in sync with this SVG).
 *
 * Pass `className` to control size (`h-8 w-8`, `h-12 w-12`, etc).
 */
export function BrandMark({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      role="img"
      aria-label="ContentLoop"
      className={cn(
        "shadow-lg shadow-fuchsia-500/20 rounded-[14px]",
        className
      )}
    >
      <defs>
        <linearGradient
          id="cl-grad-mark"
          x1="0"
          y1="0"
          x2="64"
          y2="64"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="55%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#ec4899" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="14" ry="14" fill="url(#cl-grad-mark)" />
      <path
        d="M 44 18 A 14 14 0 1 0 44 46"
        fill="none"
        stroke="white"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path
        d="M 38 12 L 44 18 L 38 24"
        fill="none"
        stroke="white"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
