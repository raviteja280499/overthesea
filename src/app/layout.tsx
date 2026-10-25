import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Playfair_Display, Geist_Mono } from "next/font/google";
import "./globals.css";

const sans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const serif = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
  display: "swap",
});

const mono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Over the Sea | Foreign Education Consultancy & Global Courier",
  description:
    "Premium domestic and international courier, cargo, and specialized foreign education consultancy services.",
};

/**
 * Document shell only: fonts and global CSS.
 *
 * The public navbar/footer and the dark theme live in (site)/layout.tsx, so
 * the admin and agent areas render neither. Body styling is intentionally
 * minimal here — each area paints its own background.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${sans.variable} ${serif.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-white">{children}</body>
    </html>
  );
}
