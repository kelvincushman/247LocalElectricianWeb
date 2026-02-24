import { MapContainer, TileLayer, Marker, Circle, Popup } from "react-leaflet";
import { Icon, LatLngBounds } from "leaflet";
import { areas, primaryTowns } from "@/data/areas";

interface CoverageArea {
  name: string;
  slug: string;
  lat: number;
  lng: number;
  radius: number; // in meters
  isPrimary?: boolean;
}

// Custom marker icon - primary (blue)
const primaryMarkerIcon = new Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Get primary town slugs for comparison
const primaryTownSlugs = primaryTowns.map(t => t.slug);

// Build coverage areas from the areas data
const coverageAreas: CoverageArea[] = areas.map(area => {
  const isPrimary = primaryTownSlugs.includes(area.slug);
  // Determine radius based on population and type
  let radius = 2500; // default for sub-areas
  if (area.slug === "bilston") radius = 5000; // headquarters
  else if (area.slug === "birmingham") radius = 5000; // major city
  else if (area.slug === "wolverhampton" || area.slug === "telford") radius = 4500;
  else if (area.slug === "walsall" || area.slug === "dudley" || area.slug === "cannock" || area.slug === "lichfield") radius = 4000;
  else if (isPrimary) radius = 3500;
  else radius = 2500;

  return {
    name: area.name,
    slug: area.slug,
    lat: area.coordinates.lat,
    lng: area.coordinates.lng,
    radius,
    isPrimary,
  };
});

const CoverageMap = () => {
  // Calculate bounds to fit all markers
  const bounds = new LatLngBounds(
    coverageAreas.map(area => [area.lat, area.lng] as [number, number])
  );

  // Center point (Bilston - headquarters)
  const center: [number, number] = [52.5657, -2.0727];

  return (
    <div className="w-full h-[400px] md:h-[500px] lg:h-[600px] rounded-xl overflow-hidden border-4 border-primary shadow-2xl">
      <MapContainer
        center={center}
        zoom={10}
        scrollWheelZoom={true}
        className="h-full w-full"
        bounds={bounds}
        boundsOptions={{ padding: [50, 50] }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Render circles first (behind markers) - sub-areas first, then primary */}
        {coverageAreas.filter(a => !a.isPrimary).map((area) => (
          <Circle
            key={`circle-${area.slug}`}
            center={[area.lat, area.lng]}
            radius={area.radius}
            pathOptions={{
              color: "#6b7280",
              fillColor: "#6b7280",
              fillOpacity: 0.05,
              weight: 1,
              dashArray: "3, 3",
            }}
          />
        ))}
        {coverageAreas.filter(a => a.isPrimary).map((area) => (
          <Circle
            key={`circle-${area.slug}`}
            center={[area.lat, area.lng]}
            radius={area.radius}
            pathOptions={{
              color: area.name === "Bilston" ? "#dc2626" : "#1e3a5f",
              fillColor: area.name === "Bilston" ? "#dc2626" : "#1e3a5f",
              fillOpacity: area.name === "Bilston" ? 0.2 : 0.1,
              weight: area.name === "Bilston" ? 3 : 2,
              dashArray: area.name === "Bilston" ? undefined : "5, 5",
            }}
          />
        ))}

        {/* Render markers - sub-areas first (behind), then primary (on top) */}
        {coverageAreas.filter(a => !a.isPrimary).map((area) => (
          <Marker
            key={`marker-${area.slug}`}
            position={[area.lat, area.lng]}
            icon={primaryMarkerIcon}
          >
            <Popup>
              <div className="text-center min-w-[120px]">
                <strong className="text-lg" style={{ color: "#1e3a5f" }}>
                  {area.name}
                </strong>
                <div className="text-xs text-gray-500 mt-1">
                  Sub-area
                </div>
                <a
                  href={`/areas/${area.slug}`}
                  className="inline-block mt-2 text-sm font-bold text-white px-3 py-1 rounded"
                  style={{ backgroundColor: "#1e3a5f" }}
                >
                  View Area →
                </a>
              </div>
            </Popup>
          </Marker>
        ))}
        {coverageAreas.filter(a => a.isPrimary).map((area) => (
          <Marker
            key={`marker-${area.slug}`}
            position={[area.lat, area.lng]}
            icon={primaryMarkerIcon}
          >
            <Popup>
              <div className="text-center min-w-[120px]">
                <strong className="text-lg" style={{ color: "#1e3a5f" }}>
                  {area.name}
                </strong>
                {area.name === "Bilston" && (
                  <div className="text-xs text-red-600 font-bold mt-1">
                    ⚡ HEADQUARTERS
                  </div>
                )}
                {area.isPrimary && area.name !== "Bilston" && (
                  <div className="text-xs text-blue-600 font-semibold mt-1">
                    Primary Service Area
                  </div>
                )}
                <div className="text-sm text-gray-600 mt-1">
                  Coverage: {(area.radius / 1000).toFixed(1)}km radius
                </div>
                <a
                  href={`/areas/${area.slug}`}
                  className="inline-block mt-2 text-sm font-bold text-white px-3 py-1 rounded"
                  style={{ backgroundColor: "#1e3a5f" }}
                >
                  View Area →
                </a>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default CoverageMap;
