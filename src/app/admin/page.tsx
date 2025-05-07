"use client";

import { useAuth } from "@/hooks/useAuth";

export default function AdminPage() {
  const { user, loading } = useAuth("admin");
  if (loading) return <p className="p-6">Verificando acceso...</p>;

  return (
    <main className="p-6">
      <h1 className="text-3xl font-bold">Panel de administración</h1>
      <p>Bienvenido, {user?.name}</p>
    </main>
  );
}
