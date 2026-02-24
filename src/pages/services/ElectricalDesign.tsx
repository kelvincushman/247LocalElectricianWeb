import { PenTool } from "lucide-react";
import ServicePageTemplate from "@/components/ServicePageTemplate";
import { Link } from "react-router-dom";

const ElectricalDesign = () => {
  const mainContent = (
    <div className="space-y-6 text-foreground">
      <h2 className="text-2xl font-bold text-primary">Electrical Design Services</h2>

      <p>
        Good electrical design ensures your installation is safe, efficient, and fit for purpose. At 247Electrician,
        we provide electrical design services for domestic extensions, renovations, and new builds across the
        Black Country, Birmingham, Walsall, and Cannock. All designs comply with <strong>BS 7671:2018+A2:2022</strong> and
        relevant Building Regulations.
      </p>

      <h3 className="text-xl font-bold text-primary">Design Services We Offer</h3>

      <p>
        Our electrical design services cover:
      </p>

      <ul className="list-disc pl-6 space-y-2">
        <li><strong>Load assessments</strong> – Calculating total demand and diversity for new installations</li>
        <li><strong>Circuit design</strong> – Optimising circuit layouts for safety and practicality</li>
        <li><strong>Cable sizing calculations</strong> – Ensuring cables meet current-carrying capacity and volt-drop requirements</li>
        <li><strong>Protection coordination</strong> – Selecting appropriate MCBs, RCDs, and RCBOs</li>
        <li><strong>Consumer unit specification</strong> – Sizing and specifying distribution boards</li>
        <li><strong>Lighting design</strong> – Lux level calculations and fitting layouts</li>
        <li><strong>Socket and switch layouts</strong> – Practical positioning for usability</li>
        <li><strong>External installations</strong> – Garden lighting, outbuildings, and EV charger circuits</li>
      </ul>

      <h3 className="text-xl font-bold text-primary">Design Documentation</h3>

      <p>
        We provide comprehensive design documentation including:
      </p>

      <ul className="list-disc pl-6 space-y-2">
        <li>Single-line diagrams showing circuit topology</li>
        <li>Cable schedules with sizes, types, and protective device ratings</li>
        <li>Socket and lighting layout drawings</li>
        <li>Calculations for fault current, earth fault loop impedance, and voltage drop</li>
        <li>Specifications for materials and equipment</li>
      </ul>

      <h3 className="text-xl font-bold text-primary">Working with Architects & Builders</h3>

      <p>
        We regularly collaborate with architects, builders, and other trades to integrate electrical design
        into wider construction projects. Early involvement ensures conduit routes are planned, adequate
        distribution board space is allocated, and the installation meets your requirements.
      </p>

      <p>
        Whether you need a complete electrical design for a new extension or simply advice on upgrading
        your <Link to="/services/fuse-board-upgrades" className="text-primary hover:text-emergency font-semibold">consumer unit</Link> or
        adding <Link to="/services/ev-charger-installation" className="text-primary hover:text-emergency font-semibold">EV charging</Link>,
        we can help ensure your project is properly planned from the outset.
      </p>
    </div>
  );

  return (
    <ServicePageTemplate
      title="Electrical Design"
      metaTitle="Electrical Design Services | Black Country & Birmingham"
      metaDescription="Professional electrical design services in Black Country, Birmingham, Walsall & Cannock. Load assessments, circuit design, cable calculations. BS 7671 compliant."
      heroIcon={PenTool}
      intro="Professional electrical design for domestic projects. We create safe, efficient, and compliant electrical layouts for extensions, renovations, and new builds."
      benefits={[
        "BS 7671 Compliant",
        "Full Documentation",
        "Load Assessments",
        "Cable Calculations",
        "NAPIT Approved",
      ]}
      mainContent={mainContent}
      standards={[
        "BS 7671:2018+A2:2022",
        "Part P Building Regulations",
        "IET Guidance Notes",
        "BS EN 12464-1 (Lighting)",
      ]}
      relatedServices={[
        {
          title: "Rewiring",
          href: "/services/rewiring",
          description: "Complete installation of designed systems.",
        },
        {
          title: "Fuse Board Upgrades",
          href: "/services/fuse-board-upgrades",
          description: "Consumer unit design and installation.",
        },
        {
          title: "Lighting Installation",
          href: "/services/lighting-installation",
          description: "Implementation of lighting designs.",
        },
      ]}
    />
  );
};

export default ElectricalDesign;
