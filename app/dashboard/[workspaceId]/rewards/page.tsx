"use client";

import { useState, useRef } from "react";
import { Plus, MoreHorizontal, Sparkles, Lock, ImagePlus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// ─── Types ───────────────────────────────────────────────────────────────────

type RewardStatus = "active" | "draft" | "archived";

interface Reward {
  id: string;
  name: string;
  description: string;
  points: number;
  image: string;
  status: RewardStatus;
  claimed: number;
}

// ─── Fixtures ────────────────────────────────────────────────────────────────

const REWARDS: Reward[] = [
  {
    id: "1",
    name: "Café offert",
    description: "Un espresso ou allongé à votre convenance.",
    points: 100,
    image: "https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?w=600&q=80",
    status: "active",
    claimed: 142,
  },
  {
    id: "2",
    name: "Dessert du jour",
    description: "Le dessert de la carte au choix du chef.",
    points: 250,
    image: "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=600&q=80",
    status: "active",
    claimed: 87,
  },
  {
    id: "3",
    name: "Entrée gratuite",
    description: "Une entrée parmi notre sélection de saison.",
    points: 400,
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80",
    status: "active",
    claimed: 54,
  },
  {
    id: "4",
    name: "Bouteille de vin",
    description: "Une sélection de vins de notre cave.",
    points: 800,
    image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600&q=80",
    status: "active",
    claimed: 23,
  },
  {
    id: "5",
    name: "Menu dégustation",
    description: "Le menu complet 5 services pour 2 personnes.",
    points: 2000,
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80",
    status: "draft",
    claimed: 0,
  },
  {
    id: "6",
    name: "Cours de cuisine",
    description: "2h en cuisine avec notre chef étoilé.",
    points: 3500,
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80",
    status: "draft",
    claimed: 0,
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<RewardStatus, { label: string; className: string }> = {
  active:   { label: "Actif",    className: "bg-emerald-500/15 text-emerald-600" },
  draft:    { label: "Brouillon", className: "bg-zinc-500/10 text-zinc-500" },
  archived: { label: "Archivé",  className: "bg-zinc-300/20 text-zinc-400" },
};

function formatPoints(n: number) {
  return n.toLocaleString("fr-FR");
}

// ─── Add Reward Drawer ───────────────────────────────────────────────────────

const ACCEPTED = ["image/png", "image/jpeg", "image/webp"];

function AddRewardSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [name, setName]        = useState("");
  const [description, setDesc] = useState("");
  const [points, setPoints]    = useState("");
  const [preview, setPreview]  = useState<string | null>(null);
  const inputRef               = useRef<HTMLInputElement>(null);

  function reset() { setName(""); setDesc(""); setPoints(""); setPreview(null); }
  function handleClose() { reset(); onClose(); }

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f && ACCEPTED.includes(f.type)) setPreview(URL.createObjectURL(f));
    e.target.value = "";
  }

  const canSubmit = name.trim() && Number(points) > 0;

  return (
    <Sheet open={open} onOpenChange={(v) => !v && handleClose()}>
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col p-0 gap-0">

        <SheetHeader className="px-6 py-5 border-b">
          <SheetTitle>Nouvelle récompense</SheetTitle>
        </SheetHeader>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">

          {/* Photo */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground uppercase tracking-wider">Photo</Label>
            <div
              onClick={() => inputRef.current?.click()}
              className={cn(
                "relative w-full rounded-xl overflow-hidden border-2 border-dashed cursor-pointer transition-all group",
                preview
                  ? "border-transparent"
                  : "border-muted-foreground/20 bg-muted/10 hover:bg-muted/20 hover:border-muted-foreground/30"
              )}
              style={{ aspectRatio: "16/9" }}
            >
              {preview ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={preview} alt="" className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-xs text-white font-medium">Changer la photo</span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setPreview(null); }}
                    className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </>
              ) : (
                <div className="h-full flex flex-col items-center justify-center gap-2 text-muted-foreground/40">
                  <ImagePlus className="h-8 w-8" />
                  <p className="text-xs">Cliquez pour ajouter une photo</p>
                </div>
              )}
            </div>
            <input ref={inputRef} type="file" accept={ACCEPTED.join(",")} className="hidden" onChange={onFile} />
          </div>

          {/* Nom */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground uppercase tracking-wider">Nom *</Label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="Café offert" className="h-9" autoFocus />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground uppercase tracking-wider">Description</Label>
            <Textarea
              value={description}
              onChange={e => setDesc(e.target.value)}
              placeholder="Décrivez la récompense en quelques mots…"
              className="resize-none h-24 text-sm"
            />
          </div>

          {/* Points */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground uppercase tracking-wider">Points requis *</Label>
            <div className="relative">
              <Input
                type="number"
                min={1}
                value={points}
                onChange={e => setPoints(e.target.value)}
                placeholder="100"
                className="h-9 pr-10"
              />
              <Sparkles className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-amber-400 pointer-events-none" />
            </div>
            <p className="text-xs text-muted-foreground">Nombre de points qu'un client doit accumuler pour obtenir cette récompense.</p>
          </div>

        </div>

        {/* Footer */}
        <div className="border-t px-6 py-4 flex gap-3">
          <Button variant="outline" className="flex-1" onClick={handleClose}>Annuler</Button>
          <Button className="flex-1" disabled={!canSubmit}>Créer</Button>
        </div>

      </SheetContent>
    </Sheet>
  );
}

// ─── Card ────────────────────────────────────────────────────────────────────

function RewardCard({ reward }: { reward: Reward }) {
  const isDraft = reward.status === "draft";

  return (
    <div className={cn(
      "group relative flex flex-col rounded-2xl overflow-hidden border bg-card transition-all duration-300",
      "hover:shadow-xl hover:-translate-y-1",
      isDraft && "opacity-60"
    )}>

      {/* Image */}
      <div className="relative overflow-hidden" style={{ aspectRatio: "4/3" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={reward.image}
          alt={reward.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Gradient */}
        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/10 to-transparent" />

        {/* Points badge */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 px-3 py-1.5">
          <Sparkles className="h-3.5 w-3.5 text-amber-300" />
          <span className="text-sm font-bold text-white">
            {formatPoints(reward.points)} pts
          </span>
        </div>

        {/* Draft lock */}
        {isDraft && (
          <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-black/40 backdrop-blur-sm px-2.5 py-1">
            <Lock className="h-3 w-3 text-white/70" />
            <span className="text-[10px] text-white/70 font-medium">Brouillon</span>
          </div>
        )}

        {/* Menu */}
        {!isDraft && (
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex h-7 w-7 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm text-white hover:bg-black/60 transition-colors">
                  <MoreHorizontal className="h-3.5 w-3.5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="text-sm">
                <DropdownMenuItem>Modifier</DropdownMenuItem>
                <DropdownMenuItem>Mettre en brouillon</DropdownMenuItem>
                <DropdownMenuItem className="text-destructive">Archiver</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <div className="flex items-start justify-between gap-2">
          <p className="font-semibold text-sm leading-snug">{reward.name}</p>
          <span className={cn(
            "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium",
            STATUS_CONFIG[reward.status].className
          )}>
            {STATUS_CONFIG[reward.status].label}
          </span>
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed">{reward.description}</p>

        {reward.claimed > 0 && (
          <p className="text-[10px] text-muted-foreground/60 mt-auto pt-2 border-t">
            Obtenu {reward.claimed} fois
          </p>
        )}
      </div>

    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

type Filter = "all" | "active" | "draft";

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all",    label: "Tous" },
  { value: "active", label: "Actifs" },
  { value: "draft",  label: "Brouillons" },
];

export default function RewardsPage() {
  const [filter, setFilter] = useState<Filter>("all");
  const [drawerOpen, setDrawerOpen] = useState(false);

  const filtered = REWARDS.filter((r) => filter === "all" || r.status === filter);

  return (
    <div className="space-y-6 pb-12">

      <AddRewardSheet open={drawerOpen} onClose={() => setDrawerOpen(false)} />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Récompenses</h1>
          <p className="text-sm text-muted-foreground">
            {REWARDS.filter(r => r.status === "active").length} actives · {REWARDS.length} au total
          </p>
        </div>
        <Button size="sm" className="gap-1.5" onClick={() => setDrawerOpen(true)}>
          <Plus className="h-4 w-4" />
          Ajouter
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-1.5">
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

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((reward) => (
          <RewardCard key={reward.id} reward={reward} />
        ))}
      </div>

    </div>
  );
}
