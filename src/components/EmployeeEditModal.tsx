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
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  const [form, setForm] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setForm(employee);
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
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${form.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al actualizar empleado");

      toast.success("Empleado actualizado correctamente");
      await onSave();
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
      <DialogContent>
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
            />
            <Input
              name="lastname"
              placeholder="Apellido"
              value={form.lastname}
              onChange={handleChange}
              className="mb-2"
            />
            <Input
              name="email"
              placeholder="Correo"
              value={form.email}
              onChange={handleChange}
              className="mb-4"
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
            <Button onClick={handleSubmit} className="w-full" disabled={loading}>
              {loading ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
