"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  const router = useRouter();

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-8 bg-background text-foreground px-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Bienvenido al Gimnasio PABLO</h1>
        <p className="text-muted-foreground text-lg max-w-md">
          Administra tu suscripción, reserva planes y entrena como nunca antes.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <Button onClick={() => router.push("/auth/login")}>Iniciar sesión</Button>
        <Button variant="outline" onClick={() => router.push("/auth/register")}>Crear cuenta</Button>
        <Button variant="ghost" onClick={() => router.push("/memberships")}>Explorar planes</Button>
      </div>
    </main>
  );
}