"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronDown, Moon, Search, User, Users, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";

import type { components } from "@/types/api.generated";
import { useCustomers } from "@/features/customers/hooks";
import { useCreatePromotion, useUpdatePromotion } from "@/features/promotions/hooks";
import type { PromotionDto, PromotionTargetedCustomer } from "@/features/promotions/api";

type CustomerDto = components["schemas"]["CustomerDto"];
type Audience = "all" | "inactive" | "targeted";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function initials(n: string) {
  return n.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}
function fullName(c: PromotionTargetedCustomer) {
  return [c.user.firstName, c.user.lastName].filter(Boolean).join(" ");
}
function toDateInput(iso?: string | null) {
  if (!iso) return "";
  return iso.slice(0, 10);
}

// ─── Audience picker ─────────────────────────────────────────────────────────

const AUDIENCE_OPTIONS: { value: Audience; icon: typeof Users; title: string; sub: string }[] = [
  { value: "all",      icon: Users, title: "Tous les clients", sub: "Visible par l'ensemble de vos clients." },
  { value: "inactive", icon: Moon,  title: "Clients inactifs", sub: "Cible les clients sans visite récente." },
  { value: "targeted", icon: User,  title: "Sélection",        sub: "Choisissez des clients précis ci-dessous." },
];

function AudiencePicker({
  audience,
  setAudience,
  selected,
  setSelected,
}: {
  audience: Audience;
  setAudience: (a: Audience) => void;
  selected: PromotionTargetedCustomer[];
  setSelected: React.Dispatch<React.SetStateAction<CustomerDto[]>>;
}) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const handleQueryChange = useCallback((value: string) => {
    setQuery(value);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedQuery(value), 300);
  }, []);

  function addCustomer(c: CustomerDto) {
    setSelected((s) => [...s, c]);
    setQuery("");
    setDebouncedQuery("");
  }

  const chosenIds = new Set(selected.map((c) => c.id));
  const { data: customersData } = useCustomers(
    debouncedQuery.trim().length >= 2 ? { search: debouncedQuery.trim(), limit: 8 } : {},
  );
  const results = (customersData?.items ?? []).filter((c) => !chosenIds.has(c.id));

  return (
    <div className="space-y-2">
      <Label>Audience</Label>

      {AUDIENCE_OPTIONS.map((a) => {
        const sel = audience === a.value;
        const Ico = a.icon;
        return (
          <button
            key={a.value}
            type="button"
            onClick={() => setAudience(a.value)}
            className={cn(
              "flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors",
              sel ? "border-foreground ring-1 ring-foreground" : "hover:bg-muted/40",
            )}
          >
            <span className={cn(
              "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border",
              sel ? "border-foreground" : "border-muted-foreground/40",
            )}>
              {sel && <span className="h-2 w-2 rounded-full bg-foreground" />}
            </span>
            <span className="min-w-0">
              <span className="flex items-center gap-1.5 text-sm font-medium">
                <Ico className="h-3.5 w-3.5 text-muted-foreground" /> {a.title}
              </span>
              <span className="mt-0.5 block text-xs text-muted-foreground">{a.sub}</span>
            </span>
            {a.value === "targeted" && selected.length > 0 && (
              <span className="ml-auto shrink-0 text-xs font-semibold text-muted-foreground">{selected.length}</span>
            )}
          </button>
        );
      })}

      {audience === "targeted" && (
        <div className="space-y-2 pt-1">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              placeholder="Rechercher un client…"
              className="h-9 pl-9"
            />
          </div>

          {debouncedQuery.trim().length >= 2 && (
            <div className="max-h-48 overflow-y-auto rounded-md border">
              {results.length === 0 ? (
                <p className="px-3 py-3.5 text-xs text-muted-foreground">Aucun client trouvé.</p>
              ) : results.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => addCustomer(c)}
                  className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm hover:bg-muted"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-[11px] font-semibold text-muted-foreground">
                    {initials(`${c.user.firstName} ${c.user.lastName}`)}
                  </span>
                  {c.user.firstName} {c.user.lastName}
                  <span className="ml-auto text-xs text-muted-foreground">{c.user.email}</span>
                </button>
              ))}
            </div>
          )}

          {selected.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {selected.map((c) => (
                <span key={c.id} className="inline-flex items-center gap-1.5 rounded-full bg-muted py-1 pl-3 pr-1.5 text-xs font-medium">
                  {fullName(c)}
                  <button
                    type="button"
                    onClick={() => setSelected((s) => s.filter((x) => x.id !== c.id))}
                    className="flex h-4 w-4 items-center justify-center rounded-full text-muted-foreground hover:bg-foreground/10 hover:text-foreground"
                    aria-label={`Retirer ${fullName(c)}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Sheet ───────────────────────────────────────────────────────────────────

export function PromotionSheet({
  open,
  onClose,
  promotion,
  initialStatus,
  initialTargetCustomer,
}: {
  open: boolean;
  onClose: () => void;
  promotion?: PromotionDto;
  initialStatus?: "active" | "draft";
  initialTargetCustomer?: CustomerDto;
}) {
  const isEditing = !!promotion;
  const create = useCreatePromotion();
  const update = useUpdatePromotion();

  const [name, setName]           = useState("");
  const [audience, setAudience]   = useState<Audience>("all");
  const [selected, setSelected]   = useState<CustomerDto[]>([]);
  const [scheduledAt, setScheduledAt] = useState("");
  const [expiresAt, setExpiresAt] = useState("");

  useEffect(() => {
    if (promotion) {
      setName(promotion.name);
      setAudience(promotion.audience as Audience);
      setScheduledAt(toDateInput(promotion.scheduledAt));
      setExpiresAt(toDateInput(promotion.expiresAt));
      setSelected(promotion.targetedCustomers ?? []);
    } else if (initialTargetCustomer) {
      setName("");
      setAudience("targeted");
      setSelected([initialTargetCustomer]);
      setScheduledAt("");
      setExpiresAt("");
    } else {
      setName("");
      setAudience("all");
      setSelected([]);
      setScheduledAt("");
      setExpiresAt("");
    }
  }, [promotion, initialTargetCustomer]);

  function handleClose() {
    setName(""); setAudience("all"); setSelected([]);
    setScheduledAt(""); setExpiresAt("");
    onClose();
  }

  const dateError = scheduledAt && expiresAt && expiresAt <= scheduledAt
    ? "La date d'expiration doit être postérieure à la date de démarrage."
    : null;

  const canSubmit =
    name.trim() &&
    (audience !== "targeted" || selected.length > 0) &&
    !dateError;

  function buildPayload() {
    return {
      name: name.trim(),
      audience,
      scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : undefined,
      expiresAt: expiresAt ? new Date(expiresAt).toISOString() : undefined,
      customerIds: audience === "targeted" ? selected.map((c) => c.id) : undefined,
    };
  }

  function handleSubmit(status?: "active" | "draft") {
    if (!canSubmit) return;
    if (isEditing) {
      update.mutate({ id: promotion!.id, ...buildPayload() }, { onSuccess: handleClose });
    } else {
      create.mutate({ ...buildPayload(), status: status ?? initialStatus ?? "active" }, { onSuccess: handleClose });
    }
  }

  const isPending = create.isPending || update.isPending;

  return (
    <Sheet open={open} onOpenChange={(v) => !v && handleClose()}>
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col p-0 gap-0">
        <SheetHeader className="px-6 py-5 border-b">
          <SheetTitle>{isEditing ? "Modifier la promotion" : "Nouvelle promotion"}</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          <div className="space-y-2">
            <Label>Nom</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="-20% sur les entrées" autoFocus />
          </div>

          <AudiencePicker audience={audience} setAudience={setAudience} selected={selected} setSelected={setSelected} />

          <div className="space-y-2">
            <Label>Date de démarrage</Label>
            <Input type="date" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} />
            <p className="text-xs text-muted-foreground">Laissez vide pour démarrer immédiatement.</p>
          </div>

          <div className="space-y-2">
            <Label>Date d&apos;expiration</Label>
            <Input type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} />
            {dateError ? (
              <p className="text-xs text-destructive">{dateError}</p>
            ) : (
              <p className="text-xs text-muted-foreground">Laissez vide pour une durée illimitée.</p>
            )}
          </div>
        </div>

        <div className="border-t px-6 py-4 flex gap-3">
          <Button variant="outline" className="flex-1" onClick={handleClose} disabled={isPending}>Annuler</Button>

          {isEditing ? (
            <Button className="flex-1" disabled={!canSubmit || isPending} onClick={() => handleSubmit()}>
              Enregistrer
            </Button>
          ) : (
            <div className="flex flex-1 gap-0">
              <Button
                className="flex-1 rounded-r-none"
                disabled={!canSubmit || isPending}
                onClick={() => handleSubmit()}
              >
                {initialStatus === "draft" ? "Enregistrer" : "Publier"}
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    className="rounded-l-none border-l border-primary-foreground/20 px-2"
                    disabled={!canSubmit || isPending}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleSubmit("active")}>Publier</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSubmit("draft")}>Enregister en brouillon</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
