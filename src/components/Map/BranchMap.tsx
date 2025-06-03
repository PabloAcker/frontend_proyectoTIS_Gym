"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

interface Props {
  selectedCity: string;
}

// Coordenadas por ciudad
const branchLocations: Record<string, { lat: number; lng: number }> = {
  "la-paz": { lat: -16.5, lng: -68.15 },
  "cochabamba": { lat: -17.3935, lng: -66.157 },
  "santa-cruz": { lat: -17.7833, lng: -63.1821 },
};

// Icono desde /public/images
const icon = L.icon({
  iconUrl: "/images/sucursal-icon.png",
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});

export default function BranchMap({ selectedCity }: Props) {
  const coords = branchLocations[selectedCity] || branchLocations["la-paz"];

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-3xl space-y-4">
        {/* Map */}
        <MapContainer
          center={[coords.lat, coords.lng]}
          zoom={14}
          scrollWheelZoom={false}
          style={{
            height: "400px",
            width: "100%",
            borderRadius: "0.5rem",
            zIndex: 0,
          }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={[coords.lat, coords.lng]} icon={icon}>
            <Popup>
              Sucursal en {selectedCity.replace("-", " ").toUpperCase()}
            </Popup>
          </Marker>
        </MapContainer>
      </div>
    </div>
  );
}
