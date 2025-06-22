"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import type { Icon, LeafletMouseEvent } from "leaflet";

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
  onSave: () => Promise<void>;
}

function MapSelector({ onSelect }: { onSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e: LeafletMouseEvent) {
      onSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export function BranchEditModal({ branch, open, onClose, onSave }: Props) {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [services, setServices] = useState("");
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [icon, setIcon] = useState<Icon | null>(null);

  useEffect(() => {
    if (branch) {
      setName(branch.name);
      setAddress(branch.address);
      setServices(branch.services);
      setCoordinates(branch.coordinates);
    }
  }, [branch]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      import("leaflet").then((L) => {
        const customIcon = L.icon({
          iconUrl: "/images/sucursal-icon.png",
          iconSize: [40, 40],
          iconAnchor: [20, 40],
          popupAnchor: [0, -40],
        });
        setIcon(customIcon);
      });
    }
  }, []);

  const handleSubmit = async () => {
    if (!name.trim() || !address.trim() || !services.trim() || !coordinates) {
      toast.warning("Todos los campos son obligatorios, incluida la ubicación.");
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/branches/${branch?.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          address,
          services,
          coordinates,
        }),
      });

      if (!res.ok) throw new Error("Error al actualizar la sucursal");

      toast.success("Sucursal actualizada correctamente");
      await onSave();
    } catch (error) {
      console.error("Error actualizando sucursal:", error);
      toast.error("Hubo un error al guardar los cambios.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Editar Sucursal</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label>Nombre</Label>
            <Input value={name} maxLength={30} onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>Dirección</Label>
            <Input value={address} maxLength={50} onChange={(e) => setAddress(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>Servicios ofrecidos</Label>
            <Textarea
              rows={3}
              placeholder="Ej: Cardio, Crossfit, Yoga"
              value={services}
              maxLength={100}
              onChange={(e) => setServices(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Ubicación (haga click para modificar)</Label>
            <div className="rounded-md overflow-hidden border shadow-sm">
              {typeof window !== "undefined" && coordinates && (
                <MapContainer
                  center={[coordinates.lat, coordinates.lng]}
                  zoom={14}
                  style={{ height: "300px", width: "100%" }}
                  scrollWheelZoom={false}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
                  />
                  <MapSelector
                    onSelect={(lat, lng) => setCoordinates({ lat, lng })}
                  />
                  {icon && (
                    <Marker
                      position={[coordinates.lat, coordinates.lng]}
                      icon={icon}
                    />
                  )}
                </MapContainer>
              )}
            </div>
            {coordinates && (
              <p className="text-sm text-muted-foreground">
                Coordenadas seleccionadas: {coordinates.lat.toFixed(5)}, {coordinates.lng.toFixed(5)}
              </p>
            )}
          </div>

          <div className="flex justify-end pt-2">
            <Button onClick={handleSubmit}>Guardar cambios</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
