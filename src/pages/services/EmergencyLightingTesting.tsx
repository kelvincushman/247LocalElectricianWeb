import { ClipboardCheck } from "lucide-react";
import ServicePageTemplate from "@/components/ServicePageTemplate";
import { Link } from "react-router-dom";

const EmergencyLightingTesting = () => {
  const mainContent = (
    <div className="space-y-6 text-foreground">
      <h2 className="text-2xl font-bold text-primary">Emergency Lighting Testing & Maintenance</h2>

      <p>
        Emergency lighting systems require regular testing and maintenance to ensure they function correctly
        when needed. At 247Electrician, we provide comprehensive testing services across the Black Country,
        Birmingham, Walsall, and Cannock in accordance with <strong>BS 5266-1:2016</strong> and
        <strong> BS EN 50172:2004</strong>.
      </p>

      <h3 className="text-xl font-bold text-primary">Testing Requirements</h3>

      <p>
        BS 5266-1 specifies the following testing regime for emergency lighting systems:
      </p>

      <ul className="list-disc pl-6 space-y-2">
        <li><strong>Daily checks</strong> – Visual inspection that indicators show the system is operational</li>
        <li><strong>Monthly functional tests</strong> – Brief activation to confirm all luminaires operate</li>
        <li><strong>Annual full-duration tests</strong> – Complete battery discharge test for the rated duration (typically 3 hours)</li>
        <li><strong>Three-yearly full-duration tests</strong> – Extended testing with additional inspections</li>
      </ul>

      <h3 className="text-xl font-bold text-primary">Our Testing Service</h3>

      <p>
        We offer flexible testing packages to meet your compliance requirements:
      </p>

      <ul className="list-disc pl-6 space-y-2">
        <li><strong>Annual testing contracts</strong> – Scheduled visits to complete all required tests</li>
        <li><strong>Full-duration discharge tests</strong> – 3-hour tests with comprehensive reporting</li>
        <li><strong>Remedial works</strong> – Replacement of failed luminaires and batteries</li>
        <li><strong>Log book maintenance</strong> – Proper documentation for fire safety inspections</li>
        <li><strong>System upgrades</strong> – Recommendations for non-compliant or aged systems</li>
      </ul>

      <h3 className="text-xl font-bold text-primary">Legal Requirements</h3>

      <p>
        Under the Regulatory Reform (Fire Safety) Order 2005, the responsible person for a premises must ensure
        emergency lighting is maintained in efficient working order. Failure to maintain adequate records or
        carry out testing can result in enforcement action by the fire authority.
      </p>

      <p>
        For <Link to="/services/hmo-electrical-testing" className="text-primary hover:text-emergency font-semibold">HMO properties</Link> and
        commercial premises, we can combine emergency lighting testing with
        <Link to="/services/eicr-certificates" className="text-primary hover:text-emergency font-semibold"> EICR inspections</Link> and
        <Link to="/services/smoke-alarm-installation" className="text-primary hover:text-emergency font-semibold">fire alarm testing</Link> for
        comprehensive compliance coverage. If your system requires upgrading, see our
        <Link to="/services/emergency-lighting-installation" className="text-primary hover:text-emergency font-semibold"> installation services</Link>.
      </p>
    </div>
  );

  return (
    <ServicePageTemplate
      title="Emergency Lighting Testing"
      metaTitle="Emergency Lighting Testing | Black Country & Birmingham"
      metaDescription="Emergency lighting testing and maintenance in Black Country, Birmingham, Walsall & Cannock. BS 5266 compliant testing, annual contracts, full certification."
      heroIcon={ClipboardCheck}
      intro="Professional emergency lighting testing and maintenance services. We ensure your emergency lighting system remains compliant and fully functional."
      benefits={[
        "BS 5266 Compliant",
        "Annual Contracts",
        "Full Documentation",
        "Remedial Works",
        "NAPIT Approved",
      ]}
      mainContent={mainContent}
      standards={[
        "BS 5266-1:2016",
        "BS EN 50172:2004",
        "Fire Safety Order 2005",
        "BS 7671:2018+A2:2022",
      ]}
      relatedServices={[
        {
          title: "Emergency Lighting Installation",
          href: "/services/emergency-lighting-installation",
          description: "New emergency lighting system installations.",
        },
        {
          title: "HMO Electrical Testing",
          href: "/services/hmo-electrical-testing",
          description: "Complete HMO compliance packages.",
        },
        {
          title: "EICR Certificates",
          href: "/services/eicr-certificates",
          description: "Electrical installation inspections.",
        },
      ]}
    />
  );
};

export default EmergencyLightingTesting;
