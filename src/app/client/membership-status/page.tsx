"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { ClientSidebar } from "@/components/ClientSidebar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { RotateCcw, PackageOpen } from "lucide-react";

interface Membership {
  id: number;
  name: string;
  duration: string;
  price: number;
  price_before_discount?: number;
}

interface Subscription {
  id: number;
  state: string;
  start_date: string;
  end_date: string;
  membership: Membership;
}

export default function MembershipStatusPage() {
  const { loading, user } = useAuth(["cliente"]);
  const router = useRouter();

  const [latest, setLatest] = useState<Subscription | null>(null);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [filtered, setFiltered] = useState<Subscription[]>([]);
  const [startFilter, setStartFilter] = useState("");
  const [endFilter, setEndFilter] = useState("");

  useEffect(() => {
    if (!user) return;

    const fetchLatest = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/subscriptions/latest/${user.id}`);
        const data = await res.json();
        setLatest(data || null);
      } catch (err) {
        console.error("Error al obtener última suscripción:", err);
      }
    };

    const fetchAllSubscriptions = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/subscriptions/history/${user.id}`);
        const data = await res.json();
        const safeData = Array.isArray(data) ? data : [];
        setSubscriptions(safeData);
        setFiltered(safeData);
      } catch (err) {
        console.error("Error al obtener historial:", err);
      }
    };

    fetchLatest();
    fetchAllSubscriptions();
  }, [user]);

  const applyFilter = () => {
    const start = startFilter ? new Date(startFilter) : null;
    const end = endFilter ? new Date(endFilter) : null;

    const result = subscriptions.filter(sub => {
      const subStart = new Date(sub.start_date);
      if (start && subStart < start) return false;
      if (end && subStart > end) return false;
      return true;
    });

    setFiltered(result);
  };

  const resetFilters = () => {
    setStartFilter("");
    setEndFilter("");
    setFiltered(subscriptions);
  };

  if (loading) return <p className="p-6">Verificando acceso...</p>;

  if (!user) {
    return (
      <main className="flex flex-col sm:flex-row min-h-screen bg-background text-foreground p-6 gap-6">
        <ClientSidebar />
        <div className="flex-1">
          <h1 className="text-2xl font-bold mb-4">Estado de suscripción</h1>
          <p className="text-muted-foreground">Crea una cuenta para ingresar a este apartado.</p>
          <Button className="mt-4" onClick={() => router.push("/auth/register")}>
            Crear cuenta
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-col sm:flex-row min-h-screen bg-background text-foreground p-6 gap-6">
      <ClientSidebar />
      <div className="flex-1">
        <h1 className="text-2xl font-bold mb-4">Estado de suscripción</h1>

        {latest ? (
          <div className="mb-8 bg-card border-l-4 border-primary p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Tu última suscripción</h2>
            <p className="text-muted-foreground mb-1">
              Estado: <strong>{latest.state}</strong>
            </p>
            <p>Inicio: {new Date(latest.start_date).toLocaleDateString()}</p>
            <p>Fin: {new Date(latest.end_date).toLocaleDateString()}</p>

            <div className="mt-3">
              <h3 className="font-medium">{latest.membership.name}</h3>
              <p><strong>Duración:</strong> {latest.membership.duration}</p>
              {latest.membership.price_before_discount && latest.membership.price_before_discount > latest.membership.price ? (
                <p>
                  <strong>Precio:</strong>{" "}
                  <span className="line-through text-muted-foreground mr-2">
                    Bs. {latest.membership.price_before_discount}
                  </span>
                  <span className="text-primary font-semibold">Bs. {latest.membership.price}</span>
                  <span className="ml-2 text-green-500" title="¡Descuento activo!">🎁</span>
                </p>
              ) : (
                <p><strong>Precio:</strong> Bs. {latest.membership.price}</p>
              )}
            </div>

            {/* Botones dinámicos */}
            <div className="mt-4 flex gap-3">
              {latest.state === "vencido" && (
                <Button onClick={() => router.push(`/memberships/${latest.membership.id}`)}>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Renovar suscripción
                </Button>
              )}
              {latest.state === "rechazado" && (
                <Button onClick={() => router.push("/memberships")}>
                  <PackageOpen className="mr-2 h-4 w-4" />
                  Ir a planes de membresía
                </Button>
              )}
            </div>
          </div>
        ) : (
          <p className="mb-8 text-muted-foreground">Aún no tienes ninguna suscripción.</p>
        )}

        <Separator className="my-6" />

        <div className="flex flex-col sm:flex-row gap-4 mb-6 items-end">
          <div>
            <label className="text-sm">Desde:</label>
            <input
              type="date"
              className="block border rounded-md px-2 py-1 mt-1"
              value={startFilter}
              onChange={(e) => setStartFilter(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm">Hasta:</label>
            <input
              type="date"
              className="block border rounded-md px-2 py-1 mt-1"
              value={endFilter}
              onChange={(e) => setEndFilter(e.target.value)}
            />
          </div>
          <Button onClick={applyFilter}>Filtrar</Button>
          <Button variant="outline" onClick={resetFilters}>Refrescar</Button>
        </div>

        {filtered.length > 0 ? (
          filtered.map((sub, idx) => (
            <div key={sub.id} className="mb-6">
              <p className="text-muted-foreground mb-1">
                Estado: <strong>{sub.state}</strong>
              </p>
              <p>Inicio: {new Date(sub.start_date).toLocaleDateString()}</p>
              <p>Fin: {new Date(sub.end_date).toLocaleDateString()}</p>

              <div className="bg-card border rounded-lg p-4 mt-2">
                <h2 className="font-semibold mb-2">{sub.membership.name}</h2>
                <p><strong>Duración:</strong> {sub.membership.duration}</p>
                {sub.membership.price_before_discount && sub.membership.price_before_discount > sub.membership.price ? (
                  <p>
                    <strong>Precio:</strong>{" "}
                    <span className="line-through text-muted-foreground mr-2">
                      Bs. {sub.membership.price_before_discount}
                    </span>
                    <span className="text-primary font-semibold">Bs. {sub.membership.price}</span>
                    <span className="ml-2 text-green-500" title="¡Descuento activo!">🎁</span>
                  </p>
                ) : (
                  <p><strong>Precio:</strong> Bs. {sub.membership.price}</p>
                )}
              </div>

              {idx < filtered.length - 1 && <Separator className="my-6" />}
            </div>
          ))
        ) : (
          <p className="text-muted-foreground">No hay suscripciones registradas.</p>
        )}
      </div>
    </main>
  );
}
