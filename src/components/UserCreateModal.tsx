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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
}

export function UserCreateModal({ open, onClose, onSave }: Props) {
  const [form, setForm] = useState({
    name: "",
    lastname: "",
    email: "",
    password: "",
    role: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!form.role) {
      toast.error("Selecciona un rol para el usuario");
      return;
    }

    setLoading(true);

    const nameRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{2,}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

    if (!nameRegex.test(form.name)) {
      toast.error("Nombre inválido. Solo letras y mínimo 2 caracteres.");
      return;
    }
    if (!nameRegex.test(form.lastname)) {
      toast.error("Apellido inválido. Solo letras y mínimo 2 caracteres.");
      return;
    }
    if (!emailRegex.test(form.email)) {
      toast.error("Correo electrónico no válido.");
      return;
    }
    if (!passwordRegex.test(form.password)) {
      toast.error("La contraseña debe tener al menos 8 caracteres, letras y números.");
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al registrar usuario");

      toast.success("Usuario creado correctamente");
      onSave();
      onClose();
    } catch (error) {
      console.error("Error:", error);
      toast.error("No se pudo registrar el usuario");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Registrar nuevo usuario</DialogTitle>
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
            placeholder="Correo electrónico"
          />
          <Input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Contraseña"
            maxLength={50}
          />

          <Select
            value={form.role}
            onValueChange={(value) => setForm({ ...form, role: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona un rol" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="empleado">Empleado</SelectItem>
              <SelectItem value="cliente">Cliente</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Guardando..." : "Crear usuario"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
