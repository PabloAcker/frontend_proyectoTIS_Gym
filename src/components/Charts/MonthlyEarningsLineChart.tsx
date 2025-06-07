"use client";

import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend);

interface EarningsData {
  month: string;
  total: number;
}

export function MonthlyEarningsLineChart() {
  const [data, setData] = useState<EarningsData[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/dashboard/subscriptions/monthly-earnings`);
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error("Error al obtener ganancias:", err);
      }
    };

    fetchData();
  }, []);

  const labels = data.map((item) => item.month);
  const totals = data.map((item) => item.total);

  const chartData = {
    labels,
    datasets: [
      {
        label: "Ganancias (Bs.)",
        data: totals,
        borderColor: "#6C63FF",
        backgroundColor: "rgba(108, 99, 255, 0.2)",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  return (
    <div className="bg-card p-4 rounded-lg shadow-md col-span-1 lg:col-span-2">
      <h2 className="text-lg font-semibold mb-2">Ganancias mensuales estimadas</h2>
      <Line data={chartData} />
    </div>
  );
}
