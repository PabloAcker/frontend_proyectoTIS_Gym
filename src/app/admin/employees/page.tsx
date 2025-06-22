"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Pencil, Plus } from "lucide-react";
import { EmployeeEditModal } from "@/components/EmployeeEditModal";
import { EmployeeCreateModal } from "@/components/EmployeeCreateModal";
import { AdminTopNav } from "@/components/AdminTopNav";
import { Pagination } from "@/components/Pagination"; // Importar el componente de paginación

interface Employee {
  id: number;
  name: string;
  lastname: string;
  email: string;
  role: "admin" | "empleado";
}

export default function AdminEmployeesPage() {
  const { loading } = useAuth(["admin"]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filtered, setFiltered] = useState<Employee[]>([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Employee | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedEmployees = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const fetchEmployees = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/employees`);
      const data = await res.json();
      setEmployees(data);
      setFiltered(data);
    } catch (error) {
      console.error("Error al cargar empleados:", error);
    }
  };

  useEffect(() => {
    if (!loading) fetchEmployees();
  }, [loading]);

  useEffect(() => {
    const lower = search.toLowerCase();
    const filteredList = employees.filter(
      (e) =>
        e.name.toLowerCase().includes(lower) ||
        e.lastname.toLowerCase().includes(lower) ||
        e.email.toLowerCase().includes(lower)
    );
    setFiltered(filteredList);
    setCurrentPage(1); // Resetear a la primera página al filtrar
  }, [search, employees]);

  if (loading) return <p className="p-6">Verificando acceso...</p>;

  return (
    <main className="p-6 bg-background text-foreground min-h-screen">
      {/* Nav superior y título */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">Gestión de Empleados</h1>
        <AdminTopNav />
      </div>

      {/* Filtro y botón */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
        <Input
          type="text"
          placeholder="Filtrar por nombre, apellido o correo"
          value={search}
          onChange={(e) => {
            const value = e.target.value;
            if (/^[\w@\.\s\-áéíóúÁÉÍÓÚñÑ]*$/.test(value) && value.length <= 50) {
              setSearch(value);
            }
          }}
          className="max-w-md"
        />

        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 w-4 h-4" />
          Crear Empleado
        </Button>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300 text-sm">
          <thead className="bg-grayLight text-left">
            <tr>
              <th className="p-2 border">Nombre</th>
              <th className="p-2 border">Apellido</th>
              <th className="p-2 border">Correo</th>
              <th className="p-2 border">Rol</th>
              <th className="p-2 border">Editar</th>
            </tr>
          </thead>
          <tbody>
            {paginatedEmployees.map((e) => (
              <tr key={e.id} className="border-t">
                <td className="p-2 border">{e.name}</td>
                <td className="p-2 border">{e.lastname}</td>
                <td className="p-2 border">{e.email}</td>
                <td className="p-2 border capitalize">{e.role}</td>
                <td className="p-2 border">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setSelected(e);
                      setEditOpen(true);
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
      <EmployeeEditModal
        employee={selected}
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSave={async () => {
          await fetchEmployees();
          setEditOpen(false);
        }}
      />

      <EmployeeCreateModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSave={async () => {
          await fetchEmployees();
          setCreateOpen(false);
        }}
      />
    </main>
  );
}
