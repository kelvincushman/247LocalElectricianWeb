import AreaPageTemplate from "@/components/AreaPageTemplate";
import { getAreaBySlug, areas } from "@/data/areas";
import { Link } from "react-router-dom";

const DudleyPage = () => {
  const area = getAreaBySlug("dudley")!;
  const nearbyAreas = area.nearbyAreas.map(slug => {
    const a = areas.find(ar => ar.slug === slug);
    return { slug, name: a?.name || slug };
  });

  const mainContent = (
    <div className="space-y-6 text-foreground">
      <h2 className="text-2xl font-bold text-primary">Professional Electrician Services in Dudley</h2>

      <p>
        Looking for a reliable electrician in Dudley? 247Electrician provides expert electrical services
        throughout Dudley, the historic capital of the Black Country. From the town centre to surrounding
        areas like Sedgley and Brierley Hill, we're your local electrical experts.
      </p>

      <h3 className="text-xl font-bold text-primary">About Dudley</h3>

      <p>
        {area.localInfo} Our electricians have extensive experience in {area.propertyTypes.toLowerCase()},
        understanding the unique electrical needs of Dudley's diverse properties.
      </p>

      <h3 className="text-xl font-bold text-primary">Electrical Services in Dudley</h3>

      <p>
        Our NAPIT-approved electricians deliver comprehensive services across Dudley:
      </p>

      <ul className="list-disc pl-6 space-y-2">
        <li>
          <Link to="/services/emergency-callouts" className="text-primary hover:text-emergency font-semibold">
            Emergency Electrician Dudley
          </Link> – 24/7 response to electrical emergencies across DY postcodes
        </li>
        <li>
          <Link to="/services/fuse-board-upgrades" className="text-primary hover:text-emergency font-semibold">
            Fuse Board Upgrades Dudley
          </Link> – Modern consumer units for Dudley properties
        </li>
        <li>
          <Link to="/services/eicr-certificates" className="text-primary hover:text-emergency font-semibold">
            EICR Certificates Dudley
          </Link> – Electrical safety reports for homes and businesses
        </li>
        <li>
          <Link to="/services/rewiring" className="text-primary hover:text-emergency font-semibold">
            Rewiring Dudley
          </Link> – Full and partial rewires for older Dudley properties
        </li>
        <li>
          <Link to="/services/lighting-installation" className="text-primary hover:text-emergency font-semibold">
            Lighting Installation
          </Link> – Indoor and outdoor lighting solutions
        </li>
        <li>
          <Link to="/services/ev-charger-installation" className="text-primary hover:text-emergency font-semibold">
            EV Charger Installation Dudley
          </Link> – Home charging points for electric vehicles
        </li>
      </ul>

      <h3 className="text-xl font-bold text-primary">Dudley Areas We Serve</h3>

      <p>
        We cover all areas within Dudley borough including Sedgley, Coseley, Brierley Hill, Kingswinford,
        Netherton, Gornal, and surrounding villages. Whether you're near Dudley Castle or in the outskirts,
        we provide fast, professional electrical services.
      </p>

      <h3 className="text-xl font-bold text-primary">Trusted Dudley Electricians</h3>

      <p>
        Dudley's historic buildings and varied housing stock require skilled electricians who understand
        older systems. Our team brings decades of experience working in Black Country properties, ensuring
        safe, compliant electrical work. All work meets <strong>BS 7671:2018+A2:2022</strong> standards.
      </p>
    </div>
  );

  return (
    <AreaPageTemplate
      areaName={area.name}
      metaTitle={`Electrician in Dudley | 24/7 Emergency & Domestic | 247Electrician`}
      metaDescription={`Professional electrician in Dudley. 24/7 emergency callouts, EICR certificates, rewiring & more. NAPIT approved. Covering all DY postcodes.`}
      coordinates={area.coordinates}
      region={area.region}
      postcode={area.postcode}
      mainContent={mainContent}
      nearbyAreas={nearbyAreas}
    />
  );
};

export default DudleyPage;
