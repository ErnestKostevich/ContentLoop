import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/components/auth-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ContentLoop — turn one post into ten",
  description:
    "Paste an article, podcast transcript, or YouTube script. Get a Twitter thread, LinkedIn post, Instagram caption, newsletter, and short-form video scripts in one click.",
  metadataBase: new URL("https://contentloop.app"),
  openGraph: {
    title: "ContentLoop — turn one post into ten",
    description:
      "Paste long-form content. Get platform-native short content for X, LinkedIn, IG, email & Shorts in one click.",
    url: "https://contentloop.app",
    siteName: "ContentLoop",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ContentLoop — turn one post into ten",
    description:
      "Paste long-form content. Get a Twitter thread, LinkedIn post, IG caption, newsletter & Shorts scripts in one click.",
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-neutral-950 text-neutral-100">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
