"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

export default function AdminPage() {
  const router = useRouter();
  const { user, loading } = useAuth(["admin", "empleado"]); // Permitimos que ambos accedan

  if (loading) return <p className="p-6">Verificando acceso...</p>;

  return (
    <main className="min-h-screen bg-background text-foreground p-6 flex flex-col items-center justify-center gap-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Panel de administración</h1>
        <p className="text-muted-foreground">Bienvenido, {user?.name}</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <Button onClick={() => router.push("/admin/clients")}>
          Gestionar Clientes
        </Button>

        {/* Mostrar este botón solo si el usuario es admin */}
        {user?.role === "admin" && (
          <Button onClick={() => router.push("/admin/employees")}>
            Gestionar Empleados
          </Button>
        )}

        <Button onClick={() => router.push("/admin/memberships")}>
          Gestionar Membresías
        </Button>
        <Button onClick={() => router.push("/admin/subscriptions")}>
          Gestionar Suscripciones
        </Button>
      </div>
    </main>
  );
}
