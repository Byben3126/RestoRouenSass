"use client";

import { BadgeCheck, CreditCard, ExternalLink } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useMe } from "@/features/user/hooks";
import { useMySubscription, useCreatePortalSession } from "@/features/subscription/hooks";

// ─── helpers ─────────────────────────────────────────────────────────────────

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

function statusVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  if (status === "active" || status === "trialing") return "default";
  if (status === "canceled" || status === "incomplete_expired") return "destructive";
  return "secondary";
}

function formatDate(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// ─── page ─────────────────────────────────────────────────────────────────────

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
    <div className="space-y-6 pb-2 max-w-2xl">
      <div>
        <h1 className="text-xl font-semibold">Mon compte</h1>
        <p className="text-sm text-muted-foreground">
          Gérez vos informations et votre abonnement.
        </p>
      </div>

      {/* Profile card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BadgeCheck className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-base">Profil</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {meLoading ? (
            <>
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-4 w-64" />
            </>
          ) : (
            <>
              <Row label="Prénom" value={me?.firstName ?? "—"} />
              <Separator />
              <Row label="Nom" value={me?.lastName ?? "—"} />
              <Separator />
              <Row label="Email" value={me?.email ?? "—"} />
            </>
          )}
        </CardContent>
      </Card>

      {/* Subscription card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-base">Abonnement</CardTitle>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handlePortal}
              disabled={portalMutation.isPending}
            >
              <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
              Gérer mon abonnement
            </Button>
          </div>
          <CardDescription>
            Facturation, changement de plan et historique des paiements via Stripe.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {subLoading ? (
            <>
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-56" />
            </>
          ) : subscription ? (
            <>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Plan</span>
                <span className="text-sm font-medium">
                  {PLAN_LABELS[subscription.plan] ?? subscription.plan}
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Statut</span>
                <Badge variant={statusVariant(subscription.status)}>
                  {STATUS_LABELS[subscription.status] ?? subscription.status}
                </Badge>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Prochain renouvellement</span>
                <span className="text-sm font-medium">
                  {subscription.cancelAtPeriodEnd
                    ? `Annulé le ${formatDate(subscription.currentPeriodEnd)}`
                    : formatDate(subscription.currentPeriodEnd)}
                </span>
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Aucun abonnement actif.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}
