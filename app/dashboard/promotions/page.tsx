"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Archive, ChevronDown, Clock, Moon, MoreHorizontal,
  Plus, Search, User, Users, X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";

import type { components } from "@/types/api.generated";
import { useCustomers } from "@/features/customers/hooks";
import {
  usePromotions,
  useCreatePromotion,
  useUpdatePromotion,
  useArchivePromotion,
  useDraftPromotion,
  usePublishPromotion,
} from "@/features/promotions/hooks";
import type { PromotionDto, PromotionDisplayStatus, PromotionTargetedCustomer } from "@/features/promotions/api";

type CustomerDto = components["schemas"]["CustomerDto"];
type Audience = "all" | "inactive" | "targeted";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function daysLeft(date?: string | null) {
  if (!date) return null;
  return Math.ceil((new Date(date).getTime() - Date.now()) / 86400000);
}
function formatDate(date: string) {
  return new Date(date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}
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

const TICKET_CSS = `
.tkt-perf{position:relative;height:0;border-top:1.5px dashed var(--border);}
.tkt-notch{position:absolute;overflow:hidden;pointer-events:none;top:0;transform:translateY(-50%);width:11px;height:20px;}
.tkt-notch::before{content:"";position:absolute;width:20px;height:20px;border-radius:9999px;background:var(--background);box-shadow:inset 0 0 0 1px var(--border);}
.tkt-notch.l{left:-1px;}
.tkt-notch.l::before{left:-10px;top:0;}
.tkt-notch.r{right:-1px;}
.tkt-notch.r::before{right:-10px;top:0;}
`;

// ─── Time pill ───────────────────────────────────────────────────────────────

function TimePill({ promo }: { promo: PromotionDto }) {
  const days = daysLeft(promo.expiresAt);
  const urgent = promo.status === "active" && days !== null && days <= 3 && days > 0;

  let label = "";
  if (promo.status === "expired") label = "Expirée";
  else if (promo.status === "draft") label = "Brouillon";
  else if (promo.status === "archived") label = "Archivée";
  else if (promo.status === "upcoming") label = promo.scheduledAt ? `Démarre le ${formatDate(promo.scheduledAt)}` : "À venir";
  else if (urgent) label = `${days} j restants`;
  else if (days === 0) label = "Expire aujourd'hui";
  else if (promo.expiresAt) label = `Jusqu'au ${formatDate(promo.expiresAt)}`;
  else label = "Sans limite";

  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap",
      urgent ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground",
      promo.status === "expired" && "line-through",
    )}>
      <Clock className="h-3 w-3" />
      {label}
    </span>
  );
}

// ─── Audience badge ───────────────────────────────────────────────────────────

function AudienceBadge({ promo }: { promo: PromotionDto }) {
  if (promo.audience === "all") {
    return (
      <Badge variant="secondary" className="gap-1 font-normal">
        <Users className="h-3 w-3" /> Pour tous
      </Badge>
    );
  }
  if (promo.audience === "inactive") {
    return (
      <Badge variant="secondary" className="gap-1 font-normal">
        <Moon className="h-3 w-3" /> Clients inactifs
      </Badge>
    );
  }
  return (
    <Badge variant="secondary" className="gap-1 font-normal">
      <User className="h-3 w-3" /> {promo.targetCount} ciblés
    </Badge>
  );
}

// ─── Card ────────────────────────────────────────────────────────────────────

function PromotionCard({
  promo,
  onEdit,
}: {
  promo: PromotionDto;
  onEdit: (p: PromotionDto) => void;
}) {
  const archive = useArchivePromotion();
  const draft = useDraftPromotion();
  const publish = usePublishPromotion();

  const canArchive = promo.status === "active" || promo.status === "upcoming" || promo.status === "draft";
  const canDraft = promo.status === "active" || promo.status === "upcoming";
  const canPublish = promo.status === "draft" || promo.status === "archived";

  const dim = promo.status === "draft" || promo.status === "archived" || promo.status === "expired";

  return (
    <div className={cn(
      "group relative flex flex-col rounded-xl border bg-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md",
      dim && "opacity-70",
    )}>
      <div className="flex flex-col gap-3 p-4 pb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <AudienceBadge promo={promo} />
          {promo.status === "draft" && (
            <Badge variant="outline" className="font-normal text-muted-foreground">Brouillon</Badge>
          )}
          {promo.status === "archived" && (
            <Badge variant="outline" className="gap-1 font-normal text-muted-foreground">
              <Archive className="h-3 w-3" /> Archivée
            </Badge>
          )}

          <div className="ml-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(promo)}>Modifier</DropdownMenuItem>
                {canPublish && (
                  <DropdownMenuItem onClick={() => publish.mutate(promo.id)}>Publier</DropdownMenuItem>
                )}
                {canDraft && (
                  <DropdownMenuItem onClick={() => draft.mutate(promo.id)}>Passer en brouillon</DropdownMenuItem>
                )}
                {canArchive && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => archive.mutate(promo.id)}
                    >
                      Archiver
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <h3 className={cn(
          "text-lg font-semibold leading-tight tracking-tight line-clamp-2",
          dim && "text-muted-foreground",
        )}>
          {promo.name}
        </h3>
      </div>

      <div className="tkt-perf">
        <span className="tkt-notch l" />
        <span className="tkt-notch r" />
      </div>

      <div className="flex items-center justify-between gap-3 p-4 pt-3">
        <span className="text-sm text-muted-foreground">
          <b className="font-semibold text-foreground">{promo.usedCount}</b> utilisations
        </span>
        <TimePill promo={promo} />
      </div>
    </div>
  );
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

function PromotionSheet({
  open,
  onClose,
  promotion,
  initialStatus,
}: {
  open: boolean;
  onClose: () => void;
  promotion?: PromotionDto;
  initialStatus?: "active" | "draft";
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
    } else {
      setName("");
      setAudience("all");
      setSelected([]);
      setScheduledAt("");
      setExpiresAt("");
    }
  }, [promotion]);

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

// ─── Page ────────────────────────────────────────────────────────────────────

type Filter = "active" | "upcoming" | "expired" | "draft" | "archived";

const FILTERS: { value: Filter; label: string }[] = [
  { value: "active",   label: "Actives"   },
  { value: "upcoming", label: "À venir"   },
  { value: "expired",  label: "Expirées"  },
  { value: "draft",    label: "Brouillons"},
  { value: "archived", label: "Archivées" },
];

export default function PromotionsPage() {
  const [filter, setFilter]       = useState<Filter>("active");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing]     = useState<PromotionDto | undefined>();
  const [initStatus, setInitStatus] = useState<"active" | "draft">("active");

  const { data: promotions = [] } = usePromotions();
  const filtered = promotions.filter((p) => (p.status as PromotionDisplayStatus) === filter);
  const activeCount = promotions.filter((p) => p.status === "active").length;

  function openCreate(status: "active" | "draft" = "active") {
    setEditing(undefined);
    setInitStatus(status);
    setSheetOpen(true);
  }

  function openEdit(promo: PromotionDto) {
    setEditing(promo);
    setSheetOpen(true);
  }

  return (
    <div className="space-y-6 pb-12">
      <style>{TICKET_CSS}</style>

      <PromotionSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        promotion={editing}
        initialStatus={initStatus}
      />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Promotions</h1>
          <p className="text-sm text-muted-foreground">
            {activeCount} promotion{activeCount !== 1 ? "s" : ""} active{activeCount !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="flex gap-0">
          <Button size="sm" className="rounded-r-none gap-1.5" onClick={() => openCreate("active")}>
            <Plus className="h-4 w-4" /> Créer
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" className="rounded-l-none border-l border-primary-foreground/20 px-2">
                <ChevronDown className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {/* <DropdownMenuItem onClick={() => openCreate("active")}>Publier</DropdownMenuItem> */}
              <DropdownMenuItem onClick={() => openCreate("draft")}>Enregistrer en brouillon</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="flex gap-1.5 flex-wrap">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setFilter(f.value)}
            className={cn(
              "rounded-lg border px-3 py-1.5 text-xs transition-all",
              filter === f.value
                ? "border-foreground bg-foreground text-background font-medium"
                : "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground py-8 text-center">Aucune promotion dans cet onglet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((promo) => (
            <PromotionCard key={promo.id} promo={promo} onEdit={openEdit} />
          ))}
        </div>
      )}
    </div>
  );
}
