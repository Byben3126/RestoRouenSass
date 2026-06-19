"use client";

import dynamic from "next/dynamic";
import { useState, useRef, useCallback } from "react";
import {
  Upload,
  X,
  Loader2,
  FileText,
  ImagePlus,
} from "lucide-react";
import type { LatLng } from "@/components/map/center-pin-map";

const CenterPinMap = dynamic(() => import("@/components/map/center-pin-map"), { ssr: false });
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

// ─── Constants ───────────────────────────────────────────────────────────────

const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp"];
const MAX_SIZE_MB     = 5;
const MAX_IMAGES      = 8;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function Section({ title, description, children }: {
  title: string; description?: string; children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div>
        <p className="text-sm font-medium">{title}</p>
        {description && (
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{description}</p>
        )}
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

// ─── Gallery ─────────────────────────────────────────────────────────────────

interface GalleryImage {
  id: string;
  url: string;
  name: string;
}

function GalleryUpload() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function processFiles(files: File[]) {
    const remaining = MAX_IMAGES - images.length;
    if (remaining <= 0) {
      toast.error(`Maximum ${MAX_IMAGES} images.`);
      return;
    }

    const valid = files.slice(0, remaining).filter((f) => {
      if (!ACCEPTED_TYPES.includes(f.type)) {
        toast.error(`${f.name} : format non supporté.`);
        return false;
      }
      if (f.size > MAX_SIZE_MB * 1024 * 1024) {
        toast.error(`${f.name} : fichier trop lourd (max ${MAX_SIZE_MB} Mo).`);
        return false;
      }
      return true;
    });

    const newImages: GalleryImage[] = valid.map((f) => ({
      id: `${Date.now()}-${Math.random()}`,
      url: URL.createObjectURL(f),
      name: f.name,
    }));

    setImages((prev) => [...prev, ...newImages]);
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    processFiles(Array.from(e.dataTransfer.files));
  }, [images]);

  const onDragOver  = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const onDragLeave = () => setIsDragging(false);

  function removeImage(id: string) {
    setImages((prev) => prev.filter((img) => img.id !== id));
  }

  return (
    <div className="space-y-3">

      {/* Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {images.map((img) => (
            <div key={img.id} className="relative group aspect-square rounded-lg overflow-hidden border bg-muted/20">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt={img.name} className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => removeImage(img.id)}
                className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}

          {/* Add more slot */}
          {images.length < MAX_IMAGES && (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="aspect-square rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/10 flex items-center justify-center hover:border-muted-foreground/40 hover:bg-muted/20 transition-all"
            >
              <ImagePlus className="h-5 w-5 text-muted-foreground/40" />
            </button>
          )}
        </div>
      )}

      {/* Drop zone (shown when empty) */}
      {images.length === 0 && (
        <div
          onClick={() => inputRef.current?.click()}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          className={cn(
            "flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed h-36 cursor-pointer transition-all",
            isDragging
              ? "border-foreground/50 bg-muted/40"
              : "border-muted-foreground/25 bg-muted/10 hover:border-muted-foreground/40 hover:bg-muted/20"
          )}
        >
          <Upload className="h-5 w-5 text-muted-foreground/40" />
          <p className="text-xs text-muted-foreground text-center leading-relaxed">
            {isDragging ? "Déposez les images ici" : "Glissez vos photos ou cliquez pour parcourir"}
          </p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          PNG, JPG, WebP · Max {MAX_SIZE_MB} Mo · {images.length}/{MAX_IMAGES} photos
        </p>
        {images.length > 0 && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 gap-1.5 text-xs"
            onClick={() => inputRef.current?.click()}
            disabled={images.length >= MAX_IMAGES}
          >
            <Upload className="h-3 w-3" />
            Ajouter des photos
          </Button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(",")}
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files) processFiles(Array.from(e.target.files));
          e.target.value = "";
        }}
      />
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

const FIXTURE = {
  name:     "Le Petit Bistrot",
  position: { lat: 49.4432, lng: 1.0993 } satisfies LatLng,
};

export default function RestaurantPage() {
  const [name, setName]         = useState(FIXTURE.name);
  const [position, setPosition] = useState<LatLng>(FIXTURE.position);
  const [isSaving, setIsSaving] = useState(false);

  const isDirty = name !== FIXTURE.name ||
    position.lat !== FIXTURE.position.lat ||
    position.lng !== FIXTURE.position.lng;

  async function handleSave() {
    setIsSaving(true);
    await new Promise((r) => setTimeout(r, 900));
    setIsSaving(false);
    toast.success("Modifications enregistrées.");
  }

  return (
    <div className="space-y-4">

      {/* Header */}
      <div className="flex items-center justify-between pb-2">
        <div>
          <h1 className="text-xl font-semibold">Mon restaurant</h1>
          <p className="text-sm text-muted-foreground">
            Gérez les informations et la présentation de votre établissement.
          </p>
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

        {/* ── Identité ── */}
        <Section title="Identité" description="Nom affiché aux clients sur l'application.">
          <div className="space-y-1.5 max-w-sm">
            <FieldLabel icon={FileText}>Nom du restaurant</FieldLabel>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Le nom de votre restaurant"
              className="h-9"
            />
          </div>
        </Section>

        <Separator />

        {/* ── Galerie ── */}
        <Section
          title="Galerie"
          description={`Photos de votre établissement visibles par les clients. Maximum ${MAX_IMAGES} images.`}
        >
          <GalleryUpload />
        </Section>

        <Separator />

        {/* ── Localisation ── */}
        <Section
          title="Localisation"
          description="Déplacez la carte pour positionner l'épingle sur votre restaurant. Les coordonnées sont enregistrées automatiquement."
        >
          <div className="rounded-xl overflow-hidden border h-72">
            <CenterPinMap
              initialPosition={FIXTURE.position}
              onPositionChange={setPosition}
            />
          </div>
        </Section>

        <div className="pb-8" />

      </div>
    </div>
  );
}
