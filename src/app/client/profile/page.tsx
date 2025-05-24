"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { ClientSidebar } from "@/components/ClientSidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Pencil, X } from "lucide-react";
import { ClientProfile } from "@/interfaces/Client-profile";

type EditableField = "name" | "lastname" | "email" | "ci" | "birthdate";

export default function ClientProfilePage() {
  const router = useRouter();
  const { user, loading } = useAuth(["cliente"]);

  const [form, setForm] = useState<Record<EditableField, string>>({
    name: "",
    lastname: "",
    email: "",
    ci: "",
    birthdate: "",
  });

  const [originalForm, setOriginalForm] = useState<typeof form | null>(null);
  const [editingField, setEditingField] = useState<EditableField | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [logoutDialog, setLogoutDialog] = useState(false);
  const [clientId, setClientId] = useState<number | null>(null);

  useEffect(() => {
    if (!user) return;

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/clients`)
      .then(res => res.json())
      .then((clients: ClientProfile[]) => {
        const clientData = clients.find(c => c.user_id === user.id);
        if (clientData) {
          setForm({
            name: clientData.name,
            lastname: clientData.lastname,
            email: clientData.email,
            ci: clientData.ci,
            birthdate: clientData.birthdate?.slice(0, 10) || "",
          });
          setClientId(clientData.id);
        } else {
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${user.id}`)
            .then(res => res.json())
            .then(data => {
              setForm(prev => ({
                ...prev,
                name: data.name || "",
                lastname: data.lastname || "",
                email: data.email || "",
                ci: "",
                birthdate: "",
              }));
            })
            .catch(() => toast.error("Error al cargar datos del usuario"));
        }
      })
      .catch(() => toast.error("Error al cargar información del cliente"));
  }, [user]);

  const handleUpdate = async (field: EditableField) => {
    try {
      const endpoint = clientId
        ? `${process.env.NEXT_PUBLIC_API_URL}/clients/${clientId}`
        : `${process.env.NEXT_PUBLIC_API_URL}/users/${user?.id}`;

      const res = await fetch(endpoint, {
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
    setForm(prev => ({ ...prev, [name]: value }));
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

  if (loading) return <p className="p-6">Cargando...</p>;

  if (!user) {
    return (
      <main className="flex flex-col sm:flex-row min-h-screen bg-background text-foreground p-6 gap-6">
        <ClientSidebar />
        <div className="flex-1">
          <h1 className="text-2xl font-bold mb-4">Perfil</h1>
          <p className="text-muted-foreground">Crea una cuenta para ingresar a este apartado.</p>
          <Button className="mt-4" onClick={() => router.push("/auth/register")}>
            Crear cuenta
          </Button>
        </div>
      </main>
    );
  }

  const fields: { label: string; key: EditableField; type?: string }[] =
    clientId !== null
      ? [
          { label: "Nombre", key: "name" },
          { label: "Apellidos", key: "lastname" },
          { label: "Correo Electrónico", key: "email" },
          { label: "CI", key: "ci" },
          { label: "Fecha de nacimiento", key: "birthdate", type: "date" },
        ]
      : [
          { label: "Nombre", key: "name" },
          { label: "Apellidos", key: "lastname" },
          { label: "Correo Electrónico", key: "email" },
        ];

  return (
    <main className="flex flex-col sm:flex-row min-h-screen bg-background text-foreground p-6 gap-6">
      <ClientSidebar />

      <div className="flex-1 max-w-2xl">
        <h1 className="text-2xl font-bold mb-2">Perfil</h1>
        <p className="text-sm text-muted-foreground mb-6">
          La información que aparece aquí es pública, ten cuidado con lo que compartes.
        </p>

        <div className="space-y-4">
          {fields.map(({ label, key, type }) => (
            <div key={key} className="flex items-center gap-4">
              <span className="w-40 font-medium text-right">{label}:</span>
              <Input
                name={key}
                type={type || "text"}
                value={form[key]}
                onChange={handleChange}
                disabled={editingField !== key}
                className="flex-1"
              />
              {editingField === key ? (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="mt-0 bg-primary text-white hover:bg-primary/90 hover:text-black transition-colors"
                    onClick={() => handleUpdate(key)}
                  >
                    Guardar
                  </Button>
                  <Button
                    variant="ghost"
                    className="mt-0 text-red-500 hover:text-red-700"
                    onClick={handleCancelEdit}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  className="mt-0 hover:bg-primary hover:text-white transition-colors"
                  onClick={() => handleEdit(key)}
                >
                  <Pencil className="w-4 h-4 mr-1" /> Editar
                </Button>
              )}
            </div>
          ))}
        </div>

        <Button variant="destructive" className="mt-6" onClick={handleLogout}>
          Cerrar sesión
        </Button>
      </div>

      <Dialog open={showSuccess} onOpenChange={() => {}}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Perfil actualizado correctamente</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>

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
