import { Droplets } from "lucide-react";
import ServicePageTemplate from "@/components/ServicePageTemplate";
import { Link } from "react-router-dom";

const ElectricShowerInstallation = () => {
  const mainContent = (
    <div className="space-y-6 text-foreground">
      <h2 className="text-2xl font-bold text-primary">Electric Shower Installation & Replacement</h2>

      <p>
        Electric showers provide instant hot water independently of your boiler, making them ideal for busy
        households and properties with limited hot water supply. At 247Electrician, we install and replace
        electric showers across the Black Country, Birmingham, Walsall, and Cannock, ensuring full compliance
        with <strong>BS 7671:2018+A2:2022</strong> bathroom regulations.
      </p>

      <h3 className="text-xl font-bold text-primary">Electric Shower Installation Services</h3>

      <p>
        We install all types and ratings of electric showers:
      </p>

      <ul className="list-disc pl-6 space-y-2">
        <li><strong>7.5kW showers</strong> – Entry-level units suitable for most properties</li>
        <li><strong>8.5kW showers</strong> – Popular mid-range option with improved flow rate</li>
        <li><strong>9.5kW showers</strong> – Higher performance for better water pressure</li>
        <li><strong>10.5kW+ showers</strong> – Premium units requiring upgraded cables and protection</li>
        <li><strong>Thermostatic showers</strong> – Temperature-stabilised for safety and comfort</li>
        <li><strong>Eco showers</strong> – Water and energy-saving features</li>
      </ul>

      <h3 className="text-xl font-bold text-primary">Electrical Requirements</h3>

      <p>
        Electric showers draw significant current and require dedicated circuits with appropriately sized cables.
        The specific requirements depend on the shower rating:
      </p>

      <ul className="list-disc pl-6 space-y-2">
        <li>7.5kW – Typically 6mm² cable with 32A MCB</li>
        <li>8.5-9.5kW – Usually 10mm² cable with 40A MCB</li>
        <li>10.5kW+ – May require 10mm² or 16mm² cable with 45A or 50A protection</li>
      </ul>

      <p>
        All installations include RCD protection as required by <strong>BS 7671 Section 701</strong> for bathroom
        installations. The cable route must be carefully planned to maintain protection within the bathroom zones.
      </p>

      <h3 className="text-xl font-bold text-primary">Upgrading Your Electric Shower</h3>

      <p>
        When upgrading to a higher-rated shower, the existing cable may not be suitable for the increased load.
        We assess the current installation and advise whether cable replacement is necessary. If your
        <Link to="/services/fuse-board-upgrades" className="text-primary hover:text-emergency font-semibold"> consumer unit </Link>
        lacks sufficient capacity, we can incorporate upgrades into your quote.
      </p>

      <p>
        For properties undergoing bathroom renovations, combining shower installation with
        <Link to="/services/lighting-installation" className="text-primary hover:text-emergency font-semibold"> bathroom lighting</Link> and
        additional <Link to="/services/socket-installation" className="text-primary hover:text-emergency font-semibold">shaver sockets</Link> provides
        excellent value.
      </p>
    </div>
  );

  return (
    <ServicePageTemplate
      title="Electric Shower Installation"
      metaTitle="Electric Shower Installation | Black Country & Birmingham"
      metaDescription="Electric shower installation and replacement in Black Country, Birmingham, Walsall & Cannock. All ratings from 7.5kW to 10.5kW+. NAPIT approved, fully certified."
      heroIcon={Droplets}
      intro="Professional electric shower installation and replacement services. We install all makes and models with the correct cable sizing and protection for safe, reliable operation."
      benefits={[
        "All Shower Ratings",
        "Cable Upgrades",
        "Same-Day Service",
        "Full Certification",
        "NAPIT Approved",
      ]}
      mainContent={mainContent}
      standards={[
        "BS 7671:2018+A2:2022",
        "BS 7671 Section 701",
        "Part P Building Regulations",
        "IET Guidance Note 7",
      ]}
      relatedServices={[
        {
          title: "Fuse Board Upgrades",
          href: "/services/fuse-board-upgrades",
          description: "Consumer unit upgrades for shower circuits.",
        },
        {
          title: "Lighting Installation",
          href: "/services/lighting-installation",
          description: "Bathroom lighting to complete your renovation.",
        },
        {
          title: "Rewiring",
          href: "/services/rewiring",
          description: "Bathroom rewiring for complete renovations.",
        },
      ]}
    />
  );
};

export default ElectricShowerInstallation;
