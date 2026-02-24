import { Home } from "lucide-react";
import ServicePageTemplate from "@/components/ServicePageTemplate";
import FAQSection from "@/components/FAQSection";
import { Link } from "react-router-dom";

const ResidentialElectrician = () => {
  const mainContent = (
    <div className="space-y-6 text-foreground">
      <h2 className="text-2xl font-bold text-primary">Your Trusted Residential Electrician Near You</h2>

      <p>
        Looking for a reliable <strong>residential electrician near you</strong>? 247Electrician provides comprehensive
        domestic electrical services throughout the Black Country, Birmingham, Walsall, and Cannock. Whether you need
        a small repair or a complete house rewire, our NAPIT-approved electricians are here to help – available 24/7
        for emergencies.
      </p>

      <h3 className="text-xl font-bold text-primary">Residential Electrical Services We Offer</h3>

      <p>
        As your <strong>local residential electrician</strong>, we handle all domestic electrical work, from minor repairs
        to major installations. Our services include:
      </p>

      <ul className="list-disc pl-6 space-y-2">
        <li>
          <Link to="/services/socket-installation" className="text-primary hover:text-emergency font-semibold">
            Socket & Switch Installation
          </Link> – Additional sockets, USB charging points, and switch upgrades
        </li>
        <li>
          <Link to="/services/lighting-installation" className="text-primary hover:text-emergency font-semibold">
            Lighting Installation
          </Link> – Indoor, outdoor, and decorative lighting solutions
        </li>
        <li>
          <Link to="/services/fuse-board-upgrades" className="text-primary hover:text-emergency font-semibold">
            Consumer Unit Upgrades
          </Link> – Modern fuse boards with RCD protection for improved safety
        </li>
        <li>
          <Link to="/services/rewiring" className="text-primary hover:text-emergency font-semibold">
            Full & Partial Rewiring
          </Link> – Complete electrical system upgrades for older properties
        </li>
        <li>
          <Link to="/services/fault-finding-and-repairs" className="text-primary hover:text-emergency font-semibold">
            Fault Finding & Repairs
          </Link> – Diagnosis and repair of electrical problems
        </li>
        <li>
          <Link to="/services/eicr-certificates" className="text-primary hover:text-emergency font-semibold">
            EICR Certificates
          </Link> – Electrical safety inspections and certification
        </li>
        <li>
          <Link to="/services/smoke-alarm-installation" className="text-primary hover:text-emergency font-semibold">
            Smoke & Carbon Monoxide Alarms
          </Link> – Compliant alarm systems for home safety
        </li>
        <li>
          <Link to="/services/ev-charger-installation" className="text-primary hover:text-emergency font-semibold">
            EV Charger Installation
          </Link> – Home electric vehicle charging points
        </li>
      </ul>

      <h3 className="text-xl font-bold text-primary">Residential Electrician for Small Jobs</h3>

      <p>
        No job is too small for our team. We're happy to help with:
      </p>

      <ul className="list-disc pl-6 space-y-2">
        <li>Installing additional plug sockets</li>
        <li>Fitting new light fixtures or ceiling fans</li>
        <li>Replacing faulty switches or dimmers</li>
        <li>Adding outdoor lighting or security lights</li>
        <li>Installing TV points or telephone sockets</li>
        <li>Fixing tripping circuits or dead sockets</li>
        <li>Testing and certifying electrical work</li>
      </ul>

      <p>
        Many homeowners struggle to find a <strong>residential electrician for small jobs</strong> – we welcome all work,
        big or small, and provide the same professional service regardless of job size.
      </p>

      <h3 className="text-xl font-bold text-primary">Affordable Residential Electrician Prices</h3>

      <p>
        We believe in transparent, competitive pricing. All quotes are provided upfront with no hidden charges.
        Our <Link to="/rate-card" className="text-primary hover:text-emergency font-semibold">rate card</Link> gives
        you a clear idea of costs, and we're always happy to provide free estimates for larger projects.
      </p>

      <p>
        As an <strong>affordable residential electrician</strong>, we offer:
      </p>

      <ul className="list-disc pl-6 space-y-2">
        <li>Free, no-obligation quotes</li>
        <li>Fixed-price jobs where possible</li>
        <li>No call-out charges during normal hours</li>
        <li>Competitive hourly rates</li>
        <li>Discounts for larger projects</li>
      </ul>

      <h3 className="text-xl font-bold text-primary">24 Hour Residential Electrician</h3>

      <p>
        Electrical emergencies don't wait for business hours. Our <strong>24 hour residential electrician</strong> service
        means you can reach us any time – day or night, weekends, and bank holidays. We provide rapid response to:
      </p>

      <ul className="list-disc pl-6 space-y-2">
        <li>Complete power failures</li>
        <li>Sparking sockets or burning smells</li>
        <li>Exposed or damaged wiring</li>
        <li>Constantly tripping circuits</li>
        <li>Electric shock incidents</li>
        <li>Storm or flood damage to electrics</li>
      </ul>

      <p>
        For emergencies, call us immediately on <a href="tel:01902943929" className="text-emergency font-bold hover:underline">01902 943 929</a> or
        visit our <Link to="/services/emergency-callouts" className="text-primary hover:text-emergency font-semibold">emergency callouts</Link> page.
      </p>

      <h3 className="text-xl font-bold text-primary">Licensed & NAPIT Approved</h3>

      <p>
        All our electricians are fully qualified and registered with NAPIT, one of the UK's leading electrical
        certification bodies. This means:
      </p>

      <ul className="list-disc pl-6 space-y-2">
        <li>All work complies with <strong>BS 7671:2018+A2:2022</strong> (18th Edition Wiring Regulations)</li>
        <li>Part P Building Regulations certification included</li>
        <li>Full insurance and public liability cover</li>
        <li>Certificates issued for all notifiable work</li>
        <li>Work guaranteed for your peace of mind</li>
      </ul>

      <h3 className="text-xl font-bold text-primary">Areas We Cover</h3>

      <p>
        We provide residential electrician services across a wide area of the West Midlands:
      </p>

      <ul className="list-disc pl-6 space-y-2">
        <li><Link to="/areas/wolverhampton" className="text-primary hover:text-emergency font-semibold">Wolverhampton</Link> and surrounding areas</li>
        <li><Link to="/areas/birmingham" className="text-primary hover:text-emergency font-semibold">Birmingham</Link> – Central and North</li>
        <li><Link to="/areas/walsall" className="text-primary hover:text-emergency font-semibold">Walsall</Link> and surrounding areas</li>
        <li><Link to="/areas/dudley" className="text-primary hover:text-emergency font-semibold">Dudley</Link> and the Black Country</li>
        <li><Link to="/areas/cannock" className="text-primary hover:text-emergency font-semibold">Cannock</Link> and South Staffordshire</li>
        <li><Link to="/areas/bilston" className="text-primary hover:text-emergency font-semibold">Bilston</Link>, <Link to="/areas/willenhall" className="text-primary hover:text-emergency font-semibold">Willenhall</Link>, <Link to="/areas/wednesbury" className="text-primary hover:text-emergency font-semibold">Wednesbury</Link>, and more</li>
      </ul>

      <p>
        View our full <Link to="/service-areas" className="text-primary hover:text-emergency font-semibold">service areas map</Link> to
        confirm we cover your location.
      </p>

      <h3 className="text-xl font-bold text-primary">Why Choose 247Electrician?</h3>

      <p>
        When you search for a <strong>residential electrician near me</strong>, you want someone you can trust.
        Here's why local homeowners choose us:
      </p>

      <ul className="list-disc pl-6 space-y-2">
        <li><strong>Local & Reliable</strong> – Based in the Black Country, we know your area</li>
        <li><strong>Fully Qualified</strong> – NAPIT registered with full Part P certification</li>
        <li><strong>Transparent Pricing</strong> – Clear quotes with no hidden charges</li>
        <li><strong>Available 24/7</strong> – Emergency electrician service around the clock</li>
        <li><strong>All Jobs Welcome</strong> – From small repairs to complete rewires</li>
        <li><strong>Clean & Tidy</strong> – We respect your home and leave it spotless</li>
        <li><strong>Guaranteed Work</strong> – All work comes with our satisfaction guarantee</li>
      </ul>
    </div>
  );

  const faqs = [
    {
      question: "How much does a residential electrician charge per hour?",
      answer: "Our standard hourly rate is competitive for the West Midlands area. For most jobs, we prefer to provide fixed-price quotes so you know exactly what you'll pay. Contact us for a free estimate tailored to your specific requirements."
    },
    {
      question: "Do you offer free estimates for residential electrical work?",
      answer: "Yes, we provide free, no-obligation quotes for all residential electrical work. For simple jobs, we can often quote over the phone. For larger projects, we'll arrange a convenient time to visit and assess the work required."
    },
    {
      question: "Can you help with small electrical jobs?",
      answer: "Absolutely! We welcome all jobs, no matter how small. Whether you need a single socket installed, a light fitting replaced, or just some advice about your home's electrics, we're happy to help."
    },
    {
      question: "Are your electricians qualified and insured?",
      answer: "Yes, all our electricians are fully qualified, NAPIT registered, and carry comprehensive public liability insurance. We provide certification for all notifiable work as required by Part P of the Building Regulations."
    },
    {
      question: "Do you provide emergency residential electrician services?",
      answer: "Yes, we operate a 24/7 emergency service for residential customers. If you have an electrical emergency at any time of day or night, call us on 01902 943 929 for immediate assistance."
    },
    {
      question: "How quickly can you attend a residential job?",
      answer: "For emergencies, we aim to attend within 1-2 hours. For non-urgent work, we typically offer appointments within 24-48 hours, though we can often accommodate same-day bookings if you need us sooner."
    },
    {
      question: "What areas do you cover for residential electrical work?",
      answer: "We cover the Black Country (Wolverhampton, Bilston, Dudley, etc.), Birmingham Central & North, Walsall and surrounds, Cannock, and South Staffordshire. Check our service areas page for full details."
    },
    {
      question: "Do I need to be home while you work?",
      answer: "For most jobs, it's helpful if someone is home at least at the start and end of the work. However, for longer projects, we're happy to work independently if you provide access and leave contact details."
    }
  ];

  return (
    <ServicePageTemplate
      title="Residential Electrician"
      metaTitle="Residential Electrician Near Me | 24/7 Local Domestic Electrician"
      metaDescription="Looking for a residential electrician near you? 247Electrician offers affordable domestic electrical services in Black Country, Birmingham & Walsall. Small jobs welcome. NAPIT approved. Call 24/7."
      heroIcon={Home}
      intro="Your trusted local residential electrician for all domestic electrical needs. From small repairs to complete rewires, we're here to help – 24 hours a day, 7 days a week."
      benefits={[
        "Small Jobs Welcome",
        "Free Quotes",
        "24/7 Emergency Service",
        "NAPIT Approved",
        "Fixed-Price Work",
      ]}
      mainContent={mainContent}
      standards={[
        "BS 7671:2018+A2:2022",
        "Part P Building Regulations",
        "18th Edition Wiring Regulations",
        "NAPIT Registered",
      ]}
      relatedServices={[
        {
          title: "Socket Installation",
          href: "/services/socket-installation",
          description: "Additional sockets, USB points, and switch upgrades for your home.",
        },
        {
          title: "Lighting Installation",
          href: "/services/lighting-installation",
          description: "Indoor and outdoor lighting solutions for every room.",
        },
        {
          title: "EICR Certificates",
          href: "/services/eicr-certificates",
          description: "Electrical safety inspections and certification for homeowners.",
        },
      ]}
      afterContent={
        <FAQSection
          faqs={faqs}
          title="Residential Electrician FAQs"
          description="Common questions about our residential electrical services"
        />
      }
    />
  );
};

export default ResidentialElectrician;
