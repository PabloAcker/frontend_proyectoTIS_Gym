"use client";

import { useRef, useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BadgeCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { RfidRestrictionDialog } from "./RfidRestrictionDialog"; // ajusta la ruta si es necesario

interface RfidScannerModalProps {
  open: boolean;
  onClose: () => void;
}

export function RfidScannerModal({ open, onClose }: RfidScannerModalProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [restrictionOpen, setRestrictionOpen] = useState(false);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!code.trim()) {
      toast.error("El campo está vacío.");
      return;
    }

    if (!/^\d+$/.test(code)) {
      toast.error("El código RFID solo debe contener números.");
      return;
    }

    setLoading(true);
    setSuccess(false);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/access`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rfid_code: code }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al registrar");

      toast.success("✅ Acceso registrado correctamente");
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setCode("");
        //onClose(); // cerrar modal cada vez que se registre un acceso
      }, 1500);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "No se pudo registrar";
      if (errorMessage.includes("una entrada diaria")) {
        setRestrictionOpen(true);
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Escanear tarjeta RFID</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Input
            ref={inputRef}
            value={code}
            onChange={(e) => {
              const onlyNumbers = e.target.value.replace(/[^0-9]/g, "");
              setCode(onlyNumbers);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Escanea la tarjeta..."
            disabled={loading || success}
            className="text-lg tracking-widest text-center"
          />

          <Button
            onClick={handleSubmit}
            disabled={!code.trim() || loading || success}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin w-4 h-4 mr-2" /> Registrando...
              </>
            ) : success ? (
              <>
                <BadgeCheck className="text-green-600 w-4 h-4 mr-2" /> Registrado
              </>
            ) : (
              "Registrar entrada/salida"
            )}
          </Button>
        </div>
      </DialogContent>
      <RfidRestrictionDialog
        open={restrictionOpen}
        onClose={() => setRestrictionOpen(false)}
      />
    </Dialog>
  );
}
