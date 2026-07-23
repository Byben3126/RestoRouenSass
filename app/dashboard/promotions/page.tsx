"use client";

import { useState } from "react";
import {
  Archive, ChevronDown, Clock, Moon, MoreHorizontal,
  Plus, User, Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  usePromotions,
  useArchivePromotion,
  useDraftPromotion,
  usePublishPromotion,
} from "@/features/promotions/hooks";
import type { PromotionDto, PromotionDisplayStatus } from "@/features/promotions/api";
import { PromotionSheet } from "@/features/promotions/components/promotion-sheet";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function daysLeft(date?: string | null) {
  if (!date) return null;
  return Math.ceil((new Date(date).getTime() - Date.now()) / 86400000);
}
function formatDate(date: string) {
  return new Date(date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
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
