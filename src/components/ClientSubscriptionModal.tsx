"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useEffect, useState } from "react";

interface Props {
  userId: number;
  open: boolean;
  onClose: () => void;
}

interface Subscription {
  id: number;
  state: string;
  start_date: string;
  end_date: string;
  membership: {
    name: string;
  };
}

export function ClientSubscriptionModal({ userId, open, onClose }: Props) {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !userId) return;

    const fetchSubscription = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/subscriptions/user/${userId}`);
        const data = await res.json();
        setSubscription(data);
      } catch (error) {
        console.error("Error al cargar suscripción:", error);
        setSubscription(null);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, [userId, open]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Estado de Suscripción</DialogTitle>
        </DialogHeader>

        {loading && <p className="text-sm text-muted-foreground">Cargando...</p>}

        {!loading && subscription ? (
          <div className="space-y-2 text-sm">
            <p><strong>Plan:</strong> {subscription.membership.name}</p>
            <p><strong>Estado:</strong> {subscription.state}</p>
            <p><strong>Inicio:</strong> {new Date(subscription.start_date).toLocaleDateString()}</p>
            <p><strong>Fin:</strong> {new Date(subscription.end_date).toLocaleDateString()}</p>
          </div>
        ) : (
          !loading && <p className="text-muted-foreground">El cliente no tiene suscripción activa.</p>
        )}
      </DialogContent>
    </Dialog>
  );
}
