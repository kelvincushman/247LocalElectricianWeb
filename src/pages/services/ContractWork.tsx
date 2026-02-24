import { Briefcase } from "lucide-react";
import ServicePageTemplate from "@/components/ServicePageTemplate";
import { Link } from "react-router-dom";

const ContractWork = () => {
  const mainContent = (
    <div className="space-y-6 text-foreground">
      <h2 className="text-2xl font-bold text-primary">Professional Electrical Contractors for Hire</h2>

      <p>
        Looking for experienced electrical contractors who can hit the ground running? At 247Electrician,
        our founding partners <strong>Kelvin</strong> and <strong>Andy</strong> bring over a decade of
        working together, combining hands-on electrical expertise with project management and M&E design
        experience. We're available for contract work, price work, and projects that demand both technical
        skill and professional site management.
      </p>

      <h3 className="text-xl font-bold text-primary">A Proven Partnership</h3>

      <p>
        Kelvin and Andy have known and worked alongside each other for more than ten years. This
        long-standing partnership means seamless communication, shared standards, and a unified approach
        to every project. When you bring us on board, you're getting a team that already works as one —
        no bedding-in period, no miscommunication, just results.
      </p>

      <h3 className="text-xl font-bold text-primary">Design Consultancy Experience</h3>

      <p>
        Kelvin spent two years working in M&E design consultancy, where he was involved in designing
        electrical installations for projects valued at over <strong>£15 million</strong>. This experience
        gives us a unique advantage: we understand not just how to install, but how systems are designed
        from the ground up. We can interpret complex drawings, identify potential issues before they
        become problems, and liaise effectively with design teams and consulting engineers.
      </p>

      <h3 className="text-xl font-bold text-primary">Site Management Credentials</h3>

      <p>
        Andy has taken the role of on-site manager on numerous projects and holds his <strong>SSSTS
        (Site Supervisor Safety Training Scheme)</strong> certification. This means we can manage
        electrical works on site, coordinate with other trades, ensure health and safety compliance,
        and deliver projects on time and to specification. You're not just getting electricians —
        you're getting supervisors who understand the bigger picture.
      </p>

      <h3 className="text-xl font-bold text-primary">Point Us at the Job</h3>

      <p>
        Our approach is straightforward: give us the brief, point us at the job, and we'll deliver the
        finished product. We take ownership of our work from start to finish. Whether it's interpreting
        drawings, sourcing materials, coordinating with other trades, or signing off completed works,
        we handle it professionally and independently.
      </p>

      <h3 className="text-xl font-bold text-primary">What We Offer</h3>

      <ul className="list-disc pl-6 space-y-2">
        <li><strong>Price Work</strong> – Fixed-price contracts for defined scopes of work</li>
        <li><strong>Day Rates</strong> – Flexible arrangements for ongoing or variable projects</li>
        <li><strong>Technical Installations</strong> – Complex electrical work requiring skilled tradesmen</li>
        <li><strong>Site Supervision</strong> – SSSTS-qualified management of electrical works</li>
        <li><strong>Design Interpretation</strong> – Reading and implementing M&E drawings accurately</li>
        <li><strong>Testing & Commissioning</strong> – Full certification and handover documentation</li>
        <li><strong>Snagging & Remedials</strong> – Resolving defects efficiently and professionally</li>
      </ul>

      <h3 className="text-xl font-bold text-primary">Sectors We Work In</h3>

      <p>
        Our contract work spans across multiple sectors:
      </p>

      <ul className="list-disc pl-6 space-y-2">
        <li>Commercial fit-outs and refurbishments</li>
        <li>Industrial and manufacturing facilities</li>
        <li>Residential developments and housing</li>
        <li>Educational buildings and schools</li>
        <li>Healthcare and care home settings</li>
        <li>Retail and hospitality venues</li>
        <li>New build construction projects</li>
      </ul>

      <h3 className="text-xl font-bold text-primary">Let's Talk</h3>

      <p>
        We're always happy to discuss your requirements, whether that's a one-off project or ongoing
        contract work. We're flexible on terms and transparent about pricing — no hidden costs, no
        surprises. If you need reliable, qualified electrical contractors who can manage themselves
        and deliver quality work, get in touch.
      </p>

      <p>
        For domestic and emergency work, we also offer our full range of{" "}
        <Link to="/services" className="text-primary hover:text-emergency font-semibold">
          electrical services
        </Link>{" "}
        across the Black Country, Birmingham, Walsall, and Cannock areas.
      </p>
    </div>
  );

  return (
    <ServicePageTemplate
      title="Contract Work"
      metaTitle="Electrical Contractors for Hire | Contract & Price Work | 247Electrician"
      metaDescription="Experienced electrical contractors available for contract work, price work, and site projects. SSSTS qualified with M&E design consultancy experience. Black Country, Birmingham, Walsall & Cannock."
      heroIcon={Briefcase}
      intro="Skilled electrical contractors with over a decade of partnership. From M&E design consultancy to SSSTS site supervision, we deliver complex projects professionally and independently. Available for price work, day rates, and contract positions."
      benefits={[
        "10+ Years Partnership",
        "M&E Design Experience",
        "SSSTS Qualified",
        "Price Work Available",
        "NAPIT Approved",
      ]}
      mainContent={mainContent}
      standards={[
        "BS 7671:2018+A2:2022",
        "SSSTS Certified",
        "NAPIT Approved",
        "Part P Compliant",
      ]}
      relatedServices={[
        {
          title: "Electrical Design",
          href: "/services/electrical-design",
          description: "Professional electrical design services.",
        },
        {
          title: "EICR Certificates",
          href: "/services/eicr-certificates",
          description: "Testing and certification for all installations.",
        },
        {
          title: "Commercial Services",
          href: "/services/emergency-lighting-installation",
          description: "Emergency lighting and commercial installations.",
        },
      ]}
    />
  );
};

export default ContractWork;
