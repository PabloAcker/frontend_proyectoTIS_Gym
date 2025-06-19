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
  branchId: number | null;
}

export function BranchImageModal({ open, onClose, branchId }: Props) {
  const [image, setImage] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || branchId === null) return;

    interface Branch {
      id: number;
      image?: string;
      // add other properties if needed
    }

    const fetchImage = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/branches`);
        const data: Branch[] = await res.json();
        const current = data.find((b: Branch) => b.id === branchId);
        setImage(current?.image || null);
      } catch {
        setImage(null);
      }
    };

    fetchImage();
  }, [open, branchId]);

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
    if (!preview || branchId === null) return;
    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/branches/${branchId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: preview }),
      });

      if (!res.ok) throw new Error("Error al guardar imagen");
      toast.success("Imagen guardada correctamente");
      setImage(preview);
      setPreview(null);
    } catch (error) {
      toast.error("Error al guardar la imagen");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Imagen de Sucursal</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {image && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">Imagen actual:</p>
              <Image src={image} alt="Imagen de sucursal" width={200} height={200} className="rounded-md" />
            </div>
          )}

          <Input type="file" accept="image/*" onChange={handleFileChange} />

          {preview && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">Previsualización:</p>
              <Image src={preview} alt="Previsualización" width={200} height={200} className="rounded-md" />
            </div>
          )}

          <Button onClick={handleSave} disabled={!preview || loading}>
            {loading ? "Guardando..." : "Guardar Imagen"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
