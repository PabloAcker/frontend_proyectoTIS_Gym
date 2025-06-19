"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect } from "react";

// Icono de sucursal
const icon = L.icon({
  iconUrl: "/images/sucursal-icon.png",
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});

interface Branch {
  id: number;
  name: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  address?: string;
  services?: string;
}

interface Props {
  branches: Branch[];
  selectedBranchId: number | null;
}

function ChangeView({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], 14);
  }, [lat, lng, map]);
  return null;
}

export default function BranchMap({ branches, selectedBranchId }: Props) {
  const selectedBranch = branches.find((b) => b.id === selectedBranchId);

  // ✅ VALIDACIÓN para evitar render hasta tener datos válidos
  if (!selectedBranch || !selectedBranch.coordinates) return null;

  const defaultCenter = selectedBranch.coordinates;

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-3xl space-y-4">
        <MapContainer
          key={`branch-map-${selectedBranch.id}`}
          center={[defaultCenter.lat, defaultCenter.lng]}
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

          <ChangeView
            lat={selectedBranch.coordinates.lat}
            lng={selectedBranch.coordinates.lng}
          />
          <Marker
            position={[
              selectedBranch.coordinates.lat,
              selectedBranch.coordinates.lng,
            ]}
            icon={icon}
          >
            <Popup>
              <strong>{selectedBranch.name}</strong>
              <br />
              {selectedBranch.address || "Dirección no disponible"}
            </Popup>
          </Marker>
        </MapContainer>
      </div>
    </div>
  );
}
