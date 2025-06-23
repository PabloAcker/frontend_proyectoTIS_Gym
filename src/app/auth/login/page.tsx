"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [cooldown, setCooldown] = useState(0); // en segundos

  const validateLoginForm = () => {
  if (!email.trim() || !password.trim()) {
    setError("Todos los campos son obligatorios");
    return false;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    setError("Correo electrónico no válido");
    return false;
  }

  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
  if (!passwordRegex.test(password)) {
    setError("La contraseña debe tener al menos 8 caracteres e incluir letras y números");
    return false;
  }

  return true;
};

  const handleLogin = async () => {
    setError("");

    if (!validateLoginForm()) return;

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
      } else if (data.user.role === "empleado") {
        router.push("/admin/rfid");
      } else if (data.user.role === "cliente") {
        router.push("/");
      }  else {
        router.push("/");
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Error al iniciar sesión");
      }

      // 👇 Lógica de intento fallido
      const newAttempts = loginAttempts + 1;
      setLoginAttempts(newAttempts);

      if (newAttempts >= 3) {
        const lockUntil = Date.now() + 30000;
        localStorage.setItem("loginCooldown", lockUntil.toString());
        setLoginAttempts(0);

        const secondsRemaining = Math.ceil((lockUntil - Date.now()) / 1000);
        setCooldown(secondsRemaining);

        toast.warning("Demasiados intentos fallidos. Espera 30 segundos para volver a intentar.", {
          duration: 5000,
        });

        const interval = setInterval(() => {
          const newRemaining = Math.ceil((lockUntil - Date.now()) / 1000);
          if (newRemaining <= 0) {
            clearInterval(interval);
            localStorage.removeItem("loginCooldown");
            setCooldown(0);
          } else {
            setCooldown(newRemaining);
          }
        }, 1000);
      }
    }
  };

  useEffect(() => {
    const storedCooldown = parseInt(localStorage.getItem("loginCooldown") || "0");
    const now = Date.now();

    if (storedCooldown > now) {
      const secondsRemaining = Math.ceil((storedCooldown - now) / 1000);
      setCooldown(secondsRemaining);

      const interval = setInterval(() => {
        const newRemaining = Math.ceil((storedCooldown - Date.now()) / 1000);
        if (newRemaining <= 0) {
          clearInterval(interval);
          localStorage.removeItem("loginCooldown");
          setCooldown(0);
          setLoginAttempts(0);
        } else {
          setCooldown(newRemaining);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, []);

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
          maxLength={35}
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

        <div className="flex items-center justify-between text-sm mb-4">
          <div
            className="text-blue-600 underline cursor-pointer hover:text-blue-800 transition"
            onClick={() => router.push("/auth/register")}
          >
            ¿No tienes una cuenta? Regístrate
          </div>
          <div className="relative group ml-2">
            <span className="text-muted-foreground cursor-default select-none text-xs border border-muted rounded-full px-2 py-0.5 hover:bg-muted">
              ?
            </span>
            <div className="absolute left-1/2 transform -translate-x-1/2 mt-2 w-64 text-xs text-center bg-black text-white px-3 py-2 rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-50">
              ¿Olvidaste tu contraseña? Contáctate con el administrador de tu preferencia para cambiarla.
            </div>
          </div>
        </div>

        <Button
          className="w-full"
          onClick={handleLogin}
          disabled={cooldown > 0}
        >
          {cooldown > 0 ? `Espera ${cooldown}s...` : "Continuar"}
        </Button>

        {error && (
          <p className="text-red-500 text-sm mt-2 text-center">{error}</p>
        )}
      </div>
    </main>
  );
}
