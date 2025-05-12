"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export function useAuth(requiredRoles?: string[]) {
  const pathname = usePathname();
  const [user, setUser] = useState<{ id: number; name: string; role: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem("user");

    if (!userData) {
      setUnauthorized(true);
      setLoading(false);
      return;
    }

    try {
      const parsed = JSON.parse(userData);
      const isAuthorized =
        !requiredRoles || requiredRoles.length === 0 || requiredRoles.includes(parsed.role);

      if (!user || user.id !== parsed.id || user.role !== parsed.role) {
        setUser(parsed); // solo actualiza si cambia
      }

      setUnauthorized(!isAuthorized);
    } catch (err) {
      console.error("Error parsing user data", err);
      setUnauthorized(true);
    } finally {
      setLoading(false);
    }
    // Solo depende del pathname (para recarga en cambios de ruta)
  }, [pathname, requiredRoles, user]);

  return { user, loading, unauthorized };
}
