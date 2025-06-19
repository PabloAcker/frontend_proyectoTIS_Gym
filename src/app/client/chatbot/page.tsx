"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Swal from "sweetalert2";
import { jsPDF } from "jspdf";
import { ClientSidebar } from "@/components/ClientSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ReloadIcon } from "@radix-ui/react-icons";
import { BicepsFlexed, BotIcon, UtensilsCrossedIcon, Lock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

const steps = [
  { label: "¿Cuál es tu peso actual (kg)?", name: "peso", options: ["<50", "50-60", "60-70", "70-80", "80+"] },
  { label: "¿Cuál es tu estatura (cm)?", name: "estatura", options: ["<150", "150-160", "160-170", "170-180", "180+"] },
  { label: "¿Cuántos días a la semana haces ejercicio?", name: "actividad", options: ["0", "1-2", "3-4", "5-6", "7"] },
  { label: "¿Cuál es tu objetivo principal?", name: "objetivo", options: ["Bajar de peso", "Mantenerme saludable", "Ganar masa muscular"] },
  { label: "¿Cuál es tu edad?", name: "edad", options: ["<18", "18-25", "26-35", "36-50", "50+"] },
];

export default function ChatbotPage() {
  const { user, loading, unauthorized } = useAuth(["cliente"]);
  const router = useRouter();

  const [tieneSuscripcion, setTieneSuscripcion] = useState<boolean>(false);
  const [tipo, setTipo] = useState<string | null>(null);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [respuesta, setRespuesta] = useState("");
  const [generando, setGenerando] = useState(false);
const [verificandoSubscripcion, setVerificandoSubscripcion] = useState(true);

  // Verifica si tiene suscripción
  useEffect(() => {
    const verificar = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/subscriptions/user/${user?.id}`);
        const data = await res.json();
        setTieneSuscripcion(data && data.state === "aprobado");
      } catch {
        setTieneSuscripcion(false);
      } finally {
        setVerificandoSubscripcion(false);
      }
    };

    if (user) {
      verificar();
    } else {
      setVerificandoSubscripcion(false); // También cubre el caso donde user es null
    }
  }, [user]);

  // Recuperar progreso del chatbot
  useEffect(() => {
    const saved = localStorage.getItem("chatbot-progress");
    if (saved) {
      const parsed = JSON.parse(saved);
      setTipo(parsed.tipo);
      setStep(parsed.step);
      setAnswers(parsed.answers);
      setRespuesta(parsed.respuesta || "");
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("chatbot-progress", JSON.stringify({ tipo, step, answers, respuesta }));
  }, [tipo, step, answers, respuesta]);

    if (loading || verificandoSubscripcion) {
    return <p className="p-6">Verificando acceso...</p>;
  }

  const handleSelect = (value: string) => {
    const name = steps[step].name;
    const newAnswers = { ...answers, [name]: value };
    setAnswers(newAnswers);

    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      enviarAlBackend({ ...newAnswers, tipo: tipo! });
    }
  };

  const enviarAlBackend = async (data: Record<string, string>) => {
    setGenerando(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chatbot`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();
      setRespuesta(json.respuesta);
      toast.success("Plan generado con éxito");
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "No se pudo generar el plan. Intenta más tarde.", "error");
    } finally {
      setGenerando(false);
    }
  };

  const descargarPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(
      tipo === "rutina" ? "Plan de rutina personalizado" : "Plan de dieta personalizada",
      20,
      20
    );

    let y = 35;
    doc.setFontSize(12);
    Object.entries(answers).forEach(([key, value]) => {
      const label = key.charAt(0).toUpperCase() + key.slice(1);
      doc.text('\u2022 ' + label + ': ' + value, 20, y);
      y += 7;
    });

    y += 10;
    doc.setFontSize(14);
    doc.text("Resultado:", 20, y);
    y += 10;

    const splitText = doc.splitTextToSize(respuesta, 170);
    const lineHeight = 7;
    splitText.forEach((line: string) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.text(line, 20, y);
      y += lineHeight;
    });

    y += 15;
    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text(
      "Este asistente no está avalado por ningún profesional médico. Consulte siempre a un especialista.",
      20,
      y
    );

    doc.save(`${tipo}_personalizado.pdf`);
  };

  const reset = () => {
    setTipo(null);
    setStep(0);
    setAnswers({});
    setRespuesta("");
    localStorage.removeItem("chatbot-progress");
  };

  const handleBack = () => {
    if (step === 0) {
      reset();
    } else {
      setStep(step - 1);
    }
  };

  if (loading) return <p className="p-6">Verificando acceso...</p>;
  if (unauthorized || !user) return null;

  return (
    <main className="flex flex-col sm:flex-row min-h-screen bg-background text-foreground p-6 gap-6">
      <ClientSidebar />

      <div className="flex-1 p-6 flex justify-center items-center">
        {tieneSuscripcion ? (
          <Card className="w-full max-w-xl border-l-4 border-primary shadow-sm">
            <CardHeader>
              <CardTitle className="text-center text-2xl flex items-center justify-center gap-2">
                <BotIcon className="w-6 h-6 text-primary" />
                Asistente de {tipo === "rutina" ? "rutina" : tipo === "dieta" ? "dieta" : "IA"}
              </CardTitle>
              <p className="text-xs text-muted-foreground text-center mt-1">
                Este asistente no está avalado por ningún profesional médico. Consulta siempre a un especialista, esta es solo una sugerencia automatizada.
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              {!tipo ? (
                <div className="text-center space-y-4">
                  <p className="text-muted-foreground">¿Qué deseas generar hoy?</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Button className="w-full" onClick={() => setTipo("dieta")}>
                      <UtensilsCrossedIcon className="w-4 h-4 mr-2" />
                      Dieta personalizada
                    </Button>
                    <Button className="w-full" onClick={() => setTipo("rutina")}>
                      <BicepsFlexed className="w-4 h-4 mr-2" />
                      Rutina personalizada
                    </Button>
                  </div>
                </div>
              ) : respuesta ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <h2 className="text-lg font-semibold mb-2">Resultado generado:</h2>
                  <p className="whitespace-pre-wrap text-sm text-muted-foreground">{respuesta}</p>

                  <div className="flex flex-col sm:flex-row gap-4 mt-6">
                    <Button onClick={descargarPDF} className="w-full sm:w-auto">
                      Descargar PDF
                    </Button>
                    <Button variant="outline" onClick={reset} className="w-full sm:w-auto">
                      Volver a empezar
                    </Button>
                  </div>
                </motion.div>
              ) : (
                <>
                  <motion.h2
                    key={step}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-md font-medium text-center text-foreground"
                  >
                    {steps[step].label}
                  </motion.h2>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {steps[step].options.map((opt) => (
                      <Button
                        key={opt}
                        variant="outline"
                        onClick={() => handleSelect(opt)}
                        className="text-sm w-full"
                      >
                        {opt}
                      </Button>
                    ))}
                  </div>

                  <div className="flex justify-between mt-4">
                    <Button variant="ghost" onClick={handleBack}>
                      ⬅ Volver
                    </Button>
                    {generando && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <ReloadIcon className="h-4 w-4 animate-spin" />
                        Generando respuesta...
                      </div>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="text-center space-y-6 max-w-md mx-auto">
            <h2 className="text-xl font-semibold text-foreground flex items-center justify-center gap-2">
              <Lock className="w-5 h-5 text-primary" />
              Desbloquea esta funcionalidad
            </h2>
            <p className="text-muted-foreground">
              Suscríbete a alguno de nuestros planes y accede a un plan de dieta o rutina completamente personalizado gracias a nuestra inteligencia artificial.
            </p>
            <Button onClick={() => router.push("/memberships")}>
              Ver planes de membresía
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}