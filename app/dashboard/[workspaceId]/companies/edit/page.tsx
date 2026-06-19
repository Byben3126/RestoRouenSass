"use client";

import { useState, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import {
  Mail,
  Hash,
  FileText,
  Utensils,
  Zap,
  Wine,
  Hotel,
  MoreHorizontal,
  Loader2,
  Trash2,
  Phone,
  MapPin,
  Upload,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";

// ─── Constants ───────────────────────────────────────────────────────────────

const ESTABLISHMENT_TYPES = [
  { value: "restaurant", label: "Restaurant Gastronomique", icon: Utensils },
  { value: "fastfood",   label: "Restauration Rapide",      icon: Zap },
  { value: "bar",        label: "Bar / Brasserie",          icon: Wine },
  { value: "hotel",      label: "Hôtel",                   icon: Hotel },
  { value: "other",      label: "Autre",                   icon: MoreHorizontal },
];

const DESCRIPTION_MAX = 300;
const ACCEPTED_TYPES  = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"];
const MAX_SIZE_MB      = 2;

// ─── Fixture (remplacer par l'API) ───────────────────────────────────────────

const CURRENT_COMPANY = {
  name:        "Le Petit Bistrot",
  type:        "restaurant",
  email:       "direction@lepetitbistrot.fr",
  phone:       "01 42 36 12 00",
  siret:       "123 456 789 00012",
  address:     "14 rue du Faubourg Saint-Antoine, 75011 Paris",
  description: "Restaurant gastronomique au cœur de Paris, spécialisé dans la cuisine française de saison.",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatSiret(raw: string) {
  const digits = raw.replace(/\D/g, "").slice(0, 14);
  const parts = [digits.slice(0, 3), digits.slice(3, 6), digits.slice(6, 9), digits.slice(9, 14)];
  return parts.filter(Boolean).join(" ");
}

// ─── Components ──────────────────────────────────────────────────────────────

function Section({ title, description, children }: {
  title: string; description?: string; children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div>
        <p className="text-sm font-medium">{title}</p>
        {description && <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{description}</p>}
      </div>
      <div className="md:col-span-2 space-y-4">{children}</div>
    </div>
  );
}

function FieldLabel({ icon: Icon, children }: { icon: React.ElementType; children: React.ReactNode }) {
  return (
    <Label className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <Icon className="h-3 w-3" />
      {children}
    </Label>
  );
}

// ─── LogoUpload ───────────────────────────────────────────────────────────────

function LogoUpload({ name }: { name: string }) {
  const [preview, setPreview]   = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const nameInitial = name.trim() ? name.trim()[0].toUpperCase() : "?";

  function processFile(file: File) {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error("Format non supporté. Utilisez PNG, JPG, WebP ou SVG.");
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      toast.error(`Fichier trop lourd. Maximum ${MAX_SIZE_MB} Mo.`);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, []);

  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const onDragLeave = () => setIsDragging(false);

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  }

  return (
    <div className="flex items-start gap-5">

      {/* Drop zone */}
      <div
        onClick={() => !preview && inputRef.current?.click()}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        className={cn(
          "relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all select-none",
          "w-36 h-36 shrink-0",
          preview
            ? "border-transparent cursor-default overflow-hidden"
            : isDragging
              ? "border-foreground/50 bg-muted/50 cursor-copy"
              : "border-muted-foreground/25 bg-muted/10 cursor-pointer hover:border-muted-foreground/40 hover:bg-muted/20"
        )}
      >
        {preview ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="Logo" className="h-full w-full object-cover" />
            {/* Overlay de remplacement */}
            <div
              onClick={() => inputRef.current?.click()}
              className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-black/50 opacity-0 hover:opacity-100 transition-opacity cursor-pointer rounded-xl"
            >
              <Upload className="h-4 w-4 text-white" />
              <span className="text-[10px] text-white font-medium">Remplacer</span>
            </div>
          </>
        ) : (
          <>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted/60 mb-2">
              {isDragging
                ? <Upload className="h-4 w-4 text-foreground/60" />
                : <span className="text-lg font-semibold text-muted-foreground/60">{nameInitial}</span>
              }
            </div>
            <p className="text-[11px] text-muted-foreground text-center leading-tight px-2">
              {isDragging ? "Déposez ici" : "Glissez ou cliquez"}
            </p>
          </>
        )}
      </div>

      {/* Infos + actions */}
      <div className="space-y-3 pt-1">
        <div>
          <p className="text-sm font-medium">Logo de l'établissement</p>
          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
            PNG, JPG, WebP ou SVG · Max {MAX_SIZE_MB} Mo<br />
            Recommandé : 256 × 256 px minimum
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 gap-1.5 text-xs"
            onClick={() => inputRef.current?.click()}
          >
            <Upload className="h-3 w-3" />
            {preview ? "Changer" : "Choisir un fichier"}
          </Button>
          {preview && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 gap-1.5 text-xs text-muted-foreground hover:text-destructive"
              onClick={() => { setPreview(null); if (inputRef.current) inputRef.current.value = ""; }}
            >
              <X className="h-3 w-3" />
              Supprimer
            </Button>
          )}
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(",")}
        className="hidden"
        onChange={onInputChange}
      />
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function EditCompanyPage() {
  const params = useParams<{ workspaceId: string }>();

  const [name, setName]               = useState(CURRENT_COMPANY.name);
  const [type, setType]               = useState(CURRENT_COMPANY.type);
  const [email, setEmail]             = useState(CURRENT_COMPANY.email);
  const [phone, setPhone]             = useState(CURRENT_COMPANY.phone);
  const [siret, setSiret]             = useState(CURRENT_COMPANY.siret);
  const [address, setAddress]         = useState(CURRENT_COMPANY.address);
  const [description, setDescription] = useState(CURRENT_COMPANY.description);
  const [isSaving, setIsSaving]       = useState(false);

  const isDirty =
    name        !== CURRENT_COMPANY.name        ||
    type        !== CURRENT_COMPANY.type        ||
    email       !== CURRENT_COMPANY.email       ||
    phone       !== CURRENT_COMPANY.phone       ||
    siret       !== CURRENT_COMPANY.siret       ||
    address     !== CURRENT_COMPANY.address     ||
    description !== CURRENT_COMPANY.description;

  const descLen = description.length;
  const descCounterClass =
    descLen >= DESCRIPTION_MAX       ? "text-destructive font-medium" :
    descLen >= DESCRIPTION_MAX * 0.8 ? "text-amber-500"               :
                                       "text-muted-foreground";

  async function handleSave() {
    setIsSaving(true);
    await new Promise((r) => setTimeout(r, 1200));
    setIsSaving(false);
    toast.success("Modifications enregistrées.");
  }

  return (
    <div className="space-y-4">

      {/* Header */}
      <div className="flex items-center justify-between pb-2">
        <div>
          <h1 className="text-xl font-semibold">Paramètres de l'entreprise</h1>
          <p className="text-sm text-muted-foreground">Modifiez les informations de votre établissement.</p>
        </div>
        <Button
          onClick={handleSave}
          disabled={!isDirty || isSaving || !name.trim()}
          size="sm"
          className="gap-2"
        >
          {isSaving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          Enregistrer
        </Button>
      </div>

      <div className="space-y-6">

        {/* ── Logo ── */}
        <Section title="Logo" description="Image affichée dans la barre latérale et les exports.">
          <LogoUpload name={name} />
        </Section>

        <Separator />

        {/* ── Identité ── */}
        <Section title="Identité" description="Nom et catégorie de l'établissement.">

          <div className="space-y-1.5 max-w-sm">
            <FieldLabel icon={FileText}>Nom de la structure</FieldLabel>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nom de votre établissement"
              className="h-9"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {ESTABLISHMENT_TYPES.map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setType(t.value)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs transition-all",
                    type === t.value
                      ? "border-foreground bg-foreground text-background font-medium"
                      : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground"
                  )}
                >
                  <Icon className="h-3 w-3 shrink-0" />
                  {t.label}
                </button>
              );
            })}
          </div>

        </Section>

        <Separator />

        {/* ── Coordonnées ── */}
        <Section title="Coordonnées" description="Informations de contact et localisation.">

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg">
            <div className="space-y-1.5">
              <FieldLabel icon={Mail}>Email principal</FieldLabel>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contact@etablissement.fr"
                className="h-9"
              />
            </div>
            <div className="space-y-1.5">
              <FieldLabel icon={Phone}>Téléphone</FieldLabel>
              <Input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="01 00 00 00 00"
                className="h-9"
              />
            </div>
          </div>

          <div className="space-y-1.5 max-w-lg">
            <FieldLabel icon={MapPin}>Adresse principale</FieldLabel>
            <Input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="N° rue, ville, code postal"
              className="h-9"
            />
          </div>

        </Section>

        <Separator />

        {/* ── Données légales ── */}
        <Section title="Données légales" description="Informations administratives et légales.">

          <div className="space-y-1.5 max-w-xs">
            <FieldLabel icon={Hash}>Numéro SIRET</FieldLabel>
            <Input
              value={siret}
              onChange={(e) => setSiret(formatSiret(e.target.value))}
              placeholder="000 000 000 00000"
              className="h-9 font-mono"
            />
          </div>

          <div className="space-y-1.5 max-w-lg">
            <FieldLabel icon={FileText}>Description</FieldLabel>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value.slice(0, DESCRIPTION_MAX))}
              className="resize-none h-24"
              placeholder="Décrivez brièvement votre établissement…"
            />
            <div className="flex justify-end">
              <span className={cn("text-xs", descCounterClass)}>
                {descLen}/{DESCRIPTION_MAX}
              </span>
            </div>
          </div>

        </Section>

        <Separator />

        {/* ── Zone critique ── */}
        <Section
          title="Zone critique"
          description="Actions irréversibles sur cet espace de travail."
        >
          <div className="rounded-lg border border-destructive/30 p-4 space-y-3">
            <div>
              <p className="text-sm font-medium text-destructive">Supprimer l'espace de travail</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Supprime définitivement l'entreprise, tous ses employés, sites et plannings. Cette action est irréversible.
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive border border-destructive/30"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Supprimer l'espace de travail
            </Button>
          </div>
        </Section>

        <div className="pb-8" />

      </div>
    </div>
  );
}
