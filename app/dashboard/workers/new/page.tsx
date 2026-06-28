"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ChevronLeft, ImagePlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

// ─── Fixtures (à remplacer par l'API) ────────────────────────────────────────

const AVAILABLE_ROLES = ["Manager", "Ouverture", "Fermeture", "Caisse", "Formation"];
const AVAILABLE_LOCATIONS = ["Le Comptoir", "La Terrasse", "Bistrot Sud"];
const CONTRACT_TYPES = ["CDI", "CDD", "Extra", "Apprentissage"] as const;

type ContractType = (typeof CONTRACT_TYPES)[number];

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div>
        <p className="text-sm font-medium">{title}</p>
        {description && <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{description}</p>}
      </div>
      <div className="md:col-span-2 space-y-4">
        {children}
      </div>
    </div>
  );
}

export default function NewWorkerPage() {
  const router = useRouter();
  const params = useParams<{ workspaceId: string }>();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [contractType, setContractType] = useState<ContractType>("CDI");
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);

  function toggleRole(role: string) {
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  }

  function toggleLocation(loc: string) {
    setSelectedLocations((prev) =>
      prev.includes(loc) ? prev.filter((l) => l !== loc) : [...prev, loc]
    );
  }

  const canSubmit = firstName.trim() && lastName.trim() && email.trim() && selectedRoles.length > 0;

  return (
    <div className="space-y-0">

      {/* Header */}
      <div className="flex items-center gap-3 pb-6">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => router.push(`/dashboard/${params.workspaceId}/workers`)}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-xl font-semibold">Nouvel employé</h1>
          <p className="text-sm text-muted-foreground">Créez le profil et assignez les rôles et sites.</p>
        </div>
      </div>

      <div className="space-y-8">

        {/* ── Identité ── */}
        <Section title="Identité" description="Informations personnelles de l'employé.">

          {/* Photo */}
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 cursor-pointer items-center justify-center rounded-full border-2 border-dashed border-muted-foreground/25 bg-muted/20 transition-all hover:border-foreground/40 hover:bg-muted/40 group">
              <ImagePlus className="h-5 w-5 text-muted-foreground/40 group-hover:text-foreground/60 transition-colors" />
            </div>
            <div className="text-xs text-muted-foreground">
              <p className="font-medium text-foreground">Photo de profil</p>
              <p>JPG, PNG · max 2 Mo</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">Prénom</Label>
              <Input placeholder="Marie" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="h-9" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">Nom</Label>
              <Input placeholder="Fontaine" value={lastName} onChange={(e) => setLastName(e.target.value)} className="h-9" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">Email</Label>
              <Input placeholder="marie@example.com" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="h-9" />
              <p className="text-xs text-muted-foreground">Invitation de compte envoyée à cette adresse.</p>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">Téléphone</Label>
              <Input placeholder="06 12 34 56 78" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="h-9" />
            </div>
          </div>
        </Section>

        <Separator />

        {/* ── Contrat ── */}
        <Section title="Contrat" description="Type de contrat de l'employé. Peut influencer les règles de planning selon les rôles assignés.">
          <div className="flex flex-wrap gap-2">
            {CONTRACT_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setContractType(type)}
                className={cn(
                  "rounded-lg border px-4 py-2 text-sm transition-all",
                  contractType === type
                    ? "border-foreground bg-foreground text-background font-medium"
                    : "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground"
                )}
              >
                {type}
              </button>
            ))}
          </div>
        </Section>

        <Separator />

        {/* ── Rôles ── */}
        <Section
          title="Rôles"
          description="Les rôles définissent les règles de planning applicables à cet employé. Un employé peut avoir plusieurs rôles."
        >
          {selectedRoles.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {selectedRoles.map((role) => (
                <span
                  key={role}
                  className="flex items-center gap-1 rounded-md border bg-muted/40 pl-2.5 pr-1.5 py-1 text-xs font-medium"
                >
                  {role}
                  <button
                    type="button"
                    onClick={() => toggleRole(role)}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {AVAILABLE_ROLES.filter((r) => !selectedRoles.includes(r)).map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => toggleRole(role)}
                className="rounded-lg border border-dashed px-3.5 py-2 text-sm text-muted-foreground transition-all hover:border-foreground/40 hover:text-foreground"
              >
                + {role}
              </button>
            ))}
          </div>

          {selectedRoles.length === 0 && (
            <p className="text-xs text-muted-foreground">Au moins un rôle est requis.</p>
          )}
        </Section>

        <Separator />

        {/* ── Sites ── */}
        <Section
          title="Sites d'affectation"
          description="L'employé peut être planifié sur ces établissements. Laissez vide pour autoriser tous les sites."
        >
          <div className="flex flex-wrap gap-2">
            {AVAILABLE_LOCATIONS.map((loc) => (
              <button
                key={loc}
                type="button"
                onClick={() => toggleLocation(loc)}
                className={cn(
                  "rounded-lg border px-3.5 py-2 text-sm transition-all",
                  selectedLocations.includes(loc)
                    ? "border-foreground bg-foreground text-background font-medium"
                    : "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground"
                )}
              >
                {loc}
              </button>
            ))}
          </div>
        </Section>

        <Separator />

        {/* Actions */}
        <div className="flex items-center justify-between pb-8">
          <Button
            variant="ghost"
            onClick={() => router.push(`/dashboard/${params.workspaceId}/workers`)}
            className="text-muted-foreground"
          >
            Annuler
          </Button>
          <Button disabled={!canSubmit}>
            Créer l'employé
          </Button>
        </div>

      </div>
    </div>
  );
}
