import { Flame } from "lucide-react";
import ServicePageTemplate from "@/components/ServicePageTemplate";
import { Link } from "react-router-dom";

const HeatSourceInstallation = () => {
  const mainContent = (
    <div className="space-y-6 text-foreground">
      <h2 className="text-2xl font-bold text-primary">Heat Pump & Electrical Heating Installation</h2>

      <p>
        As the UK transitions away from fossil fuels, heat pumps and electrical heating systems are becoming
        the standard for new and retrofitted properties. At 247Electrician, our specialist Kelvin handles
        all heat source electrical installations across the Black Country, Birmingham, Walsall, and Cannock,
        ensuring compliance with current regulations and manufacturer requirements.
      </p>

      <h3 className="text-xl font-bold text-primary">Heat Pump Electrical Installation</h3>

      <p>
        Heat pumps require significant electrical infrastructure. We provide:
      </p>

      <ul className="list-disc pl-6 space-y-2">
        <li><strong>Supply upgrades</strong> – Assessment and upgrade of your electrical supply if required</li>
        <li><strong>Consumer unit modifications</strong> – Additional circuits and protection for heat pump systems</li>
        <li><strong>Dedicated circuits</strong> – Correctly sized cabling and protection for outdoor and indoor units</li>
        <li><strong>Control wiring</strong> – Integration with thermostats, zone valves, and smart controls</li>
        <li><strong>Immersion heater circuits</strong> – Backup heating for hot water cylinders</li>
        <li><strong>Three-phase installations</strong> – For larger commercial heat pump systems</li>
      </ul>

      <h3 className="text-xl font-bold text-primary">Electric Heating Systems</h3>

      <p>
        We install a range of electric heating solutions for properties where heat pumps are not suitable:
      </p>

      <ul className="list-disc pl-6 space-y-2">
        <li><strong>Electric boilers</strong> – Direct replacement for gas or oil boilers</li>
        <li><strong>Storage heaters</strong> – Economy 7 and smart tariff compatible systems</li>
        <li><strong>Panel heaters</strong> – Modern, efficient direct heating</li>
        <li><strong>Underfloor heating</strong> – Electric UFH systems with zone controls</li>
        <li><strong>Infrared panels</strong> – Radiant heating for specific areas</li>
      </ul>

      <h3 className="text-xl font-bold text-primary">Compliance & Certification</h3>

      <p>
        All heat source installations comply with <strong>BS 7671:2018+A2:2022</strong> and relevant product
        standards. Heat pump electrical work must coordinate with the heating engineer to ensure the complete
        system operates safely and efficiently.
      </p>

      <p>
        Combining a heat pump with <Link to="/services/solar-installation" className="text-primary hover:text-emergency font-semibold">solar panels</Link> can
        dramatically reduce running costs. We can design integrated systems that maximise your self-consumption
        and minimise grid import. Your <Link to="/services/fuse-board-upgrades" className="text-primary hover:text-emergency font-semibold">consumer unit</Link> will
        typically require upgrading to accommodate these additional circuits.
      </p>
    </div>
  );

  return (
    <ServicePageTemplate
      title="Heat Source Installation"
      metaTitle="Heat Pump Electrical Installation | Black Country & Birmingham"
      metaDescription="Heat pump and electrical heating installation in Black Country, Birmingham, Walsall & Cannock. Supply upgrades, dedicated circuits, full certification. NAPIT approved."
      heroIcon={Flame}
      intro="Expert electrical installation for heat pumps, electric boilers, and heating systems. We ensure your heating infrastructure meets all current regulations and manufacturer specifications."
      benefits={[
        "Heat Pump Specialists",
        "Supply Upgrades",
        "Full Certification",
        "Smart Controls",
        "NAPIT Approved",
      ]}
      mainContent={mainContent}
      standards={[
        "BS 7671:2018+A2:2022",
        "MCS Standards (Heat Pumps)",
        "Part P Building Regulations",
        "Part L Building Regulations",
      ]}
      relatedServices={[
        {
          title: "Solar Installation",
          href: "/services/solar-installation",
          description: "Power your heat pump with free solar electricity.",
        },
        {
          title: "Fuse Board Upgrades",
          href: "/services/fuse-board-upgrades",
          description: "Consumer unit upgrades for heating circuits.",
        },
        {
          title: "Rewiring",
          href: "/services/rewiring",
          description: "Complete rewiring to support modern heating systems.",
        },
      ]}
    />
  );
};

export default HeatSourceInstallation;
