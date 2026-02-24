import AreaPageTemplate from "@/components/AreaPageTemplate";
import { getAreaBySlug, areas } from "@/data/areas";
import { Link } from "react-router-dom";

const WolverhamptonPage = () => {
  const area = getAreaBySlug("wolverhampton")!;
  const nearbyAreas = area.nearbyAreas.map(slug => {
    const a = areas.find(ar => ar.slug === slug);
    return { slug, name: a?.name || slug };
  });

  const mainContent = (
    <div className="space-y-6 text-foreground">
      <h2 className="text-2xl font-bold text-primary">Professional Electrician Services in Wolverhampton</h2>

      <p>
        Need a reliable electrician in Wolverhampton? 247Electrician provides comprehensive electrical
        services throughout Wolverhampton city and all surrounding areas. From the Victorian grandeur of
        the city centre to the leafy suburbs of Tettenhall and Penn, we've worked in properties of all
        types across Wolverhampton.
      </p>

      <h3 className="text-xl font-bold text-primary">About Wolverhampton</h3>

      <p>
        {area.localInfo} Our electricians regularly work in {area.propertyTypes.toLowerCase()}, bringing
        expert knowledge of both period and modern electrical systems.
      </p>

      <h3 className="text-xl font-bold text-primary">Electrical Services Across Wolverhampton</h3>

      <p>
        Our NAPIT-approved team delivers the full range of domestic and commercial electrical services
        throughout Wolverhampton:
      </p>

      <ul className="list-disc pl-6 space-y-2">
        <li>
          <Link to="/services/emergency-callouts" className="text-primary hover:text-emergency font-semibold">
            24/7 Emergency Electrician Wolverhampton
          </Link> – Fast response to electrical emergencies across all WV postcodes
        </li>
        <li>
          <Link to="/services/fuse-board-upgrades" className="text-primary hover:text-emergency font-semibold">
            Consumer Unit Upgrades
          </Link> – Essential upgrades for Wolverhampton's older housing stock
        </li>
        <li>
          <Link to="/services/eicr-certificates" className="text-primary hover:text-emergency font-semibold">
            EICR Testing Wolverhampton
          </Link> – Electrical safety certificates for homeowners, landlords, and businesses
        </li>
        <li>
          <Link to="/services/rewiring" className="text-primary hover:text-emergency font-semibold">
            House Rewiring
          </Link> – Complete and partial rewires for Wolverhampton properties
        </li>
        <li>
          <Link to="/services/ev-charger-installation" className="text-primary hover:text-emergency font-semibold">
            EV Charger Installation
          </Link> – Home and workplace charging points across Wolverhampton
        </li>
        <li>
          <Link to="/services/solar-installation" className="text-primary hover:text-emergency font-semibold">
            Solar Panel Installation
          </Link> – Renewable energy solutions for Wolverhampton homes
        </li>
      </ul>

      <h3 className="text-xl font-bold text-primary">Wolverhampton Areas We Cover</h3>

      <p>
        We provide electrical services throughout Wolverhampton city centre and all suburbs including
        Tettenhall, Penn, Bushbury, Wednesfield, Finchfield, Compton, and all WV postcode areas. Our
        local knowledge means we understand the typical electrical challenges in different parts of the city.
      </p>

      <h3 className="text-xl font-bold text-primary">Your Local Wolverhampton Electricians</h3>

      <p>
        Based in the Black Country, we're perfectly positioned to provide rapid response to Wolverhampton
        customers. All work is completed to <strong>BS 7671:2018+A2:2022</strong> standards with full
        certification. Whether you're in a period property near West Park or a new build in Pendeford,
        247Electrician is your trusted local electrician in Wolverhampton.
      </p>
    </div>
  );

  return (
    <AreaPageTemplate
      areaName={area.name}
      metaTitle={`Electrician in Wolverhampton | 24/7 Emergency & Domestic | 247Electrician`}
      metaDescription={`Professional electrician in Wolverhampton. 24/7 emergency callouts, EICR certificates, rewiring, EV chargers & more. NAPIT approved. Covering all WV postcodes.`}
      coordinates={area.coordinates}
      region={area.region}
      postcode={area.postcode}
      mainContent={mainContent}
      nearbyAreas={nearbyAreas}
    />
  );
};

export default WolverhamptonPage;
