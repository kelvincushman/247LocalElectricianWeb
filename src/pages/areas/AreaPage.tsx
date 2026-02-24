import AreaPageTemplate from "@/components/AreaPageTemplate";
import { getAreaBySlug, areas } from "@/data/areas";
import { Link } from "react-router-dom";
import NotFound from "@/pages/NotFound";

interface AreaPageProps {
  slug: string;
}

const AreaPage = ({ slug }: AreaPageProps) => {
  const area = getAreaBySlug(slug);

  if (!area) {
    return <NotFound />;
  }

  const nearbyAreas = area.nearbyAreas.map(nearbySlug => {
    const a = areas.find(ar => ar.slug === nearbySlug);
    return { slug: nearbySlug, name: a?.name || nearbySlug };
  });

  const mainContent = (
    <div className="space-y-6 text-foreground">
      <h2 className="text-2xl font-bold text-primary">Professional Electrician Services in {area.name}</h2>

      <p>
        Looking for a trusted electrician in {area.name}? 247Electrician provides comprehensive electrical
        services throughout {area.name} and the wider {area.postcode} postcode area. Our NAPIT-approved
        electricians bring over 65 years of combined experience to every job.
      </p>

      <h3 className="text-xl font-bold text-primary">About {area.name}</h3>

      <p>
        {area.localInfo} With properties ranging from {area.propertyTypes.toLowerCase()}, our electricians
        have extensive experience working in all types of {area.name} homes and businesses.
      </p>

      <h3 className="text-xl font-bold text-primary">Electrical Services We Offer in {area.name}</h3>

      <p>
        Our qualified electricians provide a full range of services in {area.name}, including:
      </p>

      <ul className="list-disc pl-6 space-y-2">
        <li>
          <Link to="/services/emergency-callouts" className="text-primary hover:text-emergency font-semibold">
            24/7 Emergency Callouts
          </Link> – Rapid response to power cuts, electrical faults, and emergencies in {area.name}
        </li>
        <li>
          <Link to="/services/fuse-board-upgrades" className="text-primary hover:text-emergency font-semibold">
            Fuse Board Upgrades
          </Link> – Modern consumer unit installations with RCD/RCBO protection
        </li>
        <li>
          <Link to="/services/eicr-certificates" className="text-primary hover:text-emergency font-semibold">
            EICR Certificates
          </Link> – Electrical safety testing for {area.name} homeowners and landlords
        </li>
        <li>
          <Link to="/services/rewiring" className="text-primary hover:text-emergency font-semibold">
            Rewiring
          </Link> – Full and partial rewiring for older {area.name} properties
        </li>
        <li>
          <Link to="/services/ev-charger-installation" className="text-primary hover:text-emergency font-semibold">
            EV Charger Installation
          </Link> – Home charging points installed in {area.name}
        </li>
        <li>
          <Link to="/services/lighting-installation" className="text-primary hover:text-emergency font-semibold">
            Lighting Installation
          </Link> – Indoor and outdoor lighting throughout {area.name}
        </li>
        <li>
          <Link to="/services/smoke-alarm-installation" className="text-primary hover:text-emergency font-semibold">
            Smoke Alarm Installation
          </Link> – Mains-powered interlinked fire detection systems
        </li>
        <li>
          <Link to="/services/socket-installation" className="text-primary hover:text-emergency font-semibold">
            Socket Installation
          </Link> – Additional sockets and USB outlets
        </li>
        <li>
          <Link to="/services/ventilation-installation" className="text-primary hover:text-emergency font-semibold">
            Ventilation & Fan Installation
          </Link> – Extractor fans and PIV systems for damp and mould prevention
        </li>
      </ul>

      <h3 className="text-xl font-bold text-primary">Why {area.name} Residents Choose Us</h3>

      <p>
        As local electricians based in the Black Country, we understand the specific needs of {area.name}
        residents. Many properties in {area.region} require specialist knowledge of period wiring systems.
        Our team has decades of experience working in properties just like yours.
      </p>

      <p>
        All our work in {area.name} is completed to <strong>BS 7671:2018+A2:2022</strong> standards, with
        full certification and building control notification where required. We're NAPIT registered,
        meaning our work is backed by industry guarantees.
      </p>

      <h3 className="text-xl font-bold text-primary">Fast Response in {area.name}</h3>

      <p>
        Being locally based means we can respond quickly to both emergency callouts and scheduled
        appointments in {area.name}. For emergencies, we aim to reach you within 30-90 minutes. For
        planned work, we offer flexible appointment times to suit your schedule.
      </p>

      <p>
        Whether you need an <Link to="/services/emergency-callouts" className="text-primary hover:text-emergency font-semibold">emergency electrician</Link> in {area.name},
        an <Link to="/services/eicr-certificates" className="text-primary hover:text-emergency font-semibold">EICR certificate</Link> for
        your rental property, or a complete <Link to="/services/rewiring" className="text-primary hover:text-emergency font-semibold">house rewire</Link>,
        247Electrician is here to help. Contact us today for a free, no-obligation quote.
      </p>
    </div>
  );

  return (
    <AreaPageTemplate
      areaName={area.name}
      metaTitle={`Electrician in ${area.name} | 24/7 Emergency & Domestic | 247Electrician`}
      metaDescription={`Professional electrician in ${area.name}, ${area.postcode}. 24/7 emergency callouts, EICR certificates, rewiring, fuse board upgrades. NAPIT approved. Fast local response.`}
      coordinates={area.coordinates}
      region={area.region}
      postcode={area.postcode}
      mainContent={mainContent}
      nearbyAreas={nearbyAreas}
    />
  );
};

export default AreaPage;
