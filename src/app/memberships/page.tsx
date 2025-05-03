// src/app/memberships/page.tsx
"use client";

import { useEffect, useState } from "react";
import { getMemberships } from "@/lib/api";
import { MembershipCard } from "@/components/MembershipCard";

interface Membership {
  id: number;
  name: string;
  description: string;
  price: number;
  duration: string;
}

export default function MembershipsPage() {
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getMemberships();
        setMemberships(data);
      } catch (err) {
        console.error(err);
        setError("Error al cargar membresías.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <main className="p-6 bg-background text-foreground min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Membresías Disponibles</h1>

      {loading && <p className="text-muted-foreground">Cargando...</p>}
      {error && <p className="text-red-500">{error}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {memberships.map((m) => (
          <MembershipCard key={m.id} membership={m} />
        ))}
      </div>
    </main>
  );
}