"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

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
  onSave: () => void; // Se usa para refrescar desde el padre
}

export function ClientEditModal({ client, open, onClose, onSave }: Props) {
  const [form, setForm] = useState<Client | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (client) setForm(client);
  }, [client]);

  if (!client || !form) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/clients/${client.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Error al guardar los cambios");

      toast.success("Cambios guardados correctamente");

      onSave(); // 🔄 Refresca desde el padre
      onClose();
    } catch (err) {
      console.error("Error al actualizar:", err);
      toast.success("Cambios guardados correctamente");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Editar Cliente</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Input name="name" value={form.name} onChange={handleChange} placeholder="Nombre" />
          <Input name="lastname" value={form.lastname} onChange={handleChange} placeholder="Apellido" />
          <Input name="email" value={form.email} onChange={handleChange} placeholder="Correo" />
          <Input name="ci" value={form.ci} onChange={handleChange} placeholder="Carnet" />
          <Input name="birthdate" type="date" value={form.birthdate.slice(0, 10)} onChange={handleChange} />
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Guardando..." : "Guardar cambios"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
