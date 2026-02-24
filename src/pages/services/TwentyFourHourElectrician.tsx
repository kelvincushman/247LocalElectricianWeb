import { Clock } from "lucide-react";
import ServicePageTemplate from "@/components/ServicePageTemplate";
import FAQSection from "@/components/FAQSection";
import { Link } from "react-router-dom";

const TwentyFourHourElectrician = () => {
  const mainContent = (
    <div className="space-y-6 text-foreground">
      <h2 className="text-2xl font-bold text-primary">24 Hour Electrician Near You – Open Now</h2>

      <p>
        Need an <strong>electrician open now</strong>? 247Electrician provides round-the-clock electrical services
        across the Black Country, Birmingham, Walsall, and Cannock. Whether it's 3am on a Sunday or midday on a
        Monday, our NAPIT-approved electricians are available to help with any electrical emergency or urgent repair.
      </p>

      <h3 className="text-xl font-bold text-primary">Why Choose a 24 Hour Electrician?</h3>

      <p>
        Electrical problems don't stick to business hours. A <strong>24 hour electrician near you</strong> means:
      </p>

      <ul className="list-disc pl-6 space-y-2">
        <li><strong>Immediate Response</strong> – No waiting until Monday morning</li>
        <li><strong>Safety First</strong> – Dangerous electrical issues resolved quickly</li>
        <li><strong>Peace of Mind</strong> – Know that help is always just a phone call away</li>
        <li><strong>Convenience</strong> – Appointments that fit your schedule, day or night</li>
        <li><strong>Emergency Coverage</strong> – 365 days a year, including bank holidays</li>
      </ul>

      <h3 className="text-xl font-bold text-primary">When to Call a 24 Hour Electrician</h3>

      <p>
        While some electrical issues can wait until normal business hours, others require immediate attention.
        Call our 24 hour service for:
      </p>

      <ul className="list-disc pl-6 space-y-2">
        <li><strong>Complete power failure</strong> – Loss of electricity to your property</li>
        <li><strong>Burning smells</strong> – From sockets, switches, or the consumer unit</li>
        <li><strong>Sparking or arcing</strong> – Visible sparks from any electrical point</li>
        <li><strong>Electric shocks</strong> – When touching switches or appliances</li>
        <li><strong>Exposed wiring</strong> – Damaged cables creating safety hazards</li>
        <li><strong>Water and electrics</strong> – Flooding affecting your electrical system</li>
        <li><strong>Persistent tripping</strong> – RCDs or MCBs that won't stay on</li>
        <li><strong>No heating in winter</strong> – When electric heating fails in cold weather</li>
      </ul>

      <h3 className="text-xl font-bold text-primary">Electrician Open Now – How We Work</h3>

      <p>
        When you contact our <strong>24 hour electrician</strong> service:
      </p>

      <ol className="list-decimal pl-6 space-y-2">
        <li><strong>Call us</strong> on <a href="tel:01902943929" className="text-emergency font-bold hover:underline">01902 943 929</a> or WhatsApp</li>
        <li><strong>Describe the issue</strong> – Our team will assess the urgency</li>
        <li><strong>Get safety advice</strong> – We'll guide you on immediate steps to stay safe</li>
        <li><strong>Electrician dispatched</strong> – The nearest available engineer heads to you</li>
        <li><strong>Fast arrival</strong> – Typically 30-90 minutes depending on location</li>
        <li><strong>On-site diagnosis</strong> – Professional assessment of the problem</li>
        <li><strong>Fixed-price quote</strong> – Clear pricing before any work begins</li>
        <li><strong>Repair completed</strong> – Most issues resolved on the first visit</li>
      </ol>

      <h3 className="text-xl font-bold text-primary">24/7 Emergency Electrician Prices</h3>

      <p>
        Our <strong>24 hour electrician</strong> service is competitively priced with no hidden charges:
      </p>

      <ul className="list-disc pl-6 space-y-2">
        <li><strong>Standard call-out (8am-6pm weekdays)</strong> – £85 includes first hour</li>
        <li><strong>Evening/Weekend call-out</strong> – £110 includes first hour</li>
        <li>Additional labour charged in 30-minute increments</li>
        <li>Parts charged at cost plus small handling fee</li>
        <li>No call-out fee if we can't help</li>
      </ul>

      <p>
        View our full <Link to="/rate-card" className="text-primary hover:text-emergency font-semibold">pricing guide</Link> for
        detailed rates.
      </p>

      <h3 className="text-xl font-bold text-primary">Areas We Cover – 24 Hours</h3>

      <p>
        Our 24 hour electrician service covers a wide area of the West Midlands:
      </p>

      <ul className="list-disc pl-6 space-y-2">
        <li><Link to="/areas/wolverhampton" className="text-primary hover:text-emergency font-semibold">Wolverhampton</Link> – Including Tettenhall, Penn, Bushbury, Wednesfield</li>
        <li><Link to="/areas/birmingham" className="text-primary hover:text-emergency font-semibold">Birmingham</Link> – Central, North, Handsworth, Perry Barr, Erdington</li>
        <li><Link to="/areas/walsall" className="text-primary hover:text-emergency font-semibold">Walsall</Link> – Including Aldridge, Bloxwich, Brownhills</li>
        <li><Link to="/areas/dudley" className="text-primary hover:text-emergency font-semibold">Dudley</Link> – Including Stourbridge, Brierley Hill, Sedgley</li>
        <li><Link to="/areas/bilston" className="text-primary hover:text-emergency font-semibold">Bilston</Link>, <Link to="/areas/willenhall" className="text-primary hover:text-emergency font-semibold">Willenhall</Link>, <Link to="/areas/wednesbury" className="text-primary hover:text-emergency font-semibold">Wednesbury</Link>, <Link to="/areas/tipton" className="text-primary hover:text-emergency font-semibold">Tipton</Link></li>
        <li><Link to="/areas/cannock" className="text-primary hover:text-emergency font-semibold">Cannock</Link> and South Staffordshire</li>
      </ul>

      <p>
        Check our <Link to="/service-areas" className="text-primary hover:text-emergency font-semibold">full coverage map</Link> to
        confirm we can reach you.
      </p>

      <h3 className="text-xl font-bold text-primary">Not an Emergency? Book Ahead</h3>

      <p>
        If your electrical issue isn't urgent, you can still benefit from our flexible scheduling. We offer
        evening and weekend appointments for non-emergency work, perfect if you can't take time off work.
        For general <Link to="/services/residential-electrician" className="text-primary hover:text-emergency font-semibold">residential electrician</Link> services,
        we can usually book you in within 24-48 hours.
      </p>

      <h3 className="text-xl font-bold text-primary">Qualified & Insured 24/7</h3>

      <p>
        Every electrician attending your property – day or night – is:
      </p>

      <ul className="list-disc pl-6 space-y-2">
        <li><strong>NAPIT registered</strong> – Competent person scheme membership</li>
        <li><strong>Fully qualified</strong> – City & Guilds or NVQ Level 3</li>
        <li><strong>Experienced</strong> – Gold Card JIB electricians</li>
        <li><strong>Fully insured</strong> – Public liability and professional indemnity</li>
        <li><strong>ID verified</strong> – All engineers carry photo ID</li>
      </ul>

      <p>
        All work complies with <strong>BS 7671:2018+A2:2022</strong> and includes certification where required.
      </p>
    </div>
  );

  const faqs = [
    {
      question: "Is your 24 hour electrician service really available all night?",
      answer: "Yes, we operate a genuine 24/7 service. Our electricians work shifts to ensure coverage around the clock, including nights, weekends, and bank holidays. Call 01902 943 929 at any time."
    },
    {
      question: "How quickly can a 24 hour electrician reach me?",
      answer: "For emergencies, we typically arrive within 30-90 minutes depending on your location and current demand. Our engineers are based across the West Midlands to minimise travel time."
    },
    {
      question: "Do you charge more for night-time call-outs?",
      answer: "We have two rates: standard (8am-6pm weekdays) and evening/weekend (outside these hours). The evening/weekend rate is slightly higher but still competitive. All prices are quoted upfront with no hidden charges."
    },
    {
      question: "What if the problem can't be fixed immediately?",
      answer: "If a full repair isn't possible on the first visit (e.g., parts needed), we'll make the situation safe and arrange a follow-up at your convenience. We won't leave you with a dangerous installation."
    },
    {
      question: "Are your 24 hour electricians qualified?",
      answer: "Absolutely. All our electricians are NAPIT registered and hold recognised qualifications including City & Guilds. They carry ID and you can verify their registration online."
    },
    {
      question: "Can I book a non-emergency appointment outside normal hours?",
      answer: "Yes, we're happy to arrange evening or weekend appointments for non-urgent work. This is ideal if you work during the day and can't be home for tradesman visits."
    }
  ];

  return (
    <ServicePageTemplate
      title="24 Hour Electrician"
      metaTitle="24 Hour Electrician Near Me | Electrician Open Now | 247Electrician"
      metaDescription="Need a 24 hour electrician near you? Electrician open now in Black Country, Birmingham, Walsall & Cannock. 30-90 min response. NAPIT approved. Call 01902 943 929."
      heroIcon={Clock}
      intro="Electrician open now, 24 hours a day, 7 days a week. Fast response across the West Midlands for emergencies and urgent repairs. Call us any time – we're always here."
      benefits={[
        "Open Right Now",
        "30-90 Min Response",
        "365 Days a Year",
        "No Hidden Charges",
        "NAPIT Approved",
      ]}
      mainContent={mainContent}
      standards={[
        "BS 7671:2018+A2:2022",
        "Part P Building Regulations",
        "IET Wiring Regulations",
        "NAPIT Registered",
      ]}
      relatedServices={[
        {
          title: "Emergency Callouts",
          href: "/services/emergency-callouts",
          description: "Dedicated emergency electrical response for urgent situations.",
        },
        {
          title: "Fault Finding & Repairs",
          href: "/services/fault-finding-and-repairs",
          description: "Expert diagnosis and repair of electrical problems.",
        },
        {
          title: "Fuse Board Upgrades",
          href: "/services/fuse-board-upgrades",
          description: "Modern consumer units to prevent future issues.",
        },
      ]}
      afterContent={
        <FAQSection
          faqs={faqs}
          title="24 Hour Electrician FAQs"
          description="Common questions about our round-the-clock service"
        />
      }
    />
  );
};

export default TwentyFourHourElectrician;
