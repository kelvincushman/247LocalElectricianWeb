import LandlordServiceTemplate from "@/components/LandlordServiceTemplate";
import { getServiceBySlug } from "@/data/landlordServices";

const FireAlarmTesting = () => {
  const service = getServiceBySlug("fire-alarm-testing");

  if (!service) {
    return <div>Service not found</div>;
  }

  return <LandlordServiceTemplate service={service} />;
};

export default FireAlarmTesting;
