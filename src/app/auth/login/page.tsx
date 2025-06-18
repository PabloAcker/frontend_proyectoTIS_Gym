"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    setError("");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al iniciar sesión");

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      if (data.user.role === "admin" || data.user.role === "empleado") {
        router.push("/admin");
      } else if (data.user.role === "cliente") {
        router.push("/");
      } else {
        router.push("/client");
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Error al iniciar sesión");
      }
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-background text-foreground">
      <div className="bg-card p-6 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-4">¡Bienvenido de nuevo!</h1>
        <div className="flex items-center justify-center mb-6">
          <div className="flex-1 h-px bg-muted mx-2" />
          <h2 className="text-sm text-muted-foreground font-medium">Inicia sesión</h2>
          <div className="flex-1 h-px bg-muted mx-2" />
        </div>

        <Input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-3"
        />

        <div className="relative mb-2">
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2 top-2.5 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>

        <div
          className="text-sm text-blue-600 underline mb-4 text-right cursor-pointer hover:text-blue-800 transition"
          onClick={() => router.push("/auth/register")}
        >
          ¿No tienes una cuenta? Regístrate
        </div>

        <Button className="w-full" onClick={handleLogin}>
          Continuar
        </Button>

        {error && (
          <p className="text-red-500 text-sm mt-2 text-center">{error}</p>
        )}
      </div>
    </main>
  );
}
