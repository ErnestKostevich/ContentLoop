"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import type { ReactNode } from "react";

/**
 * Conditionally mounts ClerkProvider only when the publishable key is set.
 *
 * We use INLINE STYLE OBJECTS (not Tailwind classNames) in `elements`
 * because Clerk's internal CSS has higher specificity than utility
 * classes — inline styles guarantee the override actually lands.
 *
 * Goal: max contrast (#fff text on #0a0a0a), white CTAs matching the
 * rest of the site, rounded everything, no leftover Clerk-default pink.
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
          colorPrimary: "#fafafa", // white primary (matches site CTAs)
          colorBackground: "#0a0a0a",
          colorInputBackground: "#171717",
          colorInputText: "#ffffff",
          colorText: "#ffffff",
          colorTextSecondary: "#a3a3a3",
          colorTextOnPrimaryBackground: "#0a0a0a",
          colorNeutral: "#ffffff",
          colorDanger: "#fb7185",
          colorSuccess: "#34d399",
          colorWarning: "#fbbf24",
          borderRadius: "0.75rem",
          fontFamily:
            'var(--font-sans), ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
          fontSize: "0.95rem",
        },
        elements: {
          // Modal container
          rootBox: {
            fontFamily:
              'var(--font-sans), ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
          },
          card: {
            backgroundColor: "#0a0a0a",
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "0 24px 64px -16px rgba(0,0,0,0.7)",
            borderRadius: "1.25rem",
          },

          // Header
          headerTitle: {
            color: "#ffffff",
            fontWeight: 600,
            fontSize: "1.35rem",
            letterSpacing: "-0.02em",
          },
          headerSubtitle: {
            color: "#a3a3a3",
            fontSize: "0.85rem",
          },

          // Social buttons (Continue with Google etc.)
          socialButtonsBlockButton: {
            backgroundColor: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.12)",
            color: "#ffffff",
            borderRadius: "0.75rem",
            height: "44px",
          },
          socialButtonsBlockButtonText: {
            color: "#ffffff",
            fontWeight: 500,
            fontSize: "0.9rem",
          },
          socialButtonsProviderIcon: {
            filter: "brightness(1.1)",
          },

          // Divider "or"
          dividerLine: {
            backgroundColor: "rgba(255,255,255,0.1)",
          },
          dividerText: {
            color: "#737373",
            fontSize: "0.75rem",
            letterSpacing: "0.04em",
          },

          // Form fields
          formFieldLabel: {
            color: "#d4d4d4",
            fontSize: "0.8rem",
            fontWeight: 500,
            marginBottom: "0.4rem",
          },
          formFieldInput: {
            backgroundColor: "#171717",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "#ffffff",
            borderRadius: "0.75rem",
            height: "44px",
            fontSize: "0.9rem",
          },
          formFieldInputShowPasswordButton: {
            color: "#a3a3a3",
          },

          // Primary CTA — white pill button (matches site)
          formButtonPrimary: {
            backgroundColor: "#fafafa",
            color: "#0a0a0a",
            border: "none",
            borderRadius: "9999px",
            height: "44px",
            fontWeight: 600,
            fontSize: "0.9rem",
            textTransform: "none",
            boxShadow: "0 8px 24px -8px rgba(255,255,255,0.15)",
          },

          // Footer ("Don't have an account? Sign up")
          footer: {
            backgroundColor: "transparent",
            borderTop: "1px solid rgba(255,255,255,0.06)",
          },
          footerActionText: {
            color: "#a3a3a3",
            fontSize: "0.85rem",
          },
          footerActionLink: {
            color: "#f0abfc",
            fontWeight: 600,
            fontSize: "0.85rem",
          },

          // "Secured by Clerk" small print
          footerPagesLink: {
            color: "#525252",
          },

          // Identity preview (after entering email)
          identityPreview: {
            backgroundColor: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "0.75rem",
            color: "#ffffff",
          },
          identityPreviewText: {
            color: "#ffffff",
          },
          identityPreviewEditButton: {
            color: "#f0abfc",
          },

          // Error messages
          formFieldErrorText: {
            color: "#fb7185",
            fontSize: "0.8rem",
          },
          alertText: {
            color: "#fb7185",
          },

          // "Last used" badge
          formFieldHintText: {
            color: "#a3a3a3",
          },

          // UserButton dropdown (header avatar menu)
          userButtonPopoverCard: {
            backgroundColor: "#0a0a0a",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "1rem",
          },
          userButtonPopoverActionButton: {
            color: "#e5e5e5",
          },
          userButtonPopoverActionButtonText: {
            color: "#e5e5e5",
          },
          userButtonPopoverFooter: {
            backgroundColor: "#0a0a0a",
            borderTop: "1px solid rgba(255,255,255,0.06)",
          },
        },
      }}
    >
      {children}
    </ClerkProvider>
  );
}
