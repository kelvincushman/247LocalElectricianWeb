import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, MessageCircle, Shield, Award } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-background border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Column 1: Brand */}
          <div>
            <div className="text-2xl font-black mb-3">
              <span className="text-emergency">24/7</span>
              <span className="text-primary">LocalElectrician</span>
            </div>
            <p className="text-muted-foreground font-semibold mb-4">
              Kelvin & Andy — Your Trusted Local Electricians
            </p>
            <div className="flex flex-wrap gap-2 mb-4">
              <div className="bg-primary text-primary-foreground px-3 py-1 rounded text-xs font-bold inline-flex items-center gap-1">
                <Shield className="h-3 w-3" />
                Gold Card JIB
              </div>
              <div className="bg-primary text-primary-foreground px-3 py-1 rounded text-xs font-bold inline-flex items-center gap-1">
                <Award className="h-3 w-3" />
                65+ Years Exp.
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              All work compliant with BS 7671:2018+A2:2022
            </p>
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
                <Link to="/about" className="text-muted-foreground hover:text-primary transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/services" className="text-muted-foreground hover:text-primary transition-colors">
                  Services
                </Link>
              </li>
              <li>
                <Link to="/service-areas" className="text-muted-foreground hover:text-primary transition-colors">
                  Service Areas
                </Link>
              </li>
              <li>
                <Link to="/gallery" className="text-muted-foreground hover:text-primary transition-colors">
                  Gallery
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-muted-foreground hover:text-primary transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-muted-foreground hover:text-primary transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Services */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-foreground">Our Services</h3>
            <ul className="space-y-2 text-muted-foreground text-sm">
              <li>Emergency Callouts</li>
              <li>Fault Finding & Repairs</li>
              <li>Consumer Unit Upgrades</li>
              <li>Electric Showers</li>
              <li>Kitchen & Bathroom Rewires</li>
              <li>EICRs & Landlord Certs</li>
              <li>EV Charger Installation</li>
              <li>Cooker & Hob Installation</li>
            </ul>
          </div>

          {/* Column 4: Contact */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-foreground">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <Phone className="h-5 w-5 text-emergency mt-0.5 flex-shrink-0" />
                <div>
                  <a href="tel:01234567890" className="text-foreground hover:text-emergency font-bold">
                    01234 567 890
                  </a>
                  <p className="text-xs text-muted-foreground">24/7 Emergency</p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <MessageCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <a
                    href="https://wa.me/441234567890"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-foreground hover:text-green-600 font-bold"
                  >
                    WhatsApp
                  </a>
                  <p className="text-xs text-muted-foreground">Quick Response</p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <Mail className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <a href="mailto:info@247localelectrician.co.uk" className="text-muted-foreground hover:text-primary text-sm break-all">
                  info@247localelectrician.co.uk
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground text-sm">
                  Bilston, West Midlands<br />
                  15-mile service radius
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
              © 2025 24/7 Local Electrician | Operated by ANP Electrical Ltd
            </p>
            <p className="text-center md:text-right text-xs opacity-80">
              Bilston, Wolverhampton, Walsall, Dudley, West Bromwich & West Midlands
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
