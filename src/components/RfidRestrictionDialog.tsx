// src/components/RfidRestrictionDialog.tsx
"use client";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";

interface RfidRestrictionDialogProps {
  open: boolean;
  onClose: () => void;
}

export function RfidRestrictionDialog({ open, onClose }: RfidRestrictionDialogProps) {
  return (
    <AlertDialog open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Acceso restringido</AlertDialogTitle>
          <AlertDialogDescription>
            El plan mensual solo permite un ingreso por día. Ya se ha registrado una entrada hoy con esta tarjeta.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={onClose}>Aceptar</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
