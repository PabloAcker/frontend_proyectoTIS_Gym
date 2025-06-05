"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { ClientSidebar } from "@/components/ClientSidebar";
import dynamic from "next/dynamic";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2 } from "lucide-react";

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
}

// 👇 Importa dinámicamente BranchMap y tipa las props
const BranchMap = dynamic(() => import("@/components/Map/BranchMap"), {
  ssr: false,
}) as React.FC<{ branches: Branch[]; selectedBranchId: number | null }>;

export default function BranchesPage() {
  const { user, loading, unauthorized } = useAuth(["cliente"]);

  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null);

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
      <ClientSidebar />

      <div className="flex-1 flex flex-col lg:flex-row gap-6">
        <div className="flex-1">
          <h1 className="text-2xl font-bold mb-2">Sucursales</h1>
          <p className="text-muted-foreground mb-6">
            ¡Infórmate de la localización de nuestras sucursales!
          </p>

          {/* Selector basado en nombre de sucursal */}
          <div className="mb-4 max-w-xs">
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
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Mapa */}
          <div className="rounded-lg border shadow-md overflow-hidden w-full max-w-xl">
            <BranchMap branches={branches} selectedBranchId={selectedBranchId} />
          </div>
        </div>

        {/* Card informativa de servicios */}
        {selectedBranch && (
          <Card className="w-full max-w-sm self-start mt-63 mr-25 border-l-4 border-primary shadow-sm">
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
        )}
      </div>
    </main>
  );
}

