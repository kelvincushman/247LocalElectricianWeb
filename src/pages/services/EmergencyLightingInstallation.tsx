import { Siren } from "lucide-react";
import ServicePageTemplate from "@/components/ServicePageTemplate";
import { Link } from "react-router-dom";

const EmergencyLightingInstallation = () => {
  const mainContent = (
    <div className="space-y-6 text-foreground">
      <h2 className="text-2xl font-bold text-primary">Emergency Lighting Installation</h2>

      <p>
        Emergency lighting is a critical safety system that ensures building occupants can safely evacuate
        during a power failure or emergency. At 247Electrician, we design and install emergency lighting
        systems across the Black Country, Birmingham, Walsall, and Cannock in compliance with
        <strong> BS 5266-1:2016</strong> and Building Regulations.
      </p>

      <h3 className="text-xl font-bold text-primary">Types of Emergency Lighting</h3>

      <p>
        We install all categories of emergency lighting to suit your premises:
      </p>

      <ul className="list-disc pl-6 space-y-2">
        <li><strong>Escape route lighting</strong> – Illuminating corridors, stairways, and exits</li>
        <li><strong>Open area lighting</strong> – Anti-panic lighting for large spaces</li>
        <li><strong>High-risk task area lighting</strong> – Ensuring safe shutdown of dangerous processes</li>
        <li><strong>Exit signs</strong> – Internally illuminated or externally lit running man signs</li>
        <li><strong>Maintained fittings</strong> – Operating continuously, switching to battery on mains failure</li>
        <li><strong>Non-maintained fittings</strong> – Only illuminating during mains failure</li>
        <li><strong>Sustained fittings</strong> – Part of normal lighting that continues in emergency mode</li>
      </ul>

      <h3 className="text-xl font-bold text-primary">System Design & Compliance</h3>

      <p>
        Emergency lighting design must consider escape route length, change of direction points, final exits,
        fire safety signs, and specific hazards. We design systems in accordance with:
      </p>

      <ul className="list-disc pl-6 space-y-2">
        <li><strong>BS 5266-1:2016</strong> – Code of practice for emergency lighting</li>
        <li><strong>BS EN 1838:2013</strong> – Lighting applications for emergency lighting</li>
        <li><strong>BS EN 50172:2004</strong> – Emergency escape lighting systems</li>
        <li><strong>The Regulatory Reform (Fire Safety) Order 2005</strong> – Legal requirements for non-domestic premises</li>
      </ul>

      <p>
        Upon completion, we provide full design documentation, installation certificates, and guidance on
        <Link to="/services/emergency-lighting-testing" className="text-primary hover:text-emergency font-semibold"> testing and maintenance requirements</Link>.
      </p>

      <h3 className="text-xl font-bold text-primary">Properties Requiring Emergency Lighting</h3>

      <p>
        Emergency lighting is typically required in commercial premises, HMOs, communal areas of flats,
        public buildings, and any workplace where people may be at risk during evacuation. For
        <Link to="/services/hmo-electrical-testing" className="text-primary hover:text-emergency font-semibold"> HMO properties</Link>,
        emergency lighting is often a licensing requirement.
      </p>
    </div>
  );

  return (
    <ServicePageTemplate
      title="Emergency Lighting Installation"
      metaTitle="Emergency Lighting Installation | Black Country & Birmingham"
      metaDescription="Emergency lighting installation in Black Country, Birmingham, Walsall & Cannock. BS 5266 compliant systems for commercial, HMO, and public buildings. Full certification."
      heroIcon={Siren}
      intro="Professional emergency lighting design and installation. We create compliant systems that ensure safe evacuation during power failures and emergencies."
      benefits={[
        "BS 5266 Compliant",
        "Full Design Service",
        "All Building Types",
        "Certification Provided",
        "NAPIT Approved",
      ]}
      mainContent={mainContent}
      standards={[
        "BS 5266-1:2016",
        "BS EN 1838:2013",
        "BS EN 50172:2004",
        "BS 7671:2018+A2:2022",
      ]}
      relatedServices={[
        {
          title: "Emergency Lighting Testing",
          href: "/services/emergency-lighting-testing",
          description: "Ongoing testing and maintenance services.",
        },
        {
          title: "HMO Electrical Testing",
          href: "/services/hmo-electrical-testing",
          description: "Complete HMO compliance including emergency lighting.",
        },
        {
          title: "Smoke Alarm Installation",
          href: "/services/smoke-alarm-installation",
          description: "Fire detection systems for complete safety compliance.",
        },
      ]}
    />
  );
};

export default EmergencyLightingInstallation;
