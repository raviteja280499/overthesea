"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import {
  Search,
  Plane,
  Ship,
  Truck,
  Shield,
  Clock,
  DollarSign,
  ChevronRight,
  Globe,
  Award,
  Users,
  Compass,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  FileText,
  BadgeCheck,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import canvasConfetti from "canvas-confetti";

// Mock tracking database
const mockAWBs: Record<string, {
  status: "booked" | "transit" | "out-for-delivery" | "delivered";
  details: {
    origin: string;
    destination: string;
    currentLocation: string;
    lastUpdate: string;
    shipperName: string;
    receiverName: string;
    serviceType: string;
    weight: string;
    history: { date: string; time: string; location: string; activity: string }[];
  }
}> = {
  "OTS-12345": {
    status: "delivered",
    details: {
      origin: "Hyderabad (HYD), India",
      destination: "London (LHR), United Kingdom",
      currentLocation: "London - Delivered",
      lastUpdate: "02-Jul-2026 03:30 PM",
      shipperName: "Rohan Sharma",
      receiverName: "Sarah Jenkins",
      serviceType: "International Student Express",
      weight: "12.5 kg",
      history: [
        { date: "02-Jul-2026", time: "03:30 PM", location: "London, UK", activity: "Shipment delivered - Signed by Sarah" },
        { date: "02-Jul-2026", time: "09:15 AM", location: "London Hub, UK", activity: "Out for delivery with courier" },
        { date: "01-Jul-2026", time: "11:45 PM", location: "London Heathrow Airport, UK", activity: "Arrived at destination customs facility" },
        { date: "30-Jun-2026", time: "04:10 AM", location: "Mumbai Intl Hub, India", activity: "Departed international gateway airport" },
        { date: "29-Jun-2026", time: "07:30 PM", location: "Hyderabad Begumpet Hub, India", activity: "Consignment processed and forwarded" },
        { date: "29-Jun-2026", time: "11:00 AM", location: "Hyderabad Main Office, India", activity: "Shipment picked up and booked" },
      ]
    }
  },
  "OTS-67890": {
    status: "transit",
    details: {
      origin: "Secunderabad, India",
      destination: "Dubai (DXB), United Arab Emirates",
      currentLocation: "Mumbai Gateway Port",
      lastUpdate: "02-Jul-2026 10:00 AM",
      shipperName: "Deepak Kumar",
      receiverName: "Mohammed Al Maktoum",
      serviceType: "International Express Parcel",
      weight: "4.2 kg",
      history: [
        { date: "02-Jul-2026", time: "10:00 AM", location: "Mumbai Port, India", activity: "Cleared export customs and loaded in air transit" },
        { date: "01-Jul-2026", time: "08:30 PM", location: "Mumbai Intl Hub, India", activity: "Arrived at transit facility" },
        { date: "30-Jun-2026", time: "02:15 PM", location: "Hyderabad Begumpet Hub, India", activity: "Dispatched from origin warehouse" },
        { date: "30-Jun-2026", time: "09:00 AM", location: "Secunderabad Hub, India", activity: "Shipment booked and packed" },
      ]
    }
  }
};

export default function HomePage() {
  // Tracking State
  const [awb, setAwb] = useState("");
  const [trackingResult, setTrackingResult] = useState<typeof mockAWBs[string] | null>(null);
  const [trackingError, setTrackingError] = useState("");

  // Rate Estimator State
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [weight, setWeight] = useState("");
  const [itemType, setItemType] = useState("");
  const [estimation, setEstimation] = useState<{ price: number; days: string; docs: string[] } | null>(null);

  // Handle Tracking Search
  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    setTrackingError("");
    setTrackingResult(null);

    const code = awb.trim().toUpperCase();
    if (!code) {
      setTrackingError("Please enter a tracking number.");
      return;
    }

    if (mockAWBs[code]) {
      setTrackingResult(mockAWBs[code]);
      canvasConfetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.8 }
      });
    } else {
      // Mock generated track if not in database, so it always returns something
      const mockRandomStatus = {
        status: "transit" as const,
        details: {
          origin: "Hyderabad, India",
          destination: destination || "Global Destination",
          currentLocation: "Transit Warehouse Hub",
          lastUpdate: "Just Now",
          shipperName: "Valued Customer",
          receiverName: "Consignee Agent",
          serviceType: "Standard Air Express",
          weight: weight ? `${weight} kg` : "5.0 kg",
          history: [
            { date: "Today", time: "08:00 AM", location: "Local Warehouse Hub", activity: "In transit to export hub" },
            { date: "Yesterday", time: "03:45 PM", location: "Hyderabad Hub, India", activity: "Consignment sorted and dispatched" },
            { date: "Yesterday", time: "10:30 AM", location: "Begumpet Office, India", activity: "Package accepted and processed" },
          ]
        }
      };
      setTrackingResult(mockRandomStatus);
    }
  };

  // Handle Rate Calculation
  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!origin || !destination || !weight || !itemType) return;

    const baseWeight = parseFloat(weight) || 1;
    let ratePerKg = 450; // base rate domestic
    let transitDays = "3-5 Business Days";
    let requiredDocs = ["Air Waybill (AWB)", "Invoice Copy", "ID Proof of Shipper"];

    if (destination !== "india") {
      ratePerKg = 1800; // intl rate
      transitDays = "4-7 Business Days";
      requiredDocs.push("Customs Declaration Form", "Passport Copy (for student express / personal cargo)");
      
      if (itemType === "medicine") {
        ratePerKg = 2400;
        transitDays = "5-8 Business Days";
        requiredDocs.push("Doctor's Prescription (Original)", "Medical Bill (Original)", "Drug License copy (for commercial shipments)");
      } else if (itemType === "food") {
        ratePerKg = 1950;
        transitDays = "5-8 Business Days";
        requiredDocs.push("FSSAI Undertaking", "Exporter Declaration");
      }
    } else {
      if (itemType === "medicine") {
        ratePerKg = 750;
        requiredDocs.push("Doctor Prescription");
      }
    }

    const totalPrice = Math.round(baseWeight * ratePerKg);
    setEstimation({
      price: totalPrice,
      days: transitDays,
      docs: requiredDocs
    });

    canvasConfetti({
      particleCount: 50,
      angle: 60,
      spread: 55,
      origin: { x: 0 }
    });
    canvasConfetti({
      particleCount: 50,
      angle: 120,
      spread: 55,
      origin: { x: 1 }
    });
  };

  return (
    <div className="relative overflow-hidden min-h-screen">
      {/* Decorative background glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-secondary/5 blur-[150px] pointer-events-none" />

      {/* Hero Section */}
      <section className="relative pt-16 pb-24 md:pt-24 md:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Hero Content */}
          <div className="lg:col-span-7 flex flex-col gap-6 text-center lg:text-left">
            <Badge className="self-center lg:self-start w-fit bg-primary/10 text-primary border-primary/20 text-xs px-3 py-1 font-semibold rounded-full uppercase tracking-wider animate-pulse">
              Delivering Beyond Borders
            </Badge>
            <h1 className="font-serif font-black text-4xl sm:text-5xl md:text-6xl tracking-tight leading-tight text-slate-900">
              Your Cargo, Our Commitment. <br />
              <span className="gradient-text">Over the Sea</span>
            </h1>
            <p className="text-lg text-slate-600 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Global express courier and freight shipping built on safety, speed, and absolute reliability. Connecting Hyderabad to over 190+ countries, seamlessly.
            </p>

            {/* In-Hero Tracker */}
            <form onSubmit={handleTrack} className="w-full max-w-lg mx-auto lg:mx-0 mt-4 p-2 bg-white rounded-full shadow-lg border border-border flex items-center gap-1.5 focus-within:ring-2 focus-within:ring-primary focus-within:border-transparent transition-all">
              <div className="flex items-center gap-2 pl-3 flex-grow">
                <Search className="h-5 w-5 text-muted-foreground shrink-0" />
                <input
                  type="text"
                  placeholder="Enter AWB (e.g. OTS-12345, OTS-67890)"
                  value={awb}
                  onChange={(e) => setAwb(e.target.value)}
                  className="bg-transparent border-0 outline-none w-full text-sm font-medium placeholder-slate-400 focus:ring-0 text-slate-900"
                />
              </div>
              <Button type="submit" className="rounded-full bg-primary hover:bg-secondary text-primary-foreground font-semibold px-6 shadow-md transition-all cursor-pointer">
                Track
              </Button>
            </form>
            <div className="flex justify-center lg:justify-start gap-6 text-xs font-semibold text-slate-500">
              <span>Try: <button onClick={() => { setAwb("OTS-12345"); }} className="underline hover:text-primary transition-colors cursor-pointer">OTS-12345 (Delivered)</button></span>
              <span>•</span>
              <span><button onClick={() => { setAwb("OTS-67890"); }} className="underline hover:text-primary transition-colors cursor-pointer">OTS-67890 (In Transit)</button></span>
            </div>

            {/* Tracking Results Modal/Card (displayed inline if searched) */}
            {trackingResult && (
              <Card className="mt-8 text-left glass border-primary/20 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
                <CardHeader className="bg-primary/5 py-4 px-6 border-b border-primary/10 flex flex-row justify-between items-center flex-wrap gap-4">
                  <div>
                    <CardTitle className="text-primary font-bold text-lg">Shipment Details</CardTitle>
                    <CardDescription className="text-xs font-medium">AWB Consignment Number: <span className="font-bold text-slate-800">{awb.toUpperCase()}</span></CardDescription>
                  </div>
                  <Badge className={`text-xs px-3 py-1 font-bold rounded-full capitalize ${
                    trackingResult.status === "delivered" 
                      ? "bg-emerald-100 text-emerald-800 border-emerald-200" 
                      : trackingResult.status === "out-for-delivery"
                      ? "bg-amber-100 text-amber-800 border-amber-200"
                      : "bg-blue-100 text-blue-800 border-blue-200"
                  }`}>
                    {trackingResult.status.replace(/-/g, " ")}
                  </Badge>
                </CardHeader>
                <CardContent className="p-6 flex flex-col gap-6">
                  {/* Summary Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs bg-slate-50/50 p-4 rounded-lg border border-border">
                    <div>
                      <span className="text-muted-foreground block font-medium">Shipper</span>
                      <strong className="text-slate-800">{trackingResult.details.shipperName}</strong>
                    </div>
                    <div>
                      <span className="text-muted-foreground block font-medium">Receiver</span>
                      <strong className="text-slate-800">{trackingResult.details.receiverName}</strong>
                    </div>
                    <div>
                      <span className="text-muted-foreground block font-medium">Service Type</span>
                      <strong className="text-slate-800">{trackingResult.details.serviceType}</strong>
                    </div>
                    <div>
                      <span className="text-muted-foreground block font-medium">Route</span>
                      <strong className="text-slate-800 shrink-0">{trackingResult.details.origin.split(',')[0]} ➜ {trackingResult.details.destination.split(',')[0]}</strong>
                    </div>
                  </div>

                  {/* Stepper Timeline */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">Transit Progress Logs</h4>
                    <div className="relative border-l border-primary/20 ml-2 pl-6 flex flex-col gap-6">
                      {trackingResult.details.history.map((log, index) => (
                        <div key={index} className="relative">
                          {/* Dot marker */}
                          <div className={`absolute left-[-31px] top-1.5 h-4.5 w-4.5 rounded-full border-2 bg-white flex items-center justify-center ${
                            index === 0 
                              ? "border-primary scale-110 shadow-sm" 
                              : "border-primary/40"
                          }`}>
                            {index === 0 && <div className="h-1.5 w-1.5 rounded-full bg-primary animate-ping" />}
                          </div>
                          {/* Log content */}
                          <div className="flex flex-col gap-0.5">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-semibold text-slate-500">{log.date} at {log.time}</span>
                              <Badge variant="outline" className="text-[10px] py-0 px-2 font-medium bg-slate-100 text-slate-700">{log.location}</Badge>
                            </div>
                            <p className={`text-sm ${index === 0 ? "font-semibold text-slate-900" : "text-slate-600"}`}>
                              {log.activity}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Hero Graphics / Interactive Quote Calculator */}
          <div className="lg:col-span-5 w-full">
            <Card className="glass border-border shadow-xl">
              <CardHeader className="bg-primary/5 border-b border-border">
                <CardTitle className="font-serif font-bold text-xl text-primary">Shipping Cost Estimator</CardTitle>
                <CardDescription className="text-xs">Estimate transit prices and view required documentation immediately.</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleCalculate} className="flex flex-col gap-4">
                  
                  {/* Origin */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-600">Pickup Origin</label>
                    <Select value={origin} onValueChange={setOrigin} required>
                      <SelectTrigger className="w-full bg-white text-slate-800">
                        <SelectValue placeholder="Select Pickup Location" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hyderabad">Hyderabad / Secunderabad</SelectItem>
                        <SelectItem value="mumbai">Mumbai</SelectItem>
                        <SelectItem value="bangalore">Bangalore</SelectItem>
                        <SelectItem value="delhi">Delhi</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Destination */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-600">Destination</label>
                    <Select value={destination} onValueChange={setDestination} required>
                      <SelectTrigger className="w-full bg-white text-slate-800">
                        <SelectValue placeholder="Select Destination" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="india">Domestic (Within India)</SelectItem>
                        <SelectItem value="usa">United States (USA)</SelectItem>
                        <SelectItem value="uk">United Kingdom (UK)</SelectItem>
                        <SelectItem value="uae">United Arab Emirates (UAE)</SelectItem>
                        <SelectItem value="canada">Canada</SelectItem>
                        <SelectItem value="australia">Australia</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Weight & Content Type */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-slate-600">Weight (Est. kg)</label>
                      <Input
                        type="number"
                        placeholder="e.g. 5"
                        min="0.5"
                        step="0.5"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        className="bg-white text-slate-800"
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-slate-600">Shipment Type</label>
                      <Select value={itemType} onValueChange={setItemType} required>
                        <SelectTrigger className="w-full bg-white text-slate-800">
                          <SelectValue placeholder="Select Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="document">Documents / Files</SelectItem>
                          <SelectItem value="parcel">General Parcel</SelectItem>
                          <SelectItem value="medicine">Medicines Shipping</SelectItem>
                          <SelectItem value="food">Homemade Foods / Sweets</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button type="submit" className="w-full bg-primary hover:bg-secondary text-primary-foreground font-semibold mt-2 cursor-pointer shadow">
                    Calculate Estimate
                  </Button>
                </form>

                {/* Estimate Result Display */}
                {estimation && (
                  <div className="mt-6 pt-6 border-t border-dashed border-border flex flex-col gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex justify-between items-center bg-primary/5 p-4 rounded-lg border border-primary/10">
                      <div>
                        <span className="text-xs text-muted-foreground font-medium block">Estimated Price</span>
                        <strong className="text-2xl text-primary font-black">₹{estimation.price.toLocaleString()}</strong>
                        <span className="text-[10px] text-muted-foreground block">*Excluding customs duties at destination</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-muted-foreground font-medium block">Transit Time</span>
                        <strong className="text-sm text-slate-800 font-bold block">{estimation.days}</strong>
                      </div>
                    </div>

                    {/* Docs Requirement Alert */}
                    <div className="flex flex-col gap-2 p-3 bg-amber-50/50 rounded-lg border border-amber-200/50 text-xs">
                      <span className="font-bold text-amber-800 flex items-center gap-1.5">
                        <FileText className="h-4 w-4" /> Required Documentation
                      </span>
                      <ul className="list-disc pl-4 flex flex-col gap-1 text-amber-950 font-medium">
                        {estimation.docs.map((doc, idx) => (
                          <li key={idx}>{doc}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Trust Badges / Stats Section */}
      <section className="bg-primary py-12 text-primary-foreground px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div className="flex flex-col items-center gap-2">
            <Globe className="h-10 w-10 text-accent animate-pulse" />
            <strong className="text-3xl font-black">190+</strong>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-200">Countries Connected</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Truck className="h-10 w-10 text-accent" />
            <strong className="text-3xl font-black">50,000+</strong>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-200">Successful Deliveries</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Users className="h-10 w-10 text-accent" />
            <strong className="text-3xl font-black">99.8%</strong>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-200">Customer Satisfaction</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Award className="h-10 w-10 text-accent" />
            <strong className="text-3xl font-black">15+</strong>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-200">Years of Experience</span>
          </div>
        </div>
      </section>

      {/* Services Showcase */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center flex flex-col gap-4 mb-16">
          <Badge className="w-fit self-center bg-primary/10 text-primary border-primary/20 text-xs px-3 py-1 font-semibold rounded-full uppercase tracking-wider">
            Premium Courier Solutions
          </Badge>
          <h2 className="font-serif font-black text-3xl sm:text-4xl text-slate-900">
            Adapting to All Your Global Needs
          </h2>
          <p className="text-slate-600 max-w-xl mx-auto text-sm sm:text-base">
            We operate fully integrated shipping loops spanning international document express, specialized medicine transport, student baggage, and household delicacies.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {/* Card 1: Medicine shipping */}
          <Card className="hover:shadow-xl transition-all border border-border group overflow-hidden">
            <CardHeader className="relative pb-0">
              <div className="h-12 w-12 rounded-lg bg-red-50 text-red-600 flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 transition-transform">
                <Compass className="h-6 w-6" />
              </div>
              <CardTitle className="text-slate-900 font-bold group-hover:text-primary transition-colors">Specialized Medicine Shipping</CardTitle>
              <CardDescription className="text-xs mt-1">Global logistics for critical personal medications.</CardDescription>
            </CardHeader>
            <CardContent className="pt-4 text-sm text-slate-600 leading-relaxed">
              We safely courier critical healthcare medications from Hyderabad globally (USA, UK, Canada, UAE) with certified temperature-controlled and accelerated logistics. Complete documentation guidance provided.
            </CardContent>
            <CardFooter className="border-t border-border mt-4 py-3.5 bg-slate-50/50 flex justify-between items-center text-xs font-semibold text-primary">
              <span>Doctor-Prescription courier loop</span>
              <ChevronRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
            </CardFooter>
          </Card>

          {/* Card 2: Student Express */}
          <Card className="hover:shadow-xl transition-all border border-border group overflow-hidden">
            <CardHeader className="relative pb-0">
              <div className="h-12 w-12 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 transition-transform">
                <Plane className="h-6 w-6" />
              </div>
              <CardTitle className="text-slate-900 font-bold group-hover:text-primary transition-colors">Student Express Baggage</CardTitle>
              <CardDescription className="text-xs mt-1">Discounted shipping for students going abroad.</CardDescription>
            </CardHeader>
            <CardContent className="pt-4 text-sm text-slate-600 leading-relaxed">
              Moving for education? Send university documentation, excess luggage, textbooks, and personal items at highly subsidized rates. Includes door-to-door tracking and remote custom assistance.
            </CardContent>
            <CardFooter className="border-t border-border mt-4 py-3.5 bg-slate-50/50 flex justify-between items-center text-xs font-semibold text-primary">
              <span>Subsidized student rates</span>
              <ChevronRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
            </CardFooter>
          </Card>

          {/* Card 3: Homemade Delicacies */}
          <Card className="hover:shadow-xl transition-all border border-border group overflow-hidden">
            <CardHeader className="relative pb-0">
              <div className="h-12 w-12 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 transition-transform">
                <Ship className="h-6 w-6" />
              </div>
              <CardTitle className="text-slate-900 font-bold group-hover:text-primary transition-colors">Household Foods & Sweets</CardTitle>
              <CardDescription className="text-xs mt-1">Send a taste of home to relatives abroad.</CardDescription>
            </CardHeader>
            <CardContent className="pt-4 text-sm text-slate-600 leading-relaxed">
              Ship authentic homemade foods, pickles, snacks, spices, and traditional sweets safely. We employ vacuum-packing, sanitization, and accelerated delivery paths to guarantee freshness on arrival.
            </CardContent>
            <CardFooter className="border-t border-border mt-4 py-3.5 bg-slate-50/50 flex justify-between items-center text-xs font-semibold text-primary">
              <span>Vacuum-sealed freshness path</span>
              <ChevronRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
            </CardFooter>
          </Card>

          {/* Card 4: Domestic Express */}
          <Card className="hover:shadow-xl transition-all border border-border group overflow-hidden">
            <CardHeader className="relative pb-0">
              <div className="h-12 w-12 rounded-lg bg-slate-50 text-slate-700 flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 transition-transform">
                <Truck className="h-6 w-6" />
              </div>
              <CardTitle className="text-slate-900 font-bold group-hover:text-primary transition-colors">Domestic Document & Cargo</CardTitle>
              <CardDescription className="text-xs mt-1">Connecting states and metros within India.</CardDescription>
            </CardHeader>
            <CardContent className="pt-4 text-sm text-slate-600 leading-relaxed">
              Express domestic courier for urgent documents, business letters, and parcels. Our cargo network (surface and air) covers almost every zip code in India, backed by rapid schedules.
            </CardContent>
            <CardFooter className="border-t border-border mt-4 py-3.5 bg-slate-50/50 flex justify-between items-center text-xs font-semibold text-primary">
              <span>India-wide express reach</span>
              <ChevronRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
            </CardFooter>
          </Card>

          {/* Card 5: Air & Sea Cargo */}
          <Card className="hover:shadow-xl transition-all border border-border group overflow-hidden">
            <CardHeader className="relative pb-0">
              <div className="h-12 w-12 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 transition-transform">
                <Globe className="h-6 w-6" />
              </div>
              <CardTitle className="text-slate-900 font-bold group-hover:text-primary transition-colors">Global Freight Air & Sea Cargo</CardTitle>
              <CardDescription className="text-xs mt-1">Bulk shipments for business scaling.</CardDescription>
            </CardHeader>
            <CardContent className="pt-4 text-sm text-slate-600 leading-relaxed">
              Custom-tailored warehousing and bulk cargo transport. Perfect for businesses needing LCL/FCL ocean shipping or scheduled international air cargo freights, backed by customs clearance brokers.
            </CardContent>
            <CardFooter className="border-t border-border mt-4 py-3.5 bg-slate-50/50 flex justify-between items-center text-xs font-semibold text-primary">
              <span>LCL/FCL shipping solutions</span>
              <ChevronRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
            </CardFooter>
          </Card>

          {/* Card 6: Secure Protection */}
          <Card className="hover:shadow-xl transition-all border border-border group overflow-hidden">
            <CardHeader className="relative pb-0">
              <div className="h-12 w-12 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 transition-transform">
                <Shield className="h-6 w-6" />
              </div>
              <CardTitle className="text-slate-900 font-bold group-hover:text-primary transition-colors">Transit Safety & Insurance</CardTitle>
              <CardDescription className="text-xs mt-1">Protecting high-value shipments.</CardDescription>
            </CardHeader>
            <CardContent className="pt-4 text-sm text-slate-600 leading-relaxed">
              We treat your consignments with meticulous care. Get optional transit cargo insurance options for expensive goods, computers, documents, and heavy machinery, guaranteeing total financial peace of mind.
            </CardContent>
            <CardFooter className="border-t border-border mt-4 py-3.5 bg-slate-50/50 flex justify-between items-center text-xs font-semibold text-primary">
              <span>Full value insurance options</span>
              <ChevronRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
            </CardFooter>
          </Card>

        </div>
      </section>

      {/* How it Works / Interactive Journey Timeline */}
      <section className="bg-slate-50 py-24 px-4 sm:px-6 lg:px-8 border-y border-border">
        <div className="max-w-7xl mx-auto">
          <div className="text-center flex flex-col gap-4 mb-20">
            <Badge className="w-fit self-center bg-primary/10 text-primary border-primary/20 text-xs px-3 py-1 font-semibold rounded-full uppercase tracking-wider">
              Transit Pipeline
            </Badge>
            <h2 className="font-serif font-black text-3xl sm:text-4xl text-slate-900">
              How We Deliver Beyond Borders
            </h2>
            <p className="text-slate-600 max-w-lg mx-auto text-sm">
              Our structured transit workflow ensures error-free shipping from pickup to final handshake.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative after:hidden md:after:block after:content-[''] after:absolute after:top-[44px] after:left-[10%] after:right-[10%] after:h-0.5 after:bg-slate-200 after:z-0">
            
            {/* Step 1 */}
            <div className="flex flex-col items-center text-center gap-4 relative z-10">
              <div className="h-20 w-20 rounded-full bg-white border-2 border-primary shadow-md flex items-center justify-center font-bold text-lg text-primary hover:scale-105 transition-transform">
                <FileText className="h-8 w-8 text-primary" />
              </div>
              <div className="flex flex-col gap-1.5">
                <strong className="text-base text-slate-950">1. Instant Booking</strong>
                <p className="text-xs text-slate-500 px-4 leading-relaxed">Book online or call our Begumpet office to schedule customized packaging.</p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center text-center gap-4 relative z-10">
              <div className="h-20 w-20 rounded-full bg-white border-2 border-primary shadow-md flex items-center justify-center font-bold text-lg text-primary hover:scale-105 transition-transform">
                <Truck className="h-8 w-8 text-primary" />
              </div>
              <div className="flex flex-col gap-1.5">
                <strong className="text-base text-slate-950">2. Free Door Pickup</strong>
                <p className="text-xs text-slate-500 px-4 leading-relaxed">Our agents retrieve and weigh your cargo, handling safety wrap locally.</p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center gap-4 relative z-10">
              <div className="h-20 w-20 rounded-full bg-white border-2 border-primary shadow-md flex items-center justify-center font-bold text-lg text-primary hover:scale-105 transition-transform">
                <Plane className="h-8 w-8 text-primary" />
              </div>
              <div className="flex flex-col gap-1.5">
                <strong className="text-base text-slate-950">3. Global Transit</strong>
                <p className="text-xs text-slate-500 px-4 leading-relaxed">Consignment moves via leading airline partners through customs checkpoints.</p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex flex-col items-center text-center gap-4 relative z-10">
              <div className="h-20 w-20 rounded-full bg-white border-2 border-primary shadow-md flex items-center justify-center font-bold text-lg text-primary hover:scale-105 transition-transform">
                <BadgeCheck className="h-8 w-8 text-primary" />
              </div>
              <div className="flex flex-col gap-1.5">
                <strong className="text-base text-slate-950">4. Handover Delivery</strong>
                <p className="text-xs text-slate-500 px-4 leading-relaxed">Courier delivers straight to destination address with digital proof signatures.</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center flex flex-col gap-4 mb-16">
          <Badge className="w-fit self-center bg-primary/10 text-primary border-primary/20 text-xs px-3 py-1 font-semibold rounded-full uppercase tracking-wider">
            Customer Voices
          </Badge>
          <h2 className="font-serif font-black text-3xl sm:text-4xl text-slate-900">
            Trusted by Thousands of Families
          </h2>
          <p className="text-slate-600 max-w-lg mx-auto text-sm">
            Hear from families and businesses who trust us to deliver their valuable parcels across the seas.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Testimonial 1 */}
          <Card className="glass border-border/80 flex flex-col justify-between">
            <CardContent className="pt-6 text-sm text-slate-600 italic leading-relaxed">
              "Over the Sea Courier has been an absolute lifesaver. I had to send critical diabetes medications to my daughter studying in London. They collected the prescription, packaged it perfectly, and it was delivered to her doorstep in just 4 days. Absolutely brilliant service!"
            </CardContent>
            <CardFooter className="border-t border-border mt-4 py-4 flex gap-3 items-center">
              <div className="h-10 w-10 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-sm shrink-0">
                SR
              </div>
              <div>
                <strong className="text-xs font-bold text-slate-950 block">Srinivas Rao</strong>
                <span className="text-[10px] text-muted-foreground block">Secunderabad, India</span>
              </div>
            </CardFooter>
          </Card>

          {/* Testimonial 2 */}
          <Card className="glass border-border/80 flex flex-col justify-between">
            <CardContent className="pt-6 text-sm text-slate-600 italic leading-relaxed">
              "We regular send homemade sweets and pickles to our family in Dallas. Previously we were worried about custom issues or food spoilage. Over the Sea vacuum seals everything at their Begumpet hub. It arrives in Dallas fresh and in pristine condition every time."
            </CardContent>
            <CardFooter className="border-t border-border mt-4 py-4 flex gap-3 items-center">
              <div className="h-10 w-10 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-sm shrink-0">
                PV
              </div>
              <div>
                <strong className="text-xs font-bold text-slate-950 block">Priya Venkat</strong>
                <span className="text-[10px] text-muted-foreground block">Gachibowli, Hyderabad</span>
              </div>
            </CardFooter>
          </Card>

          {/* Testimonial 3 */}
          <Card className="glass border-border/80 flex flex-col justify-between">
            <CardContent className="pt-6 text-sm text-slate-600 italic leading-relaxed">
              "I shipped my college applications and excess baggage to Melbourne. They gave me a special student discount which made it much cheaper than the standard DHL rates. The customer support on WhatsApp was extremely responsive throughout the shipment journey."
            </CardContent>
            <CardFooter className="border-t border-border mt-4 py-4 flex gap-3 items-center">
              <div className="h-10 w-10 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-sm shrink-0">
                AR
              </div>
              <div>
                <strong className="text-xs font-bold text-slate-950 block">Ananya Reddy</strong>
                <span className="text-[10px] text-muted-foreground block">Student, Melbourne University</span>
              </div>
            </CardFooter>
          </Card>
        </div>
      </section>

      {/* Modern Call to Action (CTA) */}
      <section className="bg-gradient-to-r from-slate-950 via-slate-900 to-primary py-20 px-4 sm:px-6 lg:px-8 text-center text-white border-t border-slate-900">
        <div className="max-w-4xl mx-auto flex flex-col gap-6">
          <h2 className="font-serif font-black text-3xl sm:text-4xl">Ready to Ship Beyond Borders?</h2>
          <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Get in touch with our team today to arrange a free pickup, request custom commercial cargo quotes, or understand customs guidelines.
          </p>
          <div className="flex justify-center gap-4 mt-4 flex-wrap">
            <Button asChild size="lg" className="rounded-full bg-white hover:bg-slate-100 text-slate-900 font-bold px-8 shadow cursor-pointer">
              <Link href="/contact">Book A Pickup</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-full border-white/40 hover:bg-white/10 text-white font-bold px-8 cursor-pointer">
              <Link href="/services">Explore Services</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
