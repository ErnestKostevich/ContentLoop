import type { Metadata } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { AuthProvider } from "@/components/auth-provider";
import { ClerkStyleFix } from "@/components/clerk-style-fix";
import "./globals.css";

const SITE_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://contentloop-puce.vercel.app";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

// Display serif for headlines + italic emphasis — same vibe as
// Cluely, Anthropic, Sora. Free via Google Fonts.
const instrumentSerif = Instrument_Serif({
  variable: "--font-display",
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ContentLoop — one post becomes ten",
  description:
    "Drop in any article, podcast transcript, or YouTube script. ContentLoop returns seven platform-native posts written in your voice. You bring your own AI key — we don't take a cut.",
  metadataBase: new URL(SITE_URL),
  openGraph: {
    title: "ContentLoop — one post becomes ten",
    description:
      "Drop in any article. Get a thread, a LinkedIn post, an IG caption, a newsletter, a Shorts script, a carousel, and a Reddit post — in your voice.",
    url: SITE_URL,
    siteName: "ContentLoop",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ContentLoop — one post becomes ten",
    description:
      "Drop in any article. Get seven platform-native posts in your voice. Bring your own AI key.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-black text-neutral-100 selection:bg-fuchsia-400/30 selection:text-white">
        <AuthProvider>{children}</AuthProvider>
        <ClerkStyleFix />
        <Analytics />
      </body>
    </html>
  );
}
