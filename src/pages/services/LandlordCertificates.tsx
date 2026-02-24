import { FileText } from "lucide-react";
import ServicePageTemplate from "@/components/ServicePageTemplate";
import FAQSection from "@/components/FAQSection";
import { Link } from "react-router-dom";

const LandlordCertificates = () => {
  const faqs = [
    {
      question: "What electrical certificates do landlords need?",
      answer: "All landlords need a valid Electrical Installation Condition Report (EICR) for their rental property. The EICR must be no more than 5 years old. You may also need PAT testing for any appliances you provide, and smoke/CO alarm certification."
    },
    {
      question: "How often do landlords need an EICR?",
      answer: "EICRs must be carried out at least every 5 years, or more frequently if the previous report recommends earlier testing. You must also have one before a new tenant moves in if the current report is more than 5 years old."
    },
    {
      question: "Do social housing landlords need EICRs now?",
      answer: "Yes, since November 2025, the Electrical Safety Standards regulations have been extended to social housing. Housing associations, councils, and registered providers must meet the same 5-year inspection requirements as private landlords."
    },
    {
      question: "What happens if I don't have a valid EICR?",
      answer: "Local authorities can impose fines of up to £40,000 for landlords without valid electrical safety certification. They can also arrange remedial work themselves and recover costs from you. Non-compliance may also affect your ability to evict tenants."
    },
    {
      question: "Do I need to give tenants a copy of the EICR?",
      answer: "Yes, you must provide a copy of the EICR to existing tenants within 28 days of the inspection. For new tenants, you must provide a copy before they move in. You must also supply a copy to your local authority within 7 days if requested."
    },
    {
      question: "What if the EICR identifies problems?",
      answer: "If your EICR identifies C1 (danger present) or C2 (potentially dangerous) defects, you must complete remedial work within 28 days, or within 24 hours for immediate dangers. We provide clear quotes for any repairs needed."
    }
  ];

  const mainContent = (
    <div className="space-y-6 text-foreground">
      <h2 className="text-2xl font-bold text-primary">Landlord Electrical Safety Certificates</h2>

      <p>
        All landlords in England must ensure their rental properties meet electrical safety standards
        and have a valid Electrical Installation Condition Report (EICR). At 247Electrician, we provide comprehensive
        landlord certification services across the Black Country, Birmingham, Walsall, and Cannock, helping private
        landlords, housing associations, and social housing providers meet their legal obligations.
      </p>

      <h3 className="text-xl font-bold text-primary">NEW: Social Housing Now Included (2025)</h3>

      <p>
        The <strong>Electrical Safety Standards (Extension to Social Rented Sector) Regulations 2025</strong> extends
        the requirements that private landlords have had since 2020 to the social rented sector. Housing associations,
        local authorities, and registered providers must now comply with the same electrical safety standards.
      </p>

      <p>
        <strong>Key compliance dates for social housing:</strong>
      </p>

      <ul className="list-disc pl-6 space-y-2">
        <li><strong>1 November 2025</strong> – Regulations in force for new tenancies</li>
        <li><strong>1 May 2026</strong> – Existing tenancies (granted before 1 December 2025) must comply</li>
        <li><strong>1 November 2026</strong> – Full compliance required on all installations and equipment</li>
      </ul>

      <h3 className="text-xl font-bold text-primary">Legal Requirements for All Landlords</h3>

      <p>
        Both private and social landlords must now:
      </p>

      <ul className="list-disc pl-6 space-y-2">
        <li>Have the electrical installation inspected and tested by a qualified person</li>
        <li>Ensure inspections are carried out <strong>at least every 5 years</strong></li>
        <li>Obtain an EICR from the inspector</li>
        <li>Supply a copy of the report to tenants <strong>within 28 days</strong> (or before new tenants occupy)</li>
        <li>Supply a copy to the local authority within 7 days if requested</li>
        <li>Undertake <strong>PAT testing</strong> of electrical equipment provided as part of a tenancy</li>
        <li>Complete any remedial work <strong>within 28 days</strong> (or as specified in the report)</li>
      </ul>

      <h3 className="text-xl font-bold text-primary">Our Landlord Services</h3>

      <p>
        We offer a complete compliance package for landlords:
      </p>

      <ul className="list-disc pl-6 space-y-2">
        <li><strong>EICR inspections</strong> – Comprehensive testing of your electrical installation</li>
        <li><strong>Remedial work quotations</strong> – Clear pricing for any required repairs</li>
        <li><strong>Urgent remediation</strong> – Fast turnaround on Code C1 and C2 defects</li>
        <li><strong>Re-inspection certificates</strong> – Confirmation that remedial work has been completed</li>
        <li><strong>Portfolio management</strong> – Scheduled inspections across multiple properties</li>
        <li><strong>Smoke alarm compliance</strong> – Testing and certification included</li>
      </ul>

      <h3 className="text-xl font-bold text-primary">Penalties for Non-Compliance</h3>

      <p>
        Local authorities can now impose financial penalties of <strong>up to £40,000</strong> for breaches of
        electrical safety duties. They can also arrange for remedial work to be carried out and recover costs
        from the landlord. Maintaining valid certification protects both you and your tenants.
      </p>

      <p>
        For <Link to="/services/hmo-electrical-testing" className="text-primary hover:text-emergency font-semibold">HMO properties</Link>,
        additional requirements may apply including
        <Link to="/services/emergency-lighting-testing" className="text-primary hover:text-emergency font-semibold"> emergency lighting</Link> and
        <Link to="/services/smoke-alarm-installation" className="text-primary hover:text-emergency font-semibold">fire alarm systems</Link>.
        We can advise on your specific licensing requirements.
      </p>
    </div>
  );

  return (
    <ServicePageTemplate
      title="Landlord Certificates"
      metaTitle="Landlord Electrical Certificates | Black Country & Birmingham"
      metaDescription="Landlord electrical safety certificates in Black Country, Birmingham, Walsall & Cannock. EICR inspections, remedial work, full compliance. NAPIT approved."
      heroIcon={FileText}
      intro="Complete landlord electrical safety compliance. We provide EICR inspections, remedial works, and certification to meet your legal obligations."
      benefits={[
        "Same-Day Reports",
        "Remedial Works",
        "Portfolio Discounts",
        "Full Compliance",
        "NAPIT Approved",
      ]}
      mainContent={mainContent}
      standards={[
        "Electrical Safety Standards Regs 2020 & 2025",
        "BS 7671:2018+A2:2022",
        "IET Guidance Note 3",
        "Part P Building Regulations",
      ]}
      afterContent={<FAQSection faqs={faqs} />}
      relatedServices={[
        {
          title: "EICR Certificates",
          href: "/services/eicr-certificates",
          description: "Detailed information about EICR inspections.",
        },
        {
          title: "HMO Electrical Testing",
          href: "/services/hmo-electrical-testing",
          description: "Specialist services for HMO properties.",
        },
        {
          title: "Smoke Alarm Installation",
          href: "/services/smoke-alarm-installation",
          description: "Fire detection for rental compliance.",
        },
      ]}
    />
  );
};

export default LandlordCertificates;
