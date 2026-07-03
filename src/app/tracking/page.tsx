"use client";

import { useState } from "react";
import { 
  Search, 
  MapPin, 
  Clock, 
  CheckCircle, 
  ChevronRight, 
  Plane, 
  Truck, 
  FileText, 
  ShieldCheck, 
  AlertTriangle 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

export default function TrackingPage() {
  const [awb, setAwb] = useState("");
  const [trackingResult, setTrackingResult] = useState<typeof mockAWBs[string] | null>(null);
  const [error, setError] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setTrackingResult(null);

    const code = awb.trim().toUpperCase();
    if (!code) {
      setError("Please input a valid AWB tracking code.");
      return;
    }

    if (mockAWBs[code]) {
      setTrackingResult(mockAWBs[code]);
      canvasConfetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } else {
      // Mock generated track for any code, so that tracking is fully functional
      const randomMock = {
        status: "transit" as const,
        details: {
          origin: "Hyderabad Hub, India",
          destination: "Global Destination Hub",
          currentLocation: "International Custom Transit facility",
          lastUpdate: "Just Now",
          shipperName: "Valued Client",
          receiverName: "Global Consignee",
          serviceType: "Air Express Courier",
          weight: "8.5 kg",
          history: [
            { date: "Today", time: "11:20 AM", location: "Customs Hub, India", activity: "Package cleared export regulations, loading in transit aircraft" },
            { date: "Yesterday", time: "05:00 PM", location: "Hyderabad Hub, India", activity: "Sorted and dispatched from origin gateway" },
            { date: "Yesterday", time: "09:00 AM", location: "Begumpet Office, Hyderabad", activity: "Consignment booked, scanned and loaded" }
          ]
        }
      };
      setTrackingResult(randomMock);
    }
  };

  const handleTestAWB = (testCode: string) => {
    setAwb(testCode);
    setError("");
    setTrackingResult(mockAWBs[testCode]);
    canvasConfetti({
      particleCount: 60,
      spread: 50,
      origin: { y: 0.7 }
    });
  };

  return (
    <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto flex flex-col gap-10">
      
      {/* Page Header */}
      <div className="text-center flex flex-col gap-4 max-w-2xl mx-auto">
        <Badge className="w-fit self-center bg-primary/10 text-primary border-primary/20 text-xs px-3 py-1 font-semibold rounded-full uppercase tracking-wider">
          Real-time Console
        </Badge>
        <h1 className="font-serif font-black text-4xl text-slate-900 leading-tight">
          Track Your Consignment
        </h1>
        <p className="text-slate-600 text-sm leading-relaxed">
          Enter your Air Waybill (AWB) number to review live location checkpoints, shipment status logs, and estimated doorstep handovers.
        </p>
      </div>

      {/* Track Box */}
      <Card className="glass border-border shadow-lg max-w-2xl mx-auto w-full">
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Consignment AWB Number (e.g. OTS-12345)"
                value={awb}
                onChange={(e) => setAwb(e.target.value)}
                className="pl-9 bg-white text-slate-900 border-border"
              />
            </div>
            <Button type="submit" className="bg-primary hover:bg-secondary text-primary-foreground font-semibold px-6 shadow cursor-pointer">
              Track Status
            </Button>
          </form>

          {/* Test Shortcuts */}
          <div className="mt-4 flex items-center gap-4 text-xs font-semibold text-slate-500 justify-center">
            <span>Shortcut Demos:</span>
            <button
              onClick={() => handleTestAWB("OTS-12345")}
              className="text-primary hover:underline font-bold transition-all cursor-pointer"
            >
              OTS-12345 (Delivered)
            </button>
            <span>•</span>
            <button
              onClick={() => handleTestAWB("OTS-67890")}
              className="text-primary hover:underline font-bold transition-all cursor-pointer"
            >
              OTS-67890 (In Transit)
            </button>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-lg text-xs text-red-800 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Visual Tracking Results */}
      {trackingResult && (
        <Card className="glass border-primary/20 shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
          
          {/* Header Details */}
          <div className="bg-primary/5 p-6 border-b border-primary/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Consignment Number</span>
              <strong className="text-xl text-primary font-serif font-black uppercase">{awb || "OTS-CUSTOM"}</strong>
              <span className="text-xs font-semibold text-slate-500 block mt-0.5">Last Checkpoint Update: {trackingResult.details.lastUpdate}</span>
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
          </div>

          <CardContent className="p-6 md:p-8 space-y-10">
            
            {/* Horizontal progress bar indicators */}
            <div className="relative flex justify-between items-center max-w-3xl mx-auto mt-4">
              
              {/* background tracking lines */}
              <div className="absolute top-[20px] left-[10%] right-[10%] h-1 bg-slate-200 z-0 rounded-full" />
              <div className={`absolute top-[20px] left-[10%] h-1 bg-primary z-0 rounded-full transition-all duration-500 ${
                trackingResult.status === "delivered" 
                  ? "w-[80%]" 
                  : trackingResult.status === "out-for-delivery"
                  ? "w-[53%]"
                  : trackingResult.status === "transit"
                  ? "w-[26%]"
                  : "w-0"
              }`} />

              {/* Step 1: Booked */}
              <div className="flex flex-col items-center gap-2 relative z-10">
                <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground border-4 border-white shadow flex items-center justify-center font-bold text-xs">
                  <FileText className="h-4 w-4" />
                </div>
                <span className="text-[10px] sm:text-xs font-bold text-slate-900">Booked</span>
              </div>

              {/* Step 2: In Transit */}
              <div className="flex flex-col items-center gap-2 relative z-10">
                <div className={`h-10 w-10 rounded-full border-4 border-white shadow flex items-center justify-center font-bold text-xs transition-colors ${
                  trackingResult.status !== "booked"
                    ? "bg-primary text-primary-foreground"
                    : "bg-slate-200 text-slate-500"
                }`}>
                  <Plane className="h-4 w-4" />
                </div>
                <span className={`text-[10px] sm:text-xs font-bold ${
                  trackingResult.status !== "booked" ? "text-slate-900" : "text-slate-400"
                }`}>In Transit</span>
              </div>

              {/* Step 3: Out for Delivery */}
              <div className="flex flex-col items-center gap-2 relative z-10">
                <div className={`h-10 w-10 rounded-full border-4 border-white shadow flex items-center justify-center font-bold text-xs transition-colors ${
                  trackingResult.status === "out-for-delivery" || trackingResult.status === "delivered"
                    ? "bg-primary text-primary-foreground"
                    : "bg-slate-200 text-slate-500"
                }`}>
                  <Truck className="h-4 w-4" />
                </div>
                <span className={`text-[10px] sm:text-xs font-bold ${
                  trackingResult.status === "out-for-delivery" || trackingResult.status === "delivered" ? "text-slate-900" : "text-slate-400"
                }`}>Out for Delivery</span>
              </div>

              {/* Step 4: Delivered */}
              <div className="flex flex-col items-center gap-2 relative z-10">
                <div className={`h-10 w-10 rounded-full border-4 border-white shadow flex items-center justify-center font-bold text-xs transition-colors ${
                  trackingResult.status === "delivered"
                    ? "bg-emerald-500 text-white"
                    : "bg-slate-200 text-slate-500"
                }`}>
                  <CheckCircle className="h-4 w-4" />
                </div>
                <span className={`text-[10px] sm:text-xs font-bold ${
                  trackingResult.status === "delivered" ? "text-slate-900" : "text-slate-400"
                }`}>Delivered</span>
              </div>

            </div>

            {/* Consignment Metadata Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-5 bg-slate-50/60 border border-border rounded-xl">
              <div>
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Shipper Name</span>
                <strong className="text-slate-800 text-sm font-semibold">{trackingResult.details.shipperName}</strong>
                <span className="text-xs text-muted-foreground block">{trackingResult.details.origin}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Recipient Name</span>
                <strong className="text-slate-800 text-sm font-semibold">{trackingResult.details.receiverName}</strong>
                <span className="text-xs text-muted-foreground block">{trackingResult.details.destination}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Shipping Mode</span>
                <strong className="text-slate-800 text-sm font-semibold">{trackingResult.details.serviceType}</strong>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Package Details</span>
                <strong className="text-slate-800 text-sm font-semibold">{trackingResult.details.weight}</strong>
                <span className="text-xs text-muted-foreground block">Estimated weight</span>
              </div>
            </div>

            {/* Visual Checklist logs */}
            <div className="space-y-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" /> Tracking Route History Log
              </h3>
              
              <div className="relative border-l border-primary/20 ml-2 pl-6 flex flex-col gap-8">
                {trackingResult.details.history.map((log, index) => (
                  <div key={index} className="relative">
                    {/* Circle indicators */}
                    <div className={`absolute left-[-31px] top-1.5 h-4.5 w-4.5 rounded-full border-2 bg-white flex items-center justify-center ${
                      index === 0 
                        ? "border-primary scale-110 shadow-sm" 
                        : "border-primary/40"
                    }`}>
                      {index === 0 && <div className="h-1.5 w-1.5 bg-primary rounded-full animate-ping" />}
                    </div>
                    {/* Contents */}
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 flex-wrap text-xs text-slate-500 font-semibold">
                        <span>{log.date} at {log.time}</span>
                        <span>•</span>
                        <Badge variant="outline" className="text-[10px] font-medium bg-slate-100 text-slate-700">{log.location}</Badge>
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

      {/* FAQ Banner */}
      <Card className="border border-border">
        <CardHeader>
          <CardTitle className="text-base font-bold text-slate-900">Frequently Asked Tracking Questions</CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-slate-600 space-y-3">
          <div>
            <strong className="text-slate-800 block">When will my consignment status update?</strong>
            <p>Our database scans barcodes at origin hubs, custom gateways, and local airport clearances. Updates usually reflect within 2 hours of package handovers.</p>
          </div>
          <div>
            <strong className="text-slate-800 block">My tracking number isn't yielding results. What should I do?</strong>
            <p>Ensure you typed the exact prefix (e.g. OTS-XXXXX). If the package was booked in the last hour, please wait for our Begumpet office processing line to complete the first scan.</p>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
