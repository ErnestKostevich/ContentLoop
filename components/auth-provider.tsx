"use client";

import { ClerkProvider } from "@clerk/nextjs";
import type { ReactNode } from "react";

/**
 * Conditionally mounts ClerkProvider only when the publishable key is set.
 * When auth is off, this is a no-op pass-through — the site works normally.
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
        variables: {
          colorPrimary: "#d946ef", // fuchsia
          colorBackground: "#0a0a0a",
          colorInputBackground: "#171717",
          colorText: "#ededed",
          colorTextSecondary: "#a3a3a3",
          borderRadius: "0.75rem",
        },
        elements: {
          card: "border border-white/10 bg-neutral-950",
          formButtonPrimary:
            "bg-white text-neutral-950 hover:bg-neutral-200 normal-case",
        },
      }}
    >
      {children}
    </ClerkProvider>
  );
}
