"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { UnauthorizedDialog } from "@/components/UnauthorizedDialog";
import { AdminTopNav } from "@/components/AdminTopNav";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Plus } from "lucide-react";
import { RfidScannerModal } from "@/components/RfidScannerModal";
import { Pagination } from "@/components/Pagination";
import type { DateRange } from "react-day-picker";

interface RfidLog {
  id: number;
  entry_date: string | null;
  exit_date: string | null;
  rfid_access: {
    rfid_code: string;
  };
  subscription: {
    membership: {
      name: string;
    };
    user: {
      name: string;
      lastname: string;
      client?: {
        ci: string;
      };
    };
  };
}

export default function AdminRFIDLogsPage() {
  const { loading, unauthorized } = useAuth(["admin", "empleado"]);
  const [logs, setLogs] = useState<RfidLog[]>([]);
  const [filtered, setFiltered] = useState<RfidLog[]>([]);
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [scannerOpen, setScannerOpen] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchLogs = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/rfid-logs`);
      const data = await res.json();
      if (!Array.isArray(data)) {
        console.error("Respuesta inesperada:", data);
        return;
      }
      setLogs(data);
      setFiltered(data);
    } catch (error) {
      console.error("Error al obtener logs RFID:", error);
    }
  };

  useEffect(() => {
    if (!loading) fetchLogs();
  }, [loading]);

  useEffect(() => {
    const term = search.toLowerCase();
    const from = dateRange?.from;
    const to = dateRange?.to;

    const filteredResults = logs.filter((log) => {
      const name = log.subscription.user.name.toLowerCase();
      const lastname = log.subscription.user.lastname.toLowerCase();
      const ci = log.subscription.user.client?.ci?.toLowerCase() ?? "";
      const entry = log.entry_date ? new Date(log.entry_date) : null;

      const matchesText =
        name.includes(term) || lastname.includes(term) || ci.includes(term);

      const matchesDate =
        !from || !entry
          ? true
          : from && to
          ? entry >= from && entry <= to
          : entry >= from;

      return matchesText && matchesDate;
    });

    setFiltered(filteredResults);
    setCurrentPage(1);
  }, [search, logs, dateRange]);

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentLogs = filtered.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  if (unauthorized) return <UnauthorizedDialog />;
  if (loading) return <p className="p-6">Verificando acceso...</p>;

  return (
    <main className="p-6 min-h-screen bg-background text-foreground">
      {/* Encabezado */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gestión de Accesos RFID</h1>
        <AdminTopNav />
      </div>

      {/* Filtros y botón */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-6 gap-4 w-full">
          <Input
            placeholder="Buscar por nombre, apellido o CI"
            value={search}
            onChange={(e) => {
            const value = e.target.value;
            if (/^[\w@\.\s\-áéíóúÁÉÍÓÚñÑ]*$/.test(value) && value.length <= 50) {
              setSearch(value);
            }
          }}
            className="max-w-md"
          />

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="text-left font-normal w-full sm:w-auto">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    `${format(dateRange.from, "dd/MM/yyyy")} - ${format(dateRange.to, "dd/MM/yyyy")}`
                  ) : (
                    format(dateRange.from, "dd/MM/yyyy")
                  )
                ) : (
                  "Filtrar por rango de fechas"
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="range"
                selected={dateRange}
                onSelect={(range) => setDateRange(range)}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Botón registrar acceso */}
        <Button onClick={() => setScannerOpen(true)} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Registrar Acceso RFID
        </Button>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm border border-gray-300">
          <thead className="bg-grayLight text-left">
            <tr>
              <th className="p-2 border">ID</th>
              <th className="p-2 border">Código RFID</th>
              <th className="p-2 border">Plan</th>
              <th className="p-2 border">Nombre</th>
              <th className="p-2 border">Apellido</th>
              <th className="p-2 border">CI</th>
              <th className="p-2 border">Entrada</th>
              <th className="p-2 border">Salida</th>
            </tr>
          </thead>
          <tbody>
            {currentLogs.map((log) => (
              <tr key={log.id} className="border-t">
                <td className="p-2 border">{log.id}</td>
                <td className="p-2 border">{log.rfid_access.rfid_code}</td>
                <td className="p-2 border">{log.subscription.membership.name}</td>
                <td className="p-2 border">{log.subscription.user.name}</td>
                <td className="p-2 border">{log.subscription.user.lastname}</td>
                <td className="p-2 border">{log.subscription.user.client?.ci ?? "—"}</td>
                <td className="p-2 border">
                  {log.entry_date ? new Date(log.entry_date).toLocaleString() : "—"}
                </td>
                <td className="p-2 border">
                  {log.exit_date ? new Date(log.exit_date).toLocaleString() : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Paginación solo si hay más de una página */}
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </div>

      {/* Modal para escaneo RFID */}
      <RfidScannerModal
        open={scannerOpen}
        onClose={() => {
          setScannerOpen(false);
          fetchLogs(); // Refrescar datos después de escaneo
        }}
      />
    </main>
  );
}
