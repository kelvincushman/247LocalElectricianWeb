import { Link } from "react-router-dom";
import { Phone, Mail, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-background border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Column 1: Brand */}
          <div>
            <div className="text-2xl font-black mb-3">
              <span className="text-emergency">247</span>
              <span className="text-primary">LocalElectrician</span>
            </div>
            <p className="text-muted-foreground font-semibold mb-4">
              Your Trusted Local Electrician
            </p>
            <div className="bg-primary text-primary-foreground px-3 py-1 rounded text-sm font-bold inline-block">
              NICEIC APPROVED
            </div>
          </div>
          
          {/* Column 2: Quick Links */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-foreground">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-muted-foreground hover:text-primary transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/emergency" className="text-muted-foreground hover:text-emergency transition-colors">
                  Emergency Electrician
                </Link>
              </li>
              <li>
                <Link to="/service-areas" className="text-muted-foreground hover:text-primary transition-colors">
                  Service Areas
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-muted-foreground hover:text-primary transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Column 3: Services */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-foreground">Our Services</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li>Emergency Callouts</li>
              <li>Fault Finding & Repairs</li>
              <li>Rewiring Services</li>
              <li>Fuse Board Upgrades</li>
              <li>EICR Certificates</li>
              <li>EV Charger Installation</li>
            </ul>
          </div>
          
          {/* Column 4: Contact */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-foreground">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <Phone className="h-5 w-5 text-emergency mt-0.5 flex-shrink-0" />
                <div>
                  <a href="tel:01234567890" className="text-foreground hover:text-emergency font-bold">
                    01234 567 890
                  </a>
                  <p className="text-xs text-muted-foreground">24/7 Emergency Available</p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <Mail className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <a href="mailto:info@247localelectrician.co.uk" className="text-muted-foreground hover:text-primary">
                  info@247localelectrician.co.uk
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground">
                  Bilston, West Midlands
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
      
      {/* Bottom Bar */}
      <div className="bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-2 text-sm">
            <p>
              © 2025 247LocalElectrician | Operated by ANP Electrical Ltd
            </p>
            <p className="text-center md:text-right">
              We Cover: Bilston, Wolverhampton, Walsall, Dudley, West Bromwich & West Midlands
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
