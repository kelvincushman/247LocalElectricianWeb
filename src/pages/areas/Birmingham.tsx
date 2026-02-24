import AreaPageTemplate from "@/components/AreaPageTemplate";
import { getAreaBySlug, areas } from "@/data/areas";
import { Link } from "react-router-dom";

const BirminghamPage = () => {
  const area = getAreaBySlug("birmingham")!;
  const nearbyAreas = area.nearbyAreas.map(slug => {
    const a = areas.find(ar => ar.slug === slug);
    return { slug, name: a?.name || slug };
  });

  const mainContent = (
    <div className="space-y-6 text-foreground">
      <h2 className="text-2xl font-bold text-primary">Professional Electrician Services in Birmingham</h2>

      <p>
        Need a trusted electrician in Birmingham? 247Electrician serves Birmingham Central and North,
        providing expert electrical services to the UK's second city. From city centre apartments to
        Victorian villas in Edgbaston and family homes in Erdington, we've got Birmingham covered.
      </p>

      <h3 className="text-xl font-bold text-primary">About Birmingham</h3>

      <p>
        {area.localInfo} Our electricians have worked extensively in {area.propertyTypes.toLowerCase()},
        giving us the experience to tackle any electrical project in Birmingham.
      </p>

      <h3 className="text-xl font-bold text-primary">Electrical Services Across Birmingham</h3>

      <p>
        Our NAPIT-approved team provides comprehensive electrical services throughout Birmingham:
      </p>

      <ul className="list-disc pl-6 space-y-2">
        <li>
          <Link to="/services/emergency-callouts" className="text-primary hover:text-emergency font-semibold">
            Emergency Electrician Birmingham
          </Link> – 24/7 rapid response across Birmingham postcodes
        </li>
        <li>
          <Link to="/services/fuse-board-upgrades" className="text-primary hover:text-emergency font-semibold">
            Consumer Unit Upgrades Birmingham
          </Link> – Modern fuse boards for period and modern properties
        </li>
        <li>
          <Link to="/services/eicr-certificates" className="text-primary hover:text-emergency font-semibold">
            EICR Certificates Birmingham
          </Link> – Electrical safety testing for all property types
        </li>
        <li>
          <Link to="/services/hmo-electrical-testing" className="text-primary hover:text-emergency font-semibold">
            HMO Electrical Testing
          </Link> – Compliance testing for Birmingham's many HMO properties
        </li>
        <li>
          <Link to="/services/rewiring" className="text-primary hover:text-emergency font-semibold">
            Rewiring Birmingham
          </Link> – Full and partial rewires for Victorian and older homes
        </li>
        <li>
          <Link to="/services/ev-charger-installation" className="text-primary hover:text-emergency font-semibold">
            EV Charger Installation Birmingham
          </Link> – Home and commercial charging points
        </li>
      </ul>

      <h3 className="text-xl font-bold text-primary">Birmingham Areas We Cover</h3>

      <p>
        We provide electrical services across Birmingham including Handsworth, Perry Barr, Erdington,
        Harborne, Edgbaston, Selly Oak, Moseley, and surrounding areas. Our coverage extends to
        Birmingham Central and North postcodes with fast response times.
      </p>

      <h3 className="text-xl font-bold text-primary">Your Birmingham Electrical Experts</h3>

      <p>
        Birmingham's diverse housing stock requires electricians with broad expertise. From rewiring
        grand Victorian properties to installing smart home systems in new apartments, our team has
        the skills and certification to deliver. All work meets <strong>BS 7671:2018+A2:2022</strong>
        standards with full documentation provided.
      </p>
    </div>
  );

  return (
    <AreaPageTemplate
      areaName={area.name}
      metaTitle={`Electrician in Birmingham | 24/7 Emergency & Domestic | 247Electrician`}
      metaDescription={`Professional electrician in Birmingham. 24/7 emergency callouts, EICR certificates, rewiring, EV chargers & more. NAPIT approved. Fast response across Birmingham.`}
      coordinates={area.coordinates}
      region={area.region}
      postcode={area.postcode}
      mainContent={mainContent}
      nearbyAreas={nearbyAreas}
    />
  );
};

export default BirminghamPage;
