"use client";

import { useState, useRef, useEffect } from "react";
import { Plus, MoreHorizontal, Sparkles, ImagePlus, X, Users, Loader2, Archive, FileText, ChevronDown } from "lucide-react";
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
import type { components } from "@/types/api.generated";
import { useRewards, useCreateReward, useUpdateReward, useArchiveReward, useDraftReward, usePublishReward } from "@/features/rewards/hooks";
import { uploadMedia } from "@/features/media/api";
import { toast } from "sonner";

type RewardDto = components["schemas"]["RewardDto"];

// ─── Default backgrounds ─────────────────────────────────────────────────────

const DEFAULT_GRADIENTS = [
  "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
  "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
  "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
  "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
  "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)",
];

function getDefaultGradient(id: string) {
  const index = id.charCodeAt(0) % DEFAULT_GRADIENTS.length;
  return DEFAULT_GRADIENTS[index];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatPoints(n: number) {
  return n.toLocaleString("fr-FR");
}

// ─── Add Reward Drawer ───────────────────────────────────────────────────────

const ACCEPTED = ["image/png", "image/jpeg", "image/webp"];
const POINT_PRESETS = [100, 250, 500, 1000];

function RewardSheet({ open, onClose, reward, initialStatus = 'active' }: {
  open: boolean;
  onClose: () => void;
  reward?: RewardDto;
  initialStatus?: 'active' | 'draft';
}) {
  const isEdit = !!reward;

  const [name, setName]         = useState(reward?.name ?? "");
  const [description, setDesc]  = useState(reward?.description ?? "");
  const [points, setPoints]     = useState(reward?.pointRequired ? String(reward.pointRequired) : "");
  const [preview, setPreview]   = useState<string | null>(reward?.medias?.[0]?.url ?? null);
  const [file, setFile]         = useState<File | null>(null);
  const inputRef                = useRef<HTMLInputElement>(null);

  const { mutateAsync: create, isPending: isCreating } = useCreateReward();
  const { mutateAsync: update, isPending: isUpdating } = useUpdateReward();
  const isPending = isCreating || isUpdating;

  // Sync form when reward changes (edit mode)
  useEffect(() => {
    setName(reward?.name ?? "");
    setDesc(reward?.description ?? "");
    setPoints(reward?.pointRequired ? String(reward.pointRequired) : "");
    setPreview(reward?.medias?.[0]?.url ?? null);
  }, [reward]);

  function reset() { setName(""); setDesc(""); setPoints(""); setPreview(null); setFile(null); }
  function handleClose() { if (!isEdit) reset(); onClose(); }

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f && ACCEPTED.includes(f.type)) {
      setFile(f);
      setPreview(URL.createObjectURL(f));
    }
    e.target.value = "";
  }

  async function handleSubmit() {
    try {
      let mediaIds: string[] | undefined;

      if (file) {
        const { mediaId } = await uploadMedia(file);
        mediaIds = [mediaId];
      } else if (isEdit && preview === null) {
        mediaIds = [];
      }

      if (isEdit) {
        await update({ id: reward.id, name: name.trim(), description: description.trim() || undefined, pointRequired: Number(points), mediaIds });
        toast.success("Récompense modifiée.");
      } else {
        await create({ name: name.trim(), description: description.trim() || undefined, pointRequired: Number(points), status: initialStatus, mediaIds });
        toast.success(initialStatus === 'draft' ? "Brouillon enregistré." : "Récompense créée.");
        reset();
      }
      onClose();
    } catch {
      toast.error("Une erreur est survenue.");
    }
  }

  const canSubmit = name.trim() && Number(points) > 0;

  return (
    <Sheet open={open} onOpenChange={(v) => !v && handleClose()}>
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col p-0 gap-0">

        <SheetHeader className="px-6 py-5 border-b">
          <SheetTitle>
            {isEdit ? "Modifier la récompense" : initialStatus === 'draft' ? "Nouveau brouillon" : "Nouvelle récompense"}
          </SheetTitle>
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
                    onClick={(e) => { e.stopPropagation(); setPreview(null); setFile(null); }}
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
            <div className="flex items-baseline justify-between">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">Description</Label>
              <span className="text-[11px] text-muted-foreground tabular-nums">{description.length}/120</span>
            </div>
            <Textarea
              value={description}
              maxLength={120}
              onChange={e => setDesc(e.target.value)}
              placeholder="Décrivez la récompense en quelques mots…"
              className="resize-none h-24 text-sm"
            />
          </div>

          {/* Points */}
          <div className="space-y-2">
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
            <div className="flex flex-wrap gap-1.5">
              {POINT_PRESETS.map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setPoints(String(v))}
                  className={cn(
                    "rounded-md border px-2.5 py-1 text-xs font-medium transition-colors",
                    Number(points) === v
                      ? "border-foreground bg-foreground text-background"
                      : "border-border text-muted-foreground hover:border-foreground/35 hover:text-foreground",
                  )}
                >
                  {v.toLocaleString("fr-FR")}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="border-t px-6 py-4 flex gap-3">
          <Button variant="outline" className="flex-1" onClick={handleClose} disabled={isPending}>Annuler</Button>
          <Button className="flex-1 gap-2" disabled={!canSubmit || isPending} onClick={handleSubmit}>
            {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {isEdit ? "Enregistrer" : "Créer"}
          </Button>
        </div>

      </SheetContent>
    </Sheet>
  );
}

// ─── Card ────────────────────────────────────────────────────────────────────

function RewardCard({ reward, onEdit, onArchive, onDraft, onPublish }: {
  reward: RewardDto;
  onEdit: (reward: RewardDto) => void;
  onArchive: (id: string) => void;
  onDraft: (id: string) => void;
  onPublish: (id: string) => void;
}) {
  const firstImage = reward.medias?.[0]?.url;
  const isDisabled = reward.status !== "active";

  return (
    <div className={cn(
      "group relative flex flex-col rounded-2xl overflow-hidden border bg-card transition-all duration-300 hover:shadow-xl hover:-translate-y-1",
      isDisabled && "opacity-60"
    )}>

      {/* Image / default gradient */}
      <div className="relative overflow-hidden" style={{ aspectRatio: "4/3" }}>
        {firstImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={firstImage}
            alt={reward.name}
            className={cn(
              "h-full w-full object-cover transition-transform duration-500 group-hover:scale-105",
              isDisabled && "grayscale"
            )}
          />
        ) : (
          <div
            className={cn(
              "h-full w-full transition-transform duration-500 group-hover:scale-105",
              isDisabled && "grayscale"
            )}
            style={{ background: getDefaultGradient(reward.id) }}
          />
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/10 to-transparent" />

        {/* Status badge */}
        {reward.status === "archived" && (
          <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-black/50 backdrop-blur-sm px-2.5 py-1">
            <Archive className="h-3 w-3 text-white/80" />
            <span className="text-[10px] font-medium text-white/80">Archivé</span>
          </div>
        )}
        {reward.status === "draft" && (
          <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-black/50 backdrop-blur-sm px-2.5 py-1">
            <FileText className="h-3 w-3 text-white/80" />
            <span className="text-[10px] font-medium text-white/80">Brouillon</span>
          </div>
        )}

        {/* Points badge */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 px-3 py-1.5">
          <Sparkles className="h-3.5 w-3.5 text-amber-300" />
          <span className="text-sm font-bold text-white">
            {formatPoints(reward.pointRequired)} pts
          </span>
        </div>

        {/* Menu */}
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex h-7 w-7 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm text-white hover:bg-black/60 transition-colors">
                <MoreHorizontal className="h-3.5 w-3.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="text-sm">
              <DropdownMenuItem onClick={() => onEdit(reward)}>Modifier</DropdownMenuItem>
              {reward.status !== "active"   && <DropdownMenuItem onClick={() => onPublish(reward.id)}>Publier</DropdownMenuItem>}
              {reward.status !== "draft"    && <DropdownMenuItem onClick={() => onDraft(reward.id)}>Mettre en brouillon</DropdownMenuItem>}
              {reward.status !== "archived" && <DropdownMenuItem className="text-destructive" onClick={() => onArchive(reward.id)}>Archiver</DropdownMenuItem>}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <p className="font-semibold text-sm leading-snug truncate">{reward.name}</p>
        {reward.description && (
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{reward.description}</p>
        )}

        <div className="mt-auto flex items-center gap-1.5 pt-3 border-t">
          <Users className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-[11px] text-muted-foreground">
            <span className="font-semibold text-foreground">{formatPoints(reward.usedCount)}</span> échanges
          </span>
        </div>
      </div>

    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

type Filter = "active" | "draft" | "archived";

const FILTERS: { value: Filter; label: string }[] = [
  { value: "active",   label: "Actifs" },
  { value: "draft",    label: "Brouillons" },
  { value: "archived", label: "Archivés" },
];

export default function RewardsPage() {
  const [filter, setFilter] = useState<Filter>("active");
  const [selectedReward, setSelectedReward] = useState<RewardDto | undefined>(undefined);
  const [initialStatus, setInitialStatus] = useState<'active' | 'draft'>('active');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { data: rewards = [], isLoading } = useRewards();
  const { mutate: archive } = useArchiveReward();
  const { mutate: draft }   = useDraftReward();
  const { mutate: publish } = usePublishReward();

  const filtered = rewards.filter((r) => r.status === filter);

  function openCreate(status: 'active' | 'draft' = 'active') { setSelectedReward(undefined); setInitialStatus(status); setDrawerOpen(true); }
  function openEdit(reward: RewardDto) { setSelectedReward(reward); setDrawerOpen(true); }
  function handleClose() { setDrawerOpen(false); }

  return (
    <div className="space-y-6 pb-12">

      <RewardSheet open={drawerOpen} onClose={handleClose} reward={selectedReward} initialStatus={initialStatus} />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Récompenses</h1>
          <p className="text-sm text-muted-foreground">
{(() => {
              if (isLoading) return "Chargement…";
              const count = rewards.filter(r => r.status === "active").length;
              return `${count} récompense${count > 1 ? "s" : ""} active${count > 1 ? "s" : ""}`;
            })()}
          </p>
        </div>
        <div className="flex items-center">
          <Button size="sm" className="gap-1.5 rounded-r-none border-r-0" onClick={() => openCreate('active')}>
            <Plus className="h-4 w-4" />
            Ajouter
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" className="rounded-l-none px-2">
                <ChevronDown className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="text-sm">
              <DropdownMenuItem onClick={() => openCreate('active')}>
                <Sparkles className="h-3.5 w-3.5 mr-2 text-amber-400" />
                Récompense active
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => openCreate('draft')}>
                <FileText className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                Brouillon
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
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
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-2xl border bg-muted/20 animate-pulse" style={{ aspectRatio: "4/3" }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center gap-2">
          <Sparkles className="h-8 w-8 text-muted-foreground/40" />
          <p className="text-sm font-medium">Aucune récompense</p>
          <p className="text-xs text-muted-foreground">Créez votre première récompense pour fidéliser vos clients.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((reward) => (
            <RewardCard key={reward.id} reward={reward} onEdit={openEdit} onArchive={archive} onDraft={draft} onPublish={publish} />
          ))}
        </div>
      )}

    </div>
  );
}
