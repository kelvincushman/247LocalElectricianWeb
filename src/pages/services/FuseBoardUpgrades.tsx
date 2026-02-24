import { Shield } from "lucide-react";
import ServicePageTemplate from "@/components/ServicePageTemplate";
import { Link } from "react-router-dom";

const FuseBoardUpgrades = () => {
  const mainContent = (
    <div className="space-y-6 text-foreground">
      <h2 className="text-2xl font-bold text-primary">Consumer Unit & Fuse Board Upgrades</h2>

      <p>
        Your consumer unit (commonly called a fuse board or fuse box) is the heart of your electrical installation.
        Modern consumer units provide significantly better protection against electric shock and fire than older
        fuse boards. At 247Electrician, we specialise in upgrading outdated units to current standards across
        the Black Country, Birmingham, Walsall, and Cannock.
      </p>

      <h3 className="text-xl font-bold text-primary">Why Upgrade Your Consumer Unit?</h3>

      <p>
        Consumer unit upgrades are one of the most important safety improvements you can make to your property.
        Modern units offer several advantages:
      </p>

      <ul className="list-disc pl-6 space-y-2">
        <li><strong>RCD Protection</strong> – Residual Current Devices disconnect the supply within milliseconds if a fault is detected</li>
        <li><strong>RCBO Circuits</strong> – Individual protection for each circuit, preventing nuisance tripping</li>
        <li><strong>Fire-Resistant Enclosures</strong> – Metal or flame-retardant plastic to contain any internal faults</li>
        <li><strong>Surge Protection</strong> – SPDs protect sensitive electronics from voltage spikes</li>
        <li><strong>Better Capacity</strong> – Additional ways for future circuit additions</li>
        <li><strong>Circuit Identification</strong> – Clear labelling for safety and maintenance</li>
      </ul>

      <h3 className="text-xl font-bold text-primary">Signs You Need an Upgrade</h3>

      <p>
        We recommend considering a consumer unit upgrade if your property has any of the following:
      </p>

      <ul className="list-disc pl-6 space-y-2">
        <li>Rewirable fuses (with wire carriers rather than MCBs)</li>
        <li>A wooden-backed fuse board</li>
        <li>No RCD protection (or only a single RCD for the whole installation)</li>
        <li>Insufficient capacity for modern electrical demands</li>
        <li>Frequent tripping under normal load</li>
        <li>Planning to add circuits for <Link to="/services/ev-charger-installation" className="text-primary hover:text-emergency font-semibold">EV chargers</Link> or <Link to="/services/solar-installation" className="text-primary hover:text-emergency font-semibold">solar panels</Link></li>
      </ul>

      <h3 className="text-xl font-bold text-primary">Compliance & Certification</h3>

      <p>
        Consumer unit replacements are notifiable work under <strong>Part P of the Building Regulations</strong>.
        All our installations comply with <strong>BS 7671:2018+A2:2022</strong> and <strong>Amendment 2</strong>,
        which requires metal consumer units or non-metallic units meeting specific fire-resistance standards.
      </p>

      <p>
        Upon completion, we provide an Electrical Installation Certificate and notify the work to your local
        Building Control body. This documentation is essential for insurance purposes and when selling your property.
        We also recommend an <Link to="/services/eicr-certificates" className="text-primary hover:text-emergency font-semibold">EICR</Link> for
        older properties to identify any other issues within the installation.
      </p>
    </div>
  );

  return (
    <ServicePageTemplate
      title="Fuse Board Upgrades"
      metaTitle="Consumer Unit & Fuse Board Upgrades | Black Country & Birmingham"
      metaDescription="Professional consumer unit and fuse board upgrades in Black Country, Birmingham, Walsall & Cannock. Metal units with RCD/RCBO protection. NAPIT approved, fully certified."
      heroIcon={Shield}
      intro="Upgrade your outdated fuse board to a modern, safe consumer unit with RCD protection. All installations comply with the latest regulations and are fully certified."
      benefits={[
        "RCD/RCBO Protection",
        "Metal Enclosures",
        "Full Certification",
        "Part P Compliant",
        "Building Control Notification",
      ]}
      mainContent={mainContent}
      standards={[
        "BS 7671:2018+A2:2022",
        "BS EN 61439-3",
        "Part P Building Regulations",
        "Amendment 2 (Metal CU)",
      ]}
      relatedServices={[
        {
          title: "EICR Certificates",
          href: "/services/eicr-certificates",
          description: "Full electrical inspection to complement your new consumer unit.",
        },
        {
          title: "Full Rewiring",
          href: "/services/rewiring",
          description: "Complete rewiring services for older properties.",
        },
        {
          title: "EV Charger Installation",
          href: "/services/ev-charger-installation",
          description: "Home charging points requiring dedicated circuits.",
        },
      ]}
    />
  );
};

export default FuseBoardUpgrades;
