"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Image from "next/image";

interface Props {
  open: boolean;
  onClose: () => void;
  imageUrl: string;
  branchName: string;
}

export function BranchImageZoomModal({ open, onClose, imageUrl, branchName }: Props) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="sr-only">Imagen de referencia de la sucursal</DialogTitle>
        </DialogHeader>

        <Image
          src={imageUrl}
          alt={`Imagen de referencia de ${branchName}`}
          width={800}
          height={600}
          className="w-full h-auto rounded-lg"
        />
      </DialogContent>
    </Dialog>
  );
}
