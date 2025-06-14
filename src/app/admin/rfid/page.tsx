"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { UnauthorizedDialog } from "@/components/UnauthorizedDialog";
import { AdminTopNav } from "@/components/AdminTopNav";
import { Input } from "@/components/ui/input";

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
    const filteredResults = logs.filter((log) => {
      const name = log.subscription.user.name.toLowerCase();
      const lastname = log.subscription.user.lastname.toLowerCase();
      const ci = log.subscription.user.client?.ci?.toLowerCase() ?? "";
      return (
        name.includes(term) ||
        lastname.includes(term) ||
        ci.includes(term)
      );
    });
    setFiltered(filteredResults);
  }, [search, logs]);

  if (unauthorized) return <UnauthorizedDialog />;
  if (loading) return <p className="p-6">Verificando acceso...</p>;

  return (
    <main className="p-6 min-h-screen bg-background text-foreground">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gestión de Accesos RFID</h1>
        <AdminTopNav />
      </div>

      <div className="mb-4 max-w-md">
        <Input
          placeholder="Buscar por nombre, apellido o CI"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

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
            {filtered.map((log) => (
              <tr key={log.id} className="border-t">
                <td className="p-2 border">{log.id}</td>
                <td className="p-2 border">{log.rfid_access.rfid_code}</td>
                <td className="p-2 border">{log.subscription.membership.name}</td>
                <td className="p-2 border">{log.subscription.user.name}</td>
                <td className="p-2 border">{log.subscription.user.lastname}</td>
                <td className="p-2 border">
                  {log.subscription.user.client?.ci ?? "—"}
                </td>
                <td className="p-2 border">
                  {log.entry_date
                    ? new Date(log.entry_date).toLocaleString()
                    : "—"}
                </td>
                <td className="p-2 border">
                  {log.exit_date
                    ? new Date(log.exit_date).toLocaleString()
                    : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
