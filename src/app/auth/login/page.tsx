"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

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

      if (data.user.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/memberships");
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
        <h2 className="text-2xl font-bold mb-4 text-center">Iniciar sesión</h2>
        <Input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-3"
        />
        <Input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-3"
        />
        <Button className="w-full" onClick={handleLogin}>
          Continuar
        </Button>
        {error && <p className="text-red-500 text-sm mt-2 text-center">{error}</p>}
      </div>
    </main>
  );
}