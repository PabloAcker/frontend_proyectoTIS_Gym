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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

interface User {
  id: number;
  name: string;
  lastname: string;
  email: string;
  role: string;
}

interface Props {
  user: User | null;
  open: boolean;
  onClose: () => void;
  onSave: () => void;
}

export function UserEditModal({ user, open, onClose, onSave }: Props) {
  const [form, setForm] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) setForm(user);
  }, [user]);

  if (!user || !form) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Error al guardar los cambios");

      toast.success("Usuario actualizado correctamente");
      onSave();
      onClose();
    } catch (err) {
      console.error("Error al actualizar usuario:", err);
      toast.error("Error al guardar");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${user.id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Error al eliminar");

      toast.success("Usuario eliminado correctamente");
      onSave();
      onClose();
    } catch (err) {
      console.error("Error al eliminar usuario:", err);
      toast.error("Error al eliminar usuario");
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar Usuario</DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <Input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Nombre"
            />
            <Input
              name="lastname"
              value={form.lastname}
              onChange={handleChange}
              placeholder="Apellido"
            />
            <Input
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Correo"
              type="email"
            />

            <div className="flex justify-between gap-2">
              <Button onClick={handleSubmit} disabled={loading}>
                {loading ? "Guardando..." : "Guardar cambios"}
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">Eliminar Usuario</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      ¿Estás seguro de eliminar este usuario?
                    </AlertDialogTitle>
                  </AlertDialogHeader>
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
    </>
  );
}
