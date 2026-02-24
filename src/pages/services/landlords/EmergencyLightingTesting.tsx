import LandlordServiceTemplate from "@/components/LandlordServiceTemplate";
import { getServiceBySlug } from "@/data/landlordServices";

const EmergencyLightingTesting = () => {
  const service = getServiceBySlug("emergency-lighting-testing");

  if (!service) {
    return <div>Service not found</div>;
  }

  return <LandlordServiceTemplate service={service} />;
};

export default EmergencyLightingTesting;
