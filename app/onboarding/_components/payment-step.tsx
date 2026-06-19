"use client";

import { useState } from "react";
import {
  ChevronLeft,
  Loader2,
  Check,
  CreditCard,
  Lock,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PaymentStepProps {
  planName: string;
  planPrice: number | null;
  isSubmitting: boolean;
  onBack: () => void;
  /** Called with the Stripe paymentMethodId once the card is confirmed */
  onConfirm: (paymentMethodId: string) => Promise<void>;
}

// Simulated card brand detection — Stripe Elements handles this natively
function detectBrand(value: string): "visa" | "mastercard" | "amex" | null {
  if (/^4/.test(value)) return "visa";
  if (/^5[1-5]/.test(value)) return "mastercard";
  if (/^3[47]/.test(value)) return "amex";
  return null;
}

function formatCardNumber(value: string): string {
  return value.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
}

function formatExpiry(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length >= 3) return `${digits.slice(0, 2)} / ${digits.slice(2)}`;
  return digits;
}

export function PaymentStep({ planName, planPrice, isSubmitting, onBack, onConfirm }: PaymentStepProps) {
  const [cardHolder, setCardHolder] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [error, setError] = useState<string | null>(null);

  const brand = detectBrand(cardNumber.replace(/\s/g, ""));
  const isEnterprise = planPrice === null;

  async function handleConfirm() {
    setError(null);

    // ─── TODO: Replace this block with Stripe Elements ────────────────────────
    // When integrating Stripe, this section becomes:
    //
    //   const { paymentMethod, error } = await stripe.createPaymentMethod({
    //     type: "card",
    //     card: cardElement,          // <-- CardElement from @stripe/react-stripe-js
    //     billing_details: { name: cardHolder },
    //   });
    //   if (error) { setError(error.message); return; }
    //   await onConfirm(paymentMethod.id);
    // ─────────────────────────────────────────────────────────────────────────

    // Temporary simulation
    if (!cardHolder || cardNumber.replace(/\s/g, "").length < 16 || expiry.length < 7 || cvc.length < 3) {
      setError("Veuillez renseigner tous les champs.");
      return;
    }
    await onConfirm("pm_simulated_method_id");
  }

  return (
    <div className="mx-auto w-full max-w-lg flex-1 px-6 py-16 space-y-10">

      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Moyen de paiement</h1>
        <p className="text-muted-foreground">
          {isEnterprise
            ? "Votre account manager vous contactera pour finaliser le contrat."
            : `Votre plan ${planName} sera activé immédiatement après validation.`}
        </p>
      </div>

      {/* Récap plan */}
      {!isEnterprise && (
        <div className="flex items-center justify-between rounded-xl border bg-muted/30 px-5 py-4">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Plan sélectionné</p>
            <p className="font-semibold mt-0.5">{planName}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">{planPrice}€</p>
            <p className="text-xs text-muted-foreground">/mois</p>
          </div>
        </div>
      )}

      {/* Formulaire carte */}
      <div className="space-y-5">

        {/* Nom du porteur — champ standard, hors Stripe Elements */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground uppercase tracking-wider">
            Nom sur la carte
          </Label>
          <Input
            placeholder="Jean Dupont"
            value={cardHolder}
            onChange={(e) => setCardHolder(e.target.value)}
            className="h-11"
          />
        </div>

        {/* Zone Stripe Elements ─────────────────────────────────────────────
          Les champs ci-dessous (numéro, expiry, CVC) seront remplacés
          par les composants Stripe Elements :
            <CardNumberElement />  →  numéro de carte
            <CardExpiryElement />  →  date d'expiration
            <CardCvcElement />     →  cryptogramme
          Stripe injecte un iframe sécurisé — aucune donnée sensible
          ne transite par votre serveur. PCI-DSS compliant par défaut.
        ───────────────────────────────────────────────────────────────── */}

        {/* Numéro de carte */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground uppercase tracking-wider">
            Numéro de carte
          </Label>
          <div className="relative">
            <Input
              placeholder="1234 5678 9012 3456"
              value={cardNumber}
              onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
              className="h-11 pr-16 font-mono tracking-wider"
              inputMode="numeric"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
              {brand === "visa" && (
                <span className="text-xs font-bold text-blue-600 tracking-widest">VISA</span>
              )}
              {brand === "mastercard" && (
                <span className="text-xs font-bold text-orange-500">MC</span>
              )}
              {brand === "amex" && (
                <span className="text-xs font-bold text-blue-400">AMEX</span>
              )}
              {!brand && <CreditCard className="h-4 w-4 text-muted-foreground/40" />}
            </div>
          </div>
        </div>

        {/* Expiry + CVC */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground uppercase tracking-wider">
              Date d'expiration
            </Label>
            <Input
              placeholder="MM / AA"
              value={expiry}
              onChange={(e) => setExpiry(formatExpiry(e.target.value))}
              className="h-11 font-mono tracking-wider"
              inputMode="numeric"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground uppercase tracking-wider">
              Cryptogramme
            </Label>
            <Input
              placeholder="CVC"
              value={cvc}
              onChange={(e) => setCvc(e.target.value.replace(/\D/g, "").slice(0, 4))}
              className="h-11 font-mono tracking-wider"
              inputMode="numeric"
              type="password"
            />
          </div>
        </div>

        {/* Erreur */}
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}

        {/* Sécurité */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground rounded-lg border border-dashed px-4 py-3">
          <Lock className="h-3.5 w-3.5 shrink-0" />
          <span>
            Vos données bancaires sont chiffrées et traitées directement par{" "}
            <span className="font-medium text-foreground">Stripe</span>. HCR ne stocke jamais votre numéro de carte.
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          type="button"
          onClick={onBack}
          className="gap-2 text-muted-foreground"
          disabled={isSubmitting}
        >
          <ChevronLeft className="h-4 w-4" />
          Retour
        </Button>

        <Button
          type="button"
          onClick={handleConfirm}
          disabled={isSubmitting}
          size="lg"
          className="gap-2 min-w-52"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Validation…
            </>
          ) : (
            <>
              <ShieldCheck className="h-4 w-4" />
              {isEnterprise ? "Envoyer ma demande" : "Confirmer et démarrer"}
            </>
          )}
        </Button>
      </div>

      {/* Trust */}
      <div className="flex flex-wrap justify-center gap-5 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Check className="h-3 w-3" />
          Annulable à tout moment
        </div>
        <div className="flex items-center gap-1.5">
          <Check className="h-3 w-3" />
          Aucun prélèvement aujourd'hui
        </div>
        <div className="flex items-center gap-1.5">
          <Check className="h-3 w-3" />
          Facturation mensuelle
        </div>
      </div>

    </div>
  );
}
