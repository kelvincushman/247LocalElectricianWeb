import { AlertTriangle } from "lucide-react";
import ServicePageTemplate from "@/components/ServicePageTemplate";
import { Link } from "react-router-dom";

const EmergencyCallouts = () => {
  const mainContent = (
    <div className="space-y-6 text-foreground">
      <h2 className="text-2xl font-bold text-primary">24/7 Emergency Electrical Services in the Black Country & Birmingham</h2>

      <p>
        When electrical emergencies strike, you need a qualified electrician who can respond quickly and resolve the issue safely.
        At 247Electrician, we provide round-the-clock emergency callout services across the Black Country, Birmingham Central & North,
        Walsall, and Cannock. Our NAPIT-approved electricians typically arrive within one hour of your call.
      </p>

      <h3 className="text-xl font-bold text-primary">Common Electrical Emergencies We Handle</h3>

      <p>
        Electrical emergencies can range from minor inconveniences to serious safety hazards. We regularly attend to:
      </p>

      <ul className="list-disc pl-6 space-y-2">
        <li><strong>Complete power loss</strong> – When your property loses all electrical supply</li>
        <li><strong>Tripping circuits</strong> – RCDs or MCBs that keep tripping repeatedly</li>
        <li><strong>Burning smells from sockets or switches</strong> – A potential fire hazard requiring immediate attention</li>
        <li><strong>Sparking or arcing</strong> – Visible sparks from electrical points</li>
        <li><strong>Electric shocks</strong> – When touching appliances or switches</li>
        <li><strong>Water ingress to electrical systems</strong> – Following leaks or flooding</li>
        <li><strong>Damaged or exposed wiring</strong> – Creating shock or fire risks</li>
      </ul>

      <h3 className="text-xl font-bold text-primary">Our Emergency Response Process</h3>

      <p>
        When you contact us with an electrical emergency, we follow a structured approach to ensure your safety.
        Our engineer will first provide telephone guidance to help you isolate the problem safely. We then dispatch
        the nearest available electrician to your location, typically arriving within 30 to 90 minutes depending
        on your area.
      </p>

      <p>
        All emergency work is carried out in accordance with <strong>BS 7671:2018+A2:2022</strong> (the IET Wiring Regulations).
        Where notifiable work is required, we ensure full compliance with Part P of the Building Regulations and
        provide the necessary certification.
      </p>

      <h3 className="text-xl font-bold text-primary">Why Choose 247Electrician for Emergencies?</h3>

      <p>
        Our team comprises experienced, Gold Card JIB electricians with over 65 years of combined experience.
        We carry comprehensive spares in our vans, enabling us to resolve most issues on the first visit.
        There are no hidden call-out charges – we provide upfront pricing before any work begins.
      </p>

      <p>
        For non-emergency <Link to="/services/fault-finding-and-repairs" className="text-primary hover:text-emergency font-semibold">fault finding and repairs</Link>,
        we offer scheduled appointments at competitive rates. If your emergency relates to your
        <Link to="/services/fuse-board-upgrades" className="text-primary hover:text-emergency font-semibold"> consumer unit</Link>,
        we can advise whether an upgrade would prevent future issues.
      </p>
    </div>
  );

  return (
    <ServicePageTemplate
      title="Emergency Callouts"
      metaTitle="24/7 Emergency Electrician Black Country & Birmingham"
      metaDescription="24/7 emergency electrician serving Black Country, Birmingham, Walsall & Cannock. 1hr response time, NAPIT approved, no hidden call-out charges. Call now for immediate assistance."
      heroIcon={AlertTriangle}
      intro="Fast, reliable emergency electrical services available 24 hours a day, 7 days a week. Our qualified electricians respond within one hour across the Black Country and Birmingham."
      benefits={[
        "1 Hour Response Time",
        "24/7 Availability",
        "No Hidden Charges",
        "NAPIT Approved",
        "Fully Insured",
      ]}
      mainContent={mainContent}
      standards={[
        "BS 7671:2018+A2:2022",
        "Part P Building Regulations",
        "IET Wiring Regulations",
      ]}
      relatedServices={[
        {
          title: "Fault Finding & Repairs",
          href: "/services/fault-finding-and-repairs",
          description: "Professional diagnosis of electrical problems and expert repairs.",
        },
        {
          title: "Fuse Board Upgrades",
          href: "/services/fuse-board-upgrades",
          description: "Modern consumer unit installations with RCD protection.",
        },
        {
          title: "EICR Certificates",
          href: "/services/eicr-certificates",
          description: "Electrical safety inspections for homes and landlords.",
        },
      ]}
    />
  );
};

export default EmergencyCallouts;
