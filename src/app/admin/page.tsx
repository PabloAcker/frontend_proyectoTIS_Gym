"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Layers, ReceiptText, ShieldUser, UserCog, Users } from "lucide-react";

export default function AdminPage() {
  const router = useRouter();
  const { user, loading } = useAuth(["admin", "empleado"]); 

  if (loading) return <p className="p-6">Verificando acceso...</p>;

  return (
    <main className="min-h-screen bg-background text-foreground p-6 flex flex-col items-center justify-center gap-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Panel de administración</h1>
        <p className="text-muted-foreground">Bienvenido, {user?.name}</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <Button onClick={() => router.push("/admin/clients")}>
          <Users className="mr-2 w-4 h-4" /> Gestionar Clientes
        </Button>

        {/* Mostrar este botón solo si el usuario es admin */}
        {user?.role === "admin" && (
          <Button onClick={() => router.push("/admin/employees")}>
            <ShieldUser className="mr-2 w-4 h-4" /> Gestionar Empleados
          </Button>
        )}

        <Button onClick={() => router.push("/admin/memberships")}>
          <Layers className="mr-2 w-4 h-4" /> Gestionar Membresías
        </Button>
        <Button onClick={() => router.push("/admin/subscriptions")}>
          <ReceiptText className="mr-2 w-4 h-4" /> Gestionar Suscripciones
        </Button>
        <Button onClick={() => router.push("/admin/profile")}>
          <UserCog className="mr-2 w-4 h-4" /> Perfil
        </Button>
      </div>
    </main>
  );
}
