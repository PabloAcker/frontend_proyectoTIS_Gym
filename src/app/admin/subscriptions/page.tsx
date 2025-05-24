"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Home, Users, Layers, Check, X,
  ShieldUser,
} from "lucide-react";
import { UnauthorizedDialog } from "@/components/UnauthorizedDialog";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

interface Subscription {
  id: number;
  state: "pendiente" | "aprobado" | "rechazado";
  start_date: string;
  end_date: string;
  proof_file: string | null;
  membership: {
    name: string;
    duration: string;
    price: number;
  };
  user: {
    name: string;
    lastname: string;
    email: string;
    client?: {
      ci: string;
    };
  };
}

export default function AdminSubscriptionsPage() {
  const { user, loading, unauthorized } = useAuth(["admin", "empleado"]);
  const router = useRouter();

  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [filtered, setFiltered] = useState<Subscription[]>([]);
  const [search, setSearch] = useState("");
  const [selectedSubId, setSelectedSubId] = useState<number | null>(null);
  const [dialogAction, setDialogAction] = useState<"approve" | "reject" | null>(null);

  const fetchSubscriptions = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/subscriptions`);
      const data = await res.json();
      setSubscriptions(data);
      setFiltered(data);
    } catch (error) {
      console.error("Error al cargar suscripciones:", error);
    }
  };

  useEffect(() => {
    if (!loading) fetchSubscriptions();
  }, [loading]);

  useEffect(() => {
    const term = search.toLowerCase();
    const filteredResults = subscriptions.filter((s) =>
      s.user.name.toLowerCase().includes(term) ||
      s.user.lastname.toLowerCase().includes(term) ||
      s.user.email.toLowerCase().includes(term)
    );
    setFiltered(filteredResults);
  }, [search, subscriptions]);

  const handleAction = async () => {
    if (!selectedSubId || !dialogAction) return;

    const endpoint =
      dialogAction === "approve"
        ? `/subscriptions/${selectedSubId}/approve`
        : `/subscriptions/${selectedSubId}/reject`;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
        method: "PUT",
      });

      const text = await res.text();
      if (!res.ok) throw new Error(`Error ${res.status}: ${text}`);

      toast.success(
        dialogAction === "approve" ? "Suscripción aprobada" : "Suscripción rechazada"
      );

      setSelectedSubId(null);
      setDialogAction(null);
      await fetchSubscriptions();
    } catch (error) {
      console.error("❌ Error al actualizar suscripción:", error);
      toast.error("Error al actualizar la suscripción");
    }
  };

  if (unauthorized) return <UnauthorizedDialog />;
  if (loading) return <p className="p-6">Verificando acceso...</p>;

  return (
    <main className="p-6 min-h-screen bg-background text-foreground">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gestión de Suscripciones</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push("/admin")}>
            <Home className="mr-2 w-4 h-4" /> Panel
          </Button>
          <Button variant="outline" onClick={() => router.push("/admin/clients")}>
            <Users className="mr-2 w-4 h-4" /> Clientes
          </Button>
          {user?.role === "admin" && (
          <Button variant="outline" onClick={() => router.push("/admin/employees")}>
            <ShieldUser className="mr-2 w-4 h-4" />
            Empleados
          </Button>
          )}
          <Button variant="outline" onClick={() => router.push("/admin/memberships")}>
            <Layers className="mr-2 w-4 h-4" /> Membresías
          </Button>
        </div>
      </div>

      <div className="mb-4 max-w-md">
        <Input
          placeholder="Filtrar por nombre, apellido o correo"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm border border-gray-300">
          <thead className="bg-grayLight text-left">
            <tr>
              <th className="p-2 border">Nombre</th>
              <th className="p-2 border">Apellido</th>
              <th className="p-2 border">CI</th>
              <th className="p-2 border">Correo</th>
              <th className="p-2 border">Plan</th>
              <th className="p-2 border">Duración</th>
              <th className="p-2 border">Precio</th>
              <th className="p-2 border">Comprobante</th>
              <th className="p-2 border">Estado</th>
              <th className="p-2 border">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => (
              <tr key={s.id} className="border-t">
                <td className="p-2 border">{s.user.name}</td>
                <td className="p-2 border">{s.user.lastname}</td>
                <td className="p-2 border">{s.user.client?.ci ?? "—"}</td>
                <td className="p-2 border">{s.user.email}</td>
                <td className="p-2 border">{s.membership.name}</td>
                <td className="p-2 border">{s.membership.duration}</td>
                <td className="p-2 border">Bs. {s.membership.price}</td>
                <td className="p-2 border">
                  {s.proof_file ? (
                    <a href={s.proof_file} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                      Ver
                    </a>
                  ) : (
                    "No enviado"
                  )}
                </td>
                <td className="p-2 border">
                  {s.state === "pendiente"
                    ? "Pendiente"
                    : s.state === "aprobado"
                    ? "Aprobada"
                    : "Rechazada"}
                </td>
                <td className="p-2 border">
                  {s.state === "pendiente" ? (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => {
                          setSelectedSubId(s.id);
                          setDialogAction("approve");
                        }}
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          setSelectedSubId(s.id);
                          setDialogAction("reject");
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <span className="text-muted-foreground italic">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AlertDialog
        open={!!selectedSubId && !!dialogAction}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedSubId(null);
            setDialogAction(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {dialogAction === "approve" ? "¿Aprobar esta suscripción?" : "¿Rechazar esta suscripción?"}
            </AlertDialogTitle>
          </AlertDialogHeader>
          <p className="text-muted-foreground text-sm mb-4">
            Esta acción no se puede deshacer.
          </p>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleAction}>
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}