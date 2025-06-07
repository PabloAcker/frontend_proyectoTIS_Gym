"use client";

import { useEffect, useState } from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

interface StatusData {
  withSubscription: number;
  withoutSubscription: number;
}

export function ClientsSubscriptionPieChart() {
  const [data, setData] = useState<StatusData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/dashboard/users/clients-subscription-status`);
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error("Error al obtener datos del gráfico:", err);
      }
    };

    fetchData();
  }, []);

  const chartData = {
    labels: ["Con suscripción", "Sin suscripción"],
    datasets: [
      {
        data: data ? [data.withSubscription, data.withoutSubscription] : [],
        backgroundColor: ["#34D399", "#F87171"],
      },
    ],
  };

  return (
    <div className="bg-card p-4 rounded-lg shadow-md">
      <h2 className="text-lg font-semibold mb-2">Clientes con y sin suscripción</h2>
      <div className="flex justify-center">
        <Pie data={chartData} width={100} height={100} />
      </div>
    </div>
  );
}
