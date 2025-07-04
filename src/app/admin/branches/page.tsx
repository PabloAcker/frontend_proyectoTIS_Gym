"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, Eye, Trash2, Plus, ImagePlus } from "lucide-react";
import { AdminTopNav } from "@/components/AdminTopNav";
import { BranchEditModal } from "@/components/BranchEditModal";
import { BranchCreateModal } from "@/components/BranchCreateModal";
import { BranchViewModal } from "@/components/BranchViewModal";
import { BranchImageModal } from "@/components/BranchImageModal";
import { Pagination } from "@/components/Pagination";
import { UnauthorizedDialog } from "@/components/UnauthorizedDialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

interface Branch {
  id: number;
  name: string;
  address: string;
  services: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export default function AdminBranchesPage() {
  const { loading, user: currentUser, unauthorized } = useAuth(["admin", "empleado"]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [filteredBranches, setFilteredBranches] = useState<Branch[]>([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [branchToDelete, setBranchToDelete] = useState<Branch | null>(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const [selectedBranchIdForImage, setSelectedBranchIdForImage] = useState<number | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  const fetchBranches = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/branches`);
      const data = await res.json();
      setBranches(data);
      setFilteredBranches(data);
    } catch (error) {
      console.error("Error al cargar sucursales:", error);
    }
  };

  useEffect(() => {
    if (!loading) fetchBranches();
  }, [loading]);

  useEffect(() => {
    const lower = search.toLowerCase();
    setFilteredBranches(
      branches.filter(
        (b) =>
          b.name.toLowerCase().includes(lower) ||
          b.address.toLowerCase().includes(lower)
      )
    );
  }, [search, branches]);

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentBranches = filteredBranches.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredBranches.length / itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const handleDeleteConfirmed = async () => {
    if (!branchToDelete) return;

    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/branches/${branchToDelete.id}`, {
        method: "DELETE",
      });
      setBranchToDelete(null);
      fetchBranches();
    } catch (error) {
      console.error("Error al eliminar sucursal:", error);
    }
  };

  if (loading) return <p className="p-6">Verificando acceso...</p>;
  if (unauthorized) return <UnauthorizedDialog />;

  return (
    <main className="p-6 bg-background text-foreground min-h-screen">
      {/* Nav superior y título */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">Gestión de Sucursales</h1>
        <AdminTopNav />
      </div>

      {/* Filtro y botón de acción en la misma fila */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
        <Input
          type="text"
          placeholder="Filtrar por nombre o dirección"
          value={search}
          onChange={(e) => {
            const value = e.target.value;
            if (/^[\w@\.\s\-áéíóúÁÉÍÓÚñÑ]*$/.test(value) && value.length <= 50) {
              setSearch(value);
            }
          }}
          className="max-w-md"
        />

        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="mr-2 w-4 h-4" />
          Crear Sucursal
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300 text-sm">
          <thead className="bg-grayLight text-left">
            <tr>
              <th className="p-2 border">Nombre</th>
              <th className="p-2 border">Dirección</th>
              <th className="p-2 border">Servicios</th>
              <th className="p-2 border">Editar</th>
              {currentUser?.role === "admin" && (
                <th className="p-2 border">Eliminar</th>
              )}
              <th className="p-2 border">Ver más</th>
              <th className="p-2 border">Imagen de referencia</th>
            </tr>
          </thead>
          <tbody>
            {currentBranches.map((b) => (
              <tr key={b.id} className="border-t">
                <td className="p-2 border">{b.name}</td>
                <td className="p-2 border">{b.address}</td>
                <td className="p-2 border">{b.services}</td>
                <td className="p-2 border">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setSelectedBranch(b);
                      setIsEditModalOpen(true);
                    }}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                </td>
                {currentUser?.role === "admin" && (
                  <td className="p-2 border">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setBranchToDelete(b)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </td>
                )}
                <td className="p-2 border">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setSelectedBranch(b);
                      setIsViewModalOpen(true);
                    }}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                </td>
                <td className="p-2 border">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setSelectedBranchIdForImage(b.id);
                      setIsImageModalOpen(true);
                    }}
                  >
                    <ImagePlus className="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
        )}
      </div>

      <BranchEditModal
        branch={selectedBranch}
        open={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={async () => {
          await fetchBranches();
          setSelectedBranch(null);
          setIsEditModalOpen(false);
        }}
      />

      <BranchCreateModal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={async () => {
          await fetchBranches();
          setIsCreateModalOpen(false);
        }}
      />

      <BranchViewModal
        branch={selectedBranch}
        open={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedBranch(null);
        }}
      />

      <BranchImageModal
        open={isImageModalOpen}
        onClose={() => {
          setIsImageModalOpen(false);
          setSelectedBranchIdForImage(null);
          fetchBranches();
        }}
        branchId={selectedBranchIdForImage}
      />

      {currentUser?.role === "admin" && (
        <AlertDialog open={!!branchToDelete} onOpenChange={() => setBranchToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Estás seguro de eliminar esta sucursal?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. Se eliminarán todos los datos asociados a{" "}
                <strong>{branchToDelete?.name}</strong>.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive hover:bg-destructive/90"
                onClick={handleDeleteConfirmed}
              >
                Eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </main>
  );
}
