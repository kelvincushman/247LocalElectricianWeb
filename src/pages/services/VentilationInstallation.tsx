import { Wind } from "lucide-react";
import ServicePageTemplate from "@/components/ServicePageTemplate";
import FAQSection from "@/components/FAQSection";
import { Link } from "react-router-dom";

const VentilationInstallation = () => {
  const faqs = [
    {
      question: "What is Awaab's Law and how does it affect landlords?",
      answer: "Awaab's Law came into force on 27 October 2025 and requires social housing landlords to address damp and mould hazards within strict timeframes: 24 hours for emergencies, 14 days to investigate complaints, and 7 days to complete repairs. Non-compliance can result in court action, compensation, and rent loss. The law is expected to extend to private landlords."
    },
    {
      question: "What size extractor fan do I need for my bathroom?",
      answer: "Building Regulations require bathroom extractor fans to extract at least 15 litres per second. For larger bathrooms or en-suites with showers, we may recommend higher capacity fans. Fans with humidity sensors or overrun timers are most effective at preventing condensation."
    },
    {
      question: "What is a PIV system and how does it help with damp?",
      answer: "A Positive Input Ventilation (PIV) system is a whole-house solution that draws filtered fresh air from outside and gently pressurises your home, pushing out stale moist air. It's highly effective at eliminating condensation damp and costs only a few pence per day to run."
    },
    {
      question: "How much does it cost to install an extractor fan?",
      answer: "Bathroom extractor fan installation typically costs between £100-300 depending on the fan type and whether new ducting is required. PIV systems cost more but provide whole-house ventilation. Contact us for a free quote based on your specific requirements."
    },
    {
      question: "Can you install an extractor fan where there isn't one already?",
      answer: "Yes, we can install extractor fans in bathrooms, kitchens, and utility rooms that don't have existing ventilation. This involves creating a vent through the external wall and running the electrical supply. All our work complies with Building Regulations Part F and Part P."
    },
    {
      question: "Do I need an electrician to install an extractor fan?",
      answer: "While simple like-for-like replacements may not require an electrician, new installations or changes to electrical circuits in bathrooms are notifiable under Building Regulations Part P. Our NAPIT-approved installations come with the required certification."
    }
  ];

  const mainContent = (
    <div className="space-y-6 text-foreground">
      <h2 className="text-2xl font-bold text-primary">Extractor Fan & Ventilation Installation</h2>

      <p>
        Proper ventilation is essential for healthy homes. At 247Electrician, we install bathroom extractor fans,
        kitchen ventilation, and whole-house ventilation systems throughout the Black Country, Birmingham, Walsall,
        and Cannock. Poor ventilation leads to condensation, damp, and mould — problems that can now result in
        serious legal consequences for landlords under <strong>Awaab's Law</strong>.
      </p>

      <h3 className="text-xl font-bold text-primary">Awaab's Law: What Landlords Need to Know</h3>

      <p>
        <strong>Awaab's Law</strong>, named after two-year-old Awaab Ishak who tragically died from mould exposure
        in 2020, came into force on <strong>27 October 2025</strong>. This legislation creates strict legal duties
        for social housing landlords to address damp and mould hazards:
      </p>

      <ul className="list-disc pl-6 space-y-2">
        <li><strong>24 hours</strong> – Emergency health and safety hazards must be fixed</li>
        <li><strong>14 calendar days</strong> – Investigation of reported damp and mould must begin</li>
        <li><strong>7 calendar days</strong> – Repairs must be completed after investigation</li>
        <li><strong>Written report</strong> – Findings must be sent to tenants within 3 working days of inspection</li>
        <li><strong>Alternative accommodation</strong> – Must be offered if homes cannot be made safe in time</li>
      </ul>

      <p>
        "Lifestyle" is no longer an acceptable defence for damp and mould. Landlords who fail to comply face
        court action, enforcement orders, compensation payments, and loss of rent. The law is expected to
        extend to private landlords through the <strong>Renters' Rights Act</strong>.
      </p>

      <h3 className="text-xl font-bold text-primary">Ventilation Solutions We Install</h3>

      <p>
        We provide a complete range of ventilation solutions for both domestic and commercial properties:
      </p>

      <ul className="list-disc pl-6 space-y-2">
        <li><strong>Bathroom extractor fans</strong> – Humidity-sensing, timer, and pull-cord options</li>
        <li><strong>Kitchen extractor fans</strong> – Wall-mounted and ceiling fans for cooking areas</li>
        <li><strong>Inline duct fans</strong> – Powerful extraction for longer duct runs</li>
        <li><strong>PIV systems (Positive Input Ventilation)</strong> – Whole-house ventilation to eliminate condensation</li>
        <li><strong>MVHR systems</strong> – Mechanical ventilation with heat recovery for new builds</li>
        <li><strong>Heat recovery fans</strong> – Energy-efficient extraction with heat reclaim</li>
        <li><strong>Commercial extraction</strong> – High-capacity systems for businesses and HMOs</li>
      </ul>

      <h3 className="text-xl font-bold text-primary">Bathroom Extractor Fans</h3>

      <p>
        Bathrooms generate significant moisture from baths, showers, and general use. Building Regulations
        (Approved Document F) require mechanical extraction capable of at least <strong>15 litres per second</strong>
        for bathrooms. We install fans that meet or exceed this requirement, with options including:
      </p>

      <ul className="list-disc pl-6 space-y-2">
        <li><strong>Humidity sensors</strong> – Automatically activate when moisture levels rise</li>
        <li><strong>Overrun timers</strong> – Continue running after the light is switched off</li>
        <li><strong>Low voltage options</strong> – Safe for Zone 1 installation near showers</li>
        <li><strong>Quiet operation</strong> – Modern fans as low as 25dB for minimal disturbance</li>
      </ul>

      <h3 className="text-xl font-bold text-primary">Kitchen Ventilation</h3>

      <p>
        Kitchens require extraction of at least <strong>30 litres per second</strong> (adjacent to hob) or
        <strong>60 litres per second</strong> (elsewhere). Whether you're installing a cooker hood, wall fan,
        or ceiling extractor, we ensure proper ducting and electrical supply for optimal performance.
      </p>

      <h3 className="text-xl font-bold text-primary">PIV Systems for Condensation</h3>

      <p>
        <strong>Positive Input Ventilation (PIV)</strong> is the most effective whole-house solution for
        condensation and mould problems. A PIV unit, typically installed in the loft, draws in filtered
        fresh air and gently pressurises the property, pushing out stale, moist air through natural gaps.
      </p>

      <p>
        PIV systems are ideal for older properties suffering from condensation damp. They run quietly
        and cost just a few pence per day in electricity. For landlords facing Awaab's Law requirements,
        PIV installation often provides the most cost-effective long-term solution.
      </p>

      <h3 className="text-xl font-bold text-primary">Landlord & Social Housing Compliance</h3>

      <p>
        We work with social housing providers, private landlords, and letting agents to ensure properties
        meet ventilation requirements. Combined with{" "}
        <Link to="/services/eicr-certificates" className="text-primary hover:text-emergency font-semibold">
          EICR certificates
        </Link>{" "}
        and{" "}
        <Link to="/services/smoke-alarm-installation" className="text-primary hover:text-emergency font-semibold">
          smoke alarm installation
        </Link>,
        we can help you achieve full compliance efficiently.
      </p>

      <p>
        For{" "}
        <Link to="/services/hmo-electrical-testing" className="text-primary hover:text-emergency font-semibold">
          HMO properties
        </Link>,
        adequate ventilation is typically a licensing requirement. We can assess your property and recommend
        the most appropriate solution for your specific situation.
      </p>

      <h3 className="text-xl font-bold text-primary">Professional Installation</h3>

      <p>
        All our fan installations include proper electrical connections to <strong>BS 7671:2018+A2:2022</strong> standards.
        This includes correct circuit protection, appropriate IP ratings for wet areas, and compliance with
        Building Regulations Part F (Ventilation) and Part P (Electrical Safety).
      </p>

      <p>
        Whether you need a single bathroom fan replaced or a whole-house ventilation system installed,
        247Electrician provides professional, fully certified installation. Contact us today for a free
        quote and protect your property — and your tenants — from the dangers of damp and mould.
      </p>
    </div>
  );

  return (
    <ServicePageTemplate
      title="Ventilation & Fan Installation"
      slug="ventilation-installation"
      metaTitle="Extractor Fan & Ventilation Installation | Awaab's Law Compliant | 247Electrician"
      metaDescription="Professional extractor fan and ventilation installation in Black Country, Birmingham, Walsall & Cannock. Bathroom fans, PIV systems, kitchen extraction. Awaab's Law compliant. NAPIT approved."
      heroIcon={Wind}
      intro="Professional ventilation and extractor fan installation to combat condensation, damp, and mould. We install bathroom fans, kitchen extraction, PIV systems, and help landlords comply with Awaab's Law requirements."
      benefits={[
        "Awaab's Law Compliant",
        "PIV Systems",
        "Humidity Sensors",
        "Building Regs Compliant",
        "NAPIT Approved",
      ]}
      mainContent={mainContent}
      standards={[
        "BS 7671:2018+A2:2022",
        "Building Regs Part F",
        "Building Regs Part P",
        "Awaab's Law 2025",
      ]}
      afterContent={<FAQSection faqs={faqs} />}
      relatedServices={[
        {
          title: "EICR Certificates",
          href: "/services/eicr-certificates",
          description: "Complete electrical safety testing.",
        },
        {
          title: "Landlord Certificates",
          href: "/services/landlord-certificates",
          description: "Full landlord compliance packages.",
        },
        {
          title: "Smoke Alarm Installation",
          href: "/services/smoke-alarm-installation",
          description: "Interlinked fire detection systems.",
        },
      ]}
    />
  );
};

export default VentilationInstallation;
