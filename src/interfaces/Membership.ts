// src/interfaces/Membership.ts
export interface Membership {
    id?: number;
    name: string;
    description: string;
    duration: string; // Ej: "1 mes"
    price: number;
  }  