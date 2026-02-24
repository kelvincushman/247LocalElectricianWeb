import { FileCheck } from "lucide-react";
import ServicePageTemplate from "@/components/ServicePageTemplate";
import FAQSection from "@/components/FAQSection";
import { Link } from "react-router-dom";

const EICRCertificates = () => {
  const faqs = [
    {
      question: "What is an EICR and why do I need one?",
      answer: "An Electrical Installation Condition Report (EICR) is a formal document that details the condition of the electrical installation in a property. It identifies any defects, deterioration, or non-compliance with current safety standards. Landlords are legally required to have one every 5 years, and homeowners should have one every 10 years or when buying/selling a property."
    },
    {
      question: "How long does an EICR inspection take?",
      answer: "A typical domestic EICR takes 2-4 hours depending on the size of the property and number of circuits. Larger properties or those with more complex installations may take longer. We can usually provide the report on the same day."
    },
    {
      question: "What happens if my EICR fails?",
      answer: "If your EICR identifies C1 (danger present) or C2 (potentially dangerous) codes, remedial work is required. We provide a clear quote for any repairs needed. For landlords, remedial work must be completed within 28 days, or within 24 hours for C1 defects."
    },
    {
      question: "How much does an EICR cost?",
      answer: "EICR costs vary depending on property size and number of circuits. Contact us for a free quote. Our prices are competitive and include same-day certification where possible."
    },
    {
      question: "Do social housing landlords need EICRs?",
      answer: "Yes, as of November 2025, the Electrical Safety Standards regulations have been extended to social housing. Housing associations, councils, and registered providers must now meet the same 5-year inspection requirements as private landlords, with full compliance required by November 2026."
    },
    {
      question: "What's the penalty for not having a valid EICR?",
      answer: "Local authorities can impose fines of up to £40,000 for landlords who fail to comply with electrical safety regulations. They can also arrange for remedial work and recover the costs from the landlord."
    }
  ];

  const mainContent = (
    <div className="space-y-6 text-foreground">
      <h2 className="text-2xl font-bold text-primary">Electrical Installation Condition Reports (EICRs)</h2>

      <p>
        An Electrical Installation Condition Report (EICR), formerly known as a Periodic Inspection Report,
        provides a comprehensive assessment of your property's electrical installation. At 247Electrician,
        we carry out EICR inspections across the Black Country, Birmingham, Walsall, and Cannock for homeowners,
        landlords, and commercial property owners.
      </p>

      <h3 className="text-xl font-bold text-primary">What Does an EICR Involve?</h3>

      <p>
        During an EICR inspection, our qualified electrician will:
      </p>

      <ul className="list-disc pl-6 space-y-2">
        <li>Visually inspect the consumer unit, wiring, and accessories for damage or deterioration</li>
        <li>Test circuit protective devices (RCDs, MCBs, fuses) for correct operation</li>
        <li>Measure earth fault loop impedance to verify protective device coordination</li>
        <li>Test insulation resistance to identify degraded or damaged cables</li>
        <li>Check polarity and continuity of protective conductors</li>
        <li>Assess the installation against current <strong>BS 7671:2018+A2:2022</strong> requirements</li>
      </ul>

      <h3 className="text-xl font-bold text-primary">Understanding EICR Classifications</h3>

      <p>
        The report classifies any defects found using a coding system:
      </p>

      <ul className="list-disc pl-6 space-y-2">
        <li><strong>Code C1</strong> – Danger present. Risk of injury. Immediate remedial action required</li>
        <li><strong>Code C2</strong> – Potentially dangerous. Urgent remedial action required</li>
        <li><strong>Code C3</strong> – Improvement recommended. Does not currently pose a safety risk</li>
        <li><strong>FI</strong> – Further investigation required without delay</li>
      </ul>

      <p>
        If Code C1 or C2 defects are found, we can provide a quotation for the necessary
        <Link to="/services/fault-finding-and-repairs" className="text-primary hover:text-emergency font-semibold"> repair work</Link> or
        advise whether a <Link to="/services/rewiring" className="text-primary hover:text-emergency font-semibold">rewire</Link> or
        <Link to="/services/fuse-board-upgrades" className="text-primary hover:text-emergency font-semibold"> consumer unit upgrade</Link> would
        be more appropriate.
      </p>

      <h3 className="text-xl font-bold text-primary">Legal Requirements for All Landlords</h3>

      <p>
        <strong>Private Sector Landlords:</strong> Since April 2021, private landlords in England must have a valid EICR
        for all tenanted properties. The report must be no more than five years old at the start of any new tenancy,
        and a copy must be provided to tenants within 28 days of the inspection.
      </p>

      <h3 className="text-xl font-bold text-primary">NEW: Social Housing Regulations 2025</h3>

      <p>
        The <strong>Electrical Safety Standards (Extension to Social Rented Sector) Regulations 2025</strong> now
        require social landlords to meet the same standards that private landlords have had since 2020. This includes
        housing associations, local authorities, and registered providers.
      </p>

      <p>
        <strong>Key dates for social housing:</strong>
      </p>

      <ul className="list-disc pl-6 space-y-2">
        <li><strong>1 November 2025</strong> – Regulations came into force for new tenancies</li>
        <li><strong>1 May 2026</strong> – Obligations apply to tenancies granted before 1 December 2025</li>
        <li><strong>1 November 2026</strong> – Complete compliance required on all installations and equipment</li>
      </ul>

      <h3 className="text-xl font-bold text-primary">All Landlords Must Now</h3>

      <ul className="list-disc pl-6 space-y-2">
        <li>Conduct inspections and testing of electrical installations <strong>at least every five years</strong></li>
        <li>Issue a copy of the EICR to tenants <strong>within 28 days</strong> of inspection (or before new tenants occupy)</li>
        <li>Undertake <strong>PAT testing</strong> of electrical equipment provided as part of a tenancy</li>
        <li>Complete any remedial works <strong>within 28 days</strong></li>
      </ul>

      <h3 className="text-xl font-bold text-primary">Penalties for Non-Compliance</h3>

      <p>
        Local authorities can now impose financial penalties of <strong>up to £40,000</strong> for breaches of
        electrical safety duties. They can also arrange for remedial work to be carried out and recover costs
        from the landlord.
      </p>

      <p>
        For <Link to="/services/hmo-electrical-testing" className="text-primary hover:text-emergency font-semibold">HMO properties</Link> and
        <Link to="/services/landlord-certificates" className="text-primary hover:text-emergency font-semibold"> landlord certificates</Link>,
        we provide comprehensive compliance packages to ensure you meet all legal requirements.
      </p>
    </div>
  );

  return (
    <ServicePageTemplate
      title="EICR Certificates"
      metaTitle="EICR Electrical Inspection | Black Country & Birmingham"
      metaDescription="EICR electrical inspection reports in Black Country, Birmingham, Walsall & Cannock. Landlord certificates, homeowner reports, commercial inspections. NAPIT approved."
      heroIcon={FileCheck}
      intro="Comprehensive Electrical Installation Condition Reports for homeowners, landlords, and businesses. We identify potential hazards and ensure compliance with current regulations."
      benefits={[
        "Landlord Compliant",
        "Same-Day Reports",
        "Competitive Pricing",
        "Remedial Quotes",
        "NAPIT Approved",
      ]}
      mainContent={mainContent}
      standards={[
        "BS 7671:2018+A2:2022",
        "IET Guidance Note 3",
        "Electrical Safety Standards Regs 2020 & 2025",
        "Part P Building Regulations",
      ]}
      afterContent={<FAQSection faqs={faqs} />}
      relatedServices={[
        {
          title: "Landlord Certificates",
          href: "/services/landlord-certificates",
          description: "Complete compliance packages for rental properties.",
        },
        {
          title: "Fuse Board Upgrades",
          href: "/services/fuse-board-upgrades",
          description: "Upgrade to modern protection following your EICR.",
        },
        {
          title: "Fault Finding & Repairs",
          href: "/services/fault-finding-and-repairs",
          description: "Remedial work for any defects identified.",
        },
      ]}
    />
  );
};

export default EICRCertificates;
