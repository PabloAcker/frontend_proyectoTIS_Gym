"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Image from "next/image";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Gift } from "lucide-react";

interface Membership {
  id: number;
  name: string;
  description: string;
  duration: string;
  price: number;
  discounted_price?: number;
}

interface Notification {
  id: number;
  type: "mensual" | "trimestral" | "anual";
  discount: number;
}

interface Subscription {
  membership_id: number;
  final_price: number | null;
}

export default function MembershipDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [membership, setMembership] = useState<Membership | null>(null);
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [showAlreadySubscribedDialog, setShowAlreadySubscribedDialog] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [latestSubscription, setLatestSubscription] = useState<Subscription | null>(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const userId = user?.id;

    if (userId) {
      // Notificaciones activas
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications/${userId}`)
        .then(res => res.json())
        .then(data => setNotifications(data))
        .catch(err => console.error("Error al obtener notificaciones", err));

      // Última suscripción
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/subscriptions/latest/${userId}`)
        .then(res => res.json())
        .then(data => {
          if (data && typeof data === "object") {
            setLatestSubscription(data);
          }
        })
        .catch(err => console.error("Error al obtener última suscripción", err));
    }

    const fetchMembership = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        const userIdParam = user?.id ? `?userId=${user.id}` : "";
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/memberships/${id}${userIdParam}`);
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

        const estado = subscription.state.toLowerCase();
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
      const selected = {
        id: membership.id,
        name: membership.name,
        description: membership.description,
        duration: membership.duration,
        price: discountedPrice ?? membership.discounted_price ?? membership.price,
        price_before_discount:
          discountedPrice || membership.discounted_price ? membership.price : undefined,
      };

      localStorage.setItem("selectedMembership", JSON.stringify(selected));

    } catch (error) {
      console.error("Error al guardar plan en localStorage:", error);
    }

    toast.success(`Usted eligió el plan ${membership.name}. Redirigiendo...`);
    setLoading(true);

    setTimeout(() => {
      router.push("/client/membership-status-pay");
    }, 4000);
  };

  if (!membership) {
    return <p className="p-6 text-muted-foreground">Cargando...</p>;
  }

  const name = membership.name.toLowerCase();
  const isMonthly = name.includes("mensual");
  const isQuarterly = name.includes("trimestral");
  const isAnnual = name.includes("anual");

  const getPlanType = (name: string): "mensual" | "trimestral" | "anual" | null => {
    const n = name.toLowerCase();
    if (n.includes("mensual")) return "mensual";
    if (n.includes("trimestral")) return "trimestral";
    if (n.includes("anual")) return "anual";
    return null;
  };

  const planType = getPlanType(membership.name);

  // Buscar si hay una notificación activa para este tipo de plan
  const discountNotification = notifications.find((n) => n.type === planType);

  // Verificamos si ya tuvo descuento en la última suscripción para este plan
  const alreadyDiscounted =
    latestSubscription &&
    latestSubscription.membership_id === membership.id &&
    latestSubscription.final_price !== null &&
    latestSubscription.final_price < membership.price;

  // Precio calculado fuera del handler
  const discountedPrice =
    discountNotification && !alreadyDiscounted
      ? membership.price * (1 - discountNotification.discount / 100)
      : null;

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
            <strong>Plan Mensual:</strong> ¿Estás comenzando tu camino hacia una vida más activa o simplemente necesitas una opción flexible para tu rutina? Nuestro Plan Mensual está diseñado para brindarte acceso al gimnasio durante 30 días consecutivos, permitiéndote ingresar una vez al día y acceder a todas las zonas estándar de tu sucursal (zona de musculación, cardio, máquinas y vestuarios).
            
            Este plan es perfecto para quienes desean probar el servicio, adaptarse al ritmo del gimnasio o tienen una agenda cambiante. Es ideal si quieres entrenar con libertad y sin ataduras a largo plazo, pagando solo por el tiempo que realmente usarás.
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
            <strong>Plan Trimestral:</strong> Pensado para quienes buscan consistencia en su entrenamiento sin preocuparse por renovaciones mensuales, el Plan Trimestral te brinda acceso ilimitado al gimnasio durante tres meses completos, con la posibilidad de ingresar las veces que desees cada día, sin restricciones de horario.

            Mantendrás el mismo acceso que en el plan mensual, es decir, a todas las zonas estándar (cardio, pesas, máquinas, etc.), en cualquiera de nuestras sucursales habilitadas.

            Esta opción es ideal para quienes ya han adoptado un ritmo constante de entrenamiento y desean ahorrar respecto al pago mensual.
          </p>
          <ul className="mb-6 list-disc list-inside space-y-2 text-foreground">
            <li>✅ Acceso ilimitado al día por 90 días consecutivos.</li>
            <li>⚠️ No incluye zonas VIP (zumba, sauna, pentágono, etc.).</li>
            <li>🧠 Consejo: Perfecto si entrenás más de 3 veces por semana y te interesa mantener una rutina sólida.</li>
            <li>👨‍🏫 Asistencia básica de instructores.</li>
          </ul>
        </>
      )}

      {isAnnual && (
        <>
          <p className="mb-4 text-lg leading-relaxed text-muted-foreground">
            <strong>Plan Anual:</strong> Quieres sacarle el máximo provecho al gimnasio todo el año? El Plan Anual es la opción más completa y conveniente. Te brinda acceso total todos los días del año, con ingresos ilimitados por día y entrada libre a todas las zonas estándar y VIP de cada sucursal.

            Disfruta de experiencias premium como clases de zumba, áreas de sauna, el pentágono de boxeo, y otras zonas especiales que varían según la sucursal. Este plan está hecho para verdaderos apasionados del fitness o para quienes valoran su bienestar como una prioridad.

            Además, contarás con beneficios exclusivos, acceso prioritario a eventos y promociones, y todo sin preocuparte por renovaciones frecuentes.
          </p>
          <ul className="mb-6 list-disc list-inside space-y-2 text-foreground">
            <li>✅ Acceso ilimitado todo el año.</li>
            <li>🎯 Ideal para atletas, usuarios comprometidos o quienes desean aprovechar todas las ventajas del gimnasio.</li>
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
      <div className="mb-6 text-sm">
        <strong>Precio:</strong>{" "}
        {discountedPrice ? (
          <span className="flex items-center gap-2">
            <span className="line-through text-muted-foreground">
              Bs. {membership.price.toFixed(2)}
            </span>
            <span className="text-primary font-semibold flex items-center gap-1">
              Bs. {discountedPrice.toFixed(2)}
              <Gift className="w-4 h-4 text-primary" aria-label="Precio con descuento" />
            </span>
          </span>
        ) : (
          <span className="text-primary font-semibold">
            Bs. {membership.price.toFixed(2)}
          </span>
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