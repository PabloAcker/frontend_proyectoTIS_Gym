// src/components/MembershipCard.tsx
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

export const MembershipCard = ({ membership }: { membership: Membership }) => {
  return (
    <div className="bg-card p-4 rounded-xl shadow-md border border-border">
      <div className="flex flex-col gap-3">
        <Image
          src="/images/cardMembership.png"
          alt={`Imagen de ${membership.name}`}
          width={400}
          height={200}
          className="rounded-md object-cover w-full h-48"
        />
        <h3 className="text-xl font-bold text-foreground">{membership.name}</h3>
        <p className="text-muted-foreground">{membership.description}</p>
        <div className="text-sm text-foreground">
          <p><strong>Duración:</strong> {membership.duration}</p>
          <p><strong>Precio:</strong> Bs. {membership.price}</p>
        </div>

        <Link href={`/memberships/${membership.id}`}>
          <Button variant="outline" className="mt-2 hover:bg-primary hover:text-white transition-colors">Ver más</Button>
        </Link>
      </div>
    </div>
  );
};
