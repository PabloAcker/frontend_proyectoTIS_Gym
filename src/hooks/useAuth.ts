"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export function useAuth(requiredRole?: "admin" | "cliente") {
  const pathname = usePathname();
  const [user, setUser] = useState<{ id: number; name: string; role: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem("user");

    if (!userData) {
      setLoading(false);
      setUnauthorized(true);
      return;
    }

    const parsed = JSON.parse(userData);
    setUser(parsed);

    if (requiredRole && parsed.role !== requiredRole) {
      setUnauthorized(true);
    }

    setLoading(false);
  }, [pathname, requiredRole]);

  return { user, loading, unauthorized };
}
