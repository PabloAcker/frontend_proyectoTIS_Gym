"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { Button } from "./ui/button";
import {
  Layers,
  MapPin,
  Sparkles,
  ClipboardList,
  UserCog,
  LogOut,
  MoreHorizontal,
  BellIcon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
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

  type User = { id: number; name: string };
  const [user, setUser] = useState<User | null>(null);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [notifications, setNotifications] = useState<string[]>([]);
  const [hasNewNotifications, setHasNewNotifications] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (!storedUser || !token) {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      setUser(null);
    } else {
      try {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
        fetchNotifications(parsed.id);
      } catch (e) {
        console.error("Error al parsear usuario:", e);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        setUser(null);
      }
    }

    setIsMounted(true);
  }, []);

  const fetchNotifications = async (userId: number) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications/${userId}`);
      const data = await res.json();

      if (Array.isArray(data)) {
        const messages = data.map((item) => item.message);
        setNotifications(messages);

        const seen = Cookies.get("notifications_seen");
        if (messages.length > 0 && !seen) {
          setHasNewNotifications(true);
        } else {
          setHasNewNotifications(false);
        }
      } else {
        setNotifications([]);
        setHasNewNotifications(false);
      }
    } catch (err) {
      console.error("Error al cargar notificaciones:", err);
      setNotifications([]);
      setHasNewNotifications(false);
    }
  };

  const confirmLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.clear();
    setUser(null);
    router.push("/");
  };

  const handleNotificationOpen = () => {
    Cookies.set("notifications_seen", "true", { expires: 7 });
    setHasNewNotifications(false);
  };

  if (!isMounted) return null;

  return (
    <>
      <nav className="fixed top-0 left-0 w-full z-50 backdrop-blur-md bg-background/20 border-b border-border shadow-sm px-6 py-3 flex items-center justify-between">
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

        <div className="flex items-center gap-4 mr-10">
          {user ? (
            <>
              <Button variant="ghost" onClick={() => router.push("/memberships")} className="flex items-center gap-2">
                <Layers className="w-4 h-4" />
                Planes de membresía
              </Button>
              <Button variant="ghost" onClick={() => router.push("/client/branches")} className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Sucursales
              </Button>
              <Button variant="ghost" onClick={() => router.push("/client/chatbot")} className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Dietas y rutinas
              </Button>

              {/* 🔔 Campana de notificaciones */}
              <DropdownMenu onOpenChange={(open) => {
                if (open) handleNotificationOpen();
              }}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative p-2">
                    <BellIcon className="w-5 h-5" />
                    {hasNewNotifications && (
                      <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-red-500 animate-ping" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-72">
                  <DropdownMenuLabel>Notificaciones</DropdownMenuLabel>
                  {notifications.length === 0 ? (
                    <DropdownMenuItem className="text-sm text-muted-foreground">
                      No tienes notificaciones.
                    </DropdownMenuItem>
                  ) : (
                    notifications.map((msg, index) => (
                      <DropdownMenuItem key={index} className="text-sm">
                        {msg}
                      </DropdownMenuItem>
                    ))
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Menú Más */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2">
                    <MoreHorizontal className="w-4 h-4" />
                    Más
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => router.push("/client/membership-status")}>
                    <ClipboardList className="w-4 h-4 mr-2" />
                    Estado de suscripción
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/client/profile")}>
                    <UserCog className="w-4 h-4 mr-2" />
                    Perfil
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button variant="ghost" onClick={() => setLogoutDialogOpen(true)} className="flex items-center gap-2">
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
