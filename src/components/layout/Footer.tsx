import Link from "next/link";
import Image from "next/image";
import { Ship, Mail, Phone, MapPin, Clock, GraduationCap, Package, Globe, Compass } from "lucide-react";

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

const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" {...props}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347z" />
    <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.986-1.309A9.954 9.954 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18c-1.634 0-3.155-.447-4.46-1.222l-.32-.19-2.96.777.79-2.887-.208-.332A7.954 7.954 0 014 12c0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8-8 8z" />
  </svg>
);

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-900 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-900">
          
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
                  Courier, Education & Tourism
                </span>
              </div>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed">
              Over the sea provides worldwide express courier logistics, premier foreign education consultancy, student admissions, and international tourist visa services.
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
                  Medicine & Doctor Prescription
                </Link>
              </li>
              <li>
                <Link href="/courier#baggage" className="hover:text-amber-400 transition-colors text-slate-400">
                  Student Baggage Express
                </Link>
              </li>
              <li>
                <Link href="/courier#food" className="hover:text-amber-400 transition-colors text-slate-400">
                  Household Foods & Sweets
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
                <a href="https://wa.me/919052703561?text=Hi%20Over%20The%20Sea!%20I%20want%20to%20Check%20My%20Eligibility%20for%20studying%20abroad." target="_blank" rel="noopener noreferrer" className="hover:text-sky-400 transition-colors text-slate-400">
                  Free Study Eligibility Check
                </a>
              </li>
            </ul>
          </div>

          {/* Tourism & Travel Links */}
          <div className="flex flex-col gap-6">
            <h3 className="text-white font-bold text-base tracking-wide relative after:content-[''] after:absolute after:bottom-[-8px] after:left-0 after:w-12 after:h-0.5 after:bg-emerald-500 flex items-center gap-2">
              <Compass className="h-4 w-4 text-emerald-500" /> Tourism & Travel
            </h3>
            <ul className="flex flex-col gap-3 text-sm">
              <li>
                <Link href="/tourism#destinations" className="hover:text-emerald-400 transition-colors text-slate-400">
                  Express Tourist e-Visas
                </Link>
              </li>
              <li>
                <Link href="/tourism#destinations" className="hover:text-emerald-400 transition-colors text-slate-400">
                  Thailand & Dubai 24-Hr Visas
                </Link>
              </li>
              <li>
                <Link href="/tourism#destinations" className="hover:text-emerald-400 transition-colors text-slate-400">
                  Schengen & Japan Tourist Visas
                </Link>
              </li>
              <li>
                <Link href="/tourism#destinations" className="hover:text-emerald-400 transition-colors text-slate-400">
                  12 Global Holiday Destinations
                </Link>
              </li>
              <li>
                <Link href="/tourism#apply-visa" className="hover:text-emerald-400 transition-colors text-slate-400">
                  Customized Tour Packages
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
                <WhatsAppIcon className="h-4 w-4 text-[#25D366] shrink-0" />
                <a href="https://wa.me/919052703561" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-300 transition-colors font-medium">
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
          <p>© {new Date().getFullYear()} Over the Sea Courier, Education & Tourism. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
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
            <span>•</span>
            <Link href="/tourism" className="hover:text-slate-300 transition-colors">
              Tourism & Travel
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
