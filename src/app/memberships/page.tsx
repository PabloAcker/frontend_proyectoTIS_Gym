"use client";

import { useEffect, useState } from "react";
import { getMemberships } from "@/lib/api";
import { MembershipCard } from "@/components/MembershipCard";
import { ClientSidebar } from "@/components/ClientSidebar";

interface Membership {
  id: number;
  name: string;
  description: string;
  price: number;
  duration: string;
}

interface Subscription {
  id: number;
  membership_id: number;
  final_price?: number;
}

export default function MembershipsPage() {
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [isLoadingMemberships, setIsLoadingMemberships] = useState(true);
  const [error, setError] = useState("");

  const [notifications, setNotifications] = useState([]);

  const [latestSubscription, setLatestSubscription] = useState<Subscription | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getMemberships();
        setMemberships(data);
      } catch (err) {
        console.error(err);
        setError("Error al cargar membresías.");
      } finally {
        setIsLoadingMemberships(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return;

    const user = JSON.parse(storedUser);

    // Notificaciones
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications/${user.id}`)
      .then((res) => res.json())
      .then((data) => setNotifications(data))
      .catch((err) => {
        console.error("Error al cargar notificaciones:", err);
        setNotifications([]);
      });

    // Última suscripción
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/subscriptions/latest/${user.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data === "object" && "membership_id" in data) {
          setLatestSubscription(data);
        }
      })
      .catch((err) => {
        console.error("Error al cargar última suscripción:", err);
        setLatestSubscription(null);
      });
  }, []);

  return (
    <main className="flex flex-col sm:flex-row min-h-screen bg-background text-foreground p-6 gap-6">
      <ClientSidebar />

      <div className="flex-1">
        <h1 className="text-3xl font-bold mb-6">Planes de Membresías</h1>

        {isLoadingMemberships && (
          <p className="text-muted-foreground">Cargando...</p>
        )}
        {error && <p className="text-red-500">{error}</p>}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {memberships.map((m) => (
            <MembershipCard
              key={m.id}
              membership={m}
              notifications={notifications}
              latestSubscription={latestSubscription}
            />
          ))}
        </div>
      </div>
    </main>
  );
}
