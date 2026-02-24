import { Building } from "lucide-react";
import ServicePageTemplate from "@/components/ServicePageTemplate";
import { Link } from "react-router-dom";

const HMOElectricalTesting = () => {
  const mainContent = (
    <div className="space-y-6 text-foreground">
      <h2 className="text-2xl font-bold text-primary">HMO Electrical Testing & Compliance</h2>

      <p>
        Houses in Multiple Occupation (HMOs) have specific electrical safety requirements that exceed those
        for standard rental properties. At 247Electrician, we provide comprehensive HMO electrical testing
        and compliance services across the Black Country, Birmingham, Walsall, and Cannock, ensuring your
        property meets licensing conditions.
      </p>

      <h3 className="text-xl font-bold text-primary">2025 Regulatory Update</h3>

      <p>
        The <strong>Electrical Safety Standards (Extension to Social Rented Sector) Regulations 2025</strong> now
        applies to social housing HMOs. Whether privately owned or managed by a housing association, all HMOs
        must now comply with the same electrical safety standards. Local authorities can impose fines of
        <strong> up to £40,000</strong> for non-compliance.
      </p>

      <h3 className="text-xl font-bold text-primary">HMO Electrical Requirements</h3>

      <p>
        HMO licensing typically requires:
      </p>

      <ul className="list-disc pl-6 space-y-2">
        <li><strong>Valid EICR</strong> – Electrical installation inspection no more than 5 years old</li>
        <li><strong>PAT testing</strong> – Testing of portable appliances provided with the tenancy</li>
        <li><strong>Emergency lighting</strong> – Illumination of escape routes and common areas</li>
        <li><strong>Fire detection systems</strong> – Grade A, B, C, or D systems depending on property size</li>
        <li><strong>Fire alarm testing</strong> – Regular testing with documented records</li>
        <li><strong>Socket provision</strong> – Adequate power points in each letting room</li>
        <li><strong>Kitchen electrical</strong> – Sufficient sockets for shared cooking facilities</li>
        <li><strong>Common area lighting</strong> – Adequate illumination with appropriate controls</li>
      </ul>

      <h3 className="text-xl font-bold text-primary">Our HMO Services</h3>

      <p>
        We offer complete HMO electrical compliance packages:
      </p>

      <ul className="list-disc pl-6 space-y-2">
        <li><strong>Pre-licensing surveys</strong> – Identifying works required before licence application</li>
        <li><strong>EICR inspections</strong> – Full electrical testing with same-day reports</li>
        <li><strong>Emergency lighting installation</strong> – BS 5266 compliant systems</li>
        <li><strong>Fire alarm installation</strong> – BS 5839-6 systems to required grades</li>
        <li><strong>Annual testing contracts</strong> – Ongoing compliance maintenance</li>
        <li><strong>Remedial works</strong> – Fast turnaround on required improvements</li>
      </ul>

      <h3 className="text-xl font-bold text-primary">Fire Detection Requirements</h3>

      <p>
        Fire detection in HMOs must comply with <strong>BS 5839-6:2019</strong>. The required grade depends on
        property size, layout, and risk assessment. We install and maintain systems from Grade D (battery alarms)
        through to Grade A (fully addressable systems) as specified by your local authority.
      </p>

      <p>
        For <Link to="/services/landlord-certificates" className="text-primary hover:text-emergency font-semibold">standard rental properties</Link>,
        simpler requirements may apply. We can assess your property and advise on the appropriate compliance level.
        Our <Link to="/services/emergency-lighting-installation" className="text-primary hover:text-emergency font-semibold">emergency lighting</Link> and
        <Link to="/services/smoke-alarm-installation" className="text-primary hover:text-emergency font-semibold">fire alarm services</Link> ensure
        complete HMO safety compliance.
      </p>
    </div>
  );

  return (
    <ServicePageTemplate
      title="HMO Electrical Testing"
      metaTitle="HMO Electrical Testing & Compliance | Black Country & Birmingham"
      metaDescription="HMO electrical testing and compliance in Black Country, Birmingham, Walsall & Cannock. EICR, emergency lighting, fire alarms. Licensing compliance guaranteed."
      heroIcon={Building}
      intro="Comprehensive HMO electrical compliance services. We ensure your property meets all licensing requirements for electrical safety, emergency lighting, and fire detection."
      benefits={[
        "Full Compliance",
        "Pre-Licensing Surveys",
        "Annual Contracts",
        "Fast Turnaround",
        "NAPIT Approved",
      ]}
      mainContent={mainContent}
      standards={[
        "BS 7671:2018+A2:2022",
        "Electrical Safety Standards Regs 2025",
        "BS 5839-6:2019",
        "Housing Act 2004",
      ]}
      relatedServices={[
        {
          title: "Emergency Lighting Installation",
          href: "/services/emergency-lighting-installation",
          description: "Compliant emergency lighting for HMOs.",
        },
        {
          title: "Smoke Alarm Installation",
          href: "/services/smoke-alarm-installation",
          description: "Fire detection systems for HMO licensing.",
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

export default HMOElectricalTesting;
