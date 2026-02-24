import { ChefHat } from "lucide-react";
import ServicePageTemplate from "@/components/ServicePageTemplate";
import { Link } from "react-router-dom";

const CookerInstallation = () => {
  const mainContent = (
    <div className="space-y-6 text-foreground">
      <h2 className="text-2xl font-bold text-primary">Cooker, Oven & Hob Installation</h2>

      <p>
        Electric cookers, ovens, and hobs require dedicated circuits with appropriately rated connections.
        At 247Electrician, we install all types of kitchen cooking appliances across the Black Country,
        Birmingham, Walsall, and Cannock. Our NAPIT-approved electricians ensure your appliances are
        connected safely and in compliance with <strong>BS 7671:2018+A2:2022</strong>.
      </p>

      <h3 className="text-xl font-bold text-primary">Cooker Installation Services</h3>

      <p>
        We install and connect all types of electric cooking appliances:
      </p>

      <ul className="list-disc pl-6 space-y-2">
        <li><strong>Freestanding cookers</strong> – Electric and dual-fuel models via cooker outlet plates</li>
        <li><strong>Built-in ovens</strong> – Single and double ovens with dedicated supplies</li>
        <li><strong>Induction hobs</strong> – High-power units requiring robust circuits</li>
        <li><strong>Ceramic hobs</strong> – Standard electric hob connections</li>
        <li><strong>Range cookers</strong> – High-capacity units often requiring upgraded supplies</li>
        <li><strong>Combination appliances</strong> – Oven/microwave combinations and steam ovens</li>
      </ul>

      <h3 className="text-xl font-bold text-primary">Electrical Requirements</h3>

      <p>
        Modern cooking appliances can draw significant power, particularly induction hobs. Typical requirements include:
      </p>

      <ul className="list-disc pl-6 space-y-2">
        <li><strong>Standard cookers</strong> – 6mm² cable with 32A protection via cooker control unit</li>
        <li><strong>High-power hobs</strong> – May require 10mm² cable and 40A+ protection</li>
        <li><strong>Separate oven and hob</strong> – Can sometimes share a circuit using diversity calculations</li>
        <li><strong>Range cookers</strong> – Often require 10mm² or higher depending on rating</li>
      </ul>

      <p>
        We assess your existing installation and advise on any upgrades required. Older properties may need
        cable replacement or <Link to="/services/fuse-board-upgrades" className="text-primary hover:text-emergency font-semibold">consumer unit upgrades</Link> to
        safely accommodate modern appliances.
      </p>

      <h3 className="text-xl font-bold text-primary">Cooker Control Units</h3>

      <p>
        We install cooker control units (CCUs) that provide a local isolation switch as required by BS 7671.
        The control unit must be within 2 metres of the appliance and accessible without reaching over the hob.
        For built-in ovens and hobs, we can install separate connection units with double-pole switches.
      </p>

      <p>
        If you're planning a kitchen renovation, combining appliance installation with
        <Link to="/services/socket-installation" className="text-primary hover:text-emergency font-semibold"> additional sockets</Link> and
        <Link to="/services/lighting-installation" className="text-primary hover:text-emergency font-semibold"> under-cabinet lighting</Link> is
        both practical and cost-effective.
      </p>
    </div>
  );

  return (
    <ServicePageTemplate
      title="Cooker & Hob Installation"
      slug="cooker-installation"
      metaTitle="Cooker & Oven Installation | Black Country & Birmingham"
      metaDescription="Electric cooker, oven and hob installation in Black Country, Birmingham, Walsall & Cannock. Induction hobs, range cookers, built-in ovens. NAPIT approved, certified."
      heroIcon={ChefHat}
      intro="Professional installation of electric cookers, ovens, and hobs. We connect all types of kitchen cooking appliances with the correct circuits and protection."
      benefits={[
        "All Appliance Types",
        "Same-Day Service",
        "Cable Upgrades",
        "Full Certification",
        "NAPIT Approved",
      ]}
      mainContent={mainContent}
      standards={[
        "BS 7671:2018+A2:2022",
        "BS 7671 Regulation 314.1",
        "Part P Building Regulations",
        "Manufacturer Requirements",
      ]}
      relatedServices={[
        {
          title: "Socket Installation",
          href: "/services/socket-installation",
          description: "Additional kitchen sockets for appliances.",
        },
        {
          title: "Lighting Installation",
          href: "/services/lighting-installation",
          description: "Under-cabinet and kitchen lighting.",
        },
        {
          title: "Fuse Board Upgrades",
          href: "/services/fuse-board-upgrades",
          description: "Consumer unit upgrades for kitchen circuits.",
        },
      ]}
    />
  );
};

export default CookerInstallation;
