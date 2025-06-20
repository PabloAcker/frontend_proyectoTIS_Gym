"use client";

import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Pencil, QrCode, Plus } from "lucide-react";
import { getMemberships } from "@/lib/api";
import { Membership } from "@/interfaces/Membership";
import { MembershipEditModal } from "@/components/MembershipEditModal";
import { MembershipCreateModal } from "@/components/MembershipCreateModal";
import { QrUploadModal } from "@/components/QrUploadModal";
import { AdminTopNav } from "@/components/AdminTopNav";

export default function AdminMembershipsPage() {
  const { user, loading } = useAuth(["admin", "empleado"]);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [filteredMemberships, setFilteredMemberships] = useState<Membership[]>([]);
  const [search, setSearch] = useState("");

  const [selectedMembership, setSelectedMembership] = useState<Membership | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  const fetchMemberships = async () => {
    try {
      const data = await getMemberships();
      setMemberships(data);
      setFilteredMemberships(data);
    } catch (err) {
      console.error("Error al obtener membresías", err);
    }
  };

  useEffect(() => {
    if (!loading && user?.role === "admin") fetchMemberships();
  }, [loading, user]);

  useEffect(() => {
    const lower = search.toLowerCase();
    setFilteredMemberships(
      memberships.filter(
        (m) =>
          m.name.toLowerCase().includes(lower) ||
          m.description.toLowerCase().includes(lower) ||
          m.duration.toLowerCase().includes(lower)
      )
    );
  }, [search, memberships]);

  if (loading) return <p className="p-6">Verificando acceso...</p>;
  if (user?.role !== "admin") return <p className="p-6 text-destructive">Acceso no autorizado.</p>;

  return (
    <main className="p-6 min-h-screen bg-background text-foreground">
      {/* Nav superior y título */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">Gestión de Membresías</h1>
        <AdminTopNav />
      </div>

      {/* Filtro y botón de acción en la misma fila */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
        <Input
          type="text"
          placeholder="Filtrar por nombre, duración o descripción"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-md"
        />

        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="mr-2 w-4 h-4" />
          Agregar nueva
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300 text-sm">
          <thead className="bg-grayLight text-left">
            <tr>
              <th className="p-2 border">Nombre</th>
              <th className="p-2 border">Duración</th>
              <th className="p-2 border">Descripción</th>
              <th className="p-2 border">Precio</th>
              <th className="p-2 border">Editar</th>
              <th className="p-2 border">QR</th>
            </tr>
          </thead>
          <tbody>
            {filteredMemberships.map((m) => (
              <tr key={m.id} className="border-t">
                <td className="p-2 border">{m.name}</td>
                <td className="p-2 border">{m.duration}</td>
                <td className="p-2 border">{m.description}</td>
                <td className="p-2 border">{m.price} Bs</td>
                <td className="p-2 border">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setSelectedMembership(m);
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
                      setSelectedMembership(m);
                      setIsQrModalOpen(true);
                    }}
                  >
                    <QrCode className="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL DE EDICIÓN */}
      <MembershipEditModal
        membership={selectedMembership}
        open={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={async () => {
          await fetchMemberships();
          setSelectedMembership(null);
          setIsEditModalOpen(false);
        }}
      />

      {/* MODAL DE CREACIÓN */}
      <MembershipCreateModal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={async () => {
          await fetchMemberships();
          setIsCreateModalOpen(false);
        }}
      />

      {/* MODAL DE QR */}
      {typeof selectedMembership?.id === "number" && (
        <QrUploadModal
          open={isQrModalOpen}
          onClose={() => setIsQrModalOpen(false)}
        />
      )}
    </main>
  );
}
