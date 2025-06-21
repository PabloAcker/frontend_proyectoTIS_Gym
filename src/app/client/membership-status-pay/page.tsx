"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { ClientSidebar } from "@/components/ClientSidebar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Image from "next/image";
import { toast } from "sonner";
import { Gift } from "lucide-react";

interface Membership {
  id: number;
  name: string;
  duration: string;
  price: number;
  price_before_discount?: number;
}

export default function MembershipStatusPayPage() {
  const { loading, user } = useAuth(["cliente"]);
  const router = useRouter();

  const [selectedPlan, setSelectedPlan] = useState<Membership | null>(null);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [qrImage, setQrImage] = useState<string | null>(null);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);
  const [proofSent, setProofSent] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("selectedMembership");
    if (stored) {
      try {
        const parsed: Membership = JSON.parse(stored);
        setSelectedPlan(parsed);
      } catch (error) {
        console.error("Error parsing membership:", error);
      }
    }

    const fetchQr = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/qrs`);
        const data = await res.json();
        setQrImage(data.image || null);
      } catch (error) {
        console.error("Error fetching QR:", error);
      }
    };

    fetchQr();
  }, []);

  const handleUpload = async () => {
    if (!proofFile || !selectedPlan || !user) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/subscriptions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.id,
            membershipId: selectedPlan.id,
            proofFile: base64,
          }),
        });

        if (!res.ok) throw new Error("Error al enviar suscripción");

        toast.success("Comprobante enviado correctamente. Espera la aprobación.");
        setProofSent(true);
        localStorage.removeItem("selectedMembership");
        setSelectedPlan(null);

        setTimeout(() => router.push("/memberships"), 2000);
      } catch (error) {
        console.error("Error al subir comprobante:", error);
        toast.error("Hubo un error al subir el comprobante");
      }
    };

    reader.readAsDataURL(proofFile);
  };

  const confirmCancelSelection = () => {
    localStorage.removeItem("selectedMembership");
    setSelectedPlan(null);
    setProofFile(null);
    toast.success("Selección cancelada");
    setTimeout(() => router.push("/memberships"), 1500);
  };

  if (loading) return <p className="p-6">Cargando...</p>;

  return (
    <main className="flex flex-col sm:flex-row min-h-screen bg-background text-foreground p-6 gap-6">
      <ClientSidebar />
      <div className="flex-1">
        <h1 className="text-2xl font-bold mb-4">Pago de suscripción</h1>

        {!selectedPlan ? (
          <p className="text-muted-foreground">No se ha seleccionado ningún plan.</p>
        ) : (
          <>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-2 sm:gap-0">
              <div>
                <h2 className="font-semibold text-lg text-foreground">
                  Plan seleccionado: <span className="text-primary">{selectedPlan.name}</span>
                </h2>
                {selectedPlan.price_before_discount &&
                selectedPlan.price_before_discount > selectedPlan.price ? (
                  <p className="mt-1 flex items-center flex-wrap gap-x-2">
                    <strong>Precio:</strong>
                    <span className="line-through text-muted-foreground">
                      Bs. {selectedPlan.price_before_discount.toFixed(2)}
                    </span>
                    <span className="text-primary font-semibold">
                      Bs. {selectedPlan.price.toFixed(2)}
                    </span>
                    <Gift className="w-4 h-4 text-primary" aria-label="¡Descuento aplicado!" />
                  </p>
                ) : (
                  <p className="mt-1">
                    <strong>Precio:</strong> Bs. {selectedPlan.price.toFixed(2)}
                  </p>
                )}
              </div>
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
                <p className="text-muted-foreground mb-2">Escanea este código QR para realizar el pago:</p>
                <button onClick={() => setIsQRModalOpen(true)}>
                  <Image
                    src={qrImage}
                    alt="Código QR"
                    width={256}
                    height={256}
                    className="rounded-md cursor-pointer hover:scale-105 transition-transform"
                  />
                </button>
              </div>
            )}

            {proofSent ? (
              <div className="bg-green-100 border border-green-300 p-4 rounded-md text-green-800">
                <p>Comprobante enviado correctamente. Espera la aprobación.</p>
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

      {/* Modal de QR ampliado */}
      <Dialog open={isQRModalOpen} onOpenChange={setIsQRModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Código QR</DialogTitle>
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
