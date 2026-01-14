import Link from "next/link";
import { MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t bg-secondary/30">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Brand */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <MapPin className="h-5 w-5 text-primary" />
              <span className="text-lg font-bold">Apna Safar</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Smart public transport navigation for Lahore. Find the fastest
              route using buses, metro & walking.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/plan" className="text-muted-foreground hover:text-primary">
                  Plan Route
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-muted-foreground hover:text-primary">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/saved" className="text-muted-foreground hover:text-primary">
                  Saved Routes
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4">Contact</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/privacy" className="hover:text-primary">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t pt-6 text-center text-sm text-muted-foreground">
          <p>
            Built for Lahore 🇵🇰 | © {new Date().getFullYear()} Apna Safar. All
            rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

