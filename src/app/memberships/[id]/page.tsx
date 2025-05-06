// src/app/memberships/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface Membership {
  id: number;
  name: string;
  description: string;
  duration: string;
  price: number;
}

export default function MembershipDetailPage() {
  const { id } = useParams();
  const [membership, setMembership] = useState<Membership | null>(null);

  useEffect(() => {
    const fetchMembership = async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/memberships/${id}`);
      const data = await res.json();
      setMembership(data);
    };

    fetchMembership();
  }, [id]);

  if (!membership) return <p className="p-6 text-muted-foreground">Cargando...</p>;

  return (
    <main className="p-6">
      <h1 className="text-3xl font-bold mb-4">{membership.name}</h1>
      <p className="text-muted-foreground mb-2">{membership.description}</p>
      <p><strong>Duración:</strong> {membership.duration}</p>
      <p><strong>Precio:</strong> Bs. {membership.price}</p>
    </main>
  );
}
