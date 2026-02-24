import LandlordServiceTemplate from "@/components/LandlordServiceTemplate";
import { getServiceBySlug } from "@/data/landlordServices";

const PATTesting = () => {
  const service = getServiceBySlug("pat-testing");

  if (!service) {
    return <div>Service not found</div>;
  }

  return <LandlordServiceTemplate service={service} />;
};

export default PATTesting;
