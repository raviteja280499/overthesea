import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Playfair_Display, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BottomNav from "@/components/layout/BottomNav";
import FloatingCall from "@/components/layout/FloatingCall";

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
  description: "Premium domestic and international courier, cargo, and specialized foreign education consultancy services.",
};

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
      <body className="min-h-full flex flex-col bg-[rgb(1_7_34)] text-slate-100 pb-16 lg:pb-0">
        <Navbar />
        <main className="flex-grow">{children}</main>
        <Footer />
        <BottomNav />
        <FloatingCall />
      </body>
    </html>
  );
}

