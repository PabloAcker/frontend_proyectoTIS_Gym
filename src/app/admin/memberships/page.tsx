"use client";

import { useAuth } from "@/hooks/useAuth";

export default function AdminMembershipsPage() {
  const { user, loading } = useAuth("admin");

  if (loading) return <p className="p-6">Verificando acceso...</p>;

  return (
    <main className="p-6 min-h-screen bg-background text-foreground">
      <h1 className="text-3xl font-bold mb-4">Gestión de Membresías</h1>
      <p className="text-muted-foreground mb-4">
        Bienvenido, {user?.name}. Aquí podrás ver, crear o editar planes de membresía.
      </p>

      {/* Aquí más adelante irán cards, formularios o tablas de membresías */}
    </main>
  );
}
