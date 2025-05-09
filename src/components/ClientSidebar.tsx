"use client";

import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Layers, ClipboardList } from "lucide-react";

export function ClientSidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <div className="w-full sm:w-64 p-4 bg-muted rounded-md mb-6 sm:mb-0">
      <nav className="flex flex-col gap-2">
        <Button
          variant={isActive("/memberships") ? "default" : "ghost"}
          onClick={() => router.push("/memberships")}
          className="justify-start"
        >
          <Layers className="w-4 h-4 mr-2" />
          Planes de membresía
        </Button>
        <Button
          variant={isActive("/client/membership-status") ? "default" : "ghost"}
          onClick={() => router.push("/client/membership-status")}
          className="justify-start"
        >
          <ClipboardList className="w-4 h-4 mr-2" />
          Estado de membresía
        </Button>
      </nav>
    </div>
  );
}
