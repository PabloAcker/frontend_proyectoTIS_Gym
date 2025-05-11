// src/components/ClientNavbar.tsx
"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function ClientNavbar() {
  const router = useRouter();

  return (
    <nav className="flex gap-2 mb-6">
      <Button variant="outline" onClick={() => router.push("/client")}>
        Inicio
      </Button>
      <Button variant="outline" onClick={() => router.push("/memberships")}>
        Planes
      </Button>
      <Button variant="outline" onClick={() => router.push("/client/membership-status")}>
        Mi Suscripción
      </Button>
    </nav>
  );
}
