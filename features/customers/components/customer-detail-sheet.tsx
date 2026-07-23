"use client";

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";

import type { components } from "@/types/api.generated";
import { useCustomerPointsTransactions } from "@/features/customers/hooks";

type CustomerDto = components["schemas"]["CustomerDto"];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function initials(firstName: string, lastName?: string): string {
  return `${firstName[0]}${lastName ? lastName[0] : ""}`.toUpperCase();
}

function fullName(c: CustomerDto): string {
  return [c.user.firstName, c.user.lastName].filter(Boolean).join(" ");
}

function getAge(dateOfBirth?: string): string {
  if (!dateOfBirth) return "—";
  const diff = Date.now() - new Date(dateOfBirth).getTime();
  return `${Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25))} ans`;
}

function formatDate(date?: string): string {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
}

const GENDER_LABEL: Record<string, string> = {
  male: "Homme",
  female: "Femme",
};

// ─── Stat ────────────────────────────────────────────────────────────────────

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex-1 text-center">
      <p className="text-lg font-bold tabular-nums">{value}</p>
      <p className="text-[11px] text-muted-foreground uppercase tracking-wider mt-0.5">{label}</p>
    </div>
  );
}

// ─── Field (grille 2 colonnes) ───────────────────────────────────────────────

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] text-muted-foreground uppercase tracking-wider">{label}</p>
      <p className="text-sm font-medium mt-0.5 truncate">{value}</p>
    </div>
  );
}

// ─── Sheet ───────────────────────────────────────────────────────────────────

export function CustomerDetailSheet({
  open,
  onClose,
  customer,
}: {
  open: boolean;
  onClose: () => void;
  customer?: CustomerDto;
}) {
  const { data: transactions = [], isLoading } = useCustomerPointsTransactions(customer?.id);

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col p-0 gap-0">
        <SheetHeader className="sr-only">
          <SheetTitle>Détail client</SheetTitle>
        </SheetHeader>

        {customer && (
          <div className="flex-1 overflow-y-auto">

            {/* Identité, centrée */}
            <div className="flex flex-col items-center gap-2 px-6 pt-8 pb-6 border-b">
              <Avatar className="h-14 w-14">
                <AvatarFallback className="text-base font-semibold bg-muted">
                  {initials(customer.user.firstName, customer.user.lastName)}
                </AvatarFallback>
              </Avatar>
              <p className="font-semibold text-base">{fullName(customer)}</p>
              <p className="text-xs text-muted-foreground">{customer.user.email}</p>
              <span className={cn(
                "mt-1 inline-flex items-center gap-1.5 text-xs",
                customer.isInactive ? "text-muted-foreground" : "text-emerald-600",
              )}>
                <span className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  customer.isInactive ? "bg-zinc-400" : "bg-emerald-500",
                )} />
                {customer.isInactive ? "Inactif" : "Actif"}
              </span>
            </div>

            {/* Stats */}
            <div className="flex px-6 py-5 border-b">
              <Stat label="Solde" value={`${customer.points.toLocaleString("fr-FR")} pts`} />
              <div className="w-px bg-border" />
              <Stat label="Total gagné" value={`${customer.totalPointsGained.toLocaleString("fr-FR")} pts`} />
              <div className="w-px bg-border" />
              <Stat label="Transactions" value={String(transactions.length)} />
            </div>

            {/* Infos, grille 2 colonnes */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-4 px-6 py-5 border-b">
              <Field label="Âge" value={getAge(customer.user.dateOfBirth)} />
              <Field label="Genre" value={customer.user.gender ? GENDER_LABEL[customer.user.gender] : "—"} />
              <Field
                label="Localisation"
                value={[customer.user.city, customer.user.country].filter(Boolean).join(", ") || "—"}
              />
              <Field label="Dernière visite" value={formatDate(customer.lastVisitDate)} />
              <Field label="Client depuis" value={formatDate(customer.createdAt)} />
              <Field label="Link code" value={customer.user.linkCode ?? "—"} />
            </div>

            {/* Transactions de points */}
            <div className="px-6 py-5">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Historique des points
              </p>
              {isLoading ? (
                <div className="flex justify-center py-6">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              ) : transactions.length === 0 ? (
                <p className="text-sm text-muted-foreground py-6 text-center rounded-lg border border-dashed">
                  Aucune transaction pour l&apos;instant.
                </p>
              ) : (
                <div>
                  {transactions.map((tx) => {
                    const positive = tx.amount > 0;
                    return (
                      <div key={tx.id} className="grid grid-cols-[auto_1fr_auto] items-baseline gap-3 py-1.5 text-sm">
                        <span className="text-xs text-muted-foreground tabular-nums">{formatDate(tx.createdAt)}</span>
                        <span className="truncate text-muted-foreground">{tx.reason || "Ajustement manuel"}</span>
                        <span className={cn(
                          "tabular-nums font-medium",
                          positive ? "text-emerald-600" : "text-destructive",
                        )}>
                          {positive ? "+" : ""}{tx.amount.toLocaleString("fr-FR")}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
