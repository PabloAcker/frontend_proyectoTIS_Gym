"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Image from "next/image";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Membership {
  id: number;
  name: string;
  description: string;
  duration: string;
  price: number;
  price_before_discount?: number;
}

export default function MembershipDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [membership, setMembership] = useState<Membership | null>(null);
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [showAlreadySubscribedDialog, setShowAlreadySubscribedDialog] = useState(false);

  useEffect(() => {
    const fetchMembership = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/memberships/${id}`);
        const data = await res.json();
        setMembership(data);
      } catch (error) {
        console.error("Error al cargar membresía:", error);
      }
    };

    const checkSubscription = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        if (!user || !user.id) return;

        setIsLoggedIn(true);

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/subscriptions/user/${user.id}`);
        const subscription = await res.json();

        if (!subscription || !subscription.state) {
          setHasActiveSubscription(false);
          return;
        }

        const estado = subscription.state.toLowerCase(); // 👈 campo correcto
        const esActiva = estado === "pendiente" || estado === "aprobado";

        setHasActiveSubscription(esActiva);

        if (estado === "rechazado") {
          toast.warning("Tu última suscripción fue rechazada. Puedes elegir otro plan.");
        } else if (estado === "vencido") {
          toast.info("Tu suscripción ha vencido. Puedes renovar el plan.");
        }

      } catch (error) {
        console.error("Error al verificar suscripción:", error);
        setHasActiveSubscription(false);
      }
    };

    fetchMembership();
    checkSubscription();
  }, [id]);

  const handleChoosePlan = () => {
    if (hasActiveSubscription) {
      setShowAlreadySubscribedDialog(true);
      return;
    }

    if (!membership) return;

    try {
      localStorage.setItem("selectedMembership", JSON.stringify(membership));
    } catch (error) {
      console.error("Error al guardar plan en localStorage:", error);
    }

    toast.success(`Usted eligió el plan ${membership.name}. Redirigiendo...`);
    setLoading(true);

    setTimeout(() => {
      router.push("/client/membership-status-pay");
    }, 6000);
  };

  if (!membership) {
    return <p className="p-6 text-muted-foreground">Cargando...</p>;
  }

  const name = membership.name.toLowerCase();
  const isMonthly = name.includes("mensual");
  const isQuarterly = name.includes("trimestral");
  const isAnnual = name.includes("anual");

  return (
    <main className="p-6 max-w-2xl mx-auto bg-background text-foreground">
      <h1 className="text-4xl font-bold mb-4 text-center">{membership.name}</h1>

      {(isMonthly || isQuarterly || isAnnual) && (
        <Image
          src={
            isMonthly
              ? "/images/plan_mensual.avif"
              : isQuarterly
              ? "/images/plan_trimestral.jpg"
              : "/images/plan_anual.jpg"
          }
          alt={`Plan ${membership.name}`}
          width={800}
          height={400}
          className="rounded-lg mb-6"
        />
      )}

      {isMonthly && (
        <>
          <p className="mb-4 text-lg leading-relaxed text-muted-foreground">
            <strong>Plan Mensual:</strong> ¿Estás comenzando tu camino hacia una vida más activa o simplemente necesitas una opción flexible para tu rutina? ...
          </p>
          <ul className="mb-6 list-disc list-inside space-y-2 text-foreground">
            <li>✅ Ingreso una vez al día durante 30 días.</li>
            <li>⚠️ No incluye zonas VIP (zumba, sauna, pentágono, etc.).</li>
            <li>🔒 Tu acceso es personal e intransferible, y puedes renovarlo fácilmente cada mes desde tu cuenta.</li>
            <li>👨‍🏫 Asistencia básica de instructores.</li>
          </ul>
        </>
      )}

      {isQuarterly && (
        <>
          <p className="mb-4 text-lg leading-relaxed text-muted-foreground">
            <strong>Plan Trimestral:</strong> Pensado para quienes buscan consistencia en su entrenamiento...
          </p>
          <ul className="mb-6 list-disc list-inside space-y-2 text-foreground">
            <li>✅ Acceso ilimitado al día por 90 días consecutivos.</li>
            <li>⚠️ No incluye zonas VIP.</li>
            <li>🧠 Consejo: Perfecto si entrenás más de 3 veces por semana.</li>
            <li>👨‍🏫 Asistencia básica de instructores.</li>
          </ul>
        </>
      )}

      {isAnnual && (
        <>
          <p className="mb-4 text-lg leading-relaxed text-muted-foreground">
            <strong>Plan Anual:</strong> ¿Quieres sacarle el máximo provecho al gimnasio todo el año? ...
          </p>
          <ul className="mb-6 list-disc list-inside space-y-2 text-foreground">
            <li>✅ Acceso ilimitado todo el año.</li>
            <li>🎯 Ideal para atletas o quienes valoran su bienestar como prioridad.</li>
            <li>🧘 Acceso ilimitado a clases premium y zonas VIP.</li>
            <li>👨‍🏫 Asistencia personalizada de instructores.</li>
          </ul>
        </>
      )}

      {!isMonthly && !isQuarterly && !isAnnual && (
        <p className="text-muted-foreground mb-6">{membership.description}</p>
      )}

      <p className="mb-2">
        <strong>Duración:</strong> {membership.duration}
      </p>
      <div className="mb-6">
        {membership.price_before_discount && membership.price_before_discount > membership.price ? (
          <p>
            <strong>Precio:</strong>{" "}
            <span className="line-through text-muted-foreground mr-2">
              Bs. {membership.price_before_discount}
            </span>
            <span className="text-primary font-semibold">Bs. {membership.price}</span>
            <span className="ml-2 text-green-500" title="¡Descuento activo!">🎁</span>
          </p>
        ) : (
          <p>
            <strong>Precio:</strong> Bs. {membership.price}
          </p>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        {isLoggedIn && (
          <Button
            onClick={handleChoosePlan}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            {loading ? "Redirigiendo..." : "Elegir este plan"}
          </Button>
        )}
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="w-full sm:w-auto"
        >
          Ver otros planes
        </Button>
      </div>

      <Dialog open={showAlreadySubscribedDialog} onOpenChange={setShowAlreadySubscribedDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Ya tienes una suscripción activa</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground text-sm mt-2">
            Ya tienes un plan de membresía activo actualmente. Para poder seleccionar uno nuevo, deberás esperar a que finalice el actual o comunicarte con el personal del gimnasio para gestionar un cambio.
          </p>
          <div className="flex justify-end mt-4">
            <Button onClick={() => setShowAlreadySubscribedDialog(false)}>Aceptar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
