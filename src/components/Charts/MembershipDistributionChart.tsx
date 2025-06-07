"use client";

import { useEffect, useState } from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

interface MembershipData {
  membership: string;
  count: number;
}

export function MembershipDistributionChart() {
  const [data, setData] = useState<MembershipData[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/dashboard/memberships/distribution`);
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error("Error al obtener membresías:", err);
      }
    };

    fetchData();
  }, []);

  const labels = data.map((item) => item.membership);
  const counts = data.map((item) => item.count);

  const colors = [
    "#6C63FF",
    "#34D399",
    "#FCD34D",
    "#F87171",
    "#60A5FA",
    "#F472B6",
    "#A78BFA",
    "#FBBF24",
    "#4ADE80",
    "#E879F9",
  ];

  const chartData = {
    labels,
    datasets: [
      {
        data: counts,
        backgroundColor: colors.slice(0, data.length),
      },
    ],
  };

  return (
    <div className="bg-card p-4 rounded-lg shadow-md">
      <h2 className="text-lg font-semibold mb-2">Distribución por tipo de membresía</h2>
      <div className="flex justify-center">
        <Pie data={chartData} width={100} height={100} />
      </div>
    </div>
  );
}
