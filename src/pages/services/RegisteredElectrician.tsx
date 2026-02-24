import { BadgeCheck } from "lucide-react";
import ServicePageTemplate from "@/components/ServicePageTemplate";
import FAQSection from "@/components/FAQSection";
import { Link } from "react-router-dom";

const RegisteredElectrician = () => {
  const mainContent = (
    <div className="space-y-6 text-foreground">
      <h2 className="text-2xl font-bold text-primary">NAPIT Registered Electrician Near You</h2>

      <p>
        Looking for a <strong>registered electrician near you</strong>? 247Electrician is fully registered with
        NAPIT (National Association of Professional Inspectors and Testers), one of the UK's leading electrical
        competent person schemes. This means all our work is certified, compliant, and backed by a trusted
        industry body.
      </p>

      <h3 className="text-xl font-bold text-primary">Why Use a Registered Electrician?</h3>

      <p>
        Using a <strong>registered electrician</strong> gives you important protections and guarantees:
      </p>

      <ul className="list-disc pl-6 space-y-2">
        <li><strong>Legal Compliance</strong> – Part P of the Building Regulations requires certain electrical work to be notified to Building Control. Registered electricians can self-certify, saving you time and money.</li>
        <li><strong>Guaranteed Quality</strong> – Registration bodies require electricians to meet strict competency standards and undergo regular assessment.</li>
        <li><strong>Insurance Protection</strong> – Registered schemes include warranty-backed insurance for completed work.</li>
        <li><strong>Proper Certification</strong> – You receive official certificates (Electrical Installation Certificate or Minor Works Certificate) that prove compliance.</li>
        <li><strong>Recourse if Problems Arise</strong> – If something goes wrong, the registration body can intervene on your behalf.</li>
      </ul>

      <h3 className="text-xl font-bold text-primary">What is NAPIT?</h3>

      <p>
        <strong>NAPIT</strong> (National Association of Professional Inspectors and Testers) is a government-approved
        Competent Person Scheme for electrical work in England and Wales. When you use a NAPIT-registered electrician:
      </p>

      <ul className="list-disc pl-6 space-y-2">
        <li>Work is automatically notified to Building Control</li>
        <li>You receive an official Building Regulations Compliance Certificate</li>
        <li>The electrician has been assessed for technical competence</li>
        <li>All work is covered by NAPIT's Platinum Promise warranty</li>
        <li>You can verify our registration at <a href="https://www.napit.org.uk" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-emergency font-semibold">napit.org.uk</a></li>
      </ul>

      <h3 className="text-xl font-bold text-primary">Work That Requires a Registered Electrician</h3>

      <p>
        Under Part P of the Building Regulations, the following work must be carried out by a registered
        electrician (or notified to Building Control):
      </p>

      <ul className="list-disc pl-6 space-y-2">
        <li><Link to="/services/fuse-board-upgrades" className="text-primary hover:text-emergency font-semibold">Consumer unit installations or replacements</Link></li>
        <li>New circuits (e.g., for cookers, showers, EV chargers)</li>
        <li><Link to="/services/rewiring" className="text-primary hover:text-emergency font-semibold">Full or partial rewiring</Link></li>
        <li>Electrical work in bathrooms and kitchens (special locations)</li>
        <li>Outdoor electrical installations</li>
        <li><Link to="/services/ev-charger-installation" className="text-primary hover:text-emergency font-semibold">Electric vehicle charger installation</Link></li>
        <li><Link to="/services/solar-installation" className="text-primary hover:text-emergency font-semibold">Solar PV connections</Link></li>
      </ul>

      <p>
        Using an unregistered electrician for this work means you must pay for separate Building Control
        inspection (typically £200-300+) and may face problems when selling your property.
      </p>

      <h3 className="text-xl font-bold text-primary">Our Qualifications & Registrations</h3>

      <p>
        247Electrician (operated by ANP Electrical Ltd) holds the following:
      </p>

      <ul className="list-disc pl-6 space-y-2">
        <li><strong>NAPIT Registration</strong> – Competent Person Scheme for domestic installations</li>
        <li><strong>City & Guilds Qualified</strong> – All electricians hold recognised qualifications</li>
        <li><strong>18th Edition Certified</strong> – Trained to current BS 7671:2018+A2:2022 standards</li>
        <li><strong>JIB Gold Card</strong> – Industry recognition of electrician competence</li>
        <li><strong>Public Liability Insurance</strong> – £2 million cover for your protection</li>
        <li><strong>Professional Indemnity</strong> – Cover for design and advisory work</li>
      </ul>

      <h3 className="text-xl font-bold text-primary">Certificates We Provide</h3>

      <p>
        As a registered electrician, we issue official documentation for all notifiable work:
      </p>

      <ul className="list-disc pl-6 space-y-2">
        <li><strong>Electrical Installation Certificate (EIC)</strong> – For new installations and major alterations</li>
        <li><strong>Minor Electrical Installation Works Certificate (MEIWC)</strong> – For smaller additions to existing circuits</li>
        <li><strong>Building Regulations Compliance Certificate</strong> – Automatically issued via NAPIT for Part P work</li>
        <li><strong><Link to="/services/eicr-certificates" className="text-primary hover:text-emergency font-semibold">Electrical Installation Condition Report (EICR)</Link></strong> – For testing existing installations</li>
      </ul>

      <p>
        These certificates are essential for insurance claims, property sales, and letting properties legally.
      </p>

      <h3 className="text-xl font-bold text-primary">Verify Our Registration</h3>

      <p>
        You can verify any electrician's registration status before hiring them. For NAPIT-registered
        contractors, visit the <a href="https://www.napit.org.uk/find-an-installer" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-emergency font-semibold">NAPIT Find an Installer</a> page
        and search by postcode or company name.
      </p>

      <h3 className="text-xl font-bold text-primary">Areas We Cover</h3>

      <p>
        Our registered electricians serve homes and businesses across:
      </p>

      <ul className="list-disc pl-6 space-y-2">
        <li><Link to="/areas/wolverhampton" className="text-primary hover:text-emergency font-semibold">Wolverhampton</Link> and all WV postcodes</li>
        <li><Link to="/areas/birmingham" className="text-primary hover:text-emergency font-semibold">Birmingham</Link> Central and North</li>
        <li><Link to="/areas/walsall" className="text-primary hover:text-emergency font-semibold">Walsall</Link> and surrounding areas</li>
        <li><Link to="/areas/dudley" className="text-primary hover:text-emergency font-semibold">Dudley</Link> and the Black Country</li>
        <li><Link to="/areas/cannock" className="text-primary hover:text-emergency font-semibold">Cannock</Link> and South Staffordshire</li>
      </ul>

      <p>
        View our complete <Link to="/service-areas" className="text-primary hover:text-emergency font-semibold">coverage map</Link>.
      </p>
    </div>
  );

  const faqs = [
    {
      question: "How do I check if an electrician is registered?",
      answer: "You can verify registration on the scheme's website. For NAPIT, visit napit.org.uk/find-an-installer. Other schemes include NICEIC, ELECSA, and STROMA. Always ask to see the registration card and check online before work begins."
    },
    {
      question: "What's the difference between NAPIT and NICEIC?",
      answer: "Both are government-approved Competent Person Schemes with similar standards. The main difference is administrative - both allow self-certification of Part P work. 247Electrician is registered with NAPIT, which is one of the largest schemes in the UK."
    },
    {
      question: "Do I need a registered electrician for small jobs?",
      answer: "Not always. Simple work like replacing light fittings, adding sockets to existing circuits (outside special locations), and repairing faults doesn't require notification. However, using a registered electrician ensures quality and provides documentation of the work."
    },
    {
      question: "What happens if I use an unregistered electrician?",
      answer: "For notifiable work (like new circuits or consumer unit changes), you must notify Building Control yourself and pay for inspection. If work is non-compliant, you may need to have it redone. This can also cause problems when selling your property."
    },
    {
      question: "Will I get certificates for the work?",
      answer: "Yes. For notifiable work, you'll receive an Electrical Installation Certificate and a Building Regulations Compliance Certificate. For minor work, you'll receive a Minor Works Certificate. These are important documents to keep with your property records."
    },
    {
      question: "Is your work guaranteed?",
      answer: "Yes. All our work comes with our satisfaction guarantee, and notifiable work is also covered by NAPIT's Platinum Promise warranty scheme, providing additional protection if any issues arise."
    }
  ];

  return (
    <ServicePageTemplate
      title="Registered Electrician"
      metaTitle="Registered Electrician Near Me | NAPIT Approved | 247Electrician"
      metaDescription="NAPIT registered electrician near you in Black Country, Birmingham & Walsall. Certified, insured, Part P compliant. All work guaranteed with proper certification. Call for free quote."
      heroIcon={BadgeCheck}
      intro="Fully registered with NAPIT, one of the UK's leading electrical competent person schemes. All work certified, compliant with Part P Building Regulations, and backed by warranty protection."
      benefits={[
        "NAPIT Registered",
        "Part P Compliant",
        "Full Certification",
        "Warranty Protected",
        "Verifiable Online",
      ]}
      mainContent={mainContent}
      standards={[
        "BS 7671:2018+A2:2022",
        "Part P Building Regulations",
        "NAPIT Competent Person Scheme",
        "18th Edition Wiring Regs",
      ]}
      relatedServices={[
        {
          title: "EICR Certificates",
          href: "/services/eicr-certificates",
          description: "Electrical safety inspections and condition reports.",
        },
        {
          title: "Fuse Board Upgrades",
          href: "/services/fuse-board-upgrades",
          description: "Part P notifiable consumer unit installations.",
        },
        {
          title: "Residential Electrician",
          href: "/services/residential-electrician",
          description: "Full range of domestic electrical services.",
        },
      ]}
      afterContent={
        <FAQSection
          faqs={faqs}
          title="Registered Electrician FAQs"
          description="Common questions about electrical registration and certification"
        />
      }
    />
  );
};

export default RegisteredElectrician;
