import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Deasil",
  description: "Guess today's trending topics from their clues. A daily news puzzle.",
  metadataBase: new URL("https://deasil.vercel.app"), // replace with your domain
  openGraph: {
    title: "Deasil",
    description: "Guess today's trending topics from their clues. A daily news puzzle.",
    url: "https://deasil.vercel.app",
    siteName: "Deasil",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Deasil — Daily News Puzzle",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Deasil",
    description: "Guess today's trending topics from their clues. A daily news puzzle.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=Figtree:wght@400;500;600&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}