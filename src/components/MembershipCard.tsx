"use client";

import { Button } from "@/components/ui/button";
import { Gift } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface Membership {
  id: number;
  name: string;
  description: string;
  duration: string;
  price: number;
}

interface Subscription {
  membership_id: number;
  final_price?: number;
}

interface Notification {
  type: "mensual" | "trimestral" | "anual";
  discount: number;
  message: string;
}

export const MembershipCard = ({
  membership,
  notifications = [],
  latestSubscription,
}: {
  membership: Membership;
  notifications?: Notification[];
  hideDescription?: boolean;
  latestSubscription?: Subscription | null;
}) => {
  const getImagePath = (name: string) => {
    const key = name.toLowerCase();
    if (key.includes("mensual")) return "/images/plan_mensual.avif";
    if (key.includes("trimestral")) return "/images/plan_trimestral.jpg";
    if (key.includes("anual")) return "/images/plan_anual.jpg";
    return "/images/cardMembership.png";
  };

  // Convertir duración a tipo de notificación para comparar
  const mapDurationToType = (duration: string): "mensual" | "trimestral" | "anual" | null => {
    const d = duration.toLowerCase();
    if (d.includes("1 mes")) return "mensual";
    if (d.includes("3 meses")) return "trimestral";
    if (d.includes("12 meses")) return "anual";
    return null;
  };

  const planType = mapDurationToType(membership.duration);

  // Buscar una notificación que coincida exactamente con el tipo
  const discountNotification = notifications.find((n) => n.type === planType);

  const discountedPrice = discountNotification
    ? membership.price * (1 - discountNotification.discount / 100)
    : null;

  const alreadyUsedDiscount =
    latestSubscription &&
    latestSubscription.membership_id === membership.id &&
    typeof latestSubscription.final_price === "number" &&
    latestSubscription.final_price < membership.price;

  return (
    <div className="bg-card p-4 rounded-xl shadow-md border border-border">
      <div className="flex flex-col gap-3">
        <Image
          src={getImagePath(membership.name)}
          alt={`Imagen de ${membership.name}`}
          width={400}
          height={200}
          className="rounded-md object-cover w-full h-48"
        />
        <h3 className="text-xl font-bold text-foreground">{membership.name}</h3>

        <div className="text-sm text-foreground">
          {alreadyUsedDiscount ? (
            // El descuento ya se usó, mostrar solo el precio normal
            <p>
              <strong>Precio:</strong> Bs. {membership.price.toFixed(2)}
            </p>
          ) : discountNotification ? (
            // Tiene descuento disponible (y no se usó antes)
            <p className="text-sm flex items-center gap-2">
              <strong>Precio:</strong>
              <span className="line-through text-muted-foreground">
                Bs. {membership.price.toFixed(2)}
              </span>
              <span className="text-primary font-semibold flex items-center gap-1">
                Bs. {(discountedPrice ?? membership.price).toFixed(2)}
                <span title="¡Precio con descuento!">
                  <Gift className="w-4 h-4 text-primary" />
                </span>
              </span>
            </p>
          ) : (
            // No hay descuento ni se usó antes
            <p>
              <strong>Precio:</strong> Bs. {membership.price.toFixed(2)}
            </p>
          )}
        </div>

        <Link href={`/memberships/${membership.id}`}>
          <Button
            variant="outline"
            className="mt-2 hover:bg-primary hover:text-white transition-colors"
          >
            Ver más
          </Button>
        </Link>
      </div>
    </div>
  );
};
