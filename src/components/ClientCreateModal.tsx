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
          <Input name="name" value={form.name} onChange={handleChange} placeholder="Nombre" />
          <Input name="lastname" value={form.lastname} onChange={handleChange} placeholder="Apellido" />
          <Input name="email" value={form.email} onChange={handleChange} placeholder="Correo electrónico" />
          <Input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Contraseña" />
          <Input name="ci" value={form.ci} onChange={handleChange} placeholder="Carnet de Identidad" />
          <Input name="birthdate" type="date" value={form.birthdate} onChange={handleChange} />

          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Guardando..." : "Crear cliente"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
