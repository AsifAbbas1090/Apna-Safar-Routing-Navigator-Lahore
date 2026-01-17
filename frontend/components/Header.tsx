"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { MapPin, Menu, X, ChevronDown } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useRouteStore } from "@/store/routeStore";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SUPPORTED_CITIES } from "@/lib/cities";

export default function Header() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated } = useAuthStore();
  const { selectedCity, setSelectedCity } = useRouteStore();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "/plan", label: "Plan Route" },
    { href: "/services", label: "Services" },
    { href: "/contact", label: "Contact Us" },
  ];

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isScrolled || pathname !== "/"
          ? "bg-white shadow-md"
          : "bg-transparent"
      }`}
    >
      <nav className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <MapPin className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold text-foreground">Apna Safar</span>
          <span className="text-xs text-muted-foreground hidden sm:inline">by <span className="text-[#556B2F] font-semibold">SynkSpace</span></span>
        </Link>

        {/* City Selector */}
        <div className="hidden md:flex items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <MapPin className="h-4 w-4" />
                <span>{selectedCity?.name || "Select City"}</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {SUPPORTED_CITIES.map((city) => (
                <DropdownMenuItem
                  key={city.id}
                  onClick={() => setSelectedCity(city)}
                  className={selectedCity?.id === city.id ? "bg-muted" : ""}
                >
                  {city.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden items-center space-x-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors ${
                link.href === '/contact'
                  ? 'text-black hover:text-white hover:bg-[#556B2F] px-3 py-1.5 rounded'
                  : pathname === link.href 
                    ? "text-primary" 
                    : "text-foreground hover:text-primary"
              }`}
            >
              {link.label}
            </Link>
          ))}
          {isAuthenticated ? (
            <>
              <Link href="/dashboard">
                <Button variant="outline" size="sm" className="text-black hover:bg-[#556B2F] hover:text-white transition-colors">
                  Dashboard
                </Button>
              </Link>
              <Link href="/plan">
                <Button size="sm" className="bg-[#556B2F] hover:bg-[#6B7F3F] text-white">Start Navigation</Button>
              </Link>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="outline" size="sm" className="text-black hover:bg-[#556B2F] hover:text-white transition-colors">
                  Login
                </Button>
              </Link>
              <Link href="/plan">
                <Button size="sm" className="bg-[#556B2F] hover:bg-[#6B7F3F] text-white">Start Navigation</Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="border-t bg-white md:hidden">
          <div className="container mx-auto space-y-2 px-4 py-4">
            {/* City Selector for Mobile */}
            <div className="pb-2 border-b mb-2">
              <p className="text-xs text-muted-foreground mb-2">Select City</p>
              <div className="grid grid-cols-2 gap-2">
                {SUPPORTED_CITIES.map((cityItem) => (
                  <Button
                    key={cityItem.id}
                    variant={selectedCity?.id === cityItem.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setSelectedCity(cityItem);
                      setIsMobileMenuOpen(false);
                    }}
                    className="text-xs"
                  >
                    {cityItem.name}
                  </Button>
                ))}
              </div>
            </div>
            
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`block py-2 text-sm font-medium ${
                  link.href === '/contact' 
                    ? 'text-black hover:text-white hover:bg-[#556B2F] px-2 rounded transition-colors' 
                    : ''
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="flex flex-col space-y-2 pt-2">
              {isAuthenticated ? (
                <Link href="/dashboard">
                  <Button variant="outline" className="w-full" size="sm">
                    Dashboard
                  </Button>
                </Link>
              ) : (
                <Link href="/login">
                  <Button variant="outline" className="w-full" size="sm">
                    Login
                  </Button>
                </Link>
              )}
              <Link href="/plan">
                <Button className="w-full" size="sm">
                  Start Navigation
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

