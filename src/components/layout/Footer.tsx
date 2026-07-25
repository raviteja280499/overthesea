import Link from "next/link";
import Image from "next/image";
import { Ship, Mail, Phone, MapPin, Clock, GraduationCap, Package, Globe } from "lucide-react";

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

const LinkedinIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
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
                  src="/logo.png"
                  alt="Over the Sea Logo"
                  width={48}
                  height={48}
                  className="object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-serif font-black text-xl tracking-tight text-white leading-none">
                  OVER THE SEA
                </span>
                <span className="font-sans text-[10px] tracking-[0.14em] uppercase text-primary font-semibold mt-0.5">
                  Courier & Foreign Consultancy
                </span>
              </div>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed">
              Over the sea provides worldwide express courier logistics alongside premier foreign education consultancy, student admissions, and visa guidance.
            </p>
            <div className="flex items-center gap-3">
              <a href="https://www.facebook.com/share/18eHnTG3RA/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-full bg-slate-900 hover:bg-primary hover:text-white transition-all text-slate-400" aria-label="Facebook">
                <FacebookIcon className="h-4 w-4" />
              </a>
              <a href="https://www.instagram.com/overthesea_consultancy" target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-full bg-slate-900 hover:bg-primary hover:text-white transition-all text-slate-400" aria-label="Instagram">
                <InstagramIcon className="h-4 w-4" />
              </a>
              <a href="https://www.linkedin.com/in/over-the-sea-educational-consultancy-services-a76741424" target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-full bg-slate-900 hover:bg-primary hover:text-white transition-all text-slate-400" aria-label="LinkedIn">
                <LinkedinIcon className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Courier Services Links */}
          <div className="flex flex-col gap-6">
            <h3 className="text-white font-bold text-base tracking-wide relative after:content-[''] after:absolute after:bottom-[-8px] after:left-0 after:w-12 after:h-0.5 after:bg-amber-500 flex items-center gap-2">
              <Package className="h-4 w-4 text-amber-500" /> Courier Services
            </h3>
            <ul className="flex flex-col gap-3 text-sm">
              <li>
                <Link href="/courier#international" className="hover:text-amber-400 transition-colors text-slate-400">
                  International Express Courier
                </Link>
              </li>
              <li>
                <Link href="/courier#medicine" className="hover:text-amber-400 transition-colors text-slate-400">
                  Medicine & Doctor Prescription Courier
                </Link>
              </li>
              <li>
                <Link href="/courier#baggage" className="hover:text-amber-400 transition-colors text-slate-400">
                  Student Baggage Express Shipping
                </Link>
              </li>
              <li>
                <Link href="/courier#food" className="hover:text-amber-400 transition-colors text-slate-400">
                  Household Foods & Sweets Shipping
                </Link>
              </li>
              <li>
                <Link href="/tracking" className="hover:text-amber-400 transition-colors text-slate-400">
                  Live AWB Consignment Tracking
                </Link>
              </li>
            </ul>
          </div>

          {/* Educational Consultancy Links */}
          <div className="flex flex-col gap-6">
            <h3 className="text-white font-bold text-base tracking-wide relative after:content-[''] after:absolute after:bottom-[-8px] after:left-0 after:w-12 after:h-0.5 after:bg-sky-500 flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-sky-500" /> Overseas Consultancy
            </h3>
            <ul className="flex flex-col gap-3 text-sm">
              <li>
                <Link href="/education#counselling" className="hover:text-sky-400 transition-colors text-slate-400">
                  Study Abroad Counselling
                </Link>
              </li>
              <li>
                <Link href="/education#destinations" className="hover:text-sky-400 transition-colors text-slate-400">
                  University & Course Admissions
                </Link>
              </li>
              <li>
                <Link href="/education#visa" className="hover:text-sky-400 transition-colors text-slate-400">
                  Student Visa Filing Assistance
                </Link>
              </li>
              <li>
                <Link href="/education#coaching" className="hover:text-sky-400 transition-colors text-slate-400">
                  IELTS / TOEFL / GRE Coaching
                </Link>
              </li>
              <li>
                <Link href="/education#eligibility" className="hover:text-sky-400 transition-colors text-slate-400">
                  Free Study Eligibility Assessment
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="flex flex-col gap-6">
            <h3 className="text-white font-bold text-base tracking-wide relative after:content-[''] after:absolute after:bottom-[-8px] after:left-0 after:w-12 after:h-0.5 after:bg-primary">
              Contact & Head Office
            </h3>
            <div className="flex flex-col gap-3 text-xs text-slate-400">
              <div className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span>
                  <strong>Head Office:</strong> S1 Kavitha Apartment, Vengal Rao Nagar, A Block Rd, S.R Nagar Metro Station, Hyderabad, Telangana – 500038
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 text-sky-400 shrink-0" />
                <a href="tel:+919052703560" className="hover:text-white transition-colors">
                  Call: +91 90527 03560
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="text-emerald-400 text-sm font-bold">💬</span>
                <a href="https://wa.me/919052703561" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-300 transition-colors">
                  WhatsApp: +91 90527 03561
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 text-sky-400 shrink-0" />
                <a href="mailto:overtheseaconsultancy@gmail.com" className="hover:text-white transition-colors truncate">
                  overtheseaconsultancy@gmail.com
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Globe className="h-4 w-4 text-sky-400 shrink-0" />
                <a href="https://www.overthesea.in" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  www.overthesea.in
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Over the Sea Courier & Educational Consultancy. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/about" className="hover:text-slate-300 transition-colors">
              About Us
            </Link>
            <span>•</span>
            <Link href="/contact" className="hover:text-slate-300 transition-colors">
              Contact Us
            </Link>
            <span>•</span>
            <Link href="/education" className="hover:text-slate-300 transition-colors">
              Educational Consultancy
            </Link>
            <span>•</span>
            <Link href="/courier" className="hover:text-slate-300 transition-colors">
              Global Courier Services
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
