import { Cable } from "lucide-react";
import ServicePageTemplate from "@/components/ServicePageTemplate";
import { Link } from "react-router-dom";

const Rewiring = () => {
  const mainContent = (
    <div className="space-y-6 text-foreground">
      <h2 className="text-2xl font-bold text-primary">Full & Partial Rewiring Services</h2>

      <p>
        Electrical wiring doesn't last forever. Most domestic installations have a lifespan of 25 to 40 years,
        depending on the quality of materials and installation. At 247Electrician, we provide comprehensive
        rewiring services across the Black Country, Birmingham, Walsall, and Cannock, ensuring your property
        meets modern safety standards.
      </p>

      <h3 className="text-xl font-bold text-primary">When Does a Property Need Rewiring?</h3>

      <p>
        Several indicators suggest your property may require a full or partial rewire:
      </p>

      <ul className="list-disc pl-6 space-y-2">
        <li><strong>Age of installation</strong> – Properties with wiring over 30 years old should be inspected</li>
        <li><strong>Rubber or lead-sheathed cables</strong> – Common in pre-1960s installations</li>
        <li><strong>Black rubber cables</strong> – Typically from the 1960s and 1970s, now degraded</li>
        <li><strong>Insufficient earthing</strong> – Older properties may lack proper protective conductors</li>
        <li><strong>Two-pin sockets</strong> – Indicating very old, potentially dangerous wiring</li>
        <li><strong>Burning smells or discolouration</strong> – Signs of overheating connections</li>
        <li><strong>Failed <Link to="/services/eicr-certificates" className="text-primary hover:text-emergency font-semibold">EICR inspection</Link></strong> – With Code 1 or Code 2 observations</li>
      </ul>

      <h3 className="text-xl font-bold text-primary">Our Rewiring Process</h3>

      <p>
        We understand that rewiring is a significant undertaking, so we plan every project carefully to minimise
        disruption. Our process includes an initial survey and quotation, followed by a detailed schedule of works.
        We use quality materials throughout, including LSF (Low Smoke and Fume) cables where specified and
        fire-rated cables for alarm circuits.
      </p>

      <p>
        All rewiring work includes a new <Link to="/services/fuse-board-upgrades" className="text-primary hover:text-emergency font-semibold">consumer unit</Link> with
        RCD protection, properly rated circuits for all areas, and full testing and certification. We can also
        upgrade your <Link to="/services/lighting-installation" className="text-primary hover:text-emergency font-semibold">lighting</Link> and
        add additional <Link to="/services/socket-installation" className="text-primary hover:text-emergency font-semibold">sockets</Link> as
        part of the project.
      </p>

      <h3 className="text-xl font-bold text-primary">Partial Rewiring Options</h3>

      <p>
        Not every property requires a complete rewire. We offer partial rewiring for specific areas such as
        kitchens, bathrooms, and extensions. This is often appropriate when the existing installation is in
        reasonable condition but certain circuits need upgrading to meet modern demands or comply with
        <strong> BS 7671:2018+A2:2022</strong>.
      </p>

      <p>
        For rental properties, an up-to-date <Link to="/services/eicr-certificates" className="text-primary hover:text-emergency font-semibold">EICR</Link> is
        a legal requirement. If your report identifies issues, we can advise on whether targeted repairs or a
        more comprehensive rewire represents better value.
      </p>
    </div>
  );

  return (
    <ServicePageTemplate
      title="Full & Partial Rewiring"
      slug="rewiring"
      metaTitle="House Rewiring Services | Black Country & Birmingham Electrician"
      metaDescription="Professional full and partial rewiring services in Black Country, Birmingham, Walsall & Cannock. Upgrade old wiring to modern standards. NAPIT approved, fully certified."
      heroIcon={Cable}
      intro="Complete and partial rewiring services for domestic properties. We upgrade outdated electrical installations to meet modern safety standards with minimal disruption."
      benefits={[
        "Full Certification",
        "New Consumer Unit",
        "Quality Materials",
        "Minimal Disruption",
        "Part P Compliant",
      ]}
      mainContent={mainContent}
      standards={[
        "BS 7671:2018+A2:2022",
        "Part P Building Regulations",
        "BS 5839-6 (Fire Detection)",
        "BS 7671 Section 422",
      ]}
      relatedServices={[
        {
          title: "Fuse Board Upgrades",
          href: "/services/fuse-board-upgrades",
          description: "New consumer units included with all rewiring projects.",
        },
        {
          title: "EICR Certificates",
          href: "/services/eicr-certificates",
          description: "Pre-rewire inspection to assess the full scope of work.",
        },
        {
          title: "Lighting Installation",
          href: "/services/lighting-installation",
          description: "Upgrade your lighting as part of your rewire project.",
        },
      ]}
    />
  );
};

export default Rewiring;
