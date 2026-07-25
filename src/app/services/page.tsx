"use client";

import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GraduationCap, Plane, CheckCircle2, ArrowRight } from "lucide-react";
import ScrollAnimate from "@/components/ui/ScrollAnimate";

const coreEducationServices = [
  {
    title: "Application and Admission Guidance",
    description: "Obtain assistance from our best study abroad consultants to complete an error-free application for your selected university, submit it, and keep you updated on its status.",
    image: "/services/admission-guidance.png"
  },
  {
    title: "Test Preparation",
    description: "Our comprehensive practice program is tailored to your exam needs, whether it is IELTS, TOEFL, ACT, GMAT, GRE, SAT, or any other test you may be taking. Through practice, our foreign education consultants will assist you in enhancing your abilities.",
    image: "/services/test-prep.png"
  },
  {
    title: "Visa Application",
    description: "With the assistance of our Visa experts, you will be able to fill out visa forms correctly and prepare your visa documentation in the correct order. Additionally, our foreign education consultants will help prepare for mock interviews and training sessions.",
    image: "/services/visa-application.png"
  },
  {
    title: "Pre-Departure Services",
    description: "Pre-departure briefings, insurances, currency conversions, accommodations and other services are all handled by our team before you land in your dream country.",
    image: "/services/pre-departure.png"
  },
  {
    title: "Financial AID and Scholarships",
    description: "After choosing one of the best study abroad programs, we can assist you find reliable educational loans to pursue further education abroad.",
    image: "/services/financial-aid.png"
  },
  {
    title: "Post Arrival Services",
    description: "As part of our foreign study abroad consultancy, we will take care of all details regarding your arrival in your dream country, including airport pickups, accommodation, and local city orientation.",
    image: "/services/post-arrival.png"
  }
];

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col gap-16">
      
      {/* Page Header */}
      <ScrollAnimate>
        <div className="text-center flex flex-col gap-4 max-w-3xl mx-auto">
          <Badge className="w-fit self-center bg-sky-500/20 text-sky-300 border border-sky-400/30 text-xs px-4 py-1.5 font-bold rounded-full uppercase tracking-wider">
            Services We Are Providing
          </Badge>
          <h1 className="font-serif font-black text-4xl sm:text-6xl text-white leading-tight">
            Worldwide Express & Education Consultancy
          </h1>
          <p className="text-base sm:text-lg text-slate-300 font-light leading-relaxed">
            From admission application to visa filing, prescription medicine shipping to student excess baggage, explore our complete spectrum of services.
          </p>
        </div>
      </ScrollAnimate>

      {/* 6 Core Education & Foreign Services Section */}
      <ScrollAnimate delay={100}>
        <section className="flex flex-col gap-8">
          <div className="text-center max-w-2xl mx-auto mb-4">
            <h2 className="text-3xl font-serif font-bold text-white">
              Foreign Education Consultancy Services
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Complete end-to-end guidance for your study abroad journey.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {coreEducationServices.map((service, idx) => (
              <div
                key={idx}
                className="glass-ocean rounded-3xl overflow-hidden border border-sky-500/20 hover:border-sky-400/60 transition-all duration-300 hover:-translate-y-1.5 flex flex-col shadow-2xl group"
              >
                {/* Service Card Generated Image */}
                <div className="relative w-full h-56 overflow-hidden">
                  <Image
                    src={service.image}
                    alt={service.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
                  <span className="absolute top-4 left-4 bg-sky-950/80 backdrop-blur-md text-cyan-300 font-extrabold text-xs px-3 py-1 rounded-full border border-sky-400/30 shadow-lg">
                    Service 0{idx + 1}
                  </span>
                </div>

                {/* Service Card Content */}
                <div className="p-7 flex flex-col justify-between flex-1 gap-4">
                  <div className="flex flex-col gap-2.5">
                    <h3 className="text-xl font-serif font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {service.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light">
                      {service.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-sky-900/40">
                    <Button asChild size="sm" className="w-full bg-sky-500/20 hover:bg-sky-500 text-sky-300 hover:text-slate-950 font-bold rounded-full border border-sky-400/30 transition-all">
                      <Link href="/education#eligibility">Enquire About {service.title}</Link>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </ScrollAnimate>

      {/* Dual Main Vertical Shortcuts */}
      <ScrollAnimate delay={150}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8">
          
          {/* Card 1: Educational Consultancy Portal */}
          <div className="glass-ocean p-8 rounded-[40px] border border-sky-500/30 flex flex-col justify-between gap-6 hover:border-sky-400/60 transition-all hover:-translate-y-1">
            <div className="flex flex-col gap-4">
              <div className="h-14 w-14 rounded-2xl bg-sky-500/20 text-cyan-300 flex items-center justify-center">
                <GraduationCap className="h-8 w-8" />
              </div>

              <Badge className="bg-sky-500/20 text-sky-300 border border-sky-400/30 text-xs px-3 py-1 rounded-full w-fit">
                Dedicated Portal
              </Badge>

              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white">
                Educational Consultancy Portal
              </h2>

              <p className="text-sm text-slate-300 leading-relaxed font-light">
                Explore destination guides for USA, UK, Canada, Australia, Germany & Ireland along with intake timelines and free profile evaluations.
              </p>
            </div>

            <Button asChild size="lg" className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-full h-12 shadow-lg shadow-sky-500/25">
              <Link href="/education">
                Go to Education Portal <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </div>

          {/* Card 2: Global Courier Services Portal */}
          <div className="glass-ocean p-8 rounded-[40px] border border-amber-500/30 flex flex-col justify-between gap-6 hover:border-amber-400/60 transition-all hover:-translate-y-1">
            <div className="flex flex-col gap-4">
              <div className="h-14 w-14 rounded-2xl bg-amber-500/20 text-amber-300 flex items-center justify-center">
                <Plane className="h-8 w-8" />
              </div>

              <Badge className="bg-amber-500/20 text-amber-300 border border-amber-400/30 text-xs px-3 py-1 rounded-full w-fit">
                Dedicated Portal
              </Badge>

              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white">
                Global Express Courier Logistics
              </h2>

              <p className="text-sm text-slate-300 leading-relaxed font-light">
                Calculate instant shipping rates, track AWB consignments live, book doctor prescription medicine courier, or ship student excess baggage worldwide.
              </p>
            </div>

            <Button asChild size="lg" className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-full h-12 shadow-lg shadow-amber-500/25">
              <Link href="/courier">
                Go to Courier Logistics <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </div>

        </div>
      </ScrollAnimate>

    </div>
  );
}
