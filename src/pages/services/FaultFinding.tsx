import { Search } from "lucide-react";
import ServicePageTemplate from "@/components/ServicePageTemplate";
import { Link } from "react-router-dom";

const FaultFinding = () => {
  const mainContent = (
    <div className="space-y-6 text-foreground">
      <h2 className="text-2xl font-bold text-primary">Expert Electrical Fault Finding & Repairs</h2>

      <p>
        Electrical faults can be frustrating and potentially dangerous. At 247Electrician, our experienced engineers
        use systematic testing methods and professional diagnostic equipment to identify the root cause of electrical
        problems quickly and accurately. We serve customers across the Black Country, Birmingham, Walsall, and Cannock.
      </p>

      <h3 className="text-xl font-bold text-primary">Common Electrical Faults We Diagnose</h3>

      <p>
        Our fault-finding service covers a wide range of electrical issues that affect domestic and commercial properties:
      </p>

      <ul className="list-disc pl-6 space-y-2">
        <li><strong>Intermittent power loss</strong> – Circuits that cut out randomly or under load</li>
        <li><strong>Tripping RCDs and MCBs</strong> – Protective devices activating repeatedly</li>
        <li><strong>Flickering or dimming lights</strong> – Often indicating loose connections or overloaded circuits</li>
        <li><strong>Dead sockets or circuits</strong> – Complete loss of power to specific areas</li>
        <li><strong>High electricity bills</strong> – Potential earth leakage or faulty appliances</li>
        <li><strong>Buzzing or humming sounds</strong> – From consumer units, sockets, or light fittings</li>
        <li><strong>Overheating cables or connections</strong> – A serious fire risk requiring immediate attention</li>
      </ul>

      <h3 className="text-xl font-bold text-primary">Our Diagnostic Process</h3>

      <p>
        We follow a methodical approach to fault finding, using insulation resistance testing, continuity checks,
        and thermal imaging where appropriate. Our process complies with the testing requirements of
        <strong> BS 7671:2018+A2:2022</strong> and the guidance in the IET's <em>Electrical Installation Testing</em> publication.
      </p>

      <p>
        Once we identify the fault, we provide a clear explanation of the problem and a fixed-price quote for the repair.
        There are no hidden charges, and we always explain your options before proceeding with any work.
      </p>

      <h3 className="text-xl font-bold text-primary">When to Call a Professional</h3>

      <p>
        Whilst some electrical issues may seem minor, they can indicate more serious underlying problems. If you notice
        any burning smells, visible damage to cables, or receive an electric shock, treat this as an
        <Link to="/services/emergency-callouts" className="text-primary hover:text-emergency font-semibold"> emergency </Link>
        and contact us immediately. For older properties, we recommend an
        <Link to="/services/eicr-certificates" className="text-primary hover:text-emergency font-semibold"> EICR inspection </Link>
        to identify potential issues before they become faults.
      </p>

      <p>
        If your consumer unit is outdated or lacks modern RCD protection, a
        <Link to="/services/fuse-board-upgrades" className="text-primary hover:text-emergency font-semibold"> fuse board upgrade </Link>
        may resolve recurring tripping issues and improve the overall safety of your installation.
      </p>
    </div>
  );

  return (
    <ServicePageTemplate
      title="Fault Finding & Repairs"
      metaTitle="Electrical Fault Finding & Repairs | Black Country & Birmingham"
      metaDescription="Expert electrical fault finding and repairs in Black Country, Birmingham, Walsall & Cannock. Professional diagnosis of tripping circuits, power loss & electrical faults. NAPIT approved."
      heroIcon={Search}
      intro="Professional electrical fault diagnosis and repair services. We use systematic testing methods to identify and resolve electrical problems quickly and safely."
      benefits={[
        "Professional Diagnostics",
        "Fixed-Price Repairs",
        "Same-Day Service",
        "NAPIT Approved",
        "Full Certification",
      ]}
      mainContent={mainContent}
      standards={[
        "BS 7671:2018+A2:2022",
        "IET Guidance Note 3",
        "Part P Building Regulations",
      ]}
      relatedServices={[
        {
          title: "Emergency Callouts",
          href: "/services/emergency-callouts",
          description: "24/7 emergency electrical services for urgent problems.",
        },
        {
          title: "Fuse Board Upgrades",
          href: "/services/fuse-board-upgrades",
          description: "Modern consumer unit installations with RCD protection.",
        },
        {
          title: "EICR Certificates",
          href: "/services/eicr-certificates",
          description: "Comprehensive electrical safety inspections.",
        },
      ]}
    />
  );
};

export default FaultFinding;
