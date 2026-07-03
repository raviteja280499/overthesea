"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Plane, 
  Truck, 
  HeartPulse, 
  GraduationCap, 
  Apple, 
  FileText, 
  AlertOctagon, 
  ShieldCheck, 
  Clock, 
  Info,
  ArrowRight,
  ArrowRightCircle
} from "lucide-react";
import Link from "next/link";

export default function ServicesPage() {
  return (
    <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col gap-12">
      {/* Page Header */}
      <div className="text-center flex flex-col gap-4 max-w-3xl mx-auto">
        <Badge className="w-fit self-center bg-primary/10 text-primary border-primary/20 text-xs px-3 py-1 font-semibold rounded-full uppercase tracking-wider">
          Our Shipping Catalog
        </Badge>
        <h1 className="font-serif font-black text-4xl sm:text-5xl text-slate-900 leading-tight">
          Delivering Anything, Anywhere
        </h1>
        <p className="text-lg text-slate-600 leading-relaxed">
          From legal documents to household pickles, heavy machineries to personal study logs, we offer dedicated, specialized shipping lanes tailored to safety and customs regulations.
        </p>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="international" className="w-full">
        <div className="flex justify-center mb-8">
          <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full max-w-3xl h-auto p-1.5 bg-slate-100 rounded-xl border border-slate-200">
            <TabsTrigger value="domestic" className="text-xs sm:text-sm py-2.5 rounded-lg font-semibold data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm cursor-pointer transition-all">
              Domestic Cargo
            </TabsTrigger>
            <TabsTrigger value="international" className="text-xs sm:text-sm py-2.5 rounded-lg font-semibold data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm cursor-pointer transition-all">
              International
            </TabsTrigger>
            <TabsTrigger value="specialized" className="text-xs sm:text-sm py-2.5 rounded-lg font-semibold data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm cursor-pointer transition-all">
              Specialized
            </TabsTrigger>
            <TabsTrigger value="rules" className="text-xs sm:text-sm py-2.5 rounded-lg font-semibold data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm cursor-pointer transition-all">
              Documentation
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab 1: Domestic Cargo */}
        <TabsContent value="domestic" className="space-y-8 animate-in fade-in duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8 space-y-6">
              <h2 id="domestic" className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <Truck className="h-6 w-6 text-primary" /> Domestic Shipping & Logistics
              </h2>
              <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
                Over the Sea provides comprehensive domestic logistics networks spanning documents, parcels, and heavy-weight commercial cargo across all states of India. We synchronize road, rail, and air paths to guarantee arrival on schedule.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border border-border">
                  <CardHeader>
                    <CardTitle className="text-base font-bold text-slate-900">Express Document Delivery</CardTitle>
                    <CardDescription className="text-xs">For time-critical envelopes and files.</CardDescription>
                  </CardHeader>
                  <CardContent className="text-sm text-slate-600">
                    Get same-day or next-business-day delivery in major metros (Mumbai, Delhi, Bangalore, Chennai, Kolkata). Includes end-to-end tracking, handover SMS alerts, and digital signature proofs.
                  </CardContent>
                </Card>
                
                <Card className="border border-border">
                  <CardHeader>
                    <CardTitle className="text-base font-bold text-slate-900">Surface Express Cargo</CardTitle>
                    <CardDescription className="text-xs">Subsidized shipping for heavy commercial items.</CardDescription>
                  </CardHeader>
                  <CardContent className="text-sm text-slate-600">
                    Perfect for industrial spares, retail shipments, books, and household appliances. Utilizing containerized vehicles, surface cargo offers a highly economical alternative for packages over 20 kg.
                  </CardContent>
                </Card>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg flex items-start gap-3">
                <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div className="text-xs text-slate-600">
                  <strong>Domestic Cover:</strong> We offer complete coverage to 28 states and 8 union territories, reaching over 19,000 PIN codes directly. Doorstep pickup in Hyderabad is provided free of cost.
                </div>
              </div>
            </div>
            
            <div className="lg:col-span-4 bg-slate-50 border border-slate-200 rounded-xl p-6 flex flex-col gap-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">Domestic Cargo Features</h3>
              <ul className="flex flex-col gap-4 text-xs font-medium text-slate-600">
                <li className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-primary" /> Free bubble wrap & packing support
                </li>
                <li className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" /> Delivery speed of 24 - 72 Hours
                </li>
                <li className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" /> Real-time location tracking dashboard
                </li>
                <li className="flex items-center gap-2">
                  <ArrowRightCircle className="h-5 w-5 text-primary" /> COD and To-Pay billing options
                </li>
              </ul>
              <Button asChild className="w-full bg-primary hover:bg-secondary text-primary-foreground font-semibold">
                <Link href="/contact?service=domestic">Book Domestic Courier</Link>
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* Tab 2: International */}
        <TabsContent value="international" className="space-y-8 animate-in fade-in duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8 space-y-6">
              <h2 id="international" className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <Plane className="h-6 w-6 text-primary" /> Worldwide Courier & Excess Baggage
              </h2>
              <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
                Delivering Beyond Borders. Through our strategic partnerships with global networks (DHL, FedEx, UPS, Aramex), we offer international shipping that is up to 40% cheaper than direct walk-in rates, coupled with Hyderabad's best customs assistance.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border border-border">
                  <CardHeader>
                    <CardTitle className="text-base font-bold text-slate-900">Worldwide Documents & Parcels</CardTitle>
                    <CardDescription className="text-xs">Rapid transit to 190+ countries.</CardDescription>
                  </CardHeader>
                  <CardContent className="text-sm text-slate-600">
                    Ship invoices, letters, brochures, corporate gifts, and commercial samples globally. Average transit time is 3-5 days to major hubs (London, New York, Dubai, Singapore).
                  </CardContent>
                </Card>
                
                <Card className="border border-border">
                  <CardHeader>
                    <CardTitle className="text-base font-bold text-slate-900">Excess Luggage & Relocation</CardTitle>
                    <CardDescription className="text-xs">Personal baggage shipping at bulk freight pricing.</CardDescription>
                  </CardHeader>
                  <CardContent className="text-sm text-slate-600">
                    Relocating abroad or have bags that exceed airline limits? Save massive excess baggage fees at airports. We ship personal clothing, items, and kitchen tools door-to-door with clearance help.
                  </CardContent>
                </Card>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg flex items-start gap-3">
                <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div className="text-xs text-slate-600">
                  <strong>Special Rates:</strong> USA, UK, Canada, Australia, Singapore, Dubai, and Saudi Arabia have daily dedicated flights with guaranteed customs priority, minimizing delays.
                </div>
              </div>
            </div>
            
            <div className="lg:col-span-4 bg-slate-50 border border-slate-200 rounded-xl p-6 flex flex-col gap-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">International Benefits</h3>
              <ul className="flex flex-col gap-4 text-xs font-medium text-slate-600">
                <li className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-primary" /> Integrated customs documentation guidance
                </li>
                <li className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" /> Swift transit of 3 - 6 Business Days
                </li>
                <li className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" /> Complete door-to-door digital tracking
                </li>
                <li className="flex items-center gap-2">
                  <ArrowRightCircle className="h-5 w-5 text-primary" /> Up to 40% cheaper than retail quotes
                </li>
              </ul>
              <Button asChild className="w-full bg-primary hover:bg-secondary text-primary-foreground font-semibold">
                <Link href="/contact?service=international">Book Worldwide Courier</Link>
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* Tab 3: Specialized */}
        <TabsContent value="specialized" className="space-y-8 animate-in fade-in duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8 space-y-6">
              <h2 id="specialized" className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <HeartPulse className="h-6 w-6 text-primary" /> Medicine, Food, and Student Express
              </h2>
              <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
                We handle shipments that other cargo companies shy away from. Over the Sea has dedicated logistics flows for shipping home-prepared foodstuffs and critical personal prescription medicines globally.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border border-border">
                  <CardHeader className="pb-3">
                    <HeartPulse className="h-8 w-8 text-red-500 mb-2" />
                    <CardTitle className="text-base font-bold text-slate-900">Medicine Shipping</CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs text-slate-600 leading-relaxed">
                    Courier critical life-saving medications, Ayurvedic, Homeopathic, or Allopathic medicines. We pack them under optimal conditions and verify that the doctor's prescription satisfies import regulations.
                  </CardContent>
                </Card>
                
                <Card className="border border-border">
                  <CardHeader className="pb-3">
                    <Apple className="h-8 w-8 text-amber-500 mb-2" />
                    <CardTitle className="text-base font-bold text-slate-900">Homemade Foods</CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs text-slate-600 leading-relaxed">
                    Ship pickles, spices, masala powders, sweets, snacks, and home food packages. We vacuum seal items at our Begumpet office to prevent leakage and guarantee compliance with global food regulations.
                  </CardContent>
                </Card>

                <Card className="border border-border">
                  <CardHeader className="pb-3">
                    <GraduationCap className="h-8 w-8 text-blue-500 mb-2" />
                    <CardTitle className="text-base font-bold text-slate-900">Student Express</CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs text-slate-600 leading-relaxed">
                    Subsidized shipping for university applications, laptops, excess books, and baggage. Specifically designed to support Hyderabad students traveling abroad for higher studies.
                  </CardContent>
                </Card>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg flex items-start gap-3">
                <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div className="text-xs text-slate-600">
                  <strong>Packaging Note:</strong> Pickles, liquids, and dynamic food elements require multi-layer leakage-proof packaging. Bring them to our branch, and our packing experts will pack them using vacuum-sealers free of cost.
                </div>
              </div>
            </div>
            
            <div className="lg:col-span-4 bg-slate-50 border border-slate-200 rounded-xl p-6 flex flex-col gap-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">Specialized Package Guidance</h3>
              <ul className="flex flex-col gap-4 text-xs font-medium text-slate-600">
                <li className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-primary" /> FDA / FSSAI packaging guidelines met
                </li>
                <li className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" /> Temperature controlled logistics paths
                </li>
                <li className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" /> Prescription validation prior to booking
                </li>
                <li className="flex items-center gap-2">
                  <ArrowRightCircle className="h-5 w-5 text-primary" /> Door-to-door delivery signature confirmation
                </li>
              </ul>
              <Button asChild className="w-full bg-primary hover:bg-secondary text-primary-foreground font-semibold">
                <Link href="/contact?service=specialized">Book Specialized Shipping</Link>
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* Tab 4: Rules & restrictions */}
        <TabsContent value="rules" className="space-y-8 animate-in fade-in duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            
            {/* Required Documentation */}
            <Card id="documents" className="border border-border">
              <CardHeader className="bg-primary/5 border-b border-border/80">
                <CardTitle className="text-lg font-bold text-primary flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" /> Required Documentation
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">Ensure these documents are prepared to avoid customs bottlenecks.</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-3 text-xs sm:text-sm">
                  <div>
                    <strong className="text-slate-900 block">1. Personal Shipments (Gifts, Clothes, Food)</strong>
                    <ul className="list-disc pl-4 text-slate-600 mt-1 flex flex-col gap-1 text-xs">
                      <li>Shipper's ID proof (Aadhaar Card / Passport Copy / Voter ID)</li>
                      <li>Invoice listing itemized contents and custom values</li>
                      <li>Address details of both sender and recipient (including Zip Code)</li>
                    </ul>
                  </div>
                  
                  <div>
                    <strong className="text-slate-900 block">2. Prescription Medicines</strong>
                    <ul className="list-disc pl-4 text-slate-600 mt-1 flex flex-col gap-1 text-xs">
                      <li>Original Doctor's prescription (should state diagnosis and dosage matching the pills)</li>
                      <li>Original medical purchase bill showing patient name</li>
                      <li>ID copy of the patient (matching the name on the prescription)</li>
                    </ul>
                  </div>

                  <div>
                    <strong className="text-slate-900 block">3. Commercial Cargo / Business Shipments</strong>
                    <ul className="list-disc pl-4 text-slate-600 mt-1 flex flex-col gap-1 text-xs">
                      <li>Import Export Code (IEC) of both shipper and receiver</li>
                      <li>GST registration certificate copy</li>
                      <li>Commercial Invoice & packing lists</li>
                      <li>Authorized Dealer Code (AD Code) registered at port of export</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Prohibited Items */}
            <Card id="prohibited" className="border border-border">
              <CardHeader className="bg-red-50/50 border-b border-red-100">
                <CardTitle className="text-lg font-bold text-red-600 flex items-center gap-2">
                  <AlertOctagon className="h-5 w-5 text-red-500" /> Prohibited & Dangerous Goods
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">These items are strictly banned by aviation and maritime authorities.</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-2">
                    <strong className="text-slate-950 block border-b border-slate-100 pb-1 uppercase tracking-wider text-[10px] text-red-500 font-bold">Hazmat & Flammables</strong>
                    <ul className="list-disc pl-4 text-slate-600 flex flex-col gap-1">
                      <li>Aerosol sprays, perfumes, and deodorants</li>
                      <li>Sanitizers, nail polish, and alcohol</li>
                      <li>Batteries (Lithium-ion without device)</li>
                      <li>Corrosives, acids, or toxic chemicals</li>
                    </ul>
                  </div>
                  
                  <div className="space-y-2">
                    <strong className="text-slate-950 block border-b border-slate-100 pb-1 uppercase tracking-wider text-[10px] text-red-500 font-bold">Valuables & Currency</strong>
                    <ul className="list-disc pl-4 text-slate-600 flex flex-col gap-1">
                      <li>Cash, coins, bank checks, or bullion</li>
                      <li>Original gold/silver jewelry and gems</li>
                      <li>Stamps, credit cards, or checkbooks</li>
                      <li>Antiques and unpriced artworks</li>
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <strong className="text-slate-950 block border-b border-slate-100 pb-1 uppercase tracking-wider text-[10px] text-red-500 font-bold">Narcotics & Weapons</strong>
                    <ul className="list-disc pl-4 text-slate-600 flex flex-col gap-1">
                      <li>Banned drugs, marijuana, or opioids</li>
                      <li>Firearms, explosives, or replica weapons</li>
                      <li>Knives, swords, or tactical tools</li>
                      <li>Ammunition and fireworks</li>
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <strong className="text-slate-950 block border-b border-slate-100 pb-1 uppercase tracking-wider text-[10px] text-red-500 font-bold">Perishables & Animals</strong>
                    <ul className="list-disc pl-4 text-slate-600 flex flex-col gap-1">
                      <li>Fresh raw meats, eggs, or raw milk</li>
                      <li>Live animals, plants, or organic soil</li>
                      <li>Seeds, items requiring active refrigeration</li>
                      <li>Unsealed/unpackaged food grains</li>
                    </ul>
                  </div>
                </div>

                <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-[10px] text-red-800 font-medium">
                  <strong>Warning:</strong> Attempting to ship prohibited items can result in immediate cargo confiscation by customs authorities, fines, and/or legal actions against the shipper. Always clarify if unsure.
                </div>
              </CardContent>
            </Card>

          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
