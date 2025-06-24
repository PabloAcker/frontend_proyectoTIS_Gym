"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Button } from "@/components/ui/button";

interface Membership {
  id: number;
  name: string;
  description: string;
  duration: string;
  price: number;
}

export default function MembershipCarousel({
  memberships,
}: {
  memberships: Membership[];
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) =>
        prev === memberships.length - 1 ? 0 : prev + 1
      );
    }, 3500);
    return () => clearInterval(interval);
  }, [memberships]);

  const prevSlide = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? memberships.length - 1 : prev - 1
    );
  };

  const nextSlide = () => {
    setCurrentIndex((prev) =>
      prev === memberships.length - 1 ? 0 : prev + 1
    );
  };

  const getImagePath = (name: string) => {
    const key = name.toLowerCase();
    if (key.includes("mensual")) return "/images/plan_mensual.avif";
    if (key.includes("trimestral")) return "/images/plan_trimestral.jpg";
    if (key.includes("anual")) return "/images/plan_anual.jpg";
    return "/images/cardMembership.png";
  };

  const current = memberships[currentIndex];

  return (
    <div className="relative w-full max-w-3xl px-4">
      <AnimatePresence mode="wait">
        {current ? (
          <motion.div
            key={current.id}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.5 }}
            className="bg-card p-6 rounded-xl border border-border shadow-md flex flex-col items-center text-center gap-4"
          >
            <Image
              src={getImagePath(current.name)}
              alt={`Imagen de ${current.name}`}
              width={400}
              height={200}
              className="rounded-md object-cover w-full h-48"
            />

            <h3 className="text-xl font-bold text-foreground">
              {current.name}
            </h3>

            <p className="text-sm text-foreground">
              <strong>Precio:</strong> Bs. {current.price}
            </p>

            <Button
              variant="outline"
              onClick={() => router.push(`/memberships/${current.id}`)}
              className="mt-2 hover:bg-primary hover:text-white transition-colors"
            >
              Ver más
            </Button>
          </motion.div>
        ) : (
          // Skeleton card
          <motion.div
            key="skeleton"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
            className="bg-card p-6 rounded-xl border border-border shadow-md flex flex-col items-center text-center gap-4 animate-pulse"
          >
            <div className="w-full h-48 bg-muted rounded-md" />
            <div className="w-2/3 h-5 bg-muted rounded" />
            <div className="w-1/3 h-4 bg-muted rounded" />
            <div className="w-1/4 h-10 bg-muted rounded mt-2" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Botones de navegación */}
      {memberships.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-[-3rem] top-1/2 transform -translate-y-1/2 text-primary text-3xl z-20 hover:scale-110 transition"
          >
            &#10094;
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-[-3rem] top-1/2 transform -translate-y-1/2 text-primary text-3xl z-20 hover:scale-110 transition"
          >
            &#10095;
          </button>
        </>
      )}

      {/* Dots */}
      {memberships.length > 1 && (
        <div className="flex justify-center mt-6 gap-2">
          {memberships.map((_, index) => (
            <span
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-3 h-3 rounded-full cursor-pointer transition ${
                index === currentIndex
                  ? "bg-primary"
                  : "bg-gray-300 hover:bg-primary/40"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}