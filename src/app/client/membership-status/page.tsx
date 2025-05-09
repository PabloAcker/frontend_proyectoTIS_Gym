"use client";

import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { ClientSidebar } from "@/components/ClientSidebar";

export default function MembershipStatusPage() {
  const { loading } = useAuth("cliente");

  if (loading) return <p className="p-6">Verificando acceso...</p>;

  return (
    <main className="flex flex-col sm:flex-row min-h-screen bg-background text-foreground p-6 gap-6">
      <ClientSidebar />

      <div className="flex-1">
        <h1 className="text-2xl font-bold mb-4">Estado de membresía</h1>

        <div className="mb-6">
          <p className="text-lg font-semibold">Plan actual:</p>
          <p className="text-muted-foreground">Plan trimestral</p>
        </div>

        <div className="bg-card rounded-lg shadow p-6 max-w-md space-y-4">
          <p className="text-lg">Usted desea:</p>
          <Button className="w-full" variant="outline">
            Renovar suscripción ✅
          </Button>
          <Button className="w-full" variant="outline">
            Cancelar suscripción ❌
          </Button>
        </div>
      </div>
    </main>
  );
}
