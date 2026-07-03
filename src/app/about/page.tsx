"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, 
  Target, 
  Eye, 
  Award, 
  Users, 
  ShieldCheck, 
  Globe, 
  HeartHandshake 
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AboutPage() {
  return (
    <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col gap-16">
      
      {/* Intro Header */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-7 flex flex-col gap-6">
          <Badge className="w-fit bg-primary/10 text-primary border-primary/20 text-xs px-3 py-1 font-semibold rounded-full uppercase tracking-wider">
            Who We Are
          </Badge>
          <h1 className="font-serif font-black text-4xl sm:text-5xl text-slate-900 leading-tight">
            Delivering Trust, <br />
            <span className="gradient-text">Beyond Borders</span>
          </h1>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
            Founded with the vision to bridge families and businesses across oceans, <strong>Over the Sea Global Courier Services</strong> has grown from a local Hyderabad cargo operator into a global logistics partner. 
          </p>
          <p className="text-sm sm:text-base text-slate-500 leading-relaxed">
            We specialize in cross-border door-to-door deliveries, cargo management, student express services, and custom-regulated medicine shipping. Operating from our central hub at Begumpet, Secunderabad, we leverage top international cargo flight paths to ensure your package is handled with maximum care and minimal delays.
          </p>
        </div>

        {/* Brand Graphics (Modern abstract display) */}
        <div className="lg:col-span-5 relative h-96 w-full rounded-2xl overflow-hidden shadow-xl border border-slate-200 bg-gradient-to-tr from-slate-950 to-primary flex flex-col justify-between p-8 text-white">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Globe className="h-48 w-48 text-white" />
          </div>
          <div className="flex flex-col gap-2 relative z-10">
            <span className="text-xs font-bold uppercase tracking-widest text-primary">Est. Hyderabad</span>
            <span className="font-serif font-black text-2xl">Over the sea</span>
            <p className="text-xs text-slate-300 leading-relaxed max-w-xs mt-1">
              "Connecting domestic hearts to international homes, one safe package at a time."
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-6 relative z-10">
            <div>
              <strong className="text-3xl font-black block">190+</strong>
              <span className="text-[10px] uppercase font-bold text-slate-400">Countries Served</span>
            </div>
            <div>
              <strong className="text-3xl font-black block">24/7</strong>
              <span className="text-[10px] uppercase font-bold text-slate-400">Shipment Support</span>
            </div>
          </div>
        </div>
      </div>

      {/* Vision & Mission */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="glass border-border flex flex-col justify-between">
          <CardHeader>
            <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-3">
              <Target className="h-5 w-5" />
            </div>
            <CardTitle className="text-slate-900 font-bold">Our Mission</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-600 leading-relaxed">
            To provide safe, reliable, and highly affordable international and domestic courier services. We aim to take the stress out of custom clearances, prescription requirements, and food safety regulations, ensuring families can ship their care packages with total peace of mind.
          </CardContent>
        </Card>

        <Card className="glass border-border flex flex-col justify-between">
          <CardHeader>
            <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-3">
              <Eye className="h-5 w-5" />
            </div>
            <CardTitle className="text-slate-900 font-bold">Our Vision</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-600 leading-relaxed">
            To become the most trusted global cargo brand in South India, celebrated for customer transparency, specialized vacuum food packaging, and speed-optimized shipping networks that make international distance feel non-existent.
          </CardContent>
        </Card>
      </section>

      {/* Core Values */}
      <section className="space-y-10">
        <div className="text-center flex flex-col gap-4">
          <Badge className="w-fit self-center bg-primary/10 text-primary border-primary/20 text-xs px-3 py-1 font-semibold rounded-full uppercase tracking-wider">
            Our Foundations
          </Badge>
          <h2 className="font-serif font-black text-3xl text-slate-900">
            Values that Drive Us
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          <div className="flex flex-col items-center md:items-start text-center md:text-left gap-3">
            <div className="h-12 w-12 rounded-full bg-slate-100 text-primary flex items-center justify-center shadow-sm">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <strong className="text-slate-900 text-base">Uncompromised Safety</strong>
            <p className="text-xs text-slate-500 leading-relaxed">We enforce strict sorting guidelines, thick multi-layer security bubble wrap, and structural box checks for every consignment.</p>
          </div>

          <div className="flex flex-col items-center md:items-start text-center md:text-left gap-3">
            <div className="h-12 w-12 rounded-full bg-slate-100 text-primary flex items-center justify-center shadow-sm">
              <Globe className="h-6 w-6" />
            </div>
            <strong className="text-slate-900 text-base">Global Integrations</strong>
            <p className="text-xs text-slate-500 leading-relaxed">Our partnerships with top-tier airlines and networks secure priority routes and expedited custom clearings worldwide.</p>
          </div>

          <div className="flex flex-col items-center md:items-start text-center md:text-left gap-3">
            <div className="h-12 w-12 rounded-full bg-slate-100 text-primary flex items-center justify-center shadow-sm">
              <Users className="h-6 w-6" />
            </div>
            <strong className="text-slate-900 text-base">Client Transparency</strong>
            <p className="text-xs text-slate-500 leading-relaxed">No hidden fuel surcharges or custom brokerage fees. Standard rates are mapped clearly beforehand with full invoicing.</p>
          </div>

          <div className="flex flex-col items-center md:items-start text-center md:text-left gap-3">
            <div className="h-12 w-12 rounded-full bg-slate-100 text-primary flex items-center justify-center shadow-sm">
              <HeartHandshake className="h-6 w-6" />
            </div>
            <strong className="text-slate-900 text-base">Human Touch</strong>
            <p className="text-xs text-slate-500 leading-relaxed">Whether advising on critical prescription documentation or vacuum packing pickles, we handle each package like it was our own.</p>
          </div>

        </div>
      </section>

      {/* Modern Banner CTA */}
      <section className="bg-slate-50 border border-border rounded-2xl p-8 md:p-12 flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex flex-col gap-2 text-center md:text-left">
          <h3 className="font-serif font-black text-2xl text-slate-900">Have Questions About Banned Items or Custom Docs?</h3>
          <p className="text-sm text-slate-600 max-w-xl">
            Our Begumpet support desk is available to assist you with required papers, medicines approvals, and packaging guidelines.
          </p>
        </div>
        <Button asChild size="lg" className="rounded-full bg-primary hover:bg-secondary text-primary-foreground font-semibold px-8 shrink-0 shadow-md">
          <Link href="/contact">Contact Our Team</Link>
        </Button>
      </section>

    </div>
  );
}
