"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Membership } from "@/interfaces/Membership";
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger, AlertDialogAction } from "@/components/ui/alert-dialog";

interface Props {
  membership: Membership | null;
  open: boolean;
  onClose: () => void;
  onSave: () => void;
}

export function MembershipEditModal({
  membership,
  open,
  onClose,
  onSave,
}: Props) {
  const [form, setForm] = useState<Membership | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    if (membership) setForm(membership);
  }, [membership]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!form) return;
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!form) return;
    setLoading(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/memberships/${form.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name,
            description: form.description,
            duration: form.duration,
            price: Number(form.price),
          }),
        }
      );

      if (!res.ok) throw new Error("Error al actualizar");

      toast.success("Membresía actualizada correctamente");
      onSave();
      onClose();
    } catch (error) {
      console.error("Error al actualizar membresía:", error);
      toast.error("Error al guardar cambios");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!form) return;
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/memberships/${form.id}`,
        {
          method: "DELETE",
        }
      );
      if (!res.ok) throw new Error("Error al eliminar");

      toast.success("Membresía eliminada correctamente");
      setConfirmOpen(false);
      onSave();
      onClose();
    } catch (err) {
      console.error("Error al eliminar membresía:", err);
      toast.error("Error al eliminar membresía");
    }
  };

  if (!membership || !form) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg" aria-describedby="modal-description">
        <DialogHeader>
          <DialogTitle>Editar Membresía</DialogTitle>
        </DialogHeader>
        <div id="modal-description" className="sr-only">
          Formulario para editar datos de la membresía seleccionada.
        </div>

        <div className="space-y-3">
          <Input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Nombre"
          />
          <Input
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Descripción"
          />
          <Input
            name="duration"
            value={form.duration}
            onChange={handleChange}
            placeholder="Duración (ej. 3 meses)"
          />
          <Input
            name="price"
            type="number"
            value={form.price}
            onChange={handleChange}
            placeholder="Precio (Bs)"
          />

          <div className="flex justify-between pt-4">
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? "Guardando..." : "Guardar cambios"}
            </Button>

            <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">Eliminar Plan</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    ¿Estás seguro de eliminar este plan?
                  </AlertDialogTitle>
                </AlertDialogHeader>
                <p className="text-muted-foreground">
                  Esta acción no se puede deshacer. El plan se eliminará permanentemente.
                </p>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>
                    Sí, eliminar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}