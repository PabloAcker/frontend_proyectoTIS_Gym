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

interface SubscriptionData {
  month: string;
  count: number;
}

export function SubscriptionsPerMonthChart() {
  const [data, setData] = useState<SubscriptionData[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/dashboard/subscriptions/monthly-count`);
        const json = await res.json();
        setData(json);
      } catch (error) {
        console.error("Error al cargar suscripciones mensuales:", error);
      }
    };

    fetchData();
  }, []);

  const chartData = {
    labels: data.map((d) => d.month),
    datasets: [
      {
        label: "Suscripciones",
        data: data.map((d) => d.count),
        backgroundColor: "#6C63FF",
      },
    ],
  };

  return (
    <div className="bg-card p-4 rounded-lg shadow-md">
      <h2 className="text-lg font-semibold mb-2">Suscripciones por mes</h2>
      <Bar data={chartData} width={100} height={100}/>
    </div>
  );
}
