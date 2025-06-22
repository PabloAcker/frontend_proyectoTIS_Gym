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
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

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
  const { user: currentUser } = useAuth();
  const [form, setForm] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setForm(user);
      setPassword("");
    }
  }, [user]);

  if (!user || !form) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const body = {
        name: form.name,
        lastname: form.lastname,
        email: form.email,
        ...(password ? { password } : {}),
      };

      const nameRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{2,}$/;
      if (!nameRegex.test(form.name)) {
        toast.error("Nombre inválido. Solo letras y mínimo 2 caracteres.");
        return;
      }

      if (!nameRegex.test(form.lastname)) {
        toast.error("Apellido inválido. Solo letras y mínimo 2 caracteres.");
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(form.email)) {
        toast.error("Correo electrónico no válido.");
        return;
      }

      if (password) {
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
        if (!passwordRegex.test(password)) {
          toast.error("La contraseña debe tener al menos 8 caracteres, letras y números.");
          return;
        }
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
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
              maxLength={25}
            />
            <Input
              name="lastname"
              value={form.lastname}
              onChange={handleChange}
              placeholder="Apellido"
              maxLength={25}
            />
            <Input
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Correo"
              type="email"
            />

            {/* Contraseña solo visible si es admin */}
            {currentUser?.role === "admin" && (
              <div className="relative">
                <Input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Nueva contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  maxLength={50}
                />
                <button
                  type="button"
                  className="absolute right-2 top-2.5 text-muted-foreground"
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            )}

            <div className="flex justify-between gap-2 mt-2">
              <Button onClick={handleSubmit} disabled={loading}>
                {loading ? "Guardando..." : "Guardar cambios"}
              </Button>

              {currentUser?.role === "admin" && (
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
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
