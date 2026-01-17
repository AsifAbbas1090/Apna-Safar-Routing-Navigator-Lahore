import Link from "next/link";
import { MapPin, Mail, Phone, Globe } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t bg-black text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <MapPin className="h-5 w-5 text-[#9AB973]" />
              <span className="text-lg font-bold text-white">Apna Safar</span>
            </div>
            <p className="text-sm text-gray-300 mb-4">
              Smart public transport navigation for Pakistan. Find the fastest
              route using buses, metro & walking.
            </p>
            <div className="text-sm">
              <p className="text-gray-400 mb-2">Supported by</p>
              <a 
                href="https://synkspace.io" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[#9AB973] hover:underline font-bold text-lg"
              >
                SynkSpace
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4 text-white">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/plan" className="text-gray-300 hover:text-[#9AB973] transition-colors">
                  Plan Route
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-gray-300 hover:text-[#9AB973] transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/saved" className="text-gray-300 hover:text-[#9AB973] transition-colors">
                  Saved Routes
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-gray-300 hover:text-[#9AB973] transition-colors">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4 text-white">Contact</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/privacy" className="text-gray-300 hover:text-[#9AB973] transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-300 hover:text-[#9AB973] transition-colors">
                  Contact Us
                </Link>
              </li>
              <li className="flex items-center space-x-2 text-gray-300">
                <Mail className="h-4 w-4 text-[#9AB973]" />
                <a href="mailto:synkspace.io@gmail.com" className="hover:text-[#9AB973] transition-colors">
                  synkspace.io@gmail.com
                </a>
              </li>
              <li className="flex items-center space-x-2 text-gray-300">
                <Phone className="h-4 w-4 text-[#9AB973]" />
                <a href="https://wa.me/923143796943" target="_blank" rel="noopener noreferrer" className="hover:text-[#9AB973] transition-colors">
                  +92 314 3796943
                </a>
              </li>
            </ul>
          </div>

          {/* SynkSpace Info */}
          <div>
            <h3 className="font-semibold mb-4 text-white">
              <span className="text-[#9AB973]">SynkSpace</span>
            </h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-center space-x-2">
                <Globe className="h-4 w-4 text-[#9AB973]" />
                <a href="https://synkspace.io" target="_blank" rel="noopener noreferrer" className="hover:text-[#9AB973] transition-colors">
                  synkspace.io
                </a>
              </li>
              <li className="text-gray-400 text-xs mt-4">
                Powered by SynkSpace technology
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-[#556B2F] pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-gray-400 text-center md:text-left">
              Built for Pakistan 🇵🇰 | © {new Date().getFullYear()} Apna Safar. All rights reserved.
            </p>
            <p className="text-sm text-gray-400 text-center md:text-right">
              Supported by <a href="https://synkspace.io" target="_blank" rel="noopener noreferrer" className="text-[#9AB973] hover:underline font-bold">SynkSpace</a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
