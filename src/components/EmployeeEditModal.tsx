"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

interface Props {
  employee: Employee | null;
  open: boolean;
  onClose: () => void;
  onSave: () => Promise<void>;
}

interface Employee {
  id: number;
  name: string;
  lastname: string;
  email: string;
  role: string;
}

export function EmployeeEditModal({ employee, open, onClose, onSave }: Props) {
  const { user: currentUser } = useAuth();
  const [form, setForm] = useState<Employee | null>(null);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (employee) {
      setForm(employee);
      setPassword("");
    }
  }, [employee]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!form) return;
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRoleChange = (value: string) => {
    if (!form) return;
    setForm({ ...form, role: value });
  };

  const handleSubmit = async () => {
    if (!form) return;
    setLoading(true);
    const nameRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{2,}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

    if (!nameRegex.test(form.name)) {
      toast.error("Nombre inválido. Solo letras y mínimo 2 caracteres.");
      setLoading(false);
      return;
    }
    if (!nameRegex.test(form.lastname)) {
      toast.error("Apellido inválido. Solo letras y mínimo 2 caracteres.");
      setLoading(false);
      return;
    }
    if (!emailRegex.test(form.email)) {
      toast.error("Correo electrónico no válido.");
      setLoading(false);
      return;
    }
    if (password && !passwordRegex.test(password)) {
      toast.error("La contraseña debe tener al menos 8 caracteres, letras y números.");
      setLoading(false);
      return;
    }
    try {
      const payload = {
        name: form.name,
        lastname: form.lastname,
        email: form.email,
        role: form.role,
        ...(password ? { password } : {}),
      };

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${form.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al actualizar empleado");

      toast.success("Empleado actualizado correctamente");
      await onSave();
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message || "Error al actualizar empleado");
      } else {
        toast.error("Error al actualizar empleado");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Editar Empleado</DialogTitle>
        </DialogHeader>

        {form && (
          <>
            <Input
              name="name"
              placeholder="Nombre"
              value={form.name}
              onChange={handleChange}
              className="mb-2"
              maxLength={25}
            />
            <Input
              name="lastname"
              placeholder="Apellido"
              value={form.lastname}
              onChange={handleChange}
              className="mb-2"
              maxLength={25}
            />
            <Input
              name="email"
              placeholder="Correo"
              value={form.email}
              onChange={handleChange}
              className="mb-4"
              maxLength={35}
            />

            <Select value={form.role} onValueChange={handleRoleChange}>
              <SelectTrigger className="mb-4">
                <SelectValue placeholder="Rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="empleado">Empleado</SelectItem>
                <SelectItem value="admin">Administrador</SelectItem>
              </SelectContent>
            </Select>

            {currentUser?.role === "admin" && (
              <div className="relative mb-4">
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

            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full mt-2"
            >
              {loading ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
