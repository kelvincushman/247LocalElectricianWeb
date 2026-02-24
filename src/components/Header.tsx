import { useState } from "react";
import { Phone, Menu, X, MessageCircle, ChevronDown, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLandlordsOpen, setIsLandlordsOpen] = useState(false);

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/about", label: "About Us" },
    { to: "/services", label: "Services" },
    { to: "/rate-card", label: "Prices" },
    { to: "/service-areas", label: "Areas" },
    { to: "/gallery", label: "Gallery" },
    { to: "/blog", label: "Blog" },
    { to: "/contact", label: "Contact" },
  ];

  const landlordLinks = [
    { to: "/landlords", label: "Overview", description: "All landlord services" },
    { to: "/landlords/eicr-certificates", label: "EICR Certificates", description: "Electrical safety reports" },
    { to: "/landlords/fire-alarm-testing", label: "Fire Alarm Testing", description: "Annual servicing & install" },
    { to: "/landlords/emergency-lighting-testing", label: "Emergency Lighting", description: "Monthly & annual testing" },
    { to: "/landlords/pat-testing", label: "PAT Testing", description: "Portable appliance testing" },
    { to: "/landlords/smoke-co-detectors", label: "Smoke & CO Alarms", description: "Installation & compliance" },
  ];

  return (
    <>
      {/* Emergency Top Bar */}
      <div className="bg-emergency text-emergency-foreground py-2 sticky top-0 z-50 shadow-md">
        <div className="container mx-auto px-4 flex items-center justify-center gap-4 font-bold text-sm">
          <a href="tel:01902943929" className="flex items-center gap-2 hover:underline">
            <Phone className="h-4 w-4" />
            24/7 EMERGENCY: 01902 943 929
          </a>
          <span className="hidden sm:inline">|</span>
          <a
            href="https://wa.me/441902943929"
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
                <span className="text-primary">247</span>
                <span className="text-emergency">Electrician</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.slice(0, 3).map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="text-foreground hover:text-primary font-semibold px-3 py-2 rounded-md hover:bg-muted transition-colors"
                >
                  {link.label}
                </Link>
              ))}

              {/* Landlords Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setIsLandlordsOpen(true)}
                onMouseLeave={() => setIsLandlordsOpen(false)}
              >
                <button
                  className="flex items-center gap-1 text-foreground hover:text-primary font-semibold px-3 py-2 rounded-md hover:bg-muted transition-colors"
                  onClick={() => setIsLandlordsOpen(!isLandlordsOpen)}
                >
                  <Building2 className="h-4 w-4" />
                  Landlords
                  <ChevronDown className={`h-4 w-4 transition-transform ${isLandlordsOpen ? 'rotate-180' : ''}`} />
                </button>

                {isLandlordsOpen && (
                  <div className="absolute top-full left-0 mt-1 w-64 bg-background border border-border rounded-lg shadow-xl py-2 z-50">
                    {landlordLinks.map((link) => (
                      <Link
                        key={link.to}
                        to={link.to}
                        className="block px-4 py-2 hover:bg-muted transition-colors"
                        onClick={() => setIsLandlordsOpen(false)}
                      >
                        <span className="font-semibold text-primary block">{link.label}</span>
                        <span className="text-sm text-muted-foreground">{link.description}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {navLinks.slice(3).map((link) => (
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
              <a href="https://wa.me/441902943929" target="_blank" rel="noopener noreferrer">
                <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white font-bold">
                  <MessageCircle className="mr-1 h-4 w-4" />
                  WhatsApp
                </Button>
              </a>
              <a href="tel:01902943929">
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
                {navLinks.slice(0, 3).map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="text-foreground hover:text-primary font-semibold px-3 py-3 rounded-md hover:bg-muted transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}

                {/* Mobile Landlords Section */}
                <div className="border-t border-b my-2 py-2">
                  <button
                    className="flex items-center justify-between w-full text-foreground hover:text-primary font-semibold px-3 py-3 rounded-md hover:bg-muted transition-colors"
                    onClick={() => setIsLandlordsOpen(!isLandlordsOpen)}
                  >
                    <span className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      Landlords
                    </span>
                    <ChevronDown className={`h-4 w-4 transition-transform ${isLandlordsOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isLandlordsOpen && (
                    <div className="pl-6 space-y-1">
                      {landlordLinks.map((link) => (
                        <Link
                          key={link.to}
                          to={link.to}
                          className="block px-3 py-2 text-sm text-muted-foreground hover:text-primary hover:bg-muted rounded-md transition-colors"
                          onClick={() => {
                            setIsMenuOpen(false);
                            setIsLandlordsOpen(false);
                          }}
                        >
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                {navLinks.slice(3).map((link) => (
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
                  <a href="https://wa.me/441902943929" target="_blank" rel="noopener noreferrer" className="flex-1">
                    <Button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold">
                      <MessageCircle className="mr-2 h-4 w-4" />
                      WhatsApp
                    </Button>
                  </a>
                  <a href="tel:01902943929" className="flex-1">
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
