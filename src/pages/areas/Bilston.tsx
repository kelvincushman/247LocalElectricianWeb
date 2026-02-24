import AreaPageTemplate from "@/components/AreaPageTemplate";
import { getAreaBySlug, areas } from "@/data/areas";
import { Link } from "react-router-dom";

const BilstonPage = () => {
  const area = getAreaBySlug("bilston")!;
  const nearbyAreas = area.nearbyAreas.map(slug => {
    const a = areas.find(ar => ar.slug === slug);
    return { slug, name: a?.name || slug };
  });

  const mainContent = (
    <div className="space-y-6 text-foreground">
      <h2 className="text-2xl font-bold text-primary">Professional Electrician Services in Bilston</h2>

      <p>
        Looking for a trusted electrician in Bilston? At 247Electrician, we provide comprehensive electrical
        services throughout Bilston and the wider {area.postcode} postcode area. As a historic Black Country
        town, Bilston has a diverse range of properties from Victorian terraces to modern developments, each
        with unique electrical requirements.
      </p>

      <h3 className="text-xl font-bold text-primary">About Bilston</h3>

      <p>
        {area.localInfo} With properties ranging from {area.propertyTypes.toLowerCase()}, our electricians
        have extensive experience working in all types of Bilston homes and businesses.
      </p>

      <h3 className="text-xl font-bold text-primary">Electrical Services We Offer in Bilston</h3>

      <p>
        Our NAPIT-approved electricians provide a full range of services in Bilston, including:
      </p>

      <ul className="list-disc pl-6 space-y-2">
        <li>
          <Link to="/services/emergency-callouts" className="text-primary hover:text-emergency font-semibold">
            24/7 Emergency Callouts
          </Link> – Rapid response to power cuts, electrical faults, and emergencies in Bilston
        </li>
        <li>
          <Link to="/services/fuse-board-upgrades" className="text-primary hover:text-emergency font-semibold">
            Fuse Board Upgrades
          </Link> – Modern consumer unit installations for older Bilston properties
        </li>
        <li>
          <Link to="/services/eicr-certificates" className="text-primary hover:text-emergency font-semibold">
            EICR Certificates
          </Link> – Electrical safety testing for Bilston homeowners and landlords
        </li>
        <li>
          <Link to="/services/rewiring" className="text-primary hover:text-emergency font-semibold">
            Rewiring
          </Link> – Full and partial rewiring for Victorian and older Bilston homes
        </li>
        <li>
          <Link to="/services/ev-charger-installation" className="text-primary hover:text-emergency font-semibold">
            EV Charger Installation
          </Link> – Home charging points installed in Bilston
        </li>
        <li>
          <Link to="/services/lighting-installation" className="text-primary hover:text-emergency font-semibold">
            Lighting Installation
          </Link> – Indoor and outdoor lighting throughout Bilston
        </li>
      </ul>

      <h3 className="text-xl font-bold text-primary">Why Bilston Residents Choose Us</h3>

      <p>
        As local electricians based in the Black Country, we understand the specific needs of Bilston
        residents. Many older properties in Bilston require specialist knowledge of period wiring systems
        and fuse boards. Our team has over 65 years of combined experience working in properties just like
        yours.
      </p>

      <p>
        All our work in Bilston is completed to <strong>BS 7671:2018+A2:2022</strong> standards, with full
        certification and building control notification where required. Whether you need an emergency
        electrician in Bilston or want to schedule planned electrical work, we're here to help.
      </p>
    </div>
  );

  return (
    <AreaPageTemplate
      areaName={area.name}
      metaTitle={`Electrician in Bilston | 24/7 Emergency & Domestic | 247Electrician`}
      metaDescription={`Professional electrician in Bilston, ${area.postcode}. 24/7 emergency callouts, EICR certificates, rewiring, fuse board upgrades. NAPIT approved. Fast local response.`}
      coordinates={area.coordinates}
      region={area.region}
      postcode={area.postcode}
      mainContent={mainContent}
      nearbyAreas={nearbyAreas}
    />
  );
};

export default BilstonPage;
