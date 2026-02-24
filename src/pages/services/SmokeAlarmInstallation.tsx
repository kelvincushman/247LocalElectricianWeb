import { Bell } from "lucide-react";
import ServicePageTemplate from "@/components/ServicePageTemplate";
import { Link } from "react-router-dom";

const SmokeAlarmInstallation = () => {
  const mainContent = (
    <div className="space-y-6 text-foreground">
      <h2 className="text-2xl font-bold text-primary">Smoke & Heat Alarm Installation</h2>

      <p>
        Working smoke alarms save lives. At 247Electrician, we install mains-powered, interlinked smoke and
        heat alarm systems across the Black Country, Birmingham, Walsall, and Cannock in compliance with
        <strong> BS 5839-6:2019</strong> and Building Regulations.
      </p>

      <h3 className="text-xl font-bold text-primary">Types of Fire Detection</h3>

      <p>
        We install appropriate detectors for different areas of your property:
      </p>

      <ul className="list-disc pl-6 space-y-2">
        <li><strong>Optical smoke alarms</strong> – Best for detecting slow-burning, smouldering fires</li>
        <li><strong>Ionisation smoke alarms</strong> – Responsive to fast-flaming fires</li>
        <li><strong>Heat alarms</strong> – Ideal for kitchens and garages where smoke alarms would false alarm</li>
        <li><strong>Multi-sensor alarms</strong> – Combined smoke and heat detection for reduced false alarms</li>
        <li><strong>Carbon monoxide detectors</strong> – Essential where gas appliances are present</li>
      </ul>

      <h3 className="text-xl font-bold text-primary">System Grades</h3>

      <p>
        BS 5839-6 specifies different grades of fire detection system depending on property type and risk:
      </p>

      <ul className="list-disc pl-6 space-y-2">
        <li><strong>Grade D</strong> – Battery-powered with integral batteries (minimum for rental properties)</li>
        <li><strong>Grade D1</strong> – Mains-powered with battery backup</li>
        <li><strong>Grade A</strong> – Fully addressable systems with control panel (typically HMOs and commercial)</li>
      </ul>

      <p>
        For most domestic properties, we recommend Grade D1 mains-powered, interlinked alarms. These ensure all
        alarms sound together, providing maximum warning time regardless of where the fire starts.
      </p>

      <h3 className="text-xl font-bold text-primary">Legal Requirements</h3>

      <p>
        Since October 2015, landlords must install smoke alarms on every storey of their rental properties
        and carbon monoxide alarms in rooms with solid fuel appliances. From October 2022, this extends to
        rooms with gas appliances. Failure to comply can result in fines of up to £5,000.
      </p>

      <p>
        For <Link to="/services/hmo-electrical-testing" className="text-primary hover:text-emergency font-semibold">HMO properties</Link>,
        higher-grade systems are typically required as part of the licensing conditions. Combined with
        <Link to="/services/emergency-lighting-installation" className="text-primary hover:text-emergency font-semibold"> emergency lighting</Link>,
        we can ensure complete fire safety compliance for
        <Link to="/services/landlord-certificates" className="text-primary hover:text-emergency font-semibold"> rental properties</Link>.
      </p>
    </div>
  );

  return (
    <ServicePageTemplate
      title="Smoke Alarm Installation"
      metaTitle="Smoke & Heat Alarm Installation | Black Country & Birmingham"
      metaDescription="Smoke and heat alarm installation in Black Country, Birmingham, Walsall & Cannock. Mains-powered, interlinked systems. BS 5839-6 compliant. NAPIT approved."
      heroIcon={Bell}
      intro="Professional smoke and heat alarm installation. We fit mains-powered, interlinked fire detection systems that comply with current regulations and protect your family."
      benefits={[
        "Mains-Powered",
        "Interlinked Systems",
        "BS 5839-6 Compliant",
        "Landlord Compliant",
        "NAPIT Approved",
      ]}
      mainContent={mainContent}
      standards={[
        "BS 5839-6:2019",
        "BS 7671:2018+A2:2022",
        "Smoke & CO Alarm Regulations 2015",
        "Part P Building Regulations",
      ]}
      relatedServices={[
        {
          title: "Landlord Certificates",
          href: "/services/landlord-certificates",
          description: "Complete landlord compliance packages.",
        },
        {
          title: "HMO Electrical Testing",
          href: "/services/hmo-electrical-testing",
          description: "Fire alarm systems for HMO licensing.",
        },
        {
          title: "Emergency Lighting Installation",
          href: "/services/emergency-lighting-installation",
          description: "Emergency escape route lighting.",
        },
      ]}
    />
  );
};

export default SmokeAlarmInstallation;
