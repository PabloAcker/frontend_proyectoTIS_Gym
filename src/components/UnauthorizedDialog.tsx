"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function UnauthorizedDialog() {
  const [open, setOpen] = useState(true);
  const router = useRouter();

  const handleRedirect = () => {
    setOpen(false);
    router.push("/");
  };

  return (
    <Dialog open={open} onOpenChange={handleRedirect}>
      <DialogContent className="max-w-md text-center">
        <DialogHeader>
          <DialogTitle>Acceso denegado</DialogTitle>
        </DialogHeader>
        <p className="text-muted-foreground mb-4">
          No tienes permisos para acceder a esta sección.
        </p>
        <Button onClick={handleRedirect}>Volver al inicio</Button>
      </DialogContent>
    </Dialog>
  );
}
