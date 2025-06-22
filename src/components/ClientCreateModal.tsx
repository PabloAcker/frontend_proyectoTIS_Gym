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
  onSave: () => void;
}

export function ClientCreateModal({ open, onClose, onSave }: Props) {
  const [form, setForm] = useState({
    name: "",
    lastname: "",
    email: "",
    password: "",
    ci: "",
    birthdate: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
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
    if (!passwordRegex.test(form.password)) {
      toast.error("La contraseña debe tener al menos 8 caracteres, letras y números.");
      setLoading(false);
      return;
    }
    if (form.ci.length < 5 || form.ci.length > 10) {
      toast.error("Carnet de identidad debe tener entre 5 y 10 caracteres.");
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/clients`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al registrar cliente");

      toast.success("Cliente creado correctamente");
      onSave();
      onClose();
    } catch (error) {
      console.error("Error:", error);
      toast.error("No se pudo registrar el cliente");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Registrar nuevo cliente</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Input name="name" maxLength={25} value={form.name} onChange={handleChange} placeholder="Nombre" />
          <Input name="lastname" maxLength={25} value={form.lastname} onChange={handleChange} placeholder="Apellido" />
          <Input name="email" maxLength={35} value={form.email} onChange={handleChange} placeholder="Correo electrónico" />
          <Input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Contraseña" />
          <Input name="ci" maxLength={10} value={form.ci} onChange={handleChange} placeholder="Carnet de Identidad" />
          <Input name="birthdate" type="date" value={form.birthdate} onChange={handleChange} />

          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Guardando..." : "Crear cliente"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
