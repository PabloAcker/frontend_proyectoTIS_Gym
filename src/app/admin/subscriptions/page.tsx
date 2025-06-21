"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, X, BadgePlus } from "lucide-react";
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
import { AdminTopNav } from "@/components/AdminTopNav";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input as UiInput } from "@/components/ui/input";

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
    price_before_discount?: number;
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
  const { loading, unauthorized } = useAuth(["admin", "empleado"]);

  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [filtered, setFiltered] = useState<Subscription[]>([]);
  const [search, setSearch] = useState("");
  const [selectedSubId, setSelectedSubId] = useState<number | null>(null);
  const [dialogAction, setDialogAction] = useState<"approve" | "reject" | null>(null);

  const [showRFIDDialog, setShowRFIDDialog] = useState(false);
  const [selectedRFIDSub, setSelectedRFIDSub] = useState<Subscription | null>(null);
  const [rfidCode, setRfidCode] = useState("");

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

const handleRFIDRegister = async () => {
  if (!selectedRFIDSub || !rfidCode) return;

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/access/rfid-access/${selectedRFIDSub.id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rfid_code: rfidCode }),
      }
    );

    const contentType = res.headers.get("content-type");
    let data: { error?: string } = {};

    if (contentType && contentType.includes("application/json")) {
      data = await res.json();
    } else {
      const text = await res.text();
      throw new Error(`Respuesta no válida: ${text}`);
    }

    if (!res.ok) throw new Error(data.error || "Error al registrar tarjeta");

    toast.success("Tarjeta RFID registrada correctamente");
    setShowRFIDDialog(false);
    setRfidCode("");
  } catch (error: unknown) {
    console.error("❌ Error al registrar tarjeta RFID:", error);
    if (error instanceof Error) {
      toast.error(error.message || "No se pudo registrar la tarjeta");
    } else {
      toast.error("No se pudo registrar la tarjeta");
    }
  }
};

  if (unauthorized) return <UnauthorizedDialog />;
  if (loading) return <p className="p-6">Verificando acceso...</p>;

  return (
    <main className="p-6 min-h-screen bg-background text-foreground">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gestión de Suscripciones</h1>
        <div className="flex gap-2">
          <AdminTopNav />
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
              <th className="p-2 border">RFID</th>
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
                <td className="p-2 border">
                  {s.membership.price_before_discount && s.membership.price_before_discount > s.membership.price ? (
                    <>
                      <span className="line-through text-muted-foreground mr-1">
                        Bs. {s.membership.price_before_discount}
                      </span>
                      <span className="text-green-600 font-semibold">Bs. {s.membership.price}</span>
                      <span className="ml-1" title="Precio con descuento">🎁</span>
                    </>
                  ) : (
                    <>Bs. {s.membership.price}</>
                  )}
                </td>
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
                <td className="p-2 border">
                  {s.state === "aprobado" ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedRFIDSub(s);
                        setShowRFIDDialog(true);
                      }}
                    >
                      <BadgePlus className="w-4 h-4 mr-1" />
                      Registrar
                    </Button>
                  ) : (
                    "—"
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

      <Dialog open={showRFIDDialog} onOpenChange={setShowRFIDDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Registrar tarjeta RFID</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Label>Código RFID:</Label>
            <UiInput
              value={rfidCode}
              onChange={(e) => setRfidCode(e.target.value)}
              placeholder="Escanea o ingresa el código..."
            />
            <div className="flex justify-end">
              <Button onClick={handleRFIDRegister} disabled={!rfidCode}>
                Registrar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}