"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ClientNavbar } from "@/components/ClientNavbar";
import { getMemberships } from "@/lib/api";
import MembershipCarousel from "@/components/MembershipCarousel";

// Tipado explícito de membresías
interface Membership {
  id: number;
  name: string;
  description: string;
  duration: string;
  price: number;
}

export default function HomePage() {
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMemberships()
      .then((data) => setMemberships(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen flex flex-col text-foreground scroll-smooth">
      {/* Navbar */}
      <ClientNavbar />

      {/* Sección 1: Hero con imagen de fondo y overlay oscuro */}
      <section className="relative w-full h-screen overflow-hidden">
        <Image
          src="/images/plan_trimestral.jpg"
          alt="Fondo gimnasio"
          fill
          priority
          className="object-cover object-center z-0"
        />
        <div className="absolute inset-0 bg-black/20 z-10" />

        <div className="relative z-20 h-full flex items-center px-8 md:px-20">
          <div className="max-w-2xl bg-black/30 p-6 rounded-md backdrop-blur-sm">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white">
              Bienvenido al Gimnasio E‑GYM
            </h1>
            <p className="text-lg text-white text-opacity-90 max-w-md">
              Infórmate, adquiere tu membresía y entrena como nunca antes.
            </p>
          </div>
        </div>
      </section>

      {/* Sección 2: Fondo aurora con carrusel */}
      <section className="relative w-full h-screen bg-gradient-to-br from-[#e0f7fa] via-[#e8eaf6] to-[#f1f8e9] overflow-hidden flex items-center justify-center p-6">
        {/* Aurora Decorations */}
        <div className="absolute top-[-100px] left-[-100px] w-[400px] h-[400px] bg-[#A5F3FC] rounded-full opacity-30 blur-3xl animate-pulse" />
        <div className="absolute bottom-[-120px] right-[-80px] w-[400px] h-[400px] bg-[#C4B5FD] rounded-full opacity-30 blur-3xl animate-pulse" />

        <div className="relative z-10 w-full max-w-3xl px-4">
          <h2 className="text-3xl font-bold text-center mb-8">
            ¡Elige un plan de membresía y únete a nosotros suscribiéndote!
          </h2>

          {!loading && memberships.length > 0 && (
            <MembershipCarousel memberships={memberships} />
          )}
        </div>
      </section>
    </main>
  );
}
