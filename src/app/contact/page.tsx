"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Send, 
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import canvasConfetti from "canvas-confetti";

function ContactFormContent() {
  const searchParams = useSearchParams();
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    service: "",
    weight: "",
    message: ""
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  // Pre-fill service type if query params exist
  useEffect(() => {
    const serviceType = searchParams.get("service") || searchParams.get("type");
    if (serviceType) {
      if (serviceType === "domestic") {
        setFormData(prev => ({ ...prev, service: "domestic" }));
      } else if (serviceType === "international") {
        setFormData(prev => ({ ...prev, service: "international" }));
      } else if (serviceType === "specialized") {
        setFormData(prev => ({ ...prev, service: "specialized" }));
      } else if (serviceType === "quote") {
        setFormData(prev => ({ ...prev, service: "quote" }));
      }
    }
  }, [searchParams]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleServiceChange = (val: string) => {
    setFormData(prev => ({ ...prev, service: val }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    // Simple validation
    if (!formData.name || !formData.phone || !formData.message) {
      setError("Please fill in all mandatory fields (*).");
      setIsSubmitting(false);
      return;
    }

    // Mock API Submit
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      
      // Trigger success confetti
      canvasConfetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.5 }
      });
    }, 1200);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
      
      {/* Contact Form */}
      <div className="lg:col-span-7">
        <Card className="glass border-border shadow-xl">
          <CardHeader className="bg-primary/5 border-b border-border/80">
            <CardTitle className="text-xl font-bold text-primary font-serif">Send Us an Enquiry / Schedule Pickup</CardTitle>
            <CardDescription className="text-xs">Fill in your shipping requirements below. Our Begumpet support team will reach out shortly.</CardDescription>
          </CardHeader>
          <CardContent className="p-6 md:p-8">
            {isSubmitted ? (
              <div className="text-center py-10 flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-300">
                <CheckCircle className="h-16 w-16 text-emerald-500" />
                <h3 className="font-serif font-black text-2xl text-slate-900">Enquiry Submitted Successfully!</h3>
                <p className="text-sm text-slate-600 max-w-md mx-auto">
                  Thank you, <strong>{formData.name}</strong>. We have logged your request regarding <strong>{formData.service ? formData.service.toUpperCase() : "General Courier"}</strong>. One of our support managers will call you back on <strong>{formData.phone}</strong> in the next 15-30 minutes.
                </p>
                <Button 
                  onClick={() => {
                    setIsSubmitted(false);
                    setFormData({
                      name: "",
                      email: "",
                      phone: "",
                      service: "",
                      weight: "",
                      message: ""
                    });
                  }}
                  className="mt-4 bg-primary hover:bg-secondary text-primary-foreground font-semibold rounded-full px-6 cursor-pointer"
                >
                  Send Another Enquiry
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {error && (
                  <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-xs text-red-800 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Name */}
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="name" className="text-xs font-bold text-slate-700">Full Name *</Label>
                    <Input
                      id="name"
                      placeholder="e.g. Rahul Reddy"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="bg-white border-border text-slate-900"
                      required
                    />
                  </div>
                  
                  {/* Phone */}
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="phone" className="text-xs font-bold text-slate-700">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="e.g. +91 98480 22338"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="bg-white border-border text-slate-900"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Email */}
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="email" className="text-xs font-bold text-slate-700">Email Address (Optional)</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="e.g. rahul@gmail.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="bg-white border-border text-slate-900"
                    />
                  </div>

                  {/* Service interest */}
                  <div className="flex flex-col gap-2">
                    <Label className="text-xs font-bold text-slate-700">Interest Service</Label>
                    <Select value={formData.service} onValueChange={handleServiceChange}>
                      <SelectTrigger className="bg-white border-border text-slate-800">
                        <SelectValue placeholder="Select Service" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="domestic">Domestic Express Cargo</SelectItem>
                        <SelectItem value="international">International Parcel Courier</SelectItem>
                        <SelectItem value="specialized">Medicine / Vacuumed Foods Shipping</SelectItem>
                        <SelectItem value="quote">General Pricing Quote Enquiry</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Weight */}
                <div className="flex flex-col gap-2">
                  <Label htmlFor="weight" className="text-xs font-bold text-slate-700">Estimated Cargo Weight (Optional, e.g. 5 kg)</Label>
                  <Input
                    id="weight"
                    placeholder="e.g. 15 kg"
                    value={formData.weight}
                    onChange={handleInputChange}
                    className="bg-white border-border text-slate-900"
                  />
                </div>

                {/* Message */}
                <div className="flex flex-col gap-2">
                  <Label htmlFor="message" className="text-xs font-bold text-slate-700">Enquiry details or Package Address *</Label>
                  <Textarea
                    id="message"
                    rows={4}
                    placeholder="State package origin address, destination country, weight, details of medications, food items or documents, and preferred collection date..."
                    value={formData.message}
                    onChange={handleInputChange}
                    className="bg-white border-border text-slate-900"
                    required
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={isSubmitting} 
                  className="w-full bg-primary hover:bg-secondary text-primary-foreground font-semibold py-3 cursor-pointer shadow flex items-center justify-center gap-2"
                >
                  {isSubmitting ? "Submitting Request..." : "Schedule Pickup / Send Inquiry"}
                  <Send className="h-4 w-4" />
                </Button>

              </form>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Contact Details Card */}
      <div className="lg:col-span-5 space-y-6">
        <Card className="border border-border">
          <CardHeader className="bg-slate-50 border-b border-border">
            <CardTitle className="text-base font-bold text-slate-900">Head Office Coordinates</CardTitle>
            <CardDescription className="text-xs">Feel free to drop off packages or coordinate packaging directly.</CardDescription>
          </CardHeader>
          <CardContent className="p-6 flex flex-col gap-6 text-sm text-slate-600">
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <strong>Over the Sea Head Office:</strong>
                <p className="mt-1 font-medium text-slate-700">
                  H.No.1-8-308, E N Plaza, Patigadda Lane,<br />
                  Begumpet, Secunderabad – 500003,<br />
                  Telangana, India.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 border-t border-slate-100 pt-4">
              <Phone className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <strong>Customer Support Lines:</strong>
                <p className="mt-1 font-semibold text-slate-800">
                  Mobile / WhatsApp Support: +91 9052703561
                </p>
                <p className="font-semibold text-slate-800">
                  Domestic: +91 77027 70288 / 89
                </p>
                <p className="font-semibold text-slate-800">
                  International: +91 77997 71387 / 88
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 border-t border-slate-100 pt-4">
              <Mail className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <strong>Email Inboxes:</strong>
                <p className="mt-1 font-semibold text-slate-800">
                  General Info: info@worldfirst.in
                </p>
                <p className="font-semibold text-slate-800">
                  International Cargo: intl@worldfirst.in
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 border-t border-slate-100 pt-4">
              <Clock className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <strong>Working Hours:</strong>
                <p className="mt-1 font-semibold text-slate-800">
                  Monday - Saturday: 9:00 AM - 8:00 PM
                </p>
                <p className="text-xs text-muted-foreground">Sunday: Holiday</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Map Placeholder */}
        <div className="h-60 rounded-xl overflow-hidden border border-border shadow-sm bg-slate-100 flex flex-col items-center justify-center p-6 text-center text-slate-500 relative">
          <MapPin className="h-10 w-10 text-primary mb-2 animate-bounce" />
          <span className="text-xs font-bold text-slate-800">Begumpet Hub Location Map</span>
          <span className="text-[10px] text-slate-400 mt-1">E N Plaza, Patigadda Lane, Begumpet</span>
          <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
        </div>
      </div>

    </div>
  );
}

export default function ContactPage() {
  return (
    <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col gap-12">
      {/* Page Header */}
      <div className="text-center flex flex-col gap-4 max-w-3xl mx-auto">
        <Badge className="w-fit self-center bg-primary/10 text-primary border-primary/20 text-xs px-3 py-1 font-semibold rounded-full uppercase tracking-wider">
          Enquiries Desk
        </Badge>
        <h1 className="font-serif font-black text-4xl sm:text-5xl text-slate-900 leading-tight">
          Let's Plan Your Shipment
        </h1>
        <p className="text-lg text-slate-600 leading-relaxed">
          Need a quick collection or want details on medicine customs forms? Send us a message and our Begumpet office will contact you immediately.
        </p>
      </div>

      <Suspense fallback={<div className="text-center py-10">Loading form content...</div>}>
        <ContactFormContent />
      </Suspense>
    </div>
  );
}
