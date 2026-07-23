"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";

import type { components } from "@/types/api.generated";
import { useAddCustomerPoints } from "@/features/customers/hooks";

type CustomerDto = components["schemas"]["CustomerDto"];

function fullName(c: CustomerDto) {
  return [c.user.firstName, c.user.lastName].filter(Boolean).join(" ");
}

export function AddPointsSheet({
  open,
  onClose,
  customer,
}: {
  open: boolean;
  onClose: () => void;
  customer?: CustomerDto;
}) {
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const addPoints = useAddCustomerPoints();

  useEffect(() => {
    if (open) {
      setAmount("");
      setReason("");
    }
  }, [open, customer]);

  function handleClose() {
    setAmount("");
    setReason("");
    onClose();
  }

  const parsedAmount = Number(amount);
  const canSubmit = customer && amount.trim() !== "" && Number.isInteger(parsedAmount) && parsedAmount > 0;

  function handleSubmit() {
    if (!canSubmit || !customer) return;
    addPoints.mutate(
      { id: customer.id, amount: parsedAmount, reason: reason.trim() || undefined },
      { onSuccess: handleClose },
    );
  }

  return (
    <Sheet open={open} onOpenChange={(v) => !v && handleClose()}>
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col p-0 gap-0">
        <SheetHeader className="px-6 py-5 border-b">
          <SheetTitle>Ajouter des points</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {customer && (
            <div className="rounded-lg border bg-muted/30 px-4 py-3">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Client</p>
              <p className="font-medium mt-0.5">{fullName(customer)}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Solde actuel : {customer.points.toLocaleString("fr-FR")} pts
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label>Points à ajouter</Label>
            <Input
              type="number"
              min={1}
              step={1}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="100"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label>Raison (optionnel)</Label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Geste commercial, anniversaire…"
              rows={3}
            />
          </div>
        </div>

        <div className="border-t px-6 py-4 flex gap-3">
          <Button variant="outline" className="flex-1" onClick={handleClose} disabled={addPoints.isPending}>
            Annuler
          </Button>
          <Button className="flex-1" disabled={!canSubmit || addPoints.isPending} onClick={handleSubmit}>
            {addPoints.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Ajouter"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
