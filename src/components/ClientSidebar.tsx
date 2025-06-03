"use client";

import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Layers, ClipboardList, Home, UserCog, MapPin, Sparkles } from "lucide-react";

export function ClientSidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <aside className="w-full sm:w-64 p-4 bg-[#e2f1ef] rounded-md min-h-screen">
      <nav className="flex flex-col gap-2">
        <Button
          variant={isActive("/client") ? "default" : "ghost"}
          onClick={() => router.push("/client")}
          className="justify-start"
        >
          <Home className="w-4 h-4 mr-2" />
          Inicio
        </Button>

        <Button
          variant={isActive("/memberships") ? "default" : "ghost"}
          onClick={() => router.push("/memberships")}
          className="justify-start"
        >
          <Layers className="w-4 h-4 mr-2" />
          Planes de membresía
        </Button>

        <Button
          variant={isActive("/client/branches") ? "default" : "ghost"}
          onClick={() => router.push("/client/branches")}
          className="justify-start"
        >
          <MapPin className="w-4 h-4 mr-2" />
          Sucursales
        </Button>

        <Button
          variant={isActive("/client/chatbot") ? "default" : "ghost"}
          onClick={() => router.push("/client/chatbot")}
          className="justify-start"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Dietas y rutinas
        </Button>

        <Button
          variant={isActive("/client/membership-status") ? "default" : "ghost"}
          onClick={() => router.push("/client/membership-status")}
          className="justify-start"
        >
          <ClipboardList className="w-4 h-4 mr-2" />
          Estado de suscripción
        </Button>

        <Button
          variant={isActive("/client/profile") ? "default" : "ghost"}
          onClick={() => router.push("/client/profile")}
          className="justify-start"
        >
          <UserCog className="w-4 h-4 mr-2" />
          Perfil
        </Button>
      </nav>
    </aside>
  );
}
