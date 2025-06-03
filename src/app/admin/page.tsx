"use client";

import { useAuth } from "@/hooks/useAuth";
import { MonthlyClientsChart } from "@/components/Charts/MonthlyClientsChart";
import { AdminTopNav } from "@/components/AdminTopNav";

export default function AdminPage() {
  const { user, loading } = useAuth(["admin", "empleado"]);

  if (loading) return <p className="p-6">Verificando acceso...</p>;

  return (
    <main className="p-6 min-h-screen bg-background text-foreground">
      {/* Encabezado + Navegación */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Panel de administración</h1>
          <p className="text-muted-foreground">Bienvenido, {user?.name}</p>
        </div>

        <AdminTopNav />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <MonthlyClientsChart />
      </div>
    </main>
  );
}
