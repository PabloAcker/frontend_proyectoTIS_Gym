"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { ClientSidebar } from "@/components/ClientSidebar";
import { Button } from "@/components/ui/button";
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
  const { loading, user } = useAuth("cliente");
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [qrImage, setQrImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/subscriptions/user/${user?.id}`);
        const data = await res.json();
        setSubscription(data || null);
      } catch (error) {
        console.error("Error al cargar suscripción:", error);
        setSubscription(null);
      }
    };

    const fetchQr = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/qrs`);
        if (!res.ok) throw new Error("QR no encontrado");

        const data = await res.json();
        setQrImage(data.image || null);
      } catch (error) {
        console.error("Error al cargar QR:", error);
        setQrImage(null);
      }
    };

    if (user) {
      fetchSubscription();
      fetchQr();
    }
  }, [user]);

  const handleUpload = async () => {
    if (!proofFile || !subscription) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/subscriptions/proof/${subscription.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ proofFile: base64 }),
        });

        if (!res.ok) throw new Error("Error al subir comprobante");

        toast.success("Comprobante enviado correctamente");
        setProofFile(null);
      } catch (error) {
        console.error("Error al enviar comprobante:", error);
        toast.error("Error al enviar el comprobante");
      }
    };

    reader.readAsDataURL(proofFile);
  };

  if (loading) return <p className="p-6">Verificando acceso...</p>;

  return (
    <main className="flex flex-col sm:flex-row min-h-screen bg-background text-foreground p-6 gap-6">
      <ClientSidebar />

      <div className="flex-1">
        <h1 className="text-2xl font-bold mb-4">Estado de suscripción</h1>

        {!subscription ? (
          <div className="text-muted-foreground">
            <p className="mb-4">No tienes ninguna suscripción activa.</p>

            {qrImage && (
              <div className="mb-4">
                <h2 className="font-semibold mb-2">Realiza tu pago escaneando este QR:</h2>
                <Image
                  src={qrImage}
                  alt="Código QR de pago"
                  width={256}
                  height={256}
                  className="rounded-md"
                />
              </div>
            )}

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
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <p className="text-muted-foreground">Estado: <strong>{subscription.state}</strong></p>
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
    </main>
  );
}