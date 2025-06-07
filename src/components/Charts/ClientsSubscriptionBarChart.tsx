"use client";

import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

interface MonthData {
  month: string;
  with: number;
  without: number;
}

export function ClientsSubscriptionBarChart() {
  const [data, setData] = useState<MonthData[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/dashboard/users/clients-subscription-by-month`);
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error("Error al obtener datos del gráfico:", err);
      }
    };

    fetchData();
  }, []);

  const chartData = {
    labels: data.map((d) => d.month),
    datasets: [
      {
        label: "Con suscripción",
        data: data.map((d) => d.with),
        backgroundColor: "#34D399",
      },
      {
        label: "Sin suscripción",
        data: data.map((d) => d.without),
        backgroundColor: "#F87171",
      },
    ],
  };

  return (
    <div className="bg-card p-4 rounded-lg shadow-md">
      <h2 className="text-lg font-semibold mb-2">Distribución mensual de clientes</h2>
      <Bar data={chartData} width={100} height={100} />
    </div>
  );
}
