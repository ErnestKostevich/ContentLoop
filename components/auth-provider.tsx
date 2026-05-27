"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import type { ReactNode } from "react";

/**
 * Conditionally mounts ClerkProvider only when the publishable key is set.
 *
 * Theming note: the actual look of the Clerk modal is enforced in
 * app/globals.css via `.cl-*` selectors with !important — Clerk's
 * internal CSS-in-JS has high specificity and beats both the
 * `appearance.elements` className path AND inline style objects.
 * Global CSS with !important is the only thing that wins reliably.
 *
 * Here we keep the bare-minimum dark base + brand accent.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const pubKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  if (!pubKey) return <>{children}</>;

  return (
    <ClerkProvider
      publishableKey={pubKey}
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: "#fafafa",
          colorBackground: "#0a0a0a",
          colorText: "#ffffff",
          colorTextSecondary: "#a3a3a3",
          colorInputBackground: "#171717",
          colorInputText: "#ffffff",
          borderRadius: "0.75rem",
        },
      }}
    >
      {children}
    </ClerkProvider>
  );
}
