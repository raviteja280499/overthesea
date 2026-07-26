"use client";

import { useState } from "react";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  CheckCircle2,
  Globe,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto flex flex-col gap-12">
      <div className="text-center flex flex-col gap-4 max-w-3xl mx-auto">
        <Badge className="w-fit self-center bg-sky-500/20 text-sky-300 border border-sky-400/30 text-xs px-4 py-1.5 font-bold rounded-full uppercase tracking-wider">
          S.R Nagar Head Office
        </Badge>
        <h1 className="font-serif font-black text-4xl sm:text-6xl text-white leading-tight">
          Contact Over the Sea
        </h1>
        <p className="text-base sm:text-lg text-slate-300 font-light leading-relaxed">
          Contact our Hyderabad team for Global Courier Pickups or Overseas
          Education & Visa Guidance.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="glass-ocean p-8 rounded-[36px] border border-sky-500/30 flex flex-col gap-6">
            <h2 className="text-2xl font-serif font-bold text-white">
              Official Contact Info
            </h2>

            <div className="flex items-start gap-4">
              <MapPin className="h-6 w-6 text-sky-400 shrink-0 mt-1" />
              <div>
                <strong className="text-white text-sm block">
                  Hyderabad Head Office
                </strong>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  S1 Kavitha Apartment, Vengal Rao Nagar, A Block Rd, S.R Nagar
                  Metro Station, Hyderabad, Telangana – 500038
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Phone className="h-6 w-6 text-amber-400 shrink-0 mt-1" />
              <div className="flex flex-col text-xs text-slate-300 gap-1.5">
                <div>
                  <strong className="text-sky-300 font-bold block">
                    📞 Phone Call:
                  </strong>
                  <a
                    href="tel:+919052703560"
                    className="text-sm font-mono text-white hover:underline"
                  >
                    +91 90527 03560
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-[#25D366] shrink-0">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347z" />
                    <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.986-1.309A9.954 9.954 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18c-1.634 0-3.155-.447-4.46-1.222l-.32-.19-2.96.777.79-2.887-.208-.332A7.954 7.954 0 014 12c0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8-8 8z" />
                  </svg>
                  <strong className="text-emerald-400 font-bold">
                    WhatsApp :
                  </strong>
                  <a
                    href="https://wa.me/919052703561"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-mono text-emerald-300 hover:underline ml-1"
                  >
                    +91 90527 03561
                  </a>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Mail className="h-5 w-5 text-sky-400 shrink-0" />
              <div className="flex flex-col text-xs text-slate-300">
                <strong className="text-sky-300 font-bold">Email:</strong>
                <a
                  href="mailto:overtheseaconsultancy@gmail.com"
                  className="hover:underline text-white truncate"
                >
                  overtheseaconsultancy@gmail.com
                </a>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Globe className="h-5 w-5 text-amber-400 shrink-0" />
              <div className="flex flex-col text-xs text-slate-300">
                <strong className="text-amber-300 font-bold">Website:</strong>
                <a
                  href="https://www.overthesea.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline text-white"
                >
                  www.overthesea.in
                </a>
              </div>
            </div>

            <div className="flex items-center gap-4 pt-2 border-t border-sky-900/40">
              <Clock className="h-5 w-5 text-slate-400 shrink-0" />
              <span className="text-xs text-slate-300">
                Monday - Saturday: 9:30 AM - 7:30 PM
              </span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7">
          <div className="glass-ocean p-8 sm:p-10 rounded-[40px] border border-sky-500/30 shadow-2xl">
            <h2 className="text-2xl font-serif font-bold text-white mb-6">
              Send Us a Direct Message
            </h2>

            {submitted ? (
              <div className="bg-sky-950/80 border border-sky-400/40 rounded-3xl p-8 text-center flex flex-col items-center gap-3">
                <CheckCircle2 className="h-12 w-12 text-cyan-400" />
                <h3 className="text-xl font-bold text-white">
                  Message Sent Successfully!
                </h3>
                <p className="text-xs text-slate-300">
                  Thank you for reaching out. Our S.R Nagar team will get back
                  to you shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-sky-300 uppercase">
                      Your Name *
                    </label>
                    <Input
                      required
                      placeholder="Rahul Sharma"
                      className="bg-slate-900 border-sky-800/80 text-white rounded-2xl h-12 text-sm"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-sky-300 uppercase">
                      Phone Number *
                    </label>
                    <Input
                      required
                      type="tel"
                      placeholder="+91 90527 03560"
                      className="bg-slate-900 border-sky-800/80 text-white rounded-2xl h-12 text-sm"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-sky-300 uppercase">
                    Your Message *
                  </label>
                  <Textarea
                    required
                    rows={4}
                    placeholder="How can we help you with Education Consultancy or Courier Logistics?"
                    className="bg-slate-900 border-sky-800/80 text-white rounded-2xl text-sm"
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-full h-12 text-base mt-2 cursor-pointer"
                >
                  Send Message <Send className="h-4 w-4 ml-2" />
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
