"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { ClientSidebar } from "@/components/ClientSidebar";
import dynamic from "next/dynamic";
import Image from "next/image";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, MapPinHouse } from "lucide-react";
import { BranchImageZoomModal } from "@/components/BranchImageZoomModal";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

// 👇 Define la interfaz Branch
interface Branch {
  id: number;
  name: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  address?: string;
  services?: string;
  created_at?: string;
  image?: string;
}

// 👇 Importa dinámicamente BranchMap y tipa las props
const BranchMap = dynamic(() => import("@/components/Map/BranchMap"), {
  ssr: false,
}) as React.FC<{ branches: Branch[]; selectedBranchId: number | null }>;

export default function BranchesPage() {
  const { user, loading, unauthorized } = useAuth(["cliente"]);

  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null);

  const [nearestBranchId, setNearestBranchId] = useState<number | null>(null);
  const [geoModalOpen, setGeoModalOpen] = useState(false);

  // ✅ Estados para el modal de imagen ampliada
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [modalImage, setModalImage] = useState("");
  const [modalBranch, setModalBranch] = useState("");

  const handleGeolocation = () => {
    if (!navigator.geolocation) {
      toast.error("Tu navegador no soporta geolocalización.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        if (branches.length === 0) {
          toast.error("No hay sucursales disponibles para comparar.");
          return;
        }

        let minDistance = Infinity;
        let closestBranchId: number | null = null;

        branches.forEach((branch) => {
          const d = getDistance(latitude, longitude, branch.coordinates.lat, branch.coordinates.lng);
          if (d < minDistance) {
            minDistance = d;
            closestBranchId = branch.id;
          }
        });

        if (closestBranchId !== null) {
          setSelectedBranchId(closestBranchId);
          setNearestBranchId(closestBranchId);
          const selected = branches.find((b) => b.id === closestBranchId);
          toast.success(`Sucursal más cercana: ${selected?.name}`);
        }
      },
      () => {
        toast.error("Permiso de ubicación denegado. Actívalo para usar esta función.");
      }
    );
  };

  // Haversine formula para calcular distancia entre coordenadas
  function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371; // km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) *
        Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  function deg2rad(deg: number) {
    return deg * (Math.PI / 180);
  }

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/branches`);
        const data = await res.json();
        setBranches(data);
        if (data.length > 0) setSelectedBranchId(data[0].id); // selecciona la primera sucursal por defecto
      } catch (err) {
        console.error("Error al cargar sucursales:", err);
      }
    };

    fetchBranches();
  }, []);

  const selectedBranch = branches.find((b) => b.id === selectedBranchId);
  const serviceList = selectedBranch?.services?.split(",").map((s) => s.trim()) || [];

  if (loading) return <p className="p-6">Verificando acceso...</p>;
  if (unauthorized || !user) {
    return (
      <main className="flex flex-col sm:flex-row min-h-screen bg-background text-foreground p-6 gap-6">
        <ClientSidebar />
        <div className="flex-1">
          <h1 className="text-2xl font-bold mb-4">Sucursales</h1>
          <p className="text-muted-foreground">Crea una cuenta para acceder a este apartado.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-col sm:flex-row min-h-screen bg-background text-foreground p-6 gap-6">
        <Dialog open={geoModalOpen} onOpenChange={setGeoModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Permiso de geolocalización</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">
              Para mostrarle la ubicación de la sucursal más cercana debe aceptar dar permisos de su ubicación.
            </p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setGeoModalOpen(false)}>
                Cancelar
              </Button>
              <Button
                onClick={() => {
                  setGeoModalOpen(false);
                  handleGeolocation(); // llama a la función que ya tienes
                }}
              >
                Aceptar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      <ClientSidebar />

      <div className="flex-1 flex flex-col lg:flex-row gap-6">
        <div className="flex-1">
          <h1 className="text-2xl font-bold mb-2">Sucursales</h1>
          <p className="text-muted-foreground mb-6">
            ¡Infórmate de la localización de nuestras sucursales!
          </p>

          {/* Selector basado en nombre de sucursal */}
          <div className="mb-4 flex flex-wrap sm:flex-nowrap items-center gap-2">
            <div className="max-w-xs w-full">
              <Select
                value={selectedBranchId?.toString()}
                onValueChange={(val) => setSelectedBranchId(parseInt(val))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una sucursal" />
                </SelectTrigger>
                <SelectContent>
                  {branches.map((b) => (
                    <SelectItem key={b.id} value={b.id.toString()}>
                      <span className={nearestBranchId === b.id ? "text-primary font-semibold" : ""}>
                        {b.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button variant="outline" onClick={() => setGeoModalOpen(true)}>
              <MapPinHouse className="w-4 h-4 mr-2" />
              Geolocalización
            </Button>
          </div>

          {/* Mapa */}
          <div className="rounded-lg border shadow-md overflow-hidden w-full max-w-xl">
            <BranchMap branches={branches} selectedBranchId={selectedBranchId} />
          </div>
        </div>

        {/* Card informativa de servicios */}
        {selectedBranch && (
          <div className="w-full max-w-sm mr-35 self-start space-y-4">
            <Card className="w-full max-w-sm self-start mt-35 border-l-4 border-primary shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-primary" />
                  Servicios en {selectedBranch.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Dirección: {selectedBranch.address || "No disponible"}
                </p>
                <div className="flex flex-wrap gap-2 pt-2">
                  {serviceList.length > 0 ? (
                    serviceList.map((service, idx) => (
                      <Badge key={idx} variant="default" className="text-sm px-3 py-1">
                        {service}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-sm">Sin servicios registrados.</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Imagen de referencia si existe */}
            {selectedBranch.image && (
              <>
                <div
                  className="rounded-lg border shadow-sm p-3 bg-muted/50 cursor-pointer"
                  onClick={() => {
                    setModalImage(selectedBranch.image || "");
                    setModalBranch(selectedBranch.name);
                    setImageModalOpen(true);
                  }}
                >
                  <h3 className="text-sm font-semibold mb-2">
                    Imagen de referencia de la sucursal {selectedBranch.name}
                  </h3>
                  <Image
                    src={selectedBranch.image}
                    alt={`Imagen de ${selectedBranch.name}`}
                    width={400}
                    height={300}
                    className="rounded-md w-full h-auto"
                  />
                </div>

                <BranchImageZoomModal
                  open={imageModalOpen}
                  onClose={() => setImageModalOpen(false)}
                  imageUrl={modalImage}
                  branchName={modalBranch}
                />
              </>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
