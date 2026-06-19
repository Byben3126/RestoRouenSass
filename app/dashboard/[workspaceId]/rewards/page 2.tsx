"use client";

import { useState, useRef } from "react";
import { Plus, Sparkles, Lock, ImagePlus, X, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// ─── Types ───────────────────────────────────────────────────────────────────

type RewardStatus = "active" | "draft";
interface Reward {
  id: string; name: string; description: string;
  points: number; image: string; status: RewardStatus; claimed: number;
}

// ─── Data ────────────────────────────────────────────────────────────────────

const REWARDS: Reward[] = [
  { id:"1", name:"Café offert",      description:"Un espresso ou allongé à votre convenance.",    points:100,  image:"https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?w=800&q=85", status:"active", claimed:142 },
  { id:"2", name:"Dessert du jour",  description:"Le dessert de la carte au choix du chef.",      points:250,  image:"https://images.unsplash.com/photo-1551024601-bec78aea704b?w=800&q=85", status:"active", claimed:87  },
  { id:"3", name:"Entrée gratuite",  description:"Une entrée parmi notre sélection de saison.",  points:400,  image:"https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=85", status:"active", claimed:54  },
  { id:"4", name:"Bouteille de vin", description:"Une sélection de vins de notre cave.",          points:800,  image:"https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&q=85", status:"active", claimed:23  },
  { id:"5", name:"Menu dégustation", description:"Le menu complet 5 services pour 2 personnes.", points:2000, image:"https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=85", status:"draft",  claimed:0   },
  { id:"6", name:"Cours de cuisine", description:"2h en cuisine avec notre chef étoilé.",         points:3500, image:"https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=85", status:"draft",  claimed:0   },
];

// ─── Sheet ───────────────────────────────────────────────────────────────────

const ACCEPTED = ["image/png", "image/jpeg", "image/webp"];

function AddRewardSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [name, setName]       = useState("");
  const [desc, setDesc]       = useState("");
  const [points, setPoints]   = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef              = useRef<HTMLInputElement>(null);

  function reset() { setName(""); setDesc(""); setPoints(""); setPreview(null); }
  function handleClose() { reset(); onClose(); }

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f && ACCEPTED.includes(f.type)) setPreview(URL.createObjectURL(f));
    e.target.value = "";
  }

  return (
    <Sheet open={open} onOpenChange={v => !v && handleClose()}>
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col p-0 gap-0">
        <SheetHeader className="px-6 py-5 border-b">
          <SheetTitle>Nouvelle récompense</SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
          <div className="space-y-2">
            <Label>Photo</Label>
            <div onClick={() => inputRef.current?.click()}
              className={cn("relative w-full rounded-xl overflow-hidden border-2 border-dashed cursor-pointer transition-colors group",
                preview ? "border-transparent" : "border-input bg-muted/40 hover:bg-muted/60")}
              style={{ aspectRatio: "16/9" }}>
              {preview ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={preview} alt="" className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-xs text-white font-medium">Changer</span>
                  </div>
                  <button type="button" onClick={e => { e.stopPropagation(); setPreview(null); }}
                    className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-black/50 text-white">
                    <X className="h-3 w-3" />
                  </button>
                </>
              ) : (
                <div className="h-full flex flex-col items-center justify-center gap-1.5 text-muted-foreground">
                  <ImagePlus className="h-6 w-6" />
                  <p className="text-xs">Cliquez pour ajouter une photo</p>
                </div>
              )}
            </div>
            <input ref={inputRef} type="file" accept={ACCEPTED.join(",")} className="hidden" onChange={onFile} />
          </div>
          <div className="space-y-2">
            <Label>Nom</Label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="Café offert" autoFocus />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="Décrivez la récompense…" className="resize-none h-20" />
          </div>
          <div className="space-y-2">
            <Label>Points requis</Label>
            <div className="relative">
              <Input type="number" min={1} value={points} onChange={e => setPoints(e.target.value)} placeholder="100" className="pr-10" />
              <Sparkles className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-400 pointer-events-none" />
            </div>
          </div>
        </div>
        <div className="border-t px-6 py-4 flex gap-3">
          <Button variant="outline" className="flex-1" onClick={handleClose}>Annuler</Button>
          <Button className="flex-1" disabled={!name.trim() || !Number(points)}>Créer</Button>
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
      "group rounded-2xl overflow-hidden border bg-card shadow-sm",
      "transition-all duration-300 hover:shadow-lg",
      isDraft && "opacity-55",
    )}>

      {/* Image */}
      <div className="relative overflow-hidden" style={{ aspectRatio: "16/9" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={reward.image}
          alt={reward.name}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />

        {isDraft && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <Badge variant="secondary" className="gap-1.5 px-3 py-1.5 text-xs font-semibold shadow">
              <Lock className="h-3.5 w-3.5" /> Brouillon
            </Badge>
          </div>
        )}

        {!isDraft && (
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon" variant="secondary"
                  className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm shadow border-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Modifier</DropdownMenuItem>
                <DropdownMenuItem>Mettre en brouillon</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive">Archiver</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-5 flex flex-col gap-3">

        {/* Name + points */}
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-semibold text-base leading-snug">{reward.name}</h3>
          <div className="shrink-0 flex flex-col items-end">
            <div className="flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              <span className="text-xl font-bold leading-none tracking-tight">
                {reward.points.toLocaleString("fr-FR")}
              </span>
            </div>
            <span className="text-[11px] text-muted-foreground">points</span>
          </div>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed">{reward.description}</p>

        {reward.claimed > 0 && (
          <>
            <Separator />
            <p className="text-xs text-muted-foreground">
              Obtenu <span className="font-medium text-foreground">{reward.claimed}</span> fois
            </p>
          </>
        )}

      </div>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

type Filter = "all" | "active" | "draft";
const FILTERS: { value: Filter; label: string }[] = [
  { value: "all",    label: "Toutes"     },
  { value: "active", label: "Actives"    },
  { value: "draft",  label: "Brouillons" },
];

export default function RewardsPage() {
  const [filter, setFilter]   = useState<Filter>("all");
  const [sheetOpen, setSheet] = useState(false);
  const active   = REWARDS.filter(r => r.status === "active");
  const filtered = REWARDS.filter(r => filter === "all" || r.status === filter);

  return (
    <div className="space-y-6 pb-12">
      <AddRewardSheet open={sheetOpen} onClose={() => setSheet(false)} />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Récompenses</h1>
          <p className="text-sm text-muted-foreground">
            {active.length} actives · {REWARDS.length} au total
          </p>
        </div>
        <Button size="sm" className="gap-1.5" onClick={() => setSheet(true)}>
          <Plus className="h-4 w-4" /> Ajouter
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map(r => <RewardCard key={r.id} reward={r} />)}
      </div>
    </div>
  );
}
