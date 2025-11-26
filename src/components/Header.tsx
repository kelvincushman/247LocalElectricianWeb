import { Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <>
      {/* Emergency Top Bar */}
      <div className="bg-emergency text-emergency-foreground py-2 sticky top-0 z-50 shadow-md">
        <div className="container mx-auto px-4 flex items-center justify-center gap-2 font-bold">
          <Phone className="h-4 w-4" />
          <a href="tel:01234567890" className="hover:underline">
            EMERGENCY? CALL NOW 24/7: 01234 567 890
          </a>
        </div>
      </div>
      
      {/* Main Navigation */}
      <header className="bg-background border-b border-border sticky top-10 z-40 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="text-3xl font-black">
                <span className="text-emergency">247</span>
                <span className="text-primary">LocalElectrician</span>
              </div>
            </Link>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <Link to="/" className="text-foreground hover:text-primary font-semibold transition-colors">
                Home
              </Link>
              <Link to="/emergency" className="text-foreground hover:text-emergency font-semibold transition-colors">
                Emergency
              </Link>
              <Link to="/service-areas" className="text-foreground hover:text-primary font-semibold transition-colors">
                Service Areas
              </Link>
              <Link to="/contact" className="text-foreground hover:text-primary font-semibold transition-colors">
                Contact
              </Link>
            </nav>
            
            {/* Call Button */}
            <a href="tel:01234567890">
              <Button size="lg" className="bg-emergency hover:bg-emergency/90 text-emergency-foreground font-bold">
                <Phone className="mr-2 h-5 w-5" />
                CALL NOW
              </Button>
            </a>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
