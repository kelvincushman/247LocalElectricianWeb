import { Lightbulb } from "lucide-react";
import ServicePageTemplate from "@/components/ServicePageTemplate";
import { Link } from "react-router-dom";

const LightingInstallation = () => {
  const mainContent = (
    <div className="space-y-6 text-foreground">
      <h2 className="text-2xl font-bold text-primary">Professional Lighting Installation Services</h2>

      <p>
        Quality lighting transforms your home, enhancing both functionality and aesthetics. At 247Electrician,
        we provide comprehensive lighting installation services across the Black Country, Birmingham, Walsall,
        and Cannock. From simple fitting replacements to complete lighting designs, our NAPIT-approved
        electricians deliver safe, compliant installations.
      </p>

      <h3 className="text-xl font-bold text-primary">Indoor Lighting Services</h3>

      <p>
        We install all types of indoor lighting to suit your requirements and budget:
      </p>

      <ul className="list-disc pl-6 space-y-2">
        <li><strong>LED downlights</strong> – Energy-efficient recessed lighting with proper fire hoods where required</li>
        <li><strong>Pendant and chandelier fittings</strong> – Including heavy fittings requiring additional support</li>
        <li><strong>Track and spot lighting</strong> – Ideal for kitchens, galleries, and feature walls</li>
        <li><strong>Bathroom lighting</strong> – IP-rated fittings compliant with BS 7671 zone requirements</li>
        <li><strong>Under-cabinet lighting</strong> – Kitchen task lighting and display illumination</li>
        <li><strong>Dimmer switches</strong> – Leading and trailing edge dimmers compatible with LED technology</li>
        <li><strong>Smart lighting systems</strong> – WiFi-controlled lighting with app and voice control</li>
      </ul>

      <h3 className="text-xl font-bold text-primary">Outdoor & Garden Lighting</h3>

      <p>
        External lighting requires careful consideration of IP ratings, cable protection, and compliance with
        <strong> BS 7671:2018+A2:2022 Section 714</strong> for outdoor installations:
      </p>

      <ul className="list-disc pl-6 space-y-2">
        <li><strong>Security lighting</strong> – PIR-activated floodlights and dusk-to-dawn sensors</li>
        <li><strong>Garden and pathway lighting</strong> – Low-voltage and mains-powered options</li>
        <li><strong>Patio and deck lighting</strong> – Recessed fittings for outdoor entertaining areas</li>
        <li><strong>Festoon and decorative lighting</strong> – Permanent installations with weatherproof connections</li>
      </ul>

      <h3 className="text-xl font-bold text-primary">Emergency Lighting</h3>

      <p>
        For commercial properties and HMOs, we install and maintain emergency lighting systems in accordance with
        <strong> BS 5266-1</strong>. This includes escape route lighting, open area lighting, and high-risk task area
        lighting. We provide installation certificates and can arrange ongoing maintenance contracts.
      </p>

      <p>
        Whether you're upgrading a single fitting or planning a complete lighting scheme, we ensure all work meets
        current regulations. For properties undergoing <Link to="/services/rewiring" className="text-primary hover:text-emergency font-semibold">rewiring</Link>,
        incorporating new lighting circuits is straightforward and cost-effective.
      </p>
    </div>
  );

  return (
    <ServicePageTemplate
      title="Lighting Installation"
      metaTitle="Lighting Installation Services | Black Country & Birmingham Electrician"
      metaDescription="Professional indoor and outdoor lighting installation in Black Country, Birmingham, Walsall & Cannock. LED downlights, garden lighting, emergency lighting. NAPIT approved."
      heroIcon={Lightbulb}
      intro="Expert lighting installation for homes and businesses. From LED downlights to outdoor security lighting, we create safe, energy-efficient lighting solutions."
      benefits={[
        "LED Specialists",
        "Indoor & Outdoor",
        "Smart Lighting",
        "Energy Efficient",
        "Fully Certified",
      ]}
      mainContent={mainContent}
      standards={[
        "BS 7671:2018+A2:2022",
        "BS 5266-1 (Emergency)",
        "BS 7671 Section 714",
        "Part P Building Regulations",
      ]}
      relatedServices={[
        {
          title: "Rewiring",
          href: "/services/rewiring",
          description: "Complete rewiring with new lighting circuits.",
        },
        {
          title: "Socket Installation",
          href: "/services/socket-installation",
          description: "Additional sockets to complement your lighting upgrade.",
        },
        {
          title: "Fuse Board Upgrades",
          href: "/services/fuse-board-upgrades",
          description: "Consumer unit upgrades for additional lighting circuits.",
        },
      ]}
    />
  );
};

export default LightingInstallation;
