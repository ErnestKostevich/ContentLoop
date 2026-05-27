"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import type { ReactNode } from "react";

/**
 * Conditionally mounts ClerkProvider only when the publishable key is set.
 * When auth is off, this is a no-op pass-through.
 *
 * Heavy customization so the Clerk modal blends into ContentLoop's dark UI:
 *   - dark baseTheme (proper background + readable text)
 *   - fuchsia accent matching the brand gradient
 *   - subtle glass-y card styling
 *   - white CTA button (matches the rest of the site)
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const pubKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  if (!pubKey) {
    return <>{children}</>;
  }

  return (
    <ClerkProvider
      publishableKey={pubKey}
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: "#d946ef", // fuchsia 500
          colorBackground: "#0a0a0a", // neutral-950
          colorInputBackground: "#171717", // neutral-900
          colorInputText: "#fafafa",
          colorText: "#fafafa",
          colorTextSecondary: "#a3a3a3",
          colorTextOnPrimaryBackground: "#0a0a0a",
          colorNeutral: "#fafafa",
          colorShimmer: "rgba(255,255,255,0.05)",
          colorDanger: "#fb7185",
          colorSuccess: "#34d399",
          colorWarning: "#fbbf24",
          borderRadius: "0.75rem",
          fontFamily:
            'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
        },
        elements: {
          // The big modal container
          rootBox: "shadow-2xl",
          card: "border border-white/10 bg-neutral-950 shadow-2xl shadow-black/40",
          // Header
          headerTitle: "text-neutral-100 font-semibold",
          headerSubtitle: "text-neutral-400",
          // Social buttons (Google etc.)
          socialButtonsBlockButton:
            "border border-white/10 bg-white/[0.03] hover:bg-white/[0.07] text-neutral-100",
          socialButtonsBlockButtonText: "text-neutral-100 font-medium",
          // OR divider
          dividerLine: "bg-white/10",
          dividerText: "text-neutral-500",
          // Inputs
          formFieldLabel: "text-neutral-300 text-xs font-medium",
          formFieldInput:
            "border border-white/10 bg-neutral-900 text-neutral-100 placeholder:text-neutral-600 focus:border-fuchsia-400/40",
          // Primary CTA — match site style (white button, dark text)
          formButtonPrimary:
            "bg-white text-neutral-950 hover:bg-neutral-200 normal-case font-semibold shadow-lg shadow-black/30",
          // Footer
          footer: "bg-neutral-950 border-t border-white/5",
          footerActionLink:
            "text-fuchsia-300 hover:text-fuchsia-200 font-medium",
          footerActionText: "text-neutral-500",
          // Identity preview (the "you're signed in as..." chip)
          identityPreview: "border border-white/10 bg-white/[0.03]",
          identityPreviewText: "text-neutral-200",
          identityPreviewEditButton: "text-fuchsia-300 hover:text-fuchsia-200",
          // UserButton (the avatar dropdown in the header)
          userButtonPopoverCard:
            "border border-white/10 bg-neutral-950 shadow-2xl",
          userButtonPopoverActionButton:
            "text-neutral-200 hover:bg-white/[0.05]",
          userButtonPopoverActionButtonText: "text-neutral-200",
          userButtonPopoverFooter: "bg-neutral-950 border-t border-white/5",
        },
      }}
    >
      {children}
    </ClerkProvider>
  );
}
