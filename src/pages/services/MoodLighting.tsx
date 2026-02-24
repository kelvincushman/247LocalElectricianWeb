import { Sparkles } from "lucide-react";
import ServicePageTemplate from "@/components/ServicePageTemplate";
import { Link } from "react-router-dom";

const MoodLighting = () => {
  const mainContent = (
    <div className="space-y-6 text-foreground">
      <h2 className="text-2xl font-bold text-primary">Mood & Ambient Lighting Installation</h2>

      <p>
        The right lighting can transform the atmosphere of any room. At 247Electrician, we design and install
        mood and ambient lighting systems across the Black Country, Birmingham, Walsall, and Cannock that
        allow you to create the perfect ambience for any occasion.
      </p>

      <h3 className="text-xl font-bold text-primary">Mood Lighting Options</h3>

      <p>
        We install a variety of ambient and feature lighting solutions:
      </p>

      <ul className="list-disc pl-6 space-y-2">
        <li><strong>Dimmable LED downlights</strong> – Adjustable brightness for versatile room lighting</li>
        <li><strong>LED strip lighting</strong> – Cove lighting, under-cabinet, and architectural features</li>
        <li><strong>Colour-changing systems</strong> – RGB and RGBW LED strips with controller options</li>
        <li><strong>Wall washers</strong> – Uplighting that creates dramatic effects on feature walls</li>
        <li><strong>Pendant dimming</strong> – Adjustable dining and living area centrepieces</li>
        <li><strong>Smart lighting systems</strong> – App-controlled scenes and automation</li>
        <li><strong>Landscape lighting</strong> – Garden and patio ambience</li>
      </ul>

      <h3 className="text-xl font-bold text-primary">Dimming & Control Systems</h3>

      <p>
        Modern mood lighting relies on effective dimming control. We install:
      </p>

      <ul className="list-disc pl-6 space-y-2">
        <li><strong>Leading-edge dimmers</strong> – For traditional incandescent and halogen lamps</li>
        <li><strong>Trailing-edge dimmers</strong> – Required for most LED fixtures</li>
        <li><strong>Smart dimmers</strong> – WiFi and Zigbee-connected for app and voice control</li>
        <li><strong>Scene controllers</strong> – Pre-set lighting combinations at the touch of a button</li>
        <li><strong>Multi-way dimming</strong> – Control from multiple locations</li>
      </ul>

      <h3 className="text-xl font-bold text-primary">LED Compatibility</h3>

      <p>
        Not all LED lamps and fittings are compatible with all dimmers. We ensure correct matching of
        dimmers and LED drivers to prevent flickering, buzzing, and premature failure. All installations
        comply with <strong>BS 7671:2018+A2:2022</strong> requirements for luminaire circuits.
      </p>

      <p>
        Mood lighting can be incorporated into a wider <Link to="/services/lighting-installation" className="text-primary hover:text-emergency font-semibold">lighting upgrade</Link> or
        <Link to="/services/rewiring" className="text-primary hover:text-emergency font-semibold">rewiring project</Link>. For
        maximum flexibility, consider smart lighting that integrates with your existing home automation or
        works standalone via smartphone apps.
      </p>
    </div>
  );

  return (
    <ServicePageTemplate
      title="Mood Lighting"
      metaTitle="Mood & Ambient Lighting | Black Country & Birmingham"
      metaDescription="Mood and ambient lighting installation in Black Country, Birmingham, Walsall & Cannock. Dimmable LEDs, colour-changing systems, smart controls. NAPIT approved."
      heroIcon={Sparkles}
      intro="Create the perfect atmosphere with professionally installed mood lighting. We design and install dimmable, colour-changing, and smart lighting systems for any space."
      benefits={[
        "Dimmable Systems",
        "Colour-Changing",
        "Smart Controls",
        "Energy Efficient",
        "NAPIT Approved",
      ]}
      mainContent={mainContent}
      standards={[
        "BS 7671:2018+A2:2022",
        "BS EN 61347 (LED Drivers)",
        "Part P Building Regulations",
        "IET Guidance Note 1",
      ]}
      relatedServices={[
        {
          title: "Lighting Installation",
          href: "/services/lighting-installation",
          description: "Complete indoor and outdoor lighting services.",
        },
        {
          title: "Security Lighting",
          href: "/services/security-lighting",
          description: "External lighting for safety and security.",
        },
        {
          title: "Rewiring",
          href: "/services/rewiring",
          description: "New circuits for comprehensive lighting upgrades.",
        },
      ]}
    />
  );
};

export default MoodLighting;
