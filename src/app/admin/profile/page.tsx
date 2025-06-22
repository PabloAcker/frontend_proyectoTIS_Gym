"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Pencil, X, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { UnauthorizedDialog } from "@/components/UnauthorizedDialog";
import { AdminTopNav } from "@/components/AdminTopNav";

type EditableField = "name" | "lastname" | "password";

export default function AdminProfilePage() {
  const router = useRouter();
  const { user, loading, unauthorized } = useAuth(["admin", "empleado"]);

  const [form, setForm] = useState<Record<EditableField | "email", string>>({
    name: "",
    lastname: "",
    email: "",
    password: "",
  });

  const [originalForm, setOriginalForm] = useState<typeof form | null>(null);
  const [editingField, setEditingField] = useState<EditableField | null>(null);
  const [showWarningModal, setShowWarningModal] = useState<EditableField | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [logoutDialog, setLogoutDialog] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    if (!user) return;

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${user.id}`)
      .then((res) => res.json())
      .then((data) => {
        setForm({
          name: data.name || "",
          lastname: data.lastname || "",
          email: data.email || "",
          password: "",
        });
      })
      .catch(() => toast.error("Error al cargar datos del usuario"));
  }, [user]);

  const handleUpdate = async (field: EditableField) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${user?.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: form[field] }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al actualizar");
      }

      setEditingField(null);
      setOriginalForm(null);
      setForm((prev) => ({ ...prev, password: "" }));
      setShowPassword(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2500);
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEdit = (key: EditableField) => {
    if (key === "name" || key === "lastname") {
      setShowWarningModal(key);
    } else {
      setOriginalForm({ ...form });
      setEditingField(key);
    }
  };

  const confirmEdit = () => {
    if (showWarningModal) {
      setOriginalForm({ ...form });
      setEditingField(showWarningModal);
      setShowWarningModal(null);
    }
  };

  const handleCancelEdit = () => {
    if (originalForm) {
      setForm(originalForm);
    }
    setEditingField(null);
    setOriginalForm(null);
    setShowPassword(false);
  };

  const handleLogout = () => {
    setIsLoggingOut(true);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setLogoutDialog(true);
    setTimeout(() => {
      router.push("/");
    }, 2000);
  };

  if (unauthorized && !isLoggingOut) return <UnauthorizedDialog />;
  if (loading) return <p className="p-6">Verificando acceso...</p>;

  return (
    <main className="p-6 min-h-screen bg-background text-foreground">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Perfil</h1>
        <div className="flex gap-2">
          <AdminTopNav />
        </div>
      </div>

      <div className="max-w-3xl space-y-4">
        <p className="text-sm text-muted-foreground mb-6">
          La información que aparece aquí es pública, ten cuidado con lo que compartes.
        </p>

        {["name", "lastname"].map((key) => (
          <div key={key} className="flex items-center gap-4">
            <span className="w-40 font-medium text-right">
              {key === "name" ? "Nombre:" : "Apellidos:"}
            </span>
            <Input
              name={key}
              value={form[key as EditableField]}
              onChange={(e) => {
                if (e.target.value.length <= 25) {
                  handleChange(e);
                }
              }}
              disabled={editingField !== key}
              className="flex-1"
            />
            {editingField === key ? (
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => handleUpdate(key as EditableField)}>
                  Guardar
                </Button>
                <Button
                  variant="ghost"
                  onClick={handleCancelEdit}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Button variant="outline" onClick={() => handleEdit(key as EditableField)}>
                <Pencil className="w-4 h-4 mr-1" /> Editar
              </Button>
            )}
          </div>
        ))}

        {/* Correo solo lectura */}
        <div className="flex items-center gap-4">
          <span className="w-40 font-medium text-right">Correo Electrónico:</span>
          <Input
            name="email"
            value={form.email}
            disabled
            className="flex-1 text-muted-foreground"
          />
        </div>

        {/* Contraseña */}
        <div className="flex items-center gap-4">
          <span className="w-40 font-medium text-right">Nueva Contraseña:</span>
          <div className="relative flex-1">
            <Input
              name="password"
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={(e) => {
                if (e.target.value.length <= 30) {
                  handleChange(e);
                }
              }}
              disabled={editingField !== "password"}
              placeholder="••••••••"
            />
            {editingField === "password" && (
              <button
                type="button"
                className="absolute right-2 top-2.5 text-muted-foreground"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            )}
          </div>
          {editingField === "password" ? (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => handleUpdate("password")}>
                Guardar
              </Button>
              <Button
                variant="ghost"
                onClick={handleCancelEdit}
                className="text-red-500 hover:text-red-700"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <Button variant="outline" onClick={() => handleEdit("password")}>
              <Pencil className="w-4 h-4 mr-1" /> Editar
            </Button>
          )}
        </div>

        <Button variant="destructive" className="mt-6" onClick={handleLogout}>
          Cerrar sesión
        </Button>
      </div>

      {/* Diálogo de éxito */}
      <Dialog open={showSuccess} onOpenChange={() => {}}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Perfil actualizado correctamente</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      {/* Diálogo de cierre de sesión */}
      <Dialog open={logoutDialog} onOpenChange={() => {}}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cerrando sesión...</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">Serás redirigido al inicio en unos instantes.</p>
        </DialogContent>
      </Dialog>

      {/* Modal advertencia edición nombre/apellido */}
      <Dialog open={!!showWarningModal} onOpenChange={() => setShowWarningModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Advertencia</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
            Solo puedes modificar tu nombre o apellido una vez cada 30 días. ¿Deseas continuar?
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowWarningModal(null)}>
              Cancelar
            </Button>
            <Button onClick={confirmEdit}>Continuar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
