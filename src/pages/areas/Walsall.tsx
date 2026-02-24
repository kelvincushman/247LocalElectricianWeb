import AreaPageTemplate from "@/components/AreaPageTemplate";
import { getAreaBySlug, areas } from "@/data/areas";
import { Link } from "react-router-dom";

const WalsallPage = () => {
  const area = getAreaBySlug("walsall")!;
  const nearbyAreas = area.nearbyAreas.map(slug => {
    const a = areas.find(ar => ar.slug === slug);
    return { slug, name: a?.name || slug };
  });

  const mainContent = (
    <div className="space-y-6 text-foreground">
      <h2 className="text-2xl font-bold text-primary">Professional Electrician Services in Walsall</h2>

      <p>
        Looking for a qualified electrician in Walsall? 247Electrician provides expert electrical services
        throughout Walsall borough, from the busy town centre to the leafy suburbs of Aldridge and Streetly.
        With over 65 years of combined experience, our team understands the diverse electrical needs of
        Walsall's varied property types.
      </p>

      <h3 className="text-xl font-bold text-primary">About Walsall</h3>

      <p>
        {area.localInfo} Our electricians have extensive experience working in {area.propertyTypes.toLowerCase()},
        ensuring we can handle any electrical challenge in your Walsall property.
      </p>

      <h3 className="text-xl font-bold text-primary">Electrical Services in Walsall</h3>

      <p>
        Our NAPIT-approved electricians offer comprehensive services across Walsall:
      </p>

      <ul className="list-disc pl-6 space-y-2">
        <li>
          <Link to="/services/emergency-callouts" className="text-primary hover:text-emergency font-semibold">
            Emergency Electrician Walsall
          </Link> – 24/7 rapid response to electrical emergencies across WS postcodes
        </li>
        <li>
          <Link to="/services/fuse-board-upgrades" className="text-primary hover:text-emergency font-semibold">
            Fuse Board Upgrades Walsall
          </Link> – Modern consumer units with RCD protection
        </li>
        <li>
          <Link to="/services/eicr-certificates" className="text-primary hover:text-emergency font-semibold">
            EICR Walsall
          </Link> – Electrical Installation Condition Reports for homes and rentals
        </li>
        <li>
          <Link to="/services/landlord-certificates" className="text-primary hover:text-emergency font-semibold">
            Landlord Certificates Walsall
          </Link> – Compliant electrical safety certificates for rental properties
        </li>
        <li>
          <Link to="/services/rewiring" className="text-primary hover:text-emergency font-semibold">
            Rewiring Services
          </Link> – Full house rewires and partial rewiring for Walsall homes
        </li>
        <li>
          <Link to="/services/ev-charger-installation" className="text-primary hover:text-emergency font-semibold">
            EV Charger Installation Walsall
          </Link> – Home charging points for electric vehicles
        </li>
      </ul>

      <h3 className="text-xl font-bold text-primary">Walsall Areas We Serve</h3>

      <p>
        We cover all areas within Walsall borough including Bloxwich, Aldridge, Brownhills, Pelsall, Rushall,
        Willenhall, and Darlaston. Whether you're near the Arboretum in the town centre or in the residential
        areas towards Sutton Coldfield, we provide fast, reliable electrical services.
      </p>

      <h3 className="text-xl font-bold text-primary">Why Choose Us for Electrical Work in Walsall</h3>

      <p>
        As local Black Country electricians, we pride ourselves on providing prompt, professional service
        to Walsall customers. Many properties in Walsall were built in the Victorian and Edwardian eras,
        requiring specialist knowledge of older wiring systems. Our team has the expertise to safely
        upgrade these systems to modern standards.
      </p>

      <p>
        All electrical work in Walsall is completed to <strong>BS 7671:2018+A2:2022</strong> regulations,
        fully certified and notified to building control where required. Contact us today for a free quote
        on any electrical work in Walsall.
      </p>
    </div>
  );

  return (
    <AreaPageTemplate
      areaName={area.name}
      metaTitle={`Electrician in Walsall | 24/7 Emergency & Domestic | 247Electrician`}
      metaDescription={`Professional electrician in Walsall. 24/7 emergency callouts, EICR certificates, rewiring, landlord certs & more. NAPIT approved. Covering all WS postcodes.`}
      coordinates={area.coordinates}
      region={area.region}
      postcode={area.postcode}
      mainContent={mainContent}
      nearbyAreas={nearbyAreas}
    />
  );
};

export default WalsallPage;
