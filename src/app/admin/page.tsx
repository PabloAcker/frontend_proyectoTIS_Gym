"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  Users,
  ShieldUser,
  Layers,
  ReceiptText,
  UserCog,
  Home,
} from "lucide-react";
import { MonthlyClientsChart } from "@/components/Charts/MonthlyClientsChart";

export default function AdminPage() {
  const router = useRouter();
  const { user, loading } = useAuth(["admin", "empleado"]);

  if (loading) return <p className="p-6">Verificando acceso...</p>;

  return (
    <main className="p-6 min-h-screen bg-background text-foreground">
      {/* Encabezado y menú en línea */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Panel de administración</h1>
          <p className="text-muted-foreground">Bienvenido, {user?.name}</p>
        </div>

        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" onClick={() => router.push("/admin")}>
            <Home className="mr-2 w-4 h-4" /> Panel
          </Button>
          <Button variant="outline" onClick={() => router.push("/admin/clients")}>
            <Users className="mr-2 w-4 h-4" /> Clientes
          </Button>
          {user?.role === "admin" && (
            <Button variant="outline" onClick={() => router.push("/admin/employees")}>
              <ShieldUser className="mr-2 w-4 h-4" /> Empleados
            </Button>
          )}
          <Button variant="outline" onClick={() => router.push("/admin/memberships")}>
            <Layers className="mr-2 w-4 h-4" /> Membresías
          </Button>
          <Button variant="outline" onClick={() => router.push("/admin/subscriptions")}>
            <ReceiptText className="mr-2 w-4 h-4" /> Suscripciones
          </Button>
          <Button variant="outline" onClick={() => router.push("/admin/profile")}>
            <UserCog className="mr-2 w-4 h-4" /> Perfil
          </Button>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <MonthlyClientsChart />
      </div>
    </main>
  );
}
