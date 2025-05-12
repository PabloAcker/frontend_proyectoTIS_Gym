"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: () => Promise<void>;
}

export function EmployeeCreateModal({ open, onClose, onSave }: Props) {
  const [form, setForm] = useState({
    name: "",
    lastname: "",
    email: "",
    password: "",
    role: "empleado",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al crear empleado");

      toast.success("Empleado creado exitosamente");
      await onSave();
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message || "Error al crear empleado");
      } else {
        toast.error("Error al crear empleado");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crear Empleado</DialogTitle>
        </DialogHeader>
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
          className="mb-2"
        />
        <Input
          name="password"
          placeholder="Contraseña"
          type="password"
          value={form.password}
          onChange={handleChange}
          className="mb-4"
        />
        <Button className="w-full" onClick={handleSubmit} disabled={loading}>
          {loading ? "Creando..." : "Crear"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
