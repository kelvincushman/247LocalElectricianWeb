import LandlordServiceTemplate from "@/components/LandlordServiceTemplate";
import { getServiceBySlug } from "@/data/landlordServices";

const EICRLandlords = () => {
  const service = getServiceBySlug("eicr-certificates");

  if (!service) {
    return <div>Service not found</div>;
  }

  return <LandlordServiceTemplate service={service} />;
};

export default EICRLandlords;
