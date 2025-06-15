"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Swal from "sweetalert2";
import { jsPDF } from "jspdf";
import { ClientSidebar } from "@/components/ClientSidebar";

const steps = [
  { label: "¿Cuál es tu peso actual (kg)?", name: "peso", options: ["<50", "50-60", "60-70", "70-80", "80+"] },
  { label: "¿Cuál es tu estatura (cm)?", name: "estatura", options: ["<150", "150-160", "160-170", "170-180", "180+"] },
  { label: "¿Cuántos días a la semana haces ejercicio?", name: "actividad", options: ["0", "1-2", "3-4", "5-6", "7"] },
  { label: "¿Cuál es tu objetivo principal?", name: "objetivo", options: ["Bajar de peso", "Mantener", "Ganar masa"] },
  { label: "¿Cuál es tu edad?", name: "edad", options: ["<18", "18-25", "26-35", "36-50", "50+"] },
];

export default function DietBotPage() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [respuesta, setRespuesta] = useState("");

  const handleSelect = (value: string) => {
    const name = steps[step].name;
    const newAnswers = { ...answers, [name]: value };

    setAnswers(newAnswers);
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      enviarAlBackend(newAnswers);
    }
  };

  const enviarAlBackend = async (data: Record<string, string>) => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chatbot`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const json = await res.json();
      setRespuesta(json.respuesta);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "No se pudo generar la dieta. Intenta más tarde.", "error");
    } finally {
      setLoading(false);
    }
  };

  const descargarPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Plan de dieta personalizado", 20, 20);

    // Agregar los datos ingresados
    let y = 35;
    Object.entries(answers).forEach(([key, value]) => {
    doc.setFontSize(12);
    const label = key.charAt(0).toUpperCase() + key.slice(1);
    doc.text('\u2022 ' + label + ': ' + value, 20, y);
    y += 7;
    });

    y += 10;
    doc.setFontSize(14);
    doc.text("Recomendación del chatbot:", 20, y);
    y += 10;

    const splitText = doc.splitTextToSize(respuesta, 170);
    doc.setFontSize(12);
    doc.text(splitText, 20, y);

    doc.save("dieta_personalizada.pdf");
  };

  return (
    <main className="flex min-h-screen bg-background text-foreground">
      <ClientSidebar />

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10">
        <div className="max-w-xl w-full bg-white rounded-2xl shadow-lg p-6 space-y-6">
          <h1 className="text-2xl font-bold text-center mb-4">🤖 Asistente de dieta</h1>

          {respuesta ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2 className="text-lg font-semibold mb-2">🍽 Tu dieta sugerida:</h2>
              <p className="text-gray-800 whitespace-pre-wrap">{respuesta}</p>

              <div className="flex flex-col sm:flex-row gap-4 mt-6">
                <button
                  onClick={descargarPDF}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition w-full sm:w-auto"
                >
                  📄 Descargar PDF
                </button>
                <button
                  onClick={() => {
                    setStep(0);
                    setAnswers({});
                    setRespuesta("");
                  }}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition w-full sm:w-auto"
                >
                  🔄 Volver a empezar
                </button>
              </div>
            </motion.div>
          ) : (
            <>
              <motion.h2
                key={step}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-md font-medium text-gray-700 text-center"
              >
                {steps[step].label}
              </motion.h2>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {steps[step].options.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => handleSelect(opt)}
                    className="py-2 px-4 text-sm rounded-lg border border-gray-300 hover:bg-indigo-100 transition"
                  >
                    {opt}
                  </button>
                ))}
              </div>

              {loading && <p className="text-center mt-4 text-sm text-gray-500">⏳ Generando dieta...</p>}
            </>
          )}
        </div>
      </div>
    </main>
  );
}