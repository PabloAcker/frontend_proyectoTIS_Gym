// src/components/CreateMembershipForm.tsx
"use client";

import { useState } from "react";
import { Membership } from "@/interfaces/Membership";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export const CreateMembershipForm = () => {
  const [form, setForm] = useState<Membership>({
    name: "",
    description: "",
    duration: "",
    price: 0,
  });

  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
  
    setForm({
      ...form,
      [name]: name === "price" ? parseFloat(value) : value,
    });
  };  

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/memberships`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error al crear la membresía");
      }
      router.push("/memberships");
    } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Error al enviar formulario");
        }
    }     
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-card p-6 rounded-xl shadow-md">
      <h2 className="text-xl font-bold">Registrar nueva membresía</h2>

      <Input
  type="text"
  name="name"
  placeholder="Nombre"
  value={form.name}
  onChange={handleChange}
  required
/>

<Textarea
  name="description"
  placeholder="Descripción"
  value={form.description}
  onChange={handleChange}
  required
/>

      <Input
        type="text"
        name="duration"
        placeholder="Duración (ej: 1 mes)"
        value={form.duration}
        onChange={handleChange}
        required
      />

      <Input
        type="number"
        name="price"
        placeholder="Precio"
        value={form.price}
        onChange={handleChange}
        required
      />
      
<Button size="lg">Crear Membresía</Button>
<Button variant="outline">Cancelar</Button>
<Button variant="destructive">Eliminar</Button>

      {success && <p className="text-green-500">{success}</p>}
      {error && <p className="text-red-500">{error}</p>}
    </form>
  );
};