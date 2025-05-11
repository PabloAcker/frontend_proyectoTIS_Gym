"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

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
      // ✅ Guardar plan elegido en localStorage como JSON
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

  return (
    <main className="p-6 max-w-xl mx-auto bg-background text-foreground">
      <h1 className="text-3xl font-bold mb-4">{membership.name}</h1>
      <p className="text-muted-foreground mb-4">{membership.description}</p>
      <p className="mb-1"><strong>Duración:</strong> {membership.duration}</p>
      <p className="mb-6"><strong>Precio:</strong> Bs. {membership.price}</p>

      <Button
        onClick={handleChoosePlan}
        disabled={loading}
        className="w-full"
      >
        {loading ? "Redirigiendo..." : "Elegir este plan"}
      </Button>
    </main>
  );
}
