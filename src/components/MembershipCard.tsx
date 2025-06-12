"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

interface Membership {
  id: number;
  name: string;
  description: string;
  duration: string;
  price: number;
}

export const MembershipCard = ({
  membership,
}: {
  membership: Membership;
  hideDescription?: boolean;
}) => {
  const getImagePath = (name: string) => {
    const key = name.toLowerCase();
    if (key.includes("mensual")) return "/images/plan_mensual.avif";
    if (key.includes("trimestral")) return "/images/plan_trimestral.jpg";
    if (key.includes("anual")) return "/images/plan_anual.jpg";
    return "/images/cardMembership.png";
  };

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
          <p>
            <strong>Precio:</strong> Bs. {membership.price}
          </p>
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
