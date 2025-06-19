"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { ClientNavbar } from "@/components/ClientNavbar";
import { getMemberships } from "@/lib/api";
import MembershipCarousel from "@/components/MembershipCarousel";
import dynamic from "next/dynamic";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion, useInView } from "framer-motion";

const BranchMap = dynamic(() => import("@/components/Map/BranchMap"), {
  ssr: false,
}) as React.FC<{ branches: Branch[]; selectedBranchId: number | null }>;

interface Membership {
  id: number;
  name: string;
  description: string;
  duration: string;
  price: number;
}

interface Branch {
  id: number;
  name: string;
  address?: string;
  services?: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  image?: string;
}

export default function HomePage() {
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const titleRef = useRef(null);
  const isInView = useInView(titleRef, { margin: "-100px", once: false });

  useEffect(() => {
    getMemberships()
      .then((data) => setMemberships(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/branches`);
        const data = await res.json();
        setBranches(data);
        if (data.length > 0) setSelectedBranchId(data[0].id);
      } catch (err) {
        console.error("Error al cargar sucursales:", err);
      }
    };

    fetchBranches();
  }, []);

  const selectedBranch = branches.find((b) => b.id === selectedBranchId);

  return (
    <main className="min-h-screen flex flex-col text-foreground scroll-smooth">
      {/* Navbar */}
      <ClientNavbar />

      {/* Sección 1 */}
      <section className="relative w-full h-screen overflow-hidden" id="inicio">
        <Image
          src="/images/plan_trimestral.jpg"
          alt="Fondo gimnasio"
          fill
          priority
          className="object-cover object-center z-0"
        />
        <div className="absolute inset-0 bg-black/20 z-10" />
        <div className="relative z-20 h-full flex items-center px-8 md:px-20">
          <div className="max-w-2xl bg-black/30 p-6 rounded-md backdrop-blur-sm">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white">
              Bienvenido al Gimnasio E‑GYM
            </h1>
            <p className="text-lg text-white text-opacity-90 max-w-md">
              Infórmate, adquiere tu membresía y entrena como nunca antes.
            </p>
          </div>
        </div>
      </section>

      {/* Sección 2 */}
      <section className="relative w-full h-screen bg-gradient-to-br from-[#e0f7fa] via-[#e8eaf6] to-[#f1f8e9] overflow-hidden flex items-center justify-center p-6" 
      id="membresias">
        <div className="absolute top-[-100px] left-[-100px] w-[400px] h-[400px] bg-[#A5F3FC] rounded-full opacity-30 blur-3xl animate-pulse" />
        <div className="absolute bottom-[-120px] right-[-80px] w-[400px] h-[400px] bg-[#C4B5FD] rounded-full opacity-30 blur-3xl animate-pulse" />
        <div className="relative z-10 w-full max-w-3xl px-4">
          <h2 className="text-3xl font-bold text-center mb-8">
            ¡Elige un plan de membresía y únete a nosotros suscribiéndote!
          </h2>
          {!loading && memberships.length > 0 && (
            <MembershipCarousel memberships={memberships} />
          )}
        </div>
      </section>

      {/* Sección 3: Sucursales */}
      <section className="relative w-full h-screen px-6 py-16 bg-gradient-to-r from-[#f0f9ff] via-[#fef6fb] to-[#f5f5f5] overflow-hidden"
      id="sucursales">
        <div className="absolute top-[-60px] left-[10%] w-[300px] h-[300px] bg-[#a5f3fc] rounded-full opacity-20 blur-2xl animate-pulse" />
        <div className="absolute bottom-[-100px] right-[15%] w-[300px] h-[300px] bg-[#fbcfe8] rounded-full opacity-20 blur-2xl animate-pulse" />

        <div className="relative z-10 max-w-6xl mt-5 mx-auto flex flex-col gap-8 h-full">
          {/* Título con animación */}
          <motion.h2
            ref={titleRef}
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6 }}
            className="text-3xl font-bold text-center"
          >
            Échale un vistazo a todas nuestras sucursales
          </motion.h2>

          {/* Contenido */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
            <div className="space-y-4 w-full">
              {/* Selector alineado a la izquierda */}
              <div className="w-full max-w-xs">
                <Select
                  value={selectedBranchId?.toString()}
                  onValueChange={(val) => setSelectedBranchId(parseInt(val))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una sucursal" />
                  </SelectTrigger>
                  <SelectContent>
                    {branches.map((b) => (
                      <SelectItem key={b.id} value={b.id.toString()}>
                        {b.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Mapa */}
              <BranchMap branches={branches} selectedBranchId={selectedBranchId} />
            </div>
            {/* Imagen de referencia */}
            {selectedBranch?.image && (
              <Card className="p-4 shadow-xl border rounded-xl bg-white/70 backdrop-blur-sm h-[480px] flex flex-col justify-between">
                <h3 className="text-xl font-semibold">
                  Imagen de referencia de {selectedBranch.name}
                </h3>
                <div className="relative w-full h-[380px] mt-4">
                  <Image
                    src={selectedBranch.image}
                    alt={`Sucursal ${selectedBranch.name}`}
                    fill
                    className="rounded-lg object-cover"
                  />
                </div>
              </Card>
            )}
          </div>
        </div>
      </section>

            {/* Sección 4: Footer */}
      <footer className="bg-[#629a95] text-white py-12 px-6 scroll-smooth">
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {/* Contacto */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contáctanos</h3>
            <p className="text-sm mb-1">contacto@egym.bo</p>
            <p className="text-sm mb-1">+591 700 12345</p>
            <p className="text-sm mt-4 font-semibold">Ubicación Sucursal Central:</p>
            <p className="text-sm">Zona Sur Calacoto, La Paz - Bolivia</p>
          </div>

          {/* Enlaces con scroll a secciones */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Nuestros Servicios</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="#inicio"
                  className="hover:underline cursor-pointer"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById("inicio")?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  Inicio
                </a>
              </li>
              <li>
                <a
                  href="#membresias"
                  className="hover:underline cursor-pointer"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById("membresias")?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  Planes de membresía
                </a>
              </li>
              <li>
                <a
                  href="#sucursales"
                  className="hover:underline cursor-pointer"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById("sucursales")?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  Sucursales
                </a>
              </li>
            </ul>
          </div>

          {/* Marca */}
          <div>
            <h3 className="text-xl font-bold mb-2">E‑GYM</h3>
            <p className="text-sm">
              Donde comienza tu mejor versión. <br />
              Esfuérzate, entrena y supera tus límites con nosotros.
            </p>
          </div>
        </div>

        {/* Línea y derechos */}
        <div className="border-t border-white/20 mt-10 pt-6 text-center text-xs text-white/60">
          © {new Date().getFullYear()} E‑GYM. Todos los derechos reservados.
        </div>
      </footer>
    </main>
  );
}
