import LandlordServiceTemplate from "@/components/LandlordServiceTemplate";
import { getServiceBySlug } from "@/data/landlordServices";

const SmokeCoDetectors = () => {
  const service = getServiceBySlug("smoke-co-detectors");

  if (!service) {
    return <div>Service not found</div>;
  }

  return <LandlordServiceTemplate service={service} />;
};

export default SmokeCoDetectors;
