"use client";

import { useAuth } from "@/hooks/useAuth";
import { AdminTopNav } from "@/components/AdminTopNav";
import { SubscriptionsPerMonthChart } from "@/components/Charts/SubscriptionsPerMonthChart";
import { ClientsSubscriptionPieChart } from "@/components/Charts/ClientsSubscriptionPieChart";
import { ClientsSubscriptionBarChart } from "@/components/Charts/ClientsSubscriptionBarChart";
import { MembershipDistributionChart } from "@/components/Charts/MembershipDistributionChart";
import { MonthlyEarningsLineChart } from "@/components/Charts/MonthlyEarningsLineChart";
import { Button } from "@/components/ui/button";

import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useEffect, useState } from "react";

export default function AdminPage() {
  const { user, loading } = useAuth(["admin", "empleado"]);

  const [tableData, setTableData] = useState<
    { month: string; subs: number; withSub: number; withoutSub: number; earnings: number }[]
  >([]);

  type SubsData = { month: string; count: number };
  type ClientsData = { month: string; with: number; without: number };
  type EarningsData = { month: string; total: number };

  // Cargar datos reales al montar
  useEffect(() => {
    const fetchData = async () => {
      const [subsRes, clientsRes, earningsRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/dashboard/subscriptions/monthly-count`),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/dashboard/users/clients-subscription-by-month`),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/dashboard/subscriptions/monthly-earnings`),
      ]);

      const [subs, clients, earnings] = await Promise.all([
        subsRes.json(),
        clientsRes.json(),
        earningsRes.json(),
      ]);

        const allMonths = Array.from(
          new Set([
            ...subs.map((d: SubsData) => d.month),
            ...clients.map((d: ClientsData) => d.month),
            ...earnings.map((d: EarningsData) => d.month),
          ])
        );

        const merged = allMonths.map((month) => ({
          month,
          subs: subs.find((s: SubsData) => s.month === month)?.count || 0,
          withSub: clients.find((c: ClientsData) => c.month === month)?.with || 0,
          withoutSub: clients.find((c: ClientsData) => c.month === month)?.without || 0,
          earnings: earnings.find((e: EarningsData) => e.month === month)?.total || 0,
        }));

      setTableData(merged);
    };

    fetchData();
  }, []);

  const exportToPDF = async () => {
    const input = document.getElementById("report-content");
    if (!input) return;

    const pdf = new jsPDF("p", "mm", "a4");

    // Página 1: gráficos
    const canvas = await html2canvas(input);
    const imgData = canvas.toDataURL("image/png");
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.addPage();

    // Página 2: tabla (dibujada con jsPDF)
    pdf.setFontSize(12);
    pdf.text("Reporte Detallado - Dashboard", 14, 14);
    pdf.setFontSize(10);
    pdf.text(`Generado el ${new Date().toLocaleDateString("es-BO")}`, 14, 22);

    const startY = 30;
    const rowHeight = 8;
    const colWidths = [30, 35, 40, 40, 35];
    const cols = ["Mes", "Suscripciones", "Con suscripción", "Sin suscripción", "Ganancias (Bs.)"];

    // Encabezado
    cols.forEach((col, i) => {
      pdf.setFillColor("#eeeeee");
      pdf.rect(14 + colWidths.slice(0, i).reduce((a, b) => a + b, 0), startY, colWidths[i], rowHeight, "F");
      pdf.setTextColor(0);
      pdf.text(col, 16 + colWidths.slice(0, i).reduce((a, b) => a + b, 0), startY + 6);
    });

    // Filas
    tableData.forEach((row, rowIndex) => {
      const y = startY + (rowIndex + 1) * rowHeight;
      const values = [row.month, row.subs, row.withSub, row.withoutSub, row.earnings];
      values.forEach((val, i) => {
        pdf.text(String(val), 16 + colWidths.slice(0, i).reduce((a, b) => a + b, 0), y + 6);
      });
    });

    pdf.save("reporte-dashboard.pdf");
  };

  if (loading) return <p className="p-6">Verificando acceso...</p>;

  return (
    <main className="p-6 min-h-screen bg-background text-foreground">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-2 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Panel de administración</h1>
          <p className="text-muted-foreground">Bienvenido, {user?.name}</p>
        </div>
        <AdminTopNav />
      </div>

      <div className="flex justify-end mb-6">
        <Button onClick={exportToPDF}>Exportar Reporte</Button>
      </div>

      <div id="report-content" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <SubscriptionsPerMonthChart />
        <ClientsSubscriptionPieChart />
        <ClientsSubscriptionBarChart />
        <MembershipDistributionChart />
        <MonthlyEarningsLineChart />
      </div>
    </main>
  );
}
