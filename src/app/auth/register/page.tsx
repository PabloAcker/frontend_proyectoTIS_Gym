"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Eye, EyeOff } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    lastname: "",
    email: "",
    password: "",
    ci: "",
    birthdate: "",
  });

  const [error, setError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setError("");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/clients`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al registrar");

      setShowSuccess(true);
      setTimeout(() => {
        router.push("/auth/login");
      }, 2500);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Error al registrar");
      }
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-background text-foreground">
      <div className="bg-card p-6 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-4">¡Únete a nosotros!</h1>
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="h-px flex-1 bg-muted-foreground" />
          <span className="text-sm text-muted-foreground">Crea tu cuenta</span>
          <div className="h-px flex-1 bg-muted-foreground" />
        </div>

        <Input
          name="name"
          placeholder="Nombre"
          value={form.name}
          onChange={handleChange}
          className="mb-3"
        />
        <Input
          name="lastname"
          placeholder="Apellido"
          value={form.lastname}
          onChange={handleChange}
          className="mb-3"
        />
        <Input
          name="ci"
          placeholder="CI"
          value={form.ci}
          onChange={handleChange}
          className="mb-3"
        />
        <Input
          name="birthdate"
          type="date"
          placeholder="Fecha de nacimiento"
          value={form.birthdate}
          onChange={handleChange}
          className="mb-3"
        />
        <Input
          name="email"
          placeholder="Correo electrónico"
          value={form.email}
          onChange={handleChange}
          className="mb-3"
        />
        <div className="relative mb-4">
          <Input
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Contraseña"
            value={form.password}
            onChange={handleChange}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2 top-2.5 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>

        <Button className="w-full" onClick={handleSubmit}>
          Registrarme
        </Button>

        <div
          onClick={() => router.push("/auth/login")}
          className="mt-4 text-sm text-blue-600 underline text-center cursor-pointer hover:text-blue-800 transition"
        >
          O inicia sesión con tu cuenta
        </div>

        {error && (
          <p className="text-red-500 text-sm mt-2 text-center">{error}</p>
        )}
      </div>

      <Dialog open={showSuccess} onOpenChange={() => {}}>
        <DialogContent className="text-center">
          <DialogHeader>
            <DialogTitle>Cuenta creada exitosamente</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground mt-2">
            Redirigiendo al inicio de sesión...
          </p>
        </DialogContent>
      </Dialog>
    </main>
  );
}
