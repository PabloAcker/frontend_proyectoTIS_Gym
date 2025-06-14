"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Image from "next/image";

interface Membership {
  id: number;
  name: string;
  description: string;
  duration: string;
  price: number;
}

export default function MembershipDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [membership, setMembership] = useState<Membership | null>(null);
  const [loading, setLoading] = useState(false);

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

    fetchMembership();
  }, [id]);

  const handleChoosePlan = () => {
    if (!membership) return;

    try {
      localStorage.setItem("selectedMembership", JSON.stringify(membership));
    } catch (error) {
      console.error("Error al guardar plan en localStorage:", error);
    }

    toast.success(`Usted eligió el plan ${membership.name}. Redirigiendo...`);
    setLoading(true);

    setTimeout(() => {
      router.push("/client/membership-status");
    }, 2000);
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

      {/* 📸 Imagen personalizada */}
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

      {/* 📋 Contenido por plan */}
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

      {/* 👇 Fallback para otros planes sin personalización */}
      {!isMonthly && !isQuarterly && !isAnnual && (
        <p className="text-muted-foreground mb-6">{membership.description}</p>
      )}

      {/* 📌 Datos generales */}
      <p className="mb-2">
        <strong>Duración:</strong> {membership.duration}
      </p>
      <p className="mb-6">
        <strong>Precio:</strong> Bs. {membership.price}
      </p>

      {/* 🎯 Acciones */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Button
          onClick={handleChoosePlan}
          disabled={loading}
          className="w-full sm:w-auto"
        >
          {loading ? "Redirigiendo..." : "Elegir este plan"}
        </Button>

        <Button
          variant="outline"
          onClick={() => router.back()}
          className="w-full sm:w-auto"
        >
          Ver otros planes
        </Button>
      </div>
    </main>
  );
}
