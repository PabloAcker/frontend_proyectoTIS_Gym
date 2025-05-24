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
} from "@/components/ui/dialog";
import {
  Home,
  Users,
  Layers,
  ShieldUser,
  Pencil,
  X,
  ReceiptText,
} from "lucide-react";
import { toast } from "sonner";
import { UnauthorizedDialog } from "@/components/UnauthorizedDialog";

type EditableField = "name" | "lastname" | "email";

export default function AdminProfilePage() {
  const router = useRouter();
  const { user, loading, unauthorized } = useAuth(["admin", "empleado"]);

  const [form, setForm] = useState<Record<EditableField, string>>({
    name: "",
    lastname: "",
    email: "",
  });

  const [originalForm, setOriginalForm] = useState<typeof form | null>(null);
  const [editingField, setEditingField] = useState<EditableField | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [logoutDialog, setLogoutDialog] = useState(false);

  useEffect(() => {
    if (!user) return;

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${user.id}`)
      .then((res) => res.json())
      .then((data) => {
        setForm({
          name: data.name || "",
          lastname: data.lastname || "",
          email: data.email || "",
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
    setOriginalForm({ ...form });
    setEditingField(key);
  };

  const handleCancelEdit = () => {
    if (originalForm) {
      setForm(originalForm);
    }
    setEditingField(null);
    setOriginalForm(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setLogoutDialog(true);
    setTimeout(() => {
      router.push("/");
    }, 2000);
  };

  if (unauthorized) return <UnauthorizedDialog />;
  if (loading) return <p className="p-6">Verificando acceso...</p>;

  const fields: { label: string; key: EditableField }[] = [
    { label: "Nombre", key: "name" },
    { label: "Apellidos", key: "lastname" },
    { label: "Correo Electrónico", key: "email" },
  ];

  return (
    <main className="p-6 min-h-screen bg-background text-foreground">
      {/* Menú superior */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Perfil</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push("/admin")}>
            <Home className="mr-2 w-4 h-4" /> Panel
          </Button>
          <Button variant="outline" onClick={() => router.push("/admin/clients")}>
            <Users className="mr-2 w-4 h-4" /> Clientes
          </Button>
          {user?.role === "admin" && (
            <Button variant="outline" onClick={() => router.push("/admin/employees")}>
              <ShieldUser className="mr-2 w-4 h-4" /> Empleados
            </Button>
          )}
          <Button variant="outline" onClick={() => router.push("/admin/memberships")}>
            <Layers className="mr-2 w-4 h-4" /> Membresías
          </Button>
          <Button variant="outline" onClick={() => router.push("/admin/subscriptions")}>
            <ReceiptText className="mr-2 w-4 h-4" /> Suscripciones
          </Button>
        </div>
      </div>

      <div className="max-w-3xl space-y-4">
        <p className="text-sm text-muted-foreground">
          La información que aparece aquí es pública, ten cuidado con lo que compartes.
        </p>

        {fields.map(({ label, key }) => (
          <div key={key} className="flex items-center gap-4">
            <span className="w-40 font-medium text-right">{label}:</span>
            <Input
              name={key}
              value={form[key]}
              onChange={handleChange}
              disabled={editingField !== key}
              className="flex-1"
            />
            {editingField === key ? (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="bg-primary text-white hover:bg-primary/90 hover:text-black"
                  onClick={() => handleUpdate(key)}
                >
                  Guardar
                </Button>
                <Button
                  variant="ghost"
                  className="text-red-500 hover:text-red-700"
                  onClick={handleCancelEdit}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                className="hover:bg-primary hover:text-white"
                onClick={() => handleEdit(key)}
              >
                <Pencil className="w-4 h-4 mr-1" /> Editar
              </Button>
            )}
          </div>
        ))}

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
          <p className="text-muted-foreground">
            Serás redirigido al inicio en unos instantes.
          </p>
        </DialogContent>
      </Dialog>
    </main>
  );
}
