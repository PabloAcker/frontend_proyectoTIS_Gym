"use client";

import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Home,
  Users,
  ShieldUser,
  Layers,
  ReceiptText,
  UserCog,
  UsersRound,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export function AdminTopNav() {
  const { user } = useAuth(["admin", "empleado"]);
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <div className="flex gap-2 flex-wrap justify-end">
      <Button
        variant={isActive("/admin") ? "default" : "outline"}
        onClick={() => router.push("/admin")}
      >
        <Home className="w-4 h-4 mr-2" />
        Panel
      </Button>
      <Button
        variant={isActive("/admin/users") ? "default" : "outline"}
        onClick={() => router.push("/admin/users")}
      >
        <UsersRound className="w-4 h-4 mr-2" />
        Usuarios
      </Button>
      <Button
        variant={isActive("/admin/clients") ? "default" : "outline"}
        onClick={() => router.push("/admin/clients")}
      >
        <Users className="w-4 h-4 mr-2" />
        Clientes
      </Button>
      {user?.role === "admin" && (
        <Button
          variant={isActive("/admin/employees") ? "default" : "outline"}
          onClick={() => router.push("/admin/employees")}
        >
          <ShieldUser className="w-4 h-4 mr-2" />
          Empleados
        </Button>
      )}
      <Button
        variant={isActive("/admin/memberships") ? "default" : "outline"}
        onClick={() => router.push("/admin/memberships")}
      >
        <Layers className="w-4 h-4 mr-2" />
        Membresías
      </Button>
      <Button
        variant={isActive("/admin/subscriptions") ? "default" : "outline"}
        onClick={() => router.push("/admin/subscriptions")}
      >
        <ReceiptText className="w-4 h-4 mr-2" />
        Suscripciones
      </Button>
      <Button
        variant={isActive("/admin/profile") ? "default" : "outline"}
        onClick={() => router.push("/admin/profile")}
      >
        <UserCog className="w-4 h-4 mr-2" />
        Perfil
      </Button>
    </div>
  );
}