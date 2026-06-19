"use client";

import { useState } from "react";
import { Plus, Users, User, Clock, Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription,
} from "@/components/ui/card";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// ─── Types ───────────────────────────────────────────────────────────────────

type PromotionStatus = "active" | "expired" | "draft";

interface Promotion {
  id: string;
  name: string;
  forEveryone: boolean;
  expiresAt?: Date;
  createdAt: Date;
  usedCount: number;
  targetCount?: number;
  status: PromotionStatus;
}

// ─── Fixtures ────────────────────────────────────────────────────────────────

const now = new Date();
const d = (n: number) => new Date(now.getTime() + n * 86400000);

const PROMOTIONS: Promotion[] = [
  { id:"1", name:"-20% sur les entrées",        forEveryone:true,  expiresAt:d(3),   createdAt:d(-10), usedCount:84,  status:"active"  },
  { id:"2", name:"Menu midi à 12€",             forEveryone:true,  expiresAt:d(21),  createdAt:d(-5),  usedCount:210, status:"active"  },
  { id:"3", name:"Dessert offert — fidèles",    forEveryone:false, expiresAt:d(14),  createdAt:d(-3),  usedCount:17,  targetCount:42,  status:"active"  },
  { id:"4", name:"Happy hour 17h–19h",          forEveryone:true,  expiresAt:d(60),  createdAt:d(-1),  usedCount:5,   status:"active"  },
  { id:"5", name:"Anniversaire — repas offert", forEveryone:false, expiresAt:d(90),  createdAt:d(-2),  usedCount:3,   targetCount:8,   status:"draft"   },
  { id:"6", name:"Saint-Valentin — bouteille",  forEveryone:true,  expiresAt:d(-5),  createdAt:d(-40), usedCount:56,  status:"expired" },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function daysLeft(date?: Date) {
  if (!date) return null;
  return Math.ceil((date.getTime() - Date.now()) / 86400000);
}

function formatDate(d: Date) {
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

// ─── Sheet ───────────────────────────────────────────────────────────────────

function AddPromotionSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [name, setName]               = useState("");
  const [forEveryone, setForEveryone] = useState(true);
  const [expiresAt, setExpiresAt]     = useState("");

  function reset() { setName(""); setForEveryone(true); setExpiresAt(""); }
  function handleClose() { reset(); onClose(); }

  return (
    <Sheet open={open} onOpenChange={v => !v && handleClose()}>
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col p-0 gap-0">
        <SheetHeader className="px-6 py-5 border-b">
          <SheetTitle>Nouvelle promotion</SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          <div className="space-y-2">
            <Label>Nom</Label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="-20% sur les entrées" autoFocus />
          </div>
          <div className="space-y-3">
            <Label>Audience</Label>
            <div className="flex items-center justify-between rounded-lg border p-4 bg-muted/20">
              <div className="space-y-0.5">
                <p className="text-sm font-medium">{forEveryone ? "Pour tous les clients" : "Clients ciblés"}</p>
                <p className="text-xs text-muted-foreground">
                  {forEveryone ? "Visible par tous vos clients." : "Vous assignerez les clients après création."}
                </p>
              </div>
              <Switch checked={forEveryone} onCheckedChange={setForEveryone} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Date d'expiration</Label>
            <Input type="date" value={expiresAt} onChange={e => setExpiresAt(e.target.value)} />
            <p className="text-xs text-muted-foreground">Laissez vide pour une durée illimitée.</p>
          </div>
        </div>
        <div className="border-t px-6 py-4 flex gap-3">
          <Button variant="outline" className="flex-1" onClick={handleClose}>Annuler</Button>
          <Button className="flex-1" disabled={!name.trim()}>Créer</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ─── Card ────────────────────────────────────────────────────────────────────

function PromotionCard({ promo }: { promo: Promotion }) {
  const days    = daysLeft(promo.expiresAt);
  const urgent  = days !== null && days <= 3 && days > 0;
  const expired = promo.status === "expired";
  const draft   = promo.status === "draft";
  const faded   = expired || draft;

  return (
    <Card className={cn("transition-all duration-200 hover:shadow-md", faded && "opacity-60")}>
      <CardHeader className="pb-3">

        {/* Top row: audience badge + status */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {promo.forEveryone ? (
              <Badge variant="secondary" className="gap-1 font-normal">
                <Users className="h-3 w-3" /> Pour tous
              </Badge>
            ) : (
              <Badge variant="secondary" className="gap-1 font-normal">
                <User className="h-3 w-3" /> {promo.targetCount ?? 0} ciblés
              </Badge>
            )}
            {draft && <Badge variant="outline" className="text-muted-foreground font-normal">Brouillon</Badge>}
            {urgent && (
              <Badge variant="destructive" className="gap-1 font-normal">
                <Flame className="h-3 w-3" /> Expire bientôt
              </Badge>
            )}
          </div>

          {/* Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground">
                <span className="text-base leading-none">···</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Modifier</DropdownMenuItem>
              <DropdownMenuItem>Dupliquer</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">Supprimer</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Name */}
        <CardTitle className="text-base leading-snug pt-1">{promo.name}</CardTitle>
      </CardHeader>

      <CardContent className="pb-0">
        <Separator />
      </CardContent>

      <CardFooter className="pt-3 flex items-center justify-between text-xs text-muted-foreground">
        <span>
          <span className="font-semibold text-foreground">{promo.usedCount}</span> utilisations
        </span>

        {promo.expiresAt && (
          <span className={cn(
            "flex items-center gap-1",
            urgent && "text-destructive font-medium",
            expired && "line-through",
          )}>
            <Clock className="h-3 w-3" />
            {expired
              ? "Expirée"
              : days === 0
                ? "Expire aujourd'hui"
                : days !== null && days > 0
                  ? `${days}j restants`
                  : ""}
            {" · "}{formatDate(promo.expiresAt)}
          </span>
        )}
      </CardFooter>
    </Card>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

type Filter = "all" | "active" | "expired" | "draft";
const FILTERS: { value: Filter; label: string }[] = [
  { value: "all",     label: "Toutes"    },
  { value: "active",  label: "Actives"   },
  { value: "expired", label: "Expirées"  },
  { value: "draft",   label: "Brouillons"},
];

export default function PromotionsPage() {
  const [filter, setFilter]       = useState<Filter>("all");
  const [sheetOpen, setSheetOpen] = useState(false);

  const filtered = PROMOTIONS.filter(p => filter === "all" || p.status === filter);

  return (
    <div className="space-y-6 pb-12">
      <AddPromotionSheet open={sheetOpen} onClose={() => setSheetOpen(false)} />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Promotions</h1>
          <p className="text-sm text-muted-foreground">
            {PROMOTIONS.filter(p => p.status === "active").length} actives · {PROMOTIONS.length} au total
          </p>
        </div>
        <Button size="sm" className="gap-1.5" onClick={() => setSheetOpen(true)}>
          <Plus className="h-4 w-4" /> Créer
        </Button>
      </div>

      <div className="flex gap-1.5">
        {FILTERS.map(f => (
          <button key={f.value} type="button" onClick={() => setFilter(f.value)}
            className={cn(
              "rounded-lg border px-3 py-1.5 text-xs transition-all",
              filter === f.value
                ? "border-foreground bg-foreground text-background font-medium"
                : "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground"
            )}>
            {f.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(promo => <PromotionCard key={promo.id} promo={promo} />)}
      </div>
    </div>
  );
}
