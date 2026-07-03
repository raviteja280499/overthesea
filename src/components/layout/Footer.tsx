import Link from "next/link";
import Image from "next/image";
import { Ship, Mail, Phone, MapPin, Clock } from "lucide-react";

const FacebookIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const YoutubeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
  </svg>
);

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-900 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 pb-12 border-b border-slate-900">
          
          {/* Brand Column */}
          <div className="flex flex-col gap-6">
            <Link href="/" className="flex items-center gap-3">
              <div className="relative h-12 w-12 flex items-center justify-center">
                <Image
                  src="/logo.jpg.jpeg"
                  alt="Over the Sea Logo"
                  width={48}
                  height={48}
                  className="object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-serif font-black text-xl tracking-tight text-white leading-none">
                  Over the sea
                </span>
                <span className="font-sans text-[10px] tracking-[0.18em] uppercase text-primary font-semibold">
                  Global Courier
                </span>
              </div>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed">
              Delivering Beyond Borders. Over the sea is a leading cargo and international courier service provider, bringing reliability, safety, and efficiency to every shipment globally.
            </p>
            <div className="flex items-center gap-3">
              <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-full bg-slate-900 hover:bg-primary hover:text-white transition-all text-slate-400" aria-label="Facebook">
                <FacebookIcon className="h-4 w-4" />
              </a>
              <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-full bg-slate-900 hover:bg-primary hover:text-white transition-all text-slate-400" aria-label="Instagram">
                <InstagramIcon className="h-4 w-4" />
              </a>
              <a href="https://www.youtube.com" target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-full bg-slate-900 hover:bg-primary hover:text-white transition-all text-slate-400" aria-label="Youtube">
                <YoutubeIcon className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col gap-6">
            <h3 className="text-white font-bold text-base tracking-wide relative after:content-[''] after:absolute after:bottom-[-8px] after:left-0 after:w-12 after:h-0.5 after:bg-primary">
              Our Services
            </h3>
            <ul className="flex flex-col gap-3 text-sm">
              <li>
                <Link href="/services#domestic" className="hover:text-primary transition-colors text-slate-400">
                  Domestic Express Delivery
                </Link>
              </li>
              <li>
                <Link href="/services#international" className="hover:text-primary transition-colors text-slate-400">
                  International Courier & Parcel
                </Link>
              </li>
              <li>
                <Link href="/services#specialized" className="hover:text-primary transition-colors text-slate-400">
                  Specialized Medicine Shipping
                </Link>
              </li>
              <li>
                <Link href="/services#specialized" className="hover:text-primary transition-colors text-slate-400">
                  Student Express Services
                </Link>
              </li>
              <li>
                <Link href="/services#cargo" className="hover:text-primary transition-colors text-slate-400">
                  Air & Surface Cargo Services
                </Link>
              </li>
            </ul>
          </div>

          {/* Support Links */}
          <div className="flex flex-col gap-6">
            <h3 className="text-white font-bold text-base tracking-wide relative after:content-[''] after:absolute after:bottom-[-8px] after:left-0 after:w-12 after:h-0.5 after:bg-primary">
              Useful Resources
            </h3>
            <ul className="flex flex-col gap-3 text-sm">
              <li>
                <Link href="/about" className="hover:text-primary transition-colors text-slate-400">
                  About Our Company
                </Link>
              </li>
              <li>
                <Link href="/tracking" className="hover:text-primary transition-colors text-slate-400">
                  Consignment Tracking
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary transition-colors text-slate-400">
                  Contact Support Team
                </Link>
              </li>
              <li>
                <Link href="/services#prohibited" className="hover:text-primary transition-colors text-slate-400">
                  Prohibited Shipping Items
                </Link>
              </li>
              <li>
                <Link href="/services#documents" className="hover:text-primary transition-colors text-slate-400">
                  Required Documentation
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="flex flex-col gap-6">
            <h3 className="text-white font-bold text-base tracking-wide relative after:content-[''] after:absolute after:bottom-[-8px] after:left-0 after:w-12 after:h-0.5 after:bg-primary">
              Contact Information
            </h3>
            <div className="flex flex-col gap-4 text-sm text-slate-400">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span>
                  <strong>Head Office:</strong> H.No.1-8-308, E N Plaza, Patigadda Lane, Begumpet, Secunderabad – 500003
                </span>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <div className="flex flex-col gap-0.5">
                  <span className="font-semibold text-slate-200">+91 9052703561 (Hotline)</span>
                  <span>+91 77027 70288 / 89</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-primary shrink-0" />
                <span>info@worldfirst.in</span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-primary shrink-0" />
                <span>Mon - Sat: 9:00 AM - 8:00 PM</span>
              </div>
            </div>
          </div>
          
        </div>

        <div className="pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Over the Sea Global Courier Services. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
