import { Sun } from "lucide-react";
import ServicePageTemplate from "@/components/ServicePageTemplate";
import { Link } from "react-router-dom";

const SolarInstallation = () => {
  const mainContent = (
    <div className="space-y-6 text-foreground">
      <h2 className="text-2xl font-bold text-primary">Solar Panel & Battery Storage Installation</h2>

      <p>
        Solar PV systems offer an excellent opportunity to reduce your electricity bills and carbon footprint.
        At 247Electrician, our MCS-accredited installer Andy specialises in solar panel and battery storage
        installations across the Black Country, Birmingham, Walsall, and Cannock. We design systems tailored
        to your property and energy requirements.
      </p>

      <h3 className="text-xl font-bold text-primary">Solar PV Installation Services</h3>

      <p>
        We provide end-to-end solar installation services:
      </p>

      <ul className="list-disc pl-6 space-y-2">
        <li><strong>Site survey and system design</strong> – Assessing roof orientation, shading, and optimal panel placement</li>
        <li><strong>Panel installation</strong> – High-efficiency monocrystalline panels from leading manufacturers</li>
        <li><strong>Inverter installation</strong> – String inverters, microinverters, or optimiser systems</li>
        <li><strong>Battery storage</strong> – Store excess generation for evening use</li>
        <li><strong>Smart export guarantee</strong> – Registration for payment of exported electricity</li>
        <li><strong>Monitoring systems</strong> – Real-time generation and consumption data</li>
      </ul>

      <h3 className="text-xl font-bold text-primary">Battery Storage Systems</h3>

      <p>
        Battery storage maximises the value of your solar investment by storing excess daytime generation for
        use in the evening when electricity prices are highest. We install systems from Tesla, GivEnergy,
        and other leading manufacturers, sized to match your consumption patterns.
      </p>

      <p>
        For customers with electric vehicles, combining solar panels with an
        <Link to="/services/ev-charger-installation" className="text-primary hover:text-emergency font-semibold"> EV charger </Link>
        allows you to charge your car using free, self-generated electricity.
      </p>

      <h3 className="text-xl font-bold text-primary">Regulations & Certification</h3>

      <p>
        Solar PV installations must comply with <strong>BS 7671:2018+A2:2022</strong> and the specific requirements
        of <strong>Engineering Recommendation G98/G99</strong> for connection to the distribution network. Installations
        over 3.68kW typically require DNO approval before energisation.
      </p>

      <p>
        All our installations include full certification, DNO notification, and MCS registration where required.
        This ensures eligibility for the Smart Export Guarantee and maintains your property's insurance validity.
        Your existing <Link to="/services/fuse-board-upgrades" className="text-primary hover:text-emergency font-semibold">consumer unit</Link> may
        need upgrading to accommodate the solar circuit.
      </p>
    </div>
  );

  return (
    <ServicePageTemplate
      title="Solar Installation"
      metaTitle="Solar Panel Installation | Black Country & Birmingham"
      metaDescription="Solar panel and battery storage installation in Black Country, Birmingham, Walsall & Cannock. MCS accredited installer, SEG registration, full certification. Free surveys."
      heroIcon={Sun}
      intro="Professional solar PV and battery storage installations. We design and install complete solar energy systems to reduce your electricity bills and carbon footprint."
      benefits={[
        "MCS Accredited",
        "Battery Storage",
        "Free Site Survey",
        "SEG Registration",
        "25-Year Warranties",
      ]}
      mainContent={mainContent}
      standards={[
        "BS 7671:2018+A2:2022",
        "MCS Installation Standards",
        "G98/G99 Engineering Recommendations",
        "Part P Building Regulations",
      ]}
      relatedServices={[
        {
          title: "EV Charger Installation",
          href: "/services/ev-charger-installation",
          description: "Charge your electric vehicle with free solar power.",
        },
        {
          title: "Fuse Board Upgrades",
          href: "/services/fuse-board-upgrades",
          description: "Consumer unit upgrades for solar circuits.",
        },
        {
          title: "Heat Source Installation",
          href: "/services/heat-source-installation",
          description: "Heat pumps powered by your solar generation.",
        },
      ]}
    />
  );
};

export default SolarInstallation;
