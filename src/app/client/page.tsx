"use client";

import { useEffect, useState } from "react";
import { ClientSidebar } from "@/components/ClientSidebar";
import { getMemberships } from "@/lib/api";
import { MembershipCard } from "@/components/MembershipCard";

interface Membership {
  id: number;
  name: string;
  description: string;
  duration: string;
  price: number;
}

export default function ClientLandingPage() {
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await getMemberships();
        setMemberships(data);
      } catch (err) {
        console.error(err);
        setError("Error al cargar planes de membresía.");
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, []);

  return (
    <main className="min-h-screen bg-background text-foreground p-6">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <div className="w-full md:w-64">
          <ClientSidebar />
        </div>

        {/* Contenido principal */}
        <div className="flex-1">
          <header className="mb-10">
            <h1 className="text-3xl font-bold mb-4">Bienvenido al Gimnasio</h1>

            <section className="mb-10">
              <h2 className="text-2xl font-semibold mb-2">Acerca de Nosotros</h2>
              <p className="text-muted-foreground">
                Somos un gimnasio comprometido con tu salud y bienestar. Ofrecemos equipos modernos,
                instructores calificados y un ambiente motivador para que logres tus objetivos físicos.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-semibold mb-2">¿Por qué elegirnos?</h2>
              <ul className="list-disc pl-6 text-muted-foreground">
                <li>Planes flexibles y accesibles</li>
                <li>Entrenadores certificados</li>
                <li>Acceso 24/7 con tecnología RFID</li>
                <li>Clases grupales, pesas, cardio y más</li>
              </ul>
            </section>
          </header>

          <section>
            <h2 className="text-2xl font-bold mb-4">
              ¡Elige un plan de membresía y únete a nosotros suscribiéndote!
            </h2>

            {loading && <p className="text-muted-foreground">Cargando planes...</p>}
            {error && <p className="text-red-500">{error}</p>}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {memberships.map((m) => (
                <MembershipCard key={m.id} membership={m} hideDescription />
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
