// src/components/MembershipCard.tsx
import React from "react";

interface Membership {
  id: number;
  name: string;
  description: string;
  price: number;
  duration: string;
}

export const MembershipCard = ({ membership }: { membership: Membership }) => {
  return (
    <div className="bg-card p-4 rounded-xl shadow-md border border-neutral-200 dark:border-neutral-800">
      <h3 className="text-xl font-bold text-foreground">{membership.name}</h3>
      <p className="text-muted-foreground mb-2">{membership.description}</p>
      <div className="text-sm text-foreground">
        <p><strong>Duración:</strong> {membership.duration}</p>
        <p><strong>Precio:</strong> Bs. {membership.price}</p>
      </div>
    </div>
  );
};