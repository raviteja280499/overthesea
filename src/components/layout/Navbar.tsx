"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronDown, Ship, Globe, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navItems = [
  { name: "Home", path: "/" },
  { name: "About Us", path: "/about" },
  {
    name: "Services",
    path: "/services",
    dropdown: [
      { name: "Domestic Cargo", path: "/services#domestic" },
      { name: "International Courier", path: "/services#international" },
      { name: "Medicine Shipping", path: "/services#specialized" },
      { name: "Student Express", path: "/services#specialized" },
    ],
  },
  { name: "Track Shipment", path: "/tracking" },
  { name: "Contact Us", path: "/contact" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 glass">
      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative h-12 w-12 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Image
              src="/logo.jpg.jpeg"
              alt="Over the Sea Logo"
              width={48}
              height={48}
              className="object-contain"
              priority
            />
          </div>
          <div className="flex flex-col">
            <span className="font-serif font-black text-xl tracking-tight text-primary leading-none group-hover:text-secondary transition-colors">
              Over the sea
            </span>
            <span className="font-sans text-[10px] tracking-[0.18em] uppercase text-muted-foreground font-semibold">
              Global Courier Services
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-8">
          {navItems.map((item) => {
            if (item.dropdown) {
              return (
                <DropdownMenu key={item.name}>
                  <DropdownMenuTrigger className="flex items-center gap-1 text-sm font-semibold text-foreground/80 hover:text-primary transition-colors focus:outline-none cursor-pointer">
                    {item.name}
                    <ChevronDown className="h-4 w-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 glass mt-1">
                    {item.dropdown.map((subItem) => (
                      <DropdownMenuItem key={subItem.name} asChild>
                        <Link
                          href={subItem.path}
                          className="w-full text-sm hover:text-primary hover:bg-muted/50 cursor-pointer"
                        >
                          {subItem.name}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              );
            }

            const isActive = pathname === item.path;
            return (
              <Link
                key={item.name}
                href={item.path}
                className={`text-sm font-semibold transition-colors hover:text-primary ${
                  isActive ? "text-primary border-b-2 border-primary pb-1" : "text-foreground/80"
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Action Button */}
        <div className="hidden lg:block">
          <Button asChild size="default" className="shadow-md hover:shadow-lg transition-all rounded-full bg-primary hover:bg-secondary text-primary-foreground font-semibold">
            <Link href="/contact?type=quote">Get a Quote</Link>
          </Button>
        </div>

        {/* Mobile Menu Toggle */}
        <div className="lg:hidden">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-foreground hover:bg-muted/50">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 glass border-l border-border/40">
              <SheetHeader className="text-left pb-4 border-b border-border/20">
                <SheetTitle className="flex items-center gap-2">
                  <div className="h-9 w-9 flex items-center justify-center">
                    <Image
                      src="/logo.jpg.jpeg"
                      alt="Over the Sea Logo"
                      width={36}
                      height={36}
                      className="object-contain"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-serif font-black text-base text-primary leading-none">
                      Over the sea
                    </span>
                    <span className="font-sans text-[8px] tracking-[0.15em] uppercase text-muted-foreground">
                      Global Courier Services
                    </span>
                  </div>
                </SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-6 py-6 h-[calc(100vh-100px)] justify-between">
                <div className="flex flex-col gap-4">
                  {navItems.map((item) => (
                    <div key={item.name} className="flex flex-col">
                      {item.dropdown ? (
                        <div className="flex flex-col gap-2">
                          <span className="text-sm font-semibold text-muted-foreground px-2">
                            {item.name}
                          </span>
                          <div className="pl-4 flex flex-col gap-2 border-l border-border/60 ml-2">
                            {item.dropdown.map((subItem) => (
                              <Link
                                key={subItem.name}
                                href={subItem.path}
                                onClick={() => setIsOpen(false)}
                                className="text-sm font-medium py-1 px-2 text-foreground/80 hover:text-primary transition-colors hover:bg-muted/30 rounded"
                              >
                                {subItem.name}
                              </Link>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <Link
                          href={item.path}
                          onClick={() => setIsOpen(false)}
                          className={`text-sm font-semibold py-2 px-2 transition-all rounded hover:bg-muted/30 hover:text-primary ${
                            pathname === item.path ? "text-primary bg-muted/40 font-bold" : "text-foreground/80"
                          }`}
                        >
                          {item.name}
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex flex-col gap-4 pt-4 border-t border-border/20">
                  <div className="flex flex-col gap-2 text-xs text-muted-foreground px-2">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Phone className="h-3.5 w-3.5 text-primary" />
                      Domestic: +91 77027 70288
                    </span>
                    <span className="flex items-center gap-1.5 font-medium">
                      <Globe className="h-3.5 w-3.5 text-secondary" />
                      Intl: +91 77997 71387
                    </span>
                  </div>
                  <Button asChild onClick={() => setIsOpen(false)} className="w-full bg-primary hover:bg-secondary text-primary-foreground font-semibold">
                    <Link href="/contact?type=quote">Get a Quote</Link>
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
