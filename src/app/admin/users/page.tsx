"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, Plus } from "lucide-react";
import { AdminTopNav } from "@/components/AdminTopNav";
import { UserEditModal } from "@/components/UserEditModal";
import { UserCreateModal } from "@/components/UserCreateModal";
import { Pagination } from "@/components/Pagination"; // nuevo componente

interface User {
  id: number;
  name: string;
  lastname: string;
  email: string;
  role: string;
  created_at?: string;
  updated_at?: string;
}

export default function AdminUsersPage() {
  const { loading } = useAuth(["admin", "empleado"]);
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`);
      const data = await res.json();
      setUsers(data);
      setFilteredUsers(data);
    } catch (error) {
      console.error("Error al cargar usuarios:", error);
    }
  };

  useEffect(() => {
    if (!loading) fetchUsers();
  }, [loading]);

  useEffect(() => {
    const lower = search.toLowerCase();
    const filtered = users
      .filter((u) => u.name && u.lastname && u.email)
      .filter(
        (u) =>
          u.name.toLowerCase().includes(lower) ||
          u.lastname.toLowerCase().includes(lower) ||
          u.email.toLowerCase().includes(lower)
      );
    setFilteredUsers(filtered);
    setCurrentPage(1); // Reiniciar a la primera página si hay cambio en búsqueda
  }, [search, users]);

  if (loading) return <p className="p-6">Verificando acceso...</p>;

  return (
    <main className="p-6 bg-background text-foreground min-h-screen">
      {/* Nav superior y título */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gestión de Usuarios</h1>
        <AdminTopNav />
      </div>

      {/* Filtro y botón de acción */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
        <Input
          type="text"
          placeholder="Filtrar por nombre, apellido o correo"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-md"
        />

        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="mr-2 w-4 h-4" />
          Crear Usuario
        </Button>
      </div>

      {/* Tabla de usuarios */}
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300 text-sm">
          <thead className="bg-grayLight text-left">
            <tr>
              <th className="p-2 border">Nombre</th>
              <th className="p-2 border">Apellido</th>
              <th className="p-2 border">Correo</th>
              <th className="p-2 border">Editar</th>
            </tr>
          </thead>
          <tbody>
            {paginatedUsers.map((u) => (
              <tr key={u.id} className="border-t">
                <td className="p-2 border">{u.name}</td>
                <td className="p-2 border">{u.lastname}</td>
                <td className="p-2 border">{u.email}</td>
                <td className="p-2 border">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setSelectedUser(u);
                      setIsEditModalOpen(true);
                    }}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}

      {/* Modales */}
      <UserEditModal
        user={selectedUser}
        open={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={async () => {
          await fetchUsers();
          setSelectedUser(null);
          setIsEditModalOpen(false);
        }}
      />

      <UserCreateModal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={async () => {
          await fetchUsers();
          setIsCreateModalOpen(false);
        }}
      />
    </main>
  );
}
