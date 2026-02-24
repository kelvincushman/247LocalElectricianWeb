import { MapContainer, TileLayer, Marker, Circle, Popup } from "react-leaflet";
import { Icon } from "leaflet";

interface AreaMapProps {
  coordinates: { lat: number; lng: number };
  areaName: string;
  radius?: number; // in meters, default 3000 (3km)
}

// Custom marker icon
const markerIcon = new Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const AreaMap = ({ coordinates, areaName, radius = 3000 }: AreaMapProps) => {
  return (
    <div className="w-full h-[300px] md:h-[400px] rounded-xl overflow-hidden border-2 border-primary shadow-lg">
      <MapContainer
        center={[coordinates.lat, coordinates.lng]}
        zoom={13}
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[coordinates.lat, coordinates.lng]} icon={markerIcon}>
          <Popup>
            <div className="text-center">
              <strong className="text-primary">247Electrician</strong>
              <br />
              Serving {areaName}
            </div>
          </Popup>
        </Marker>
        <Circle
          center={[coordinates.lat, coordinates.lng]}
          radius={radius}
          pathOptions={{
            color: "#1e3a5f",
            fillColor: "#1e3a5f",
            fillOpacity: 0.1,
            weight: 2,
          }}
        />
      </MapContainer>
    </div>
  );
};

export default AreaMap;
