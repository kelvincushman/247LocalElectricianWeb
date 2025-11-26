import { useState } from "react";
import { Phone, Menu, X, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/about", label: "About Us" },
    { to: "/services", label: "Services" },
    { to: "/service-areas", label: "Areas" },
    { to: "/gallery", label: "Gallery" },
    { to: "/blog", label: "Blog" },
    { to: "/contact", label: "Contact" },
  ];

  return (
    <>
      {/* Emergency Top Bar */}
      <div className="bg-emergency text-emergency-foreground py-2 sticky top-0 z-50 shadow-md">
        <div className="container mx-auto px-4 flex items-center justify-center gap-4 font-bold text-sm">
          <a href="tel:01234567890" className="flex items-center gap-2 hover:underline">
            <Phone className="h-4 w-4" />
            24/7 EMERGENCY: 01234 567 890
          </a>
          <span className="hidden sm:inline">|</span>
          <a
            href="https://wa.me/441234567890"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-2 hover:underline"
          >
            <MessageCircle className="h-4 w-4" />
            WhatsApp
          </a>
        </div>
      </div>

      {/* Main Navigation */}
      <header className="bg-background border-b border-border sticky top-10 z-40 shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="text-2xl md:text-3xl font-black">
                <span className="text-emergency">24/7</span>
                <span className="text-primary">LocalElectrician</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="text-foreground hover:text-primary font-semibold px-3 py-2 rounded-md hover:bg-muted transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Desktop CTA Buttons */}
            <div className="hidden lg:flex items-center gap-2">
              <a href="https://wa.me/441234567890" target="_blank" rel="noopener noreferrer">
                <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white font-bold">
                  <MessageCircle className="mr-1 h-4 w-4" />
                  WhatsApp
                </Button>
              </a>
              <a href="tel:01234567890">
                <Button size="sm" className="bg-emergency hover:bg-emergency/90 text-emergency-foreground font-bold">
                  <Phone className="mr-1 h-4 w-4" />
                  Call Now
                </Button>
              </a>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2 rounded-md hover:bg-muted"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <nav className="lg:hidden pt-4 pb-2 border-t mt-3">
              <div className="flex flex-col gap-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="text-foreground hover:text-primary font-semibold px-3 py-3 rounded-md hover:bg-muted transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="flex gap-2 mt-4 pt-4 border-t">
                  <a href="https://wa.me/441234567890" target="_blank" rel="noopener noreferrer" className="flex-1">
                    <Button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold">
                      <MessageCircle className="mr-2 h-4 w-4" />
                      WhatsApp
                    </Button>
                  </a>
                  <a href="tel:01234567890" className="flex-1">
                    <Button className="w-full bg-emergency hover:bg-emergency/90 text-emergency-foreground font-bold">
                      <Phone className="mr-2 h-4 w-4" />
                      Call
                    </Button>
                  </a>
                </div>
              </div>
            </nav>
          )}
        </div>
      </header>
    </>
  );
};

export default Header;
