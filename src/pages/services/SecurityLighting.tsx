import { ShieldAlert } from "lucide-react";
import ServicePageTemplate from "@/components/ServicePageTemplate";
import { Link } from "react-router-dom";

const SecurityLighting = () => {
  const mainContent = (
    <div className="space-y-6 text-foreground">
      <h2 className="text-2xl font-bold text-primary">Security Lighting Installation</h2>

      <p>
        Effective security lighting is one of the most cost-effective deterrents against intruders and provides
        added safety for your family and visitors. At 247Electrician, we design and install security lighting
        systems across the Black Country, Birmingham, Walsall, and Cannock, tailored to your property and requirements.
      </p>

      <h3 className="text-xl font-bold text-primary">Security Lighting Options</h3>

      <p>
        We install a range of security lighting solutions:
      </p>

      <ul className="list-disc pl-6 space-y-2">
        <li><strong>PIR floodlights</strong> – Motion-activated lights that illuminate when movement is detected</li>
        <li><strong>Dusk-to-dawn lighting</strong> – Photocell-controlled lights that operate automatically at night</li>
        <li><strong>LED floodlights</strong> – Energy-efficient, high-output illumination for large areas</li>
        <li><strong>Soffit downlights</strong> – Discreet lighting that illuminates entry points and pathways</li>
        <li><strong>Bollard and post lights</strong> – Pathway lighting that also provides perimeter security</li>
        <li><strong>Smart security lights</strong> – WiFi-controlled with app alerts and scheduling</li>
        <li><strong>Camera-integrated lighting</strong> – Combined floodlight and CCTV systems</li>
      </ul>

      <h3 className="text-xl font-bold text-primary">Design Considerations</h3>

      <p>
        Effective security lighting requires careful planning to avoid light pollution whilst maximising coverage.
        We consider:
      </p>

      <ul className="list-disc pl-6 space-y-2">
        <li>Vulnerable areas such as entry points, gates, and blind spots</li>
        <li>Sensor positioning to avoid false triggers from pets and passing traffic</li>
        <li>Light levels that illuminate without causing glare or nuisance</li>
        <li>Integration with existing lighting and smart home systems</li>
        <li>Timer and override controls for flexibility</li>
      </ul>

      <h3 className="text-xl font-bold text-primary">Installation Standards</h3>

      <p>
        All external lighting installations comply with <strong>BS 7671:2018+A2:2022 Section 714</strong> for outdoor
        installations. This includes appropriate IP ratings for weatherproofing, correct cable protection, and
        suitable protective devices. External circuits require RCD protection as standard.
      </p>

      <p>
        Security lighting works best as part of a comprehensive approach. Consider combining with
        <Link to="/services/lighting-installation" className="text-primary hover:text-emergency font-semibold"> general outdoor lighting</Link> and
        <Link to="/services/socket-installation" className="text-primary hover:text-emergency font-semibold">outdoor sockets</Link> for
        a complete external electrical upgrade.
      </p>
    </div>
  );

  return (
    <ServicePageTemplate
      title="Security Lighting"
      metaTitle="Security Lighting Installation | Black Country & Birmingham"
      metaDescription="Security lighting installation in Black Country, Birmingham, Walsall & Cannock. PIR floodlights, smart security lights, dusk-to-dawn systems. NAPIT approved."
      heroIcon={ShieldAlert}
      intro="Professional security lighting design and installation. We create effective, energy-efficient security lighting systems that protect your property and deter intruders."
      benefits={[
        "PIR & Smart Options",
        "Energy Efficient LED",
        "Professional Design",
        "Full Certification",
        "NAPIT Approved",
      ]}
      mainContent={mainContent}
      standards={[
        "BS 7671:2018+A2:2022",
        "BS 7671 Section 714",
        "Part P Building Regulations",
        "BS EN 12464-2 (Outdoor)",
      ]}
      relatedServices={[
        {
          title: "Lighting Installation",
          href: "/services/lighting-installation",
          description: "Complete outdoor and garden lighting.",
        },
        {
          title: "Socket Installation",
          href: "/services/socket-installation",
          description: "Outdoor power points for gardens and garages.",
        },
        {
          title: "Fault Finding & Repairs",
          href: "/services/fault-finding-and-repairs",
          description: "Repair of existing security lighting.",
        },
      ]}
    />
  );
};

export default SecurityLighting;
