"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { ClientSidebar } from "@/components/ClientSidebar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Image from "next/image";
import { toast } from "sonner";

interface Membership {
  id: number;
  name: string;
  duration: string;
  price: number;
}

interface Subscription {
  id: number;
  state: string;
  proof_file: string | null;
  start_date: string;
  end_date: string;
  membership: Membership;
}

export default function MembershipStatusPage() {
  const { loading, user } = useAuth(["cliente"]);
  const router = useRouter();

  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<Membership | null>(null);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [qrImage, setQrImage] = useState<string | null>(null);
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);
  const [proofSent, setProofSent] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);

  useEffect(() => {
    if (!user) return;

    const fetchSubscription = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/subscriptions/user/${user.id}`);
        const data = await res.json();
        setSubscription(data || null);
        if (data?.state === "aprobado") {
          localStorage.removeItem("selectedMembership");
          setSelectedPlan(null);
        }
      } catch (error) {
        console.error("Error al cargar suscripción:", error);
        setSubscription(null);
      }
    };

    const fetchQr = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/qrs`);
        const data = await res.json();
        setQrImage(data.image || null);
      } catch (error) {
        console.error("Error al cargar QR:", error);
        setQrImage(null);
      }
    };

    const fetchSelectedPlan = () => {
      try {
        const stored = localStorage.getItem("selectedMembership");
        if (stored) {
          const parsed: Membership = JSON.parse(stored);
          setSelectedPlan(parsed);
        }
      } catch (error) {
        console.error("Error al leer plan seleccionado:", error);
      }
    };

    fetchSelectedPlan();
    if (user) {
      fetchSubscription();
      fetchQr();
    }
  }, [user]);

  const handleUpload = async () => {
    if (!proofFile || !selectedPlan) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/subscriptions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user?.id,
            membershipId: selectedPlan.id,
            proofFile: base64,
          }),
        });

        if (!res.ok) throw new Error("Error al enviar suscripción");

        toast.success("Comprobante enviado correctamente. Estado en espera de aprobación.");
        setProofFile(null);
        setProofSent(true);
        localStorage.removeItem("selectedMembership");
        setSelectedPlan(null);

        const refresh = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/subscriptions/user/${user?.id}`);
        const newSub = await refresh.json();
        setSubscription(newSub || null);
      } catch (error) {
        console.error("Error al enviar comprobante:", error);
        toast.error("Error al enviar el comprobante");
      }
    };

    reader.readAsDataURL(proofFile);
  };

  const confirmCancelSelection = () => {
    localStorage.removeItem("selectedMembership");
    setSelectedPlan(null);
    setProofFile(null);
    toast.success("Redirigiendo a la página principal...");
    setTimeout(() => router.push("/client"), 1500);
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

          {!subscription ? (
            <div className="text-muted-foreground">
              {selectedPlan ? (
                <>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="font-semibold text-lg text-foreground">
                      Estás a punto de unirte al plan{" "}
                      <span className="text-primary">{selectedPlan.name}</span>
                    </h2>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setConfirmCancelOpen(true)}
                      disabled={proofSent}
                    >
                      Cancelar selección
                    </Button>
                  </div>

                  {qrImage && (
                    <div className="mb-6">
                      <p className="text-muted-foreground mb-2">
                        Realiza tu pago escaneando este QR:
                      </p>
                      <button onClick={() => setIsQRModalOpen(true)}>
                        <Image
                          src={qrImage}
                          alt="Código QR de pago"
                          width={256}
                          height={256}
                          className="rounded-md cursor-pointer hover:scale-105 transition-transform"
                        />
                      </button>
                    </div>
                  )}

                  {proofSent ? (
                    <div className="bg-green-100 border border-green-300 p-4 rounded-md text-green-800">
                      <p>Tu comprobante fue enviado. Espera a que un empleado lo apruebe para activar tu suscripción.</p>
                    </div>
                  ) : (
                    <>
                      <div className="mb-4">
                        <label className="block font-medium mb-1">Sube tu comprobante de pago:</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                        />
                      </div>

                      <Button onClick={handleUpload} disabled={!proofFile}>
                        Enviar comprobante
                      </Button>
                    </>
                  )}
                </>
              ) : (
                <p className="text-muted-foreground">No tienes ninguna suscripción ni plan seleccionado.</p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <p className="text-muted-foreground">
                  Estado: <strong>{subscription.state}</strong>
                </p>
                <p>Inicio: {new Date(subscription.start_date).toLocaleDateString()}</p>
                <p>Fin: {new Date(subscription.end_date).toLocaleDateString()}</p>
              </div>

              <div className="bg-card border rounded-lg p-4">
                <h2 className="font-semibold mb-2">{subscription.membership.name}</h2>
                <p><strong>Duración:</strong> {subscription.membership.duration}</p>
                <p><strong>Precio:</strong> Bs. {subscription.membership.price}</p>
              </div>
            </div>
          )}
        </div>

        {/* Modal de confirmación de cancelación */}
        <Dialog open={confirmCancelOpen} onOpenChange={setConfirmCancelOpen}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>¿Cancelar selección de plan?</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground mb-4">
              Se eliminará el plan seleccionado y volverás al inicio.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setConfirmCancelOpen(false)}>
                No
              </Button>
              <Button variant="destructive" onClick={confirmCancelSelection}>
                Sí, cancelar
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* 🆕 Modal para ver el QR en pantalla completa */}
        <Dialog open={isQRModalOpen} onOpenChange={setIsQRModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>QR de pago</DialogTitle>
            </DialogHeader>
            <div className="flex justify-center">
              {qrImage && (
                <Image
                  src={qrImage}
                  alt="QR ampliado"
                  width={512}
                  height={512}
                  className="rounded-md max-w-full h-auto"
                />
              )}
            </div>
          </DialogContent>
        </Dialog>
      </main>
    );
  }