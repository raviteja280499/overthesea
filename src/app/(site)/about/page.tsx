import { ShieldCheck, Award, Globe, GraduationCap, Package, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import ScrollAnimate from "@/components/ui/ScrollAnimate";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto flex flex-col gap-12">
      <ScrollAnimate>
        <div className="text-center flex flex-col gap-4 max-w-3xl mx-auto">
          <Badge className="w-fit self-center bg-sky-500/20 text-sky-300 border border-sky-400/30 text-xs px-4 py-1.5 font-bold rounded-full uppercase tracking-wider">
            About Over the Sea
          </Badge>
          <h1 className="font-serif font-black text-4xl sm:text-6xl text-white leading-tight">
            Pioneering Global Gateway Services
          </h1>
          <p className="text-base sm:text-lg text-slate-300 font-light leading-relaxed">
            Over the sea operates two distinct, specialized verticals: premier Overseas Education Consultancy and Express International Courier Logistics from S.R Nagar, Hyderabad.
          </p>
        </div>
      </ScrollAnimate>

      <ScrollAnimate delay={150}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="glass-ocean p-8 rounded-[40px] border border-sky-500/30 flex flex-col gap-4">
            <GraduationCap className="h-10 w-10 text-sky-400" />
            <h2 className="text-2xl font-serif font-bold text-white">Educational & Foreign Consultancy</h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light">
              Our dedicated education team provides personalized study abroad profile evaluations, course & university shortlisting, 100% student visa filing, and IELTS/GRE test prep coaching.
            </p>
            <Button asChild className="w-fit bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-full mt-2">
              <Link href="/education">Explore Education Services</Link>
            </Button>
          </div>

          <div className="glass-ocean p-8 rounded-[40px] border border-amber-500/30 flex flex-col gap-4">
            <Package className="h-10 w-10 text-amber-400" />
            <h2 className="text-2xl font-serif font-bold text-white">Global Express Courier Logistics</h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light">
              Connecting Hyderabad to 190+ countries with door-to-door express parcel delivery, prescription medicine shipping, student excess baggage, and commercial vacuum-sealed food transport.
            </p>
            <Button asChild className="w-fit bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-full mt-2">
              <Link href="/courier">Explore Courier Services</Link>
            </Button>
          </div>
        </div>
      </ScrollAnimate>
    </div>
  );
}
