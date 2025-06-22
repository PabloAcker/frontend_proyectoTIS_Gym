"use client";

import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  Home,
  Users,
  ShieldUser,
  Layers,
  ReceiptText,
  UserCog,
  UsersRound,
  MapPin,
  BadgeCheck,
  MoreHorizontal,
  LogOut,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { useState, useEffect } from "react";

export function AdminTopNav() {
  const { user } = useAuth(["admin", "empleado"]);
  const router = useRouter();
  const pathname = usePathname();

  const [logoutDialog, setLogoutDialog] = useState(false);
  const [userName, setUserName] = useState("");

  const isActive = (path: string) => pathname === path;

  const routes = [
    ...(user?.role === "admin"
      ? [{ label: "Panel", icon: <Home className="w-4 h-4 mr-2" />, href: "/admin" }]
      : []),
    { label: "Usuarios", icon: <UsersRound className="w-4 h-4 mr-2" />, href: "/admin/users" },
    { label: "Clientes", icon: <Users className="w-4 h-4 mr-2" />, href: "/admin/clients" },
    ...(user?.role === "admin"
      ? [{ label: "Empleados", icon: <ShieldUser className="w-4 h-4 mr-2" />, href: "/admin/employees" }]
      : []),
    { label: "Sucursales", icon: <MapPin className="w-4 h-4 mr-2" />, href: "/admin/branches" },
    { label: "Accesos RFID", icon: <BadgeCheck className="w-4 h-4 mr-2" />, href: "/admin/rfid" },
    ...(user?.role === "admin"
      ? [{ label: "Membresías", icon: <Layers className="w-4 h-4 mr-2" />, href: "/admin/memberships" }]
      : []),
    { label: "Suscripciones", icon: <ReceiptText className="w-4 h-4 mr-2" />, href: "/admin/subscriptions" },
    { label: "Perfil", icon: <UserCog className="w-4 h-4 mr-2" />, href: "/admin/profile" },
  ];

  const maxVisible = 6;
  const visibleRoutes = routes.slice(0, maxVisible);
  const overflowRoutes = routes.slice(maxVisible);

  const confirmLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.clear();
    window.location.href = "/";
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUserName(parsed.name || "");
      } catch (e) {
        console.error("Error al parsear usuario:", e);
      }
    }
  }, []);

  return (
    <>
      <div className="flex gap-2 overflow-x-auto max-w-full scrollbar-hide">
        {visibleRoutes.map((route) => (
          <Button
            key={route.href}
            variant={isActive(route.href) ? "default" : "outline"}
            onClick={() => router.push(route.href)}
          >
            {route.icon}
            {route.label}
          </Button>
        ))}

        {overflowRoutes.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <MoreHorizontal className="w-4 h-4 mr-2" />
                Más
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {overflowRoutes.map((route) => (
                <DropdownMenuItem
                  key={route.href}
                  onClick={() => router.push(route.href)}
                >
                  {route.icon}
                  {route.label}
                </DropdownMenuItem>
              ))}
              <DropdownMenuItem onClick={() => setLogoutDialog(true)}>
                <LogOut className="w-4 h-4 mr-2" />
                Cerrar sesión - {userName}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {overflowRoutes.length === 0 && (
          <Button
            variant="outline"
            onClick={() => setLogoutDialog(true)}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Cerrar sesión - {userName}
          </Button>
        )}
      </div>

      {/* Modal de confirmación */}
      <AlertDialog open={logoutDialog} onOpenChange={setLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro de cerrar sesión?</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmLogout}>
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
