"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Layers,
  ClipboardList,
  Home,
  UserCog,
  MapPin,
  Sparkles,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

export function ClientSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [logoutDialog, setLogoutDialog] = useState(false);
  const [userName, setUserName] = useState("");

  const isActive = (path: string) => pathname === path;

  const confirmLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.clear();
    router.push("/");
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
    <aside className="w-full sm:w-64 p-4 bg-[#e2f1ef] rounded-md min-h-[90vh] flex flex-col justify-between">
      {/* Navegación principal */}
      <nav className="flex flex-col gap-2">
        <Button
          variant={isActive("/") ? "default" : "ghost"}
          onClick={() => router.push("/")}
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

      {/* Botón de cerrar sesión con nombre del usuario debajo */}
      <div className="mt-4 pt-4">
        <Button
          variant="ghost"
          className="w-full justify-start flex-col items-start text-left"
          onClick={() => setLogoutDialog(true)}
        >
          <div className="flex items-center">
            <LogOut className="w-4 h-4 mr-2" />
            Cerrar sesión -
          {userName && (
            <span className="ml-1">
              {userName}
            </span>
          )}
          </div>
        </Button>
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
    </aside>
  );
}
