import { Car } from "lucide-react";
import ServicePageTemplate from "@/components/ServicePageTemplate";
import { Link } from "react-router-dom";

const EVChargerInstallation = () => {
  const mainContent = (
    <div className="space-y-6 text-foreground">
      <h2 className="text-2xl font-bold text-primary">Electric Vehicle Charger Installation</h2>

      <p>
        As electric vehicles become increasingly popular, home charging is the most convenient and cost-effective
        way to keep your EV ready for the road. At 247Electrician, we are approved installers of EV charging
        points across the Black Country, Birmingham, Walsall, and Cannock. Our installations comply with both
        <strong> BS 7671:2018+A2:2022</strong> and the <strong>IET Code of Practice for Electric Vehicle Charging</strong>.
      </p>

      <h3 className="text-xl font-bold text-primary">Types of EV Chargers We Install</h3>

      <p>
        We install a range of home and workplace charging solutions:
      </p>

      <ul className="list-disc pl-6 space-y-2">
        <li><strong>7kW Untethered chargers</strong> – The most common home installation, compatible with all EVs</li>
        <li><strong>7kW Tethered chargers</strong> – Built-in cable for convenient connection</li>
        <li><strong>22kW Three-phase chargers</strong> – Faster charging where three-phase supply is available</li>
        <li><strong>Smart chargers</strong> – App-controlled units with scheduling and energy monitoring</li>
        <li><strong>Load-managed installations</strong> – Protecting your supply from overload</li>
      </ul>

      <h3 className="text-xl font-bold text-primary">Installation Requirements</h3>

      <p>
        EV charger installation typically requires a dedicated circuit from your consumer unit. We assess your
        existing electrical installation to determine whether your current supply has sufficient capacity. In some
        cases, a <Link to="/services/fuse-board-upgrades" className="text-primary hover:text-emergency font-semibold">consumer unit upgrade</Link> may
        be required to accommodate the additional load.
      </p>

      <p>
        Key technical requirements include:
      </p>

      <ul className="list-disc pl-6 space-y-2">
        <li>PME earthing assessment and, where necessary, an earth electrode installation</li>
        <li>Type A or Type B RCD protection as specified by the charger manufacturer</li>
        <li>Cable sizing calculations accounting for voltage drop and thermal constraints</li>
        <li>Surge protection device (SPD) installation where recommended</li>
        <li>DNO notification for installations exceeding certain thresholds</li>
      </ul>

      <h3 className="text-xl font-bold text-primary">Regulations & Certification</h3>

      <p>
        All EV charger installations must comply with <strong>BS 7671:2018+A2:2022</strong> and the
        <strong> IET Code of Practice for Electric Vehicle Charging Equipment Installation (4th Edition)</strong>.
        The installation is notifiable under Part P of the Building Regulations, and we provide full certification
        including an Electrical Installation Certificate.
      </p>

      <p>
        If you're also considering <Link to="/services/solar-installation" className="text-primary hover:text-emergency font-semibold">solar panel installation</Link>,
        combining these with an EV charger can significantly reduce your running costs by charging from your own
        generated electricity.
      </p>
    </div>
  );

  return (
    <ServicePageTemplate
      title="EV Charger Installation"
      metaTitle="EV Charger Installation | Black Country & Birmingham Electrician"
      metaDescription="Professional EV charger installation in Black Country, Birmingham, Walsall & Cannock. 7kW & 22kW chargers, smart charging, full certification. NAPIT approved installer."
      heroIcon={Car}
      intro="Expert electric vehicle charger installation for homes and businesses. We install all major brands with full certification and compliance with IET guidelines."
      benefits={[
        "All Major Brands",
        "Smart Chargers",
        "Full Certification",
        "DNO Notification",
        "Warranty Support",
      ]}
      mainContent={mainContent}
      standards={[
        "BS 7671:2018+A2:2022",
        "IET EV CoP 4th Edition",
        "Part P Building Regulations",
        "BS EN 61851",
      ]}
      relatedServices={[
        {
          title: "Solar Installation",
          href: "/services/solar-installation",
          description: "Combine solar panels with your EV charger for free motoring.",
        },
        {
          title: "Fuse Board Upgrades",
          href: "/services/fuse-board-upgrades",
          description: "Consumer unit upgrades for EV charger circuits.",
        },
        {
          title: "EICR Certificates",
          href: "/services/eicr-certificates",
          description: "Pre-installation inspection of your electrical system.",
        },
      ]}
    />
  );
};

export default EVChargerInstallation;
