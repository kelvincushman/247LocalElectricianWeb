import { Plug } from "lucide-react";
import ServicePageTemplate from "@/components/ServicePageTemplate";
import { Link } from "react-router-dom";

const SocketInstallation = () => {
  const mainContent = (
    <div className="space-y-6 text-foreground">
      <h2 className="text-2xl font-bold text-primary">Socket Installation & Replacement Services</h2>

      <p>
        Modern homes require more power outlets than ever before. At 247Electrician, we install additional
        sockets and replace outdated outlets across the Black Country, Birmingham, Walsall, and Cannock.
        All our work complies with <strong>BS 7671:2018+A2:2022</strong> and is carried out by NAPIT-approved
        electricians.
      </p>

      <h3 className="text-xl font-bold text-primary">Socket Installation Services</h3>

      <p>
        We provide a comprehensive range of socket installation services:
      </p>

      <ul className="list-disc pl-6 space-y-2">
        <li><strong>Additional double sockets</strong> – New outlets added to existing circuits where capacity allows</li>
        <li><strong>New circuits</strong> – Dedicated circuits for high-demand areas like kitchens and home offices</li>
        <li><strong>USB sockets</strong> – Combined power and USB charging outlets for convenience</li>
        <li><strong>Outdoor sockets</strong> – IP-rated weatherproof sockets for gardens and garages</li>
        <li><strong>Fused connection units</strong> – For permanently connected appliances</li>
        <li><strong>Cooker and oven connections</strong> – High-current outlets for kitchen appliances</li>
        <li><strong>Shaver sockets</strong> – Bathroom-safe isolating transformer sockets</li>
      </ul>

      <h3 className="text-xl font-bold text-primary">Socket Replacement & Upgrades</h3>

      <p>
        If your existing sockets show signs of wear, damage, or overheating, replacement is essential for safety.
        Warning signs include:
      </p>

      <ul className="list-disc pl-6 space-y-2">
        <li>Discolouration or burn marks around the socket</li>
        <li>Cracked or damaged faceplates</li>
        <li>Loose sockets that move in the wall</li>
        <li>Plugs that don't stay firmly inserted</li>
        <li>Sparking when inserting or removing plugs</li>
        <li>Buzzing or crackling sounds</li>
      </ul>

      <p>
        We also upgrade older round-pin sockets to modern 13A outlets and replace single sockets with doubles
        where required. For properties with outdated wiring, we may recommend a
        <Link to="/services/rewiring" className="text-primary hover:text-emergency font-semibold"> partial rewire </Link>
        to ensure the circuit can safely support additional loads.
      </p>

      <h3 className="text-xl font-bold text-primary">Compliance & Safety</h3>

      <p>
        Socket installations must comply with specific requirements of <strong>BS 7671</strong>, including
        RCD protection for socket outlets (Regulation 411.3.3) and mounting heights in accordance with
        Part M of the Building Regulations for accessibility. We ensure all new sockets are properly
        protected by your <Link to="/services/fuse-board-upgrades" className="text-primary hover:text-emergency font-semibold">consumer unit's</Link> RCDs.
      </p>
    </div>
  );

  return (
    <ServicePageTemplate
      title="Socket Installation"
      metaTitle="Socket Installation & Replacement | Black Country & Birmingham"
      metaDescription="Professional socket installation and replacement in Black Country, Birmingham, Walsall & Cannock. Additional sockets, USB outlets, outdoor sockets. NAPIT approved electrician."
      heroIcon={Plug}
      intro="Expert socket installation and replacement services. We add new sockets, upgrade existing outlets, and ensure your electrical system meets modern demands safely."
      benefits={[
        "Same-Day Service",
        "USB Sockets Available",
        "Indoor & Outdoor",
        "RCD Protected",
        "Fully Certified",
      ]}
      mainContent={mainContent}
      standards={[
        "BS 7671:2018+A2:2022",
        "BS 1363 (Plugs & Sockets)",
        "Part M Building Regulations",
        "Part P Building Regulations",
      ]}
      relatedServices={[
        {
          title: "Fuse Board Upgrades",
          href: "/services/fuse-board-upgrades",
          description: "Upgrade your consumer unit for additional circuits.",
        },
        {
          title: "Rewiring",
          href: "/services/rewiring",
          description: "Complete rewiring for older properties.",
        },
        {
          title: "Lighting Installation",
          href: "/services/lighting-installation",
          description: "Complement new sockets with upgraded lighting.",
        },
      ]}
    />
  );
};

export default SocketInstallation;
