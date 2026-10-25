import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BottomNav from "@/components/layout/BottomNav";
import FloatingCall from "@/components/layout/FloatingCall";

/**
 * Public marketing site chrome.
 *
 * This lives in a (site) route group rather than the root layout so that
 * /admin and /agent do not render it at all. Previously the navbar, footer,
 * bottom nav and floating call button were in every response and the admin
 * and agent shells simply covered them with a `fixed inset-0` overlay — so
 * the DOM, the tab order and the client bundles of the public site were all
 * still being shipped to the back office, including footer links that leaked
 * into content checks.
 */
export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-col bg-[rgb(1_7_34)] pb-16 text-slate-100 lg:pb-0">
      <Navbar />
      <main className="flex-grow">{children}</main>
      <Footer />
      <BottomNav />
      <FloatingCall />
    </div>
  );
}
