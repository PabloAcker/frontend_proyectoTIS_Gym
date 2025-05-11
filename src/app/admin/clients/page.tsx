"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, BadgeInfo, Home, Layers, Plus } from "lucide-react";
import { ClientEditModal } from "@/components/ClientEditModal";
import { ClientCreateModal } from "@/components/ClientCreateModal";
import { ClientSubscriptionModal } from "@/components/ClientSubscriptionModal";

interface Client {
  id: number;
  ci: string;
  name: string;
  lastname: string;
  email: string;
  birthdate: string;
}

export default function AdminClientsPage() {
  const { loading } = useAuth("admin");
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [search, setSearch] = useState("");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const router = useRouter();

  const fetchClients = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/clients`);
      const data = await res.json();
      setClients(data);
      setFilteredClients(data);
    } catch (error) {
      console.error("Error al cargar clientes:", error);
    }
  };

  useEffect(() => {
    if (!loading) fetchClients();
  }, [loading]);

  useEffect(() => {
    const lower = search.toLowerCase();
    setFilteredClients(
      clients
        .filter((c) => c && c.name && c.lastname && c.email)
        .filter(
          (c) =>
            c.name.toLowerCase().includes(lower) ||
            c.lastname.toLowerCase().includes(lower) ||
            c.email.toLowerCase().includes(lower)
        )
    );
  }, [search, clients]);

  if (loading) return <p className="p-6">Verificando acceso...</p>;

  return (
    <main className="p-6 bg-background text-foreground min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gestión de Clientes</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push("/admin")}>
            <Home className="mr-2 w-4 h-4" />
            Panel
          </Button>
          <Button variant="outline" onClick={() => router.push("/admin/memberships")}>
            <Layers className="mr-2 w-4 h-4" />
            Membresías
          </Button>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="mr-2 w-4 h-4" />
            Crear Cliente
          </Button>
        </div>
      </div>

      <div className="mb-4">
        <Input
          type="text"
          placeholder="Filtrar por nombre, apellido o correo"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-md"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300 text-sm">
          <thead className="bg-grayLight text-left">
            <tr>
              <th className="p-2 border">CI</th>
              <th className="p-2 border">Nombre</th>
              <th className="p-2 border">Apellido</th>
              <th className="p-2 border">Nacimiento</th>
              <th className="p-2 border">Correo</th>
              <th className="p-2 border">Editar</th>
              <th className="p-2 border">Estado de Suscripción</th>
            </tr>
          </thead>
          <tbody>
            {filteredClients.map((c) => (
              <tr key={c.id} className="border-t">
                <td className="p-2 border">{c.ci}</td>
                <td className="p-2 border">{c.name}</td>
                <td className="p-2 border">{c.lastname}</td>
                <td className="p-2 border">{new Date(c.birthdate).toLocaleDateString()}</td>
                <td className="p-2 border">{c.email}</td>
                <td className="p-2 border">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setSelectedClient(c);
                      setIsEditModalOpen(true);
                    }}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                </td>
                <td className="p-2 border">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setSelectedUserId(c.id);
                      setIsSubscriptionModalOpen(true);
                    }}
                  >
                    <BadgeInfo className="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ClientEditModal
        client={selectedClient}
        open={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={async () => {
          await fetchClients();
          setSelectedClient(null);
          setIsEditModalOpen(false);
        }}
      />

      <ClientCreateModal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={async () => {
          await fetchClients();
          setIsCreateModalOpen(false);
        }}
      />

      {selectedUserId !== null && (
        <ClientSubscriptionModal
          userId={selectedUserId}
          open={isSubscriptionModalOpen}
          onClose={() => {
            setSelectedUserId(null);
            setIsSubscriptionModalOpen(false);
          }}
        />
      )}
    </main>
  );
}
