"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  const router = useRouter();

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-8 px-4 relative overflow-hidden bg-gradient-to-br from-[#e0f7fa] via-[#e8eaf6] to-[#f1f8e9]">
      {/* Efecto aurora con blur y opacidad */}
      <div className="absolute top-[-100px] left-[-100px] w-[400px] h-[400px] bg-[#A5F3FC] rounded-full opacity-30 blur-3xl animate-pulse" />
      <div className="absolute bottom-[-120px] right-[-80px] w-[400px] h-[400px] bg-[#C4B5FD] rounded-full opacity-30 blur-3xl animate-pulse" />

      {/* Logo */}
      <Image
        src="/images/logo-gym.png"
        alt="Logo Gimnasio PABLO"
        width={300}
        height={300}
        className="mb-4"
        priority
      />

      {/* Texto principal */}
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4 text-foreground">
          Bienvenido al Gimnasio E-GYM
        </h1>
        <p className="text-muted-foreground text-lg max-w-md mx-auto">
          Infórmate, adquiere tu membresía y entrena como nunca antes.
        </p>
      </div>

      {/* Botones */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Button onClick={() => router.push("/auth/login")}>Iniciar sesión</Button>
        <Button variant="outline" onClick={() => router.push("/auth/register")}>
          Crear cuenta
        </Button>
        <Button variant="ghost" onClick={() => router.push("/memberships")}>
          Explorar planes
        </Button>
      </div>
    </main>
  );
}
