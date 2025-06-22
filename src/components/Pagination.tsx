"use client";

import { Button } from "@/components/ui/button";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const goToPrevious = () => {
    if (currentPage > 1) onPageChange(currentPage - 1);
  };

  const goToNext = () => {
    if (currentPage < totalPages) onPageChange(currentPage + 1);
  };

  return (
    <div className="flex items-center justify-center gap-4 mt-4">
      <Button
        variant="outline"
        size="sm"
        onClick={goToPrevious}
        disabled={currentPage === 1}
      >
        Anterior
      </Button>

      <span className="text-sm text-muted-foreground">
        Página {currentPage} de {totalPages}
      </span>

      <Button
        variant="outline"
        size="sm"
        onClick={goToNext}
        disabled={currentPage === totalPages}
      >
        Siguiente
      </Button>
    </div>
  );
}
