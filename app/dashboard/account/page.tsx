"use client";

import { ExternalLink } from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useMe } from "@/features/user/hooks";
import { useMySubscription, useCreatePortalSession } from "@/features/subscription/hooks";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const PLAN_LABELS: Record<string, string> = {
  starter: "Starter",
  growth: "Growth",
  pro: "Pro",
};

const STATUS_LABELS: Record<string, string> = {
  active: "Actif",
  trialing: "Période d'essai",
  past_due: "Paiement en retard",
  unpaid: "Non payé",
  canceled: "Annulé",
  incomplete: "Incomplet",
  incomplete_expired: "Expiré",
  paused: "En pause",
};

function formatDate(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

function initials(firstName?: string, lastName?: string): string {
  return `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase() || "?";
}

// ─── Section ─────────────────────────────────────────────────────────────────

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

// ─── Page ────────────────────────────────────────────────────────────────────

export default function AccountPage() {
  const { data: me, isLoading: meLoading } = useMe();
  const { data: subscription, isLoading: subLoading } = useMySubscription();
  const portalMutation = useCreatePortalSession();

  async function handlePortal() {
    try {
      await portalMutation.mutateAsync();
    } catch {
      toast.error("Impossible d'ouvrir le portail de gestion, veuillez réessayer.");
    }
  }

  return (
    <div className="space-y-8 pb-12 max-w-3xl">
      <div>
        <h1 className="text-xl font-semibold">Mon compte</h1>
        <p className="text-sm text-muted-foreground">
          Gérez vos informations et votre abonnement.
        </p>
      </div>

      <Separator />

      {/* Profil */}
      <Section title="Profil" description="Vos informations personnelles.">
        {meLoading ? (
          <div className="flex items-center gap-3">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="text-sm font-semibold bg-muted">
                {initials(me?.firstName, me?.lastName)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="font-medium truncate">
                {[me?.firstName, me?.lastName].filter(Boolean).join(" ") || "—"}
              </p>
              <p className="text-sm text-muted-foreground truncate">{me?.email ?? "—"}</p>
            </div>
          </div>
        )}
      </Section>

      <Separator />

      {/* Abonnement */}
      <Section
        title="Abonnement"
        description="Facturation, changement de plan et historique des paiements via Stripe."
      >
        {subLoading ? (
          <Skeleton className="h-24 w-full rounded-2xl" />
        ) : subscription ? (
          <div className="rounded-2xl bg-foreground p-5 text-background">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-background/60">Plan actuel</span>
              <Badge className="border-0 bg-background/15 text-background hover:bg-background/15">
                {STATUS_LABELS[subscription.status] ?? subscription.status}
              </Badge>
            </div>
            <p className="mt-2 text-2xl font-bold">
              {PLAN_LABELS[subscription.plan] ?? subscription.plan}
            </p>
            <p className="mt-1 text-xs text-background/60">
              {subscription.cancelAtPeriodEnd
                ? `Annulé le ${formatDate(subscription.currentPeriodEnd)}`
                : `Renouvellement le ${formatDate(subscription.currentPeriodEnd)}`}
            </p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Aucun abonnement actif.</p>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={handlePortal}
          disabled={portalMutation.isPending}
        >
          <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
          Gérer mon abonnement
        </Button>
      </Section>
    </div>
  );
}
