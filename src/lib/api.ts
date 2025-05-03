// lib/api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export const getMemberships = async () => {
  const res = await fetch(`${API_URL}/memberships`, { cache: "no-store" });
  if (!res.ok) throw new Error("Error al obtener membresías");
  return res.json();
};