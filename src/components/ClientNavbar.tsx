"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import {
  Layers,
  MapPin,
  Sparkles,
  ClipboardList,
  UserCog,
  LogOut,
  MoreHorizontal,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";

export function ClientNavbar() {
  const router = useRouter();

  type User = { name: string };
  const [user, setUser] = useState<User | null>(null);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
      } catch (e) {
        console.error("Error al parsear usuario:", e);
      }
    }
  }, []);

  const confirmLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    router.push("/");
  };

  if (!isMounted) return null;

  return (
    <>
      <nav className="fixed top-0 left-0 w-full z-50 backdrop-blur-md bg-background/20 border-b border-border shadow-sm px-6 py-3 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3 ml-12">
          <Image
            src="/images/logo-gym.png"
            alt="Logo Gimnasio"
            width={40}
            height={40}
            className="rounded-sm"
          />
          <span className="font-bold text-xl text-black">E-GYM</span>
        </div>

        {/* Navegación */}
        <div className="flex items-center gap-4 mr-10">
          {user ? (
            <>
              <Button
                variant="ghost"
                onClick={() => router.push("/memberships")}
                className="flex items-center gap-2"
              >
                <Layers className="w-4 h-4" />
                Planes de membresía
              </Button>
              <Button
                variant="ghost"
                onClick={() => router.push("/client/branches")}
                className="flex items-center gap-2"
              >
                <MapPin className="w-4 h-4" />
                Sucursales
              </Button>
              <Button
                variant="ghost"
                onClick={() => router.push("/client/chatbot")}
                className="flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Dietas y rutinas
              </Button>

              {/* Menú de navegación adicional */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2">
                    <MoreHorizontal className="w-4 h-4" />
                    Más
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => router.push("/client/membership-status")}
                  >
                    <ClipboardList className="w-4 h-4 mr-2" />
                    Estado de suscripción
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/client/profile")}>
                    <UserCog className="w-4 h-4 mr-2" />
                    Perfil
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Botón de cerrar sesión (fuera del dropdown) */}
              <Button
                variant="ghost"
                onClick={() => setLogoutDialogOpen(true)}
                className="flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Cerrar sesión - {user.name}
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => router.push("/auth/login")}>
                Iniciar sesión
              </Button>
              <Button onClick={() => router.push("/auth/register")}>
                Crear cuenta
              </Button>
            </>
          )}
        </div>
      </nav>

      {/* Diálogo de confirmación */}
      <AlertDialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro de cerrar sesión?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción cerrará tu sesión actual y te llevará a la página principal.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmLogout}>Confirmar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
