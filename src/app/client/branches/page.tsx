"use client";

import { useAuth } from "@/hooks/useAuth";
import { ClientSidebar } from "@/components/ClientSidebar";
import dynamic from "next/dynamic";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Importa dinámicamente el componente de Leaflet para evitar errores en SSR
const BranchMap = dynamic(() => import("@/components/Map/BranchMap"), { ssr: false });

export default function BranchesPage() {
  const { user, loading, unauthorized } = useAuth(["cliente"]);

  const [city, setCity] = useState("la-paz"); // Valor por defecto

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

      <div className="flex-1">
        <h1 className="text-2xl font-bold mb-2">Sucursales</h1>
        <p className="text-muted-foreground mb-6">
          ¡Infórmate de la localización de nuestras sucursales!
        </p>

        <div className="mb-4 max-w-xs">
          <Select value={city} onValueChange={setCity}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona una ciudad" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="la-paz">La Paz</SelectItem>
              <SelectItem value="cochabamba">Cochabamba</SelectItem>
              <SelectItem value="santa-cruz">Santa Cruz</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Mapa */}
        <div className="rounded-lg border shadow-md overflow-hidden w-full max-w-xl">
          <BranchMap selectedCity={city} />
        </div>
      </div>
    </main>
  );
}
