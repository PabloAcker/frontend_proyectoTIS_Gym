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
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Membership } from "@/interfaces/Membership";

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
}

export function MembershipCreateModal({ open, onClose, onSave }: Props) {
  const [form, setForm] = useState<Membership>({
    name: "",
    description: "",
    duration: "",
    price: 0,
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: name === "price" ? parseFloat(value) : value });
  };

  const handleSubmit = async () => {
    const { name, description, duration, price } = form;

    if (!name.trim() || !description.trim() || !duration.trim() || price <= 0) {
      toast.error("Todos los campos deben estar completos y válidos");
      return;
    }

    if (name.length > 25) {
      toast.error("El nombre no puede tener más de 25 caracteres");
      return;
    }

    if (description.length > 120) {
      toast.error("La descripción no puede tener más de 120 caracteres");
      return;
    }

    if (duration.length > 25) {
      toast.error("La duración no puede tener más de 25 caracteres");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/memberships`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Error al crear membresía");
      toast.success("Membresía creada correctamente");

      onSave();
      onClose();
      setForm({ name: "", description: "", duration: "", price: 0 });
    } catch (err) {
      console.error(err);
      toast.error("Error al crear membresía");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg" aria-describedby="crear-modal">
        <DialogHeader>
          <DialogTitle>Registrar nueva membresía</DialogTitle>
        </DialogHeader>

        <div id="crear-modal" className="sr-only">Formulario para crear membresía</div>

        <div className="space-y-3">
          <Input
            name="name"
            placeholder="Nombre"
            value={form.name}
            onChange={handleChange}
            required
            maxLength={25}
          />
          <Textarea
            name="description"
            placeholder="Descripción"
            value={form.description}
            onChange={handleChange}
            required
            maxLength={120}
          />
          <Input
            name="duration"
            placeholder="Duración (ej: 1 mes)"
            value={form.duration}
            onChange={handleChange}
            required
            maxLength={10}
          />
          <Input
            name="price"
            type="number"
            placeholder="Precio"
            value={form.price}
            onChange={handleChange}
            required
          />

          <Button onClick={handleSubmit} disabled={loading} className="w-full">
            {loading ? "Guardando..." : "Crear Membresía"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}