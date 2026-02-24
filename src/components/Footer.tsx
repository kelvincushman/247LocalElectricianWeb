import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, MessageCircle, Shield, Award, Building2 } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-background border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Column 1: Brand */}
          <div>
            <div className="text-2xl font-black mb-3">
              <span className="text-emergency">247</span>
              <span className="text-primary">Electrician</span>
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
              <li>
                <Link to="/services/contract-work" className="text-primary hover:text-emergency font-semibold transition-colors">
                  Contract Work
                </Link>
              </li>
              <li>
                <Link to="/rate-card" className="text-primary hover:text-emergency font-semibold transition-colors">
                  Prices & Rate Card
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Services */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-foreground">Our Services</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/services/emergency-callouts" className="text-muted-foreground hover:text-primary transition-colors">
                  Emergency Callouts
                </Link>
              </li>
              <li>
                <Link to="/services/fault-finding-and-repairs" className="text-muted-foreground hover:text-primary transition-colors">
                  Fault Finding & Repairs
                </Link>
              </li>
              <li>
                <Link to="/services/fuse-board-upgrades" className="text-muted-foreground hover:text-primary transition-colors">
                  Consumer Unit Upgrades
                </Link>
              </li>
              <li>
                <Link to="/services/solar-installation" className="text-muted-foreground hover:text-primary transition-colors">
                  Solar Installation
                </Link>
              </li>
              <li>
                <Link to="/services/heat-source-installation" className="text-muted-foreground hover:text-primary transition-colors">
                  Heat Source Installation
                </Link>
              </li>
              <li>
                <Link to="/services/eicr-certificates" className="text-muted-foreground hover:text-primary transition-colors">
                  EICRs & Landlord Certs
                </Link>
              </li>
              <li>
                <Link to="/services/ev-charger-installation" className="text-muted-foreground hover:text-primary transition-colors">
                  EV Charger Installation
                </Link>
              </li>
              <li>
                <Link to="/services/rewiring" className="text-muted-foreground hover:text-primary transition-colors">
                  Full & Partial Rewiring
                </Link>
              </li>
              <li>
                <Link to="/services/ventilation-installation" className="text-muted-foreground hover:text-primary transition-colors">
                  Ventilation & Fans
                </Link>
              </li>
              <li>
                <Link to="/services/contract-work" className="text-primary hover:text-emergency font-semibold transition-colors">
                  Contract Work →
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: For Landlords */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-foreground flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              For Landlords
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/landlords" className="text-primary hover:text-emergency font-semibold transition-colors">
                  Landlord Services Hub
                </Link>
              </li>
              <li>
                <Link to="/landlords/eicr-certificates" className="text-muted-foreground hover:text-primary transition-colors">
                  EICR Certificates
                </Link>
              </li>
              <li>
                <Link to="/landlords/fire-alarm-testing" className="text-muted-foreground hover:text-primary transition-colors">
                  Fire Alarm Testing
                </Link>
              </li>
              <li>
                <Link to="/landlords/emergency-lighting-testing" className="text-muted-foreground hover:text-primary transition-colors">
                  Emergency Lighting
                </Link>
              </li>
              <li>
                <Link to="/landlords/pat-testing" className="text-muted-foreground hover:text-primary transition-colors">
                  PAT Testing
                </Link>
              </li>
              <li>
                <Link to="/landlords/smoke-co-detectors" className="text-muted-foreground hover:text-primary transition-colors">
                  Smoke & CO Alarms
                </Link>
              </li>
              <li className="pt-2 border-t border-border mt-2">
                <span className="text-xs text-muted-foreground block mb-1">Volume discounts available</span>
                <Link to="/landlords" className="text-emergency hover:text-emergency/80 font-semibold transition-colors">
                  Up to 25% off →
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 5: Areas We Cover */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-foreground">Areas We Cover</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/areas/wolverhampton" className="text-muted-foreground hover:text-primary transition-colors">
                  Wolverhampton
                </Link>
              </li>
              <li>
                <Link to="/areas/walsall" className="text-muted-foreground hover:text-primary transition-colors">
                  Walsall
                </Link>
              </li>
              <li>
                <Link to="/areas/birmingham" className="text-muted-foreground hover:text-primary transition-colors">
                  Birmingham
                </Link>
              </li>
              <li>
                <Link to="/areas/dudley" className="text-muted-foreground hover:text-primary transition-colors">
                  Dudley
                </Link>
              </li>
              <li>
                <Link to="/areas/west-bromwich" className="text-muted-foreground hover:text-primary transition-colors">
                  West Bromwich
                </Link>
              </li>
              <li>
                <Link to="/areas/cannock" className="text-muted-foreground hover:text-primary transition-colors">
                  Cannock
                </Link>
              </li>
              <li>
                <Link to="/service-areas" className="text-primary hover:text-emergency font-semibold transition-colors">
                  View All Areas →
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Contact Row */}
        <div className="border-t border-border mt-8 pt-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-emergency flex-shrink-0" />
              <div>
                <a href="tel:01902943929" className="text-foreground hover:text-emergency font-bold">
                  01902 943 929
                </a>
                <p className="text-xs text-muted-foreground">24/7 Emergency</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MessageCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
              <div>
                <a
                  href="https://wa.me/441902943929"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground hover:text-green-600 font-bold"
                >
                  WhatsApp
                </a>
                <p className="text-xs text-muted-foreground">Quick Response</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-primary flex-shrink-0" />
              <a href="mailto:info@247electrician.uk" className="text-muted-foreground hover:text-primary text-sm">
                info@247electrician.uk
              </a>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-primary flex-shrink-0" />
              <span className="text-muted-foreground text-sm">
                Black Country & Birmingham
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Area Links Bar */}
      <div className="bg-muted border-t border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-wrap justify-center gap-2 text-xs">
            <Link to="/areas/bilston" className="text-muted-foreground hover:text-primary">Bilston</Link>
            <span className="text-muted-foreground">•</span>
            <Link to="/areas/wolverhampton" className="text-muted-foreground hover:text-primary">Wolverhampton</Link>
            <span className="text-muted-foreground">•</span>
            <Link to="/areas/walsall" className="text-muted-foreground hover:text-primary">Walsall</Link>
            <span className="text-muted-foreground">•</span>
            <Link to="/areas/dudley" className="text-muted-foreground hover:text-primary">Dudley</Link>
            <span className="text-muted-foreground">•</span>
            <Link to="/areas/west-bromwich" className="text-muted-foreground hover:text-primary">West Bromwich</Link>
            <span className="text-muted-foreground">•</span>
            <Link to="/areas/birmingham" className="text-muted-foreground hover:text-primary">Birmingham</Link>
            <span className="text-muted-foreground">•</span>
            <Link to="/areas/cannock" className="text-muted-foreground hover:text-primary">Cannock</Link>
            <span className="text-muted-foreground">•</span>
            <Link to="/areas/bloxwich" className="text-muted-foreground hover:text-primary">Bloxwich</Link>
            <span className="text-muted-foreground">•</span>
            <Link to="/areas/aldridge" className="text-muted-foreground hover:text-primary">Aldridge</Link>
            <span className="text-muted-foreground">•</span>
            <Link to="/areas/sedgley" className="text-muted-foreground hover:text-primary">Sedgley</Link>
            <span className="text-muted-foreground">•</span>
            <Link to="/areas/tettenhall" className="text-muted-foreground hover:text-primary">Tettenhall</Link>
          </div>
        </div>
      </div>


      {/* Bottom Bar */}
      <div className="bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
            <p>
              © 2025 247Electrician | Operated by ANP & Birmingham Electrical Services Ltd
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
              <Link to="/privacy-policy" className="hover:underline opacity-80 hover:opacity-100">
                Privacy Policy
              </Link>
              <Link to="/terms-of-service" className="hover:underline opacity-80 hover:opacity-100">
                Terms of Service
              </Link>
              <Link to="/gdpr" className="hover:underline opacity-80 hover:opacity-100">
                GDPR
              </Link>
              <a href="/sitemap.xml" className="hover:underline opacity-80 hover:opacity-100">
                Sitemap
              </a>
            </div>
          </div>
          <p className="text-center text-xs opacity-70 mt-2">
            Black Country, Birmingham, Walsall, Cannock, Dudley, West Bromwich & Wolverhampton | Site Maintained by: <a href="https://www.aigentis.io" target="_blank" rel="noopener noreferrer" className="hover:underline hover:opacity-100">www.Aigentis.io</a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
