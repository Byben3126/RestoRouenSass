"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ChevronLeft, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

// ─── Constants ───────────────────────────────────────────────────────────────

const DAYS = [
  { key: "mon", label: "Lundi" },
  { key: "tue", label: "Mardi" },
  { key: "wed", label: "Mercredi" },
  { key: "thu", label: "Jeudi" },
  { key: "fri", label: "Vendredi" },
  { key: "sat", label: "Samedi" },
  { key: "sun", label: "Dimanche" },
];

const AVAILABLE_WORKERS = [
  { id: "1", name: "Marie Fontaine" },
  { id: "2", name: "Thomas Bernard" },
  { id: "3", name: "Camille Leroy" },
  { id: "4", name: "Lucas Moreau" },
  { id: "5", name: "Inès Dupuis" },
  { id: "6", name: "Axel Martin" },
  { id: "7", name: "Zoé Petit" },
  { id: "8", name: "Hugo Richard" },
];

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

function Toggle({ label, description, checked, onChange }: {
  label: string; description?: string; checked: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-2">
      <div>
        <p className="text-sm font-medium">{label}</p>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors",
          checked ? "bg-primary" : "bg-muted"
        )}
      >
        <span className={cn(
          "inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform",
          checked ? "translate-x-4" : "translate-x-0"
        )} />
      </button>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function NewLocationPage() {
  const router = useRouter();
  const params = useParams<{ workspaceId: string }>();

  // Identité
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [capacity, setCapacity] = useState(20);

  // Horaires
  const [openDays, setOpenDays] = useState<string[]>(["mon", "tue", "wed", "thu", "fri"]);
  const [openTime, setOpenTime] = useState("08:00");
  const [closeTime, setCloseTime] = useState("23:00");
  const [breakStart, setBreakStart] = useState("14:30");
  const [breakEnd, setBreakEnd] = useState("17:00");
  const [hasBreak, setHasBreak] = useState(false);

  // Workers
  const [selectedWorkers, setSelectedWorkers] = useState<string[]>([]);

  // Options
  const [isActive, setIsActive] = useState(true);
  const [allowOverlap, setAllowOverlap] = useState(false);
  const [requiresMinWorkers, setRequiresMinWorkers] = useState(true);
  const [minWorkers, setMinWorkers] = useState(2);

  function toggleDay(key: string) {
    setOpenDays((prev) =>
      prev.includes(key) ? prev.filter((d) => d !== key) : [...prev, key]
    );
  }

  function toggleWorker(id: string) {
    setSelectedWorkers((prev) =>
      prev.includes(id) ? prev.filter((w) => w !== id) : [...prev, id]
    );
  }

  const canSubmit = name.trim() && address.trim() && openDays.length > 0;

  return (
    <div className="space-y-0">

      {/* Header */}
      <div className="flex items-center gap-3 pb-6">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => router.push(`/dashboard/${params.workspaceId}/locations`)}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-xl font-semibold">Nouveau site</h1>
          <p className="text-sm text-muted-foreground">Configurez un établissement et ses contraintes de planning.</p>
        </div>
      </div>

      <div className="space-y-8">

        {/* ── Identité ── */}
        <Section title="Identité" description="Informations générales de l'établissement.">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground uppercase tracking-wider">Nom du site</Label>
            <Input
              placeholder="Le Comptoir, Bistrot Sud…"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-9 max-w-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground uppercase tracking-wider">Adresse</Label>
            <Input
              placeholder="12 rue de la Paix"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="h-9 max-w-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-4 max-w-sm">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">Code postal</Label>
              <Input
                placeholder="75001"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                className="h-9"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">Ville</Label>
              <Input
                placeholder="Paris"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="h-9"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 max-w-sm">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">Téléphone</Label>
              <Input
                placeholder="01 23 45 67 89"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="h-9"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">Email</Label>
              <Input
                placeholder="contact@site.fr"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-9"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground uppercase tracking-wider">Capacité d'accueil</Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={capacity}
                min={1}
                onChange={(e) => setCapacity(Number(e.target.value))}
                className="h-9 w-24"
              />
              <span className="text-xs text-muted-foreground">personnes</span>
            </div>
          </div>
        </Section>

        <Separator />

        {/* ── Jours d'ouverture ── */}
        <Section title="Jours d'ouverture" description="Le planning ne génèrera des shifts que pour les jours cochés.">
          <div className="flex flex-wrap gap-2">
            {DAYS.map((day) => (
              <button
                key={day.key}
                type="button"
                onClick={() => toggleDay(day.key)}
                className={cn(
                  "rounded-lg border px-4 py-2 text-sm transition-all",
                  openDays.includes(day.key)
                    ? "border-foreground bg-foreground text-background font-medium"
                    : "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground"
                )}
              >
                {day.label}
              </button>
            ))}
          </div>
        </Section>

        <Separator />

        {/* ── Horaires ── */}
        <Section title="Horaires d'ouverture" description="Amplitude horaire du site. Les shifts ne pourront pas être planifiés en dehors.">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">Ouverture</Label>
              <Input
                type="time"
                value={openTime}
                onChange={(e) => setOpenTime(e.target.value)}
                className="h-9 w-32"
              />
            </div>
            <div className="pt-5 text-muted-foreground">→</div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">Fermeture</Label>
              <Input
                type="time"
                value={closeTime}
                onChange={(e) => setCloseTime(e.target.value)}
                className="h-9 w-32"
              />
            </div>
          </div>

          <div className="rounded-lg border divide-y">
            <div className="px-4">
              <Toggle
                label="Créneau de fermeture intermédiaire"
                description="Définit une plage sans personnel (ex: coupure entre service midi et soir)."
                checked={hasBreak}
                onChange={setHasBreak}
              />
            </div>
            {hasBreak && (
              <div className="px-4 py-3">
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground uppercase tracking-wider">Début coupure</Label>
                    <Input type="time" value={breakStart} onChange={(e) => setBreakStart(e.target.value)} className="h-9 w-32" />
                  </div>
                  <div className="pt-5 text-muted-foreground">→</div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground uppercase tracking-wider">Fin coupure</Label>
                    <Input type="time" value={breakEnd} onChange={(e) => setBreakEnd(e.target.value)} className="h-9 w-32" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </Section>

        <Separator />

        {/* ── Effectifs ── */}
        <Section title="Effectifs" description="Contraintes d'effectif pour ce site lors de la génération du planning.">
          <div className="rounded-lg border divide-y">
            <div className="px-4">
              <Toggle
                label="Minimum d'employés requis"
                description="Le planning sera invalide si ce nombre n'est pas atteint sur chaque créneau ouvert."
                checked={requiresMinWorkers}
                onChange={setRequiresMinWorkers}
              />
            </div>
            {requiresMinWorkers && (
              <div className="px-4 py-3 flex items-center gap-3">
                <Input
                  type="number"
                  value={minWorkers}
                  min={1}
                  max={50}
                  onChange={(e) => setMinWorkers(Number(e.target.value))}
                  className="h-9 w-20"
                />
                <span className="text-sm text-muted-foreground">employés minimum par créneau</span>
              </div>
            )}
            <div className="px-4">
              <Toggle
                label="Autoriser le chevauchement de shifts"
                description="Deux shifts peuvent se superposer sur ce site (utile pour les passations)."
                checked={allowOverlap}
                onChange={setAllowOverlap}
              />
            </div>
          </div>
        </Section>

        <Separator />

        {/* ── Employés affectés ── */}
        <Section
          title="Employés affectés"
          description="Seuls les employés sélectionnés peuvent être planifiés sur ce site. Laissez vide pour autoriser tous les employés."
        >
          {selectedWorkers.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {selectedWorkers.map((id) => {
                const worker = AVAILABLE_WORKERS.find((w) => w.id === id);
                if (!worker) return null;
                return (
                  <span
                    key={id}
                    className="flex items-center gap-1 rounded-md border bg-muted/40 pl-2.5 pr-1.5 py-1 text-xs font-medium"
                  >
                    {worker.name}
                    <button
                      type="button"
                      onClick={() => toggleWorker(id)}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                );
              })}
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            {AVAILABLE_WORKERS.filter((w) => !selectedWorkers.includes(w.id)).map((worker) => (
              <button
                key={worker.id}
                type="button"
                onClick={() => toggleWorker(worker.id)}
                className="rounded-lg border border-dashed px-3.5 py-2 text-sm text-muted-foreground transition-all hover:border-foreground/40 hover:text-foreground"
              >
                + {worker.name}
              </button>
            ))}
          </div>
        </Section>

        <Separator />

        {/* ── Options ── */}
        <Section title="Options" description="Paramètres généraux du site.">
          <div className="rounded-lg border divide-y">
            <div className="px-4">
              <Toggle
                label="Site actif"
                description="Un site inactif n'est pas pris en compte dans la génération de planning."
                checked={isActive}
                onChange={setIsActive}
              />
            </div>
          </div>
        </Section>

        <Separator />

        {/* Actions */}
        <div className="flex items-center justify-between pb-8">
          <Button
            variant="ghost"
            onClick={() => router.push(`/dashboard/${params.workspaceId}/locations`)}
            className="text-muted-foreground"
          >
            Annuler
          </Button>
          <Button disabled={!canSubmit}>
            Créer le site
          </Button>
        </div>

      </div>
    </div>
  );
}
