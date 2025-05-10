"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Image from "next/image";
import { useState, useEffect } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function QrUploadModal({ open, onClose }: Props) {
  const [qrImage, setQrImage] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;

    const fetchQr = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/qrs`);
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setQrImage(data[0].image || null); // toma el primero o el más reciente
        } else {
          setQrImage(null);
        }
      } catch (error) {
        console.log("No hay QR aún cargado", error);
        setQrImage(null);
      }
    };

    fetchQr();
  }, [open]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!preview) return;
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/qrs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: preview,
          description: "QR global de referencia",
        }),
      });

      if (!res.ok) throw new Error("Error al guardar QR");

      toast.success("QR guardado correctamente");
      setQrImage(preview);
      setPreview(null);
    } catch (error) {
      toast.error("Error al guardar el QR");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Gestión de QR</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {qrImage && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">QR actual:</p>
              <Image src={qrImage} alt="QR actual" width={200} height={200} className="rounded-md" />
            </div>
          )}

          <Input type="file" accept="image/*" onChange={handleFileChange} />

          {preview && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">Previsualización:</p>
              <Image src={preview} alt="Previsualización QR" width={200} height={200} className="rounded-md" />
            </div>
          )}

          <Button onClick={handleSave} disabled={!preview || loading}>
            {loading ? "Guardando..." : "Guardar QR"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
