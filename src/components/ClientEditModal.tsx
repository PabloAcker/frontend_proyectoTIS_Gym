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
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

interface Client {
  id: number;
  name: string;
  lastname: string;
  email: string;
  ci: string;
  birthdate: string;
}

interface Props {
  client: Client | null;
  open: boolean;
  onClose: () => void;
  onSave: () => void;
}

export function ClientEditModal({ client, open, onClose, onSave }: Props) {
  const { user: currentUser } = useAuth();
  const [form, setForm] = useState<Client | null>(null);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (client) {
      setForm(client);
      setPassword("");
    }
  }, [client]);

  if (!client || !form) return null;

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
        ci: form.ci,
        birthdate: form.birthdate,
        ...(password ? { password } : {}),
      };

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/clients/${client.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Error al guardar los cambios");

      toast.success("Cambios guardados correctamente");
      onSave();
      onClose();
    } catch (err) {
      console.error("Error al actualizar:", err);
      toast.error("Error al guardar");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/clients/${client.id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Error al eliminar");

      toast.success("Cliente eliminado correctamente");
      onSave();
      onClose();
    } catch (err) {
      console.error("Error al eliminar:", err);
      toast.error("Error al eliminar cliente");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Editar Cliente</DialogTitle>
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
          />
          <Input
            name="ci"
            value={form.ci}
            onChange={handleChange}
            placeholder="Carnet"
          />
          <Input
            name="birthdate"
            type="date"
            value={form.birthdate.slice(0, 10)}
            onChange={handleChange}
          />

          {currentUser?.role === "admin" && (
            <div className="relative">
              <Input
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Nueva contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
                  <Button variant="destructive">Eliminar Cliente</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      ¿Estás seguro de eliminar este cliente?
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
  );
}
