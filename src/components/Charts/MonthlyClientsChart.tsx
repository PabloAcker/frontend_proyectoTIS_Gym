"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { mes: "Ene", clientes: 200 },
  { mes: "Feb", clientes: 180 },
  { mes: "Mar", clientes: 150 },
  { mes: "Abr", clientes: 220 },
  { mes: "May", clientes: 170 },
  { mes: "Jun", clientes: 190 },
];

export function MonthlyClientsChart() {
  return (
    <div className="bg-card p-4 rounded-lg shadow-md">
      <h2 className="text-lg font-semibold mb-2">Clientes por mes</h2>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="mes" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="clientes" fill="#6C63FF" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
