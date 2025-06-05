"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const MapContainer = dynamic(() => import("react-leaflet").then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then(mod => mod.Marker), { ssr: false });

// Icono personalizado
const icon = L.icon({
  iconUrl: "/images/sucursal-icon.png",
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});

interface Branch {
  id: number;
  name: string;
  address: string;
  services: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

interface Props {
  branch: Branch | null;
  open: boolean;
  onClose: () => void;
}

export function BranchViewModal({ branch, open, onClose }: Props) {
  if (!branch) return null;

  const { name, address, services, coordinates } = branch;
  const serviceList = services?.split(",").map(s => s.trim()) || [];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Información de la Sucursal</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Nombre:</p>
            <p className="font-medium">{name}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Dirección:</p>
            <p className="font-medium">{address}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Servicios:</p>
            <div className="flex flex-wrap gap-2 mt-1">
              {serviceList.length > 0 ? (
                serviceList.map((s, idx) => (
                  <Badge key={idx} variant="default" className="text-sm px-3 py-1">
                    {s}
                  </Badge>
                ))
              ) : (
                <p className="text-muted-foreground text-sm">Sin servicios registrados.</p>
              )}
            </div>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Coordenadas:</p>
            <p className="font-medium">
              Lat: {coordinates.lat.toFixed(5)}, Lng: {coordinates.lng.toFixed(5)}
            </p>
          </div>

          <div className="overflow-hidden border rounded-md shadow-sm">
            <MapContainer
              center={[coordinates.lat, coordinates.lng]}
              zoom={15}
              style={{ height: "300px", width: "100%" }}
              scrollWheelZoom={false}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
              />
              <Marker position={[coordinates.lat, coordinates.lng]} icon={icon} />
            </MapContainer>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
