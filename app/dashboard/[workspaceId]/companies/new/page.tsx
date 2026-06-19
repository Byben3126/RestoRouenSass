"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Building2,
  Loader2,
  ImagePlus,
  ChevronLeft,
  ChevronRight,
  Check,
  Mail,
  Hash,
  FileText,
  Utensils,
  Zap,
  Wine,
  Hotel,
  MoreHorizontal,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

// ─── Schema ──────────────────────────────────────────────────────────────────

const companySchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères."),
  type: z.string({ required_error: "Veuillez sélectionner un type." }),
  siret: z.string().optional(),
  email: z.string().email("Email invalide").or(z.literal("")).optional(),
  description: z.string().max(300, "Description trop longue").optional(),
});

type CompanyFormValues = z.infer<typeof companySchema>;

// ─── Constants ───────────────────────────────────────────────────────────────

const STEPS = [
  { id: 1, label: "Identité" },
  { id: 2, label: "Coordonnées" },
  { id: 3, label: "Confirmation" },
];

const ESTABLISHMENT_TYPES = [
  {
    value: "restaurant",
    label: "Restaurant Gastronomique",
    description: "Cuisine raffinée, service à table",
    icon: Utensils,
  },
  {
    value: "fastfood",
    label: "Restauration Rapide",
    description: "Service rapide, volume élevé",
    icon: Zap,
  },
  {
    value: "bar",
    label: "Bar / Brasserie",
    description: "Boissons, petite restauration",
    icon: Wine,
  },
  {
    value: "hotel",
    label: "Hôtel",
    description: "Hébergement, services multiples",
    icon: Hotel,
  },
  {
    value: "other",
    label: "Autre établissement",
    description: "Autre type de structure",
    icon: MoreHorizontal,
  },
];

// ─── Step Indicator ──────────────────────────────────────────────────────────

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-2">
      {STEPS.map((step, idx) => {
        const isDone = current > step.id;
        const isActive = current === step.id;
        return (
          <div key={step.id} className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-all",
                  isDone && "bg-primary text-primary-foreground",
                  isActive &&
                    "bg-primary text-primary-foreground ring-4 ring-primary/20",
                  !isDone && !isActive && "bg-muted text-muted-foreground"
                )}
              >
                {isDone ? <Check className="h-3.5 w-3.5" /> : step.id}
              </div>
              <span
                className={cn(
                  "hidden text-sm sm:block",
                  isActive ? "font-medium text-foreground" : "text-muted-foreground"
                )}
              >
                {step.label}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div
                className={cn(
                  "h-px w-8 transition-colors",
                  current > step.id ? "bg-primary" : "bg-border"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Type Card ────────────────────────────────────────────────────────────────

function TypeCard({
  type,
  selected,
  onSelect,
}: {
  type: (typeof ESTABLISHMENT_TYPES)[number];
  selected: boolean;
  onSelect: () => void;
}) {
  const Icon = type.icon;
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex flex-col gap-3 rounded-xl border p-4 text-left transition-all hover:border-primary/50 hover:bg-accent/40",
        selected
          ? "border-primary bg-primary/5 ring-2 ring-primary/20"
          : "border-border bg-card"
      )}
    >
      <div
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-lg transition-colors",
          selected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
        )}
      >
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className={cn("text-sm font-medium", selected && "text-primary")}>
          {type.label}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">{type.description}</p>
      </div>
    </button>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function CreateCompanyPage() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(companySchema),
    defaultValues: { name: "", siret: "", email: "", description: "", type: "" },
  });

  const { watch, trigger } = form;
  const watchedType = watch("type");
  const watchedName = watch("name");

  async function goNext() {
    let fields: (keyof CompanyFormValues)[] = [];
    if (step === 1) fields = ["name", "type"];
    if (step === 2) fields = ["email", "siret", "description"];
    const valid = await trigger(fields);
    if (valid) setStep((s) => s + 1);
  }

  async function onSubmit(data: CompanyFormValues) {
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 1500));
    setIsSubmitting(false);
    toast.success("Entreprise créée !", {
      description: `L'espace pour ${data.name} est maintenant configuré.`,
    });
    router.back();
  }

  const selectedType = ESTABLISHMENT_TYPES.find((t) => t.value === watchedType);

  return (
    <div className="min-h-screen">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>

          {/* ── Header ── */}
          <header className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => (step > 1 ? setStep((s) => s - 1) : router.back())}
                type="button"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
                  <Building2 className="h-4 w-4 text-primary" />
                </div>
                <span className="text-sm font-medium text-muted-foreground">
                  Nouvelle entreprise
                </span>
              </div>
            </div>
            <StepIndicator current={step} />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              type="button"
              className="text-muted-foreground"
            >
              Annuler
            </Button>
          </header>

          {/* ── Body ── */}
          <div className="mx-auto max-w-2xl py-10">

            {/* ── Step 1 : Identité ── */}
            {step === 1 && (
              <div className="space-y-8">
                <div className="space-y-1">
                  <h2 className="text-2xl font-semibold tracking-tight">Profil de l'établissement</h2>
                  <p className="text-sm text-muted-foreground">
                    Comment s'appelle votre structure et quel est son secteur ?
                  </p>
                </div>

                {/* Logo + Nom */}
                <div className="rounded-xl border bg-card p-6 space-y-6">
                  <div className="flex items-start gap-5">
                    <div className="flex flex-col gap-2">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Logo</p>
                      <div className="flex h-20 w-20 cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/30 bg-muted/20 transition-all hover:border-primary/50 hover:bg-primary/5 group">
                        <ImagePlus className="h-5 w-5 text-muted-foreground/50 transition-all group-hover:text-primary group-hover:scale-110" />
                      </div>
                    </div>
                    <div className="flex-1 pt-5">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nom de la structure</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Ex: Le Petit Bistrot, Groupe Saveurs…"
                                {...field}
                                className="bg-background"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>

                {/* Type */}
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium">Type d'établissement</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Sélectionnez la catégorie qui correspond le mieux à votre activité.
                    </p>
                  </div>
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                            {ESTABLISHMENT_TYPES.map((type) => (
                              <TypeCard
                                key={type.value}
                                type={type}
                                selected={field.value === type.value}
                                onSelect={() => field.onChange(type.value)}
                              />
                            ))}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end">
                  <Button type="button" onClick={goNext} className="gap-2">
                    Continuer
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* ── Step 2 : Coordonnées ── */}
            {step === 2 && (
              <div className="space-y-8">
                <div className="space-y-1">
                  <h2 className="text-2xl font-semibold tracking-tight">Coordonnées</h2>
                  <p className="text-sm text-muted-foreground">
                    Informations de contact et données administratives.
                  </p>
                </div>

                <div className="rounded-xl border bg-card p-6 space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-1.5">
                            <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                            Email principal
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="direction@entreprise.com"
                              type="email"
                              {...field}
                              className="bg-background"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="siret"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-1.5">
                            <Hash className="h-3.5 w-3.5 text-muted-foreground" />
                            Numéro SIRET
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="123 456 789 00012"
                              {...field}
                              className="bg-background"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1.5">
                          <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                          Concept / Description
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Décrivez brièvement l'esprit de votre établissement…"
                            className="resize-none h-28 bg-background leading-relaxed"
                            {...field}
                          />
                        </FormControl>
                        <div className="flex items-center justify-between">
                          <FormDescription>
                            Visible par vos futurs collaborateurs.
                          </FormDescription>
                          <span className="text-xs text-muted-foreground">
                            {(field.value ?? "").length}/300
                          </span>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end">
                  <Button type="button" onClick={goNext} className="gap-2">
                    Vérifier et finaliser
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* ── Step 3 : Confirmation ── */}
            {step === 3 && (
              <div className="space-y-8">
                <div className="space-y-1">
                  <h2 className="text-2xl font-semibold tracking-tight">Tout est prêt</h2>
                  <p className="text-sm text-muted-foreground">
                    Vérifiez les informations avant de créer l'espace de travail.
                  </p>
                </div>

                {/* Recap Card */}
                <div className="rounded-xl border bg-card overflow-hidden">
                  {/* Banner */}
                  <div className="h-20 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b" />

                  <div className="px-6 pb-6 -mt-8 space-y-5">
                    {/* Avatar & Name */}
                    <div className="flex items-end gap-4">
                      <div className="flex h-16 w-16 items-center justify-center rounded-xl border-2 border-background bg-muted shadow-sm">
                        {selectedType ? (
                          <selectedType.icon className="h-7 w-7 text-muted-foreground" />
                        ) : (
                          <Building2 className="h-7 w-7 text-muted-foreground" />
                        )}
                      </div>
                      <div className="pb-1">
                        <p className="text-lg font-semibold">{watchedName || "—"}</p>
                        {selectedType && (
                          <Badge variant="secondary" className="text-xs mt-0.5">
                            {selectedType.label}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Details */}
                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div className="space-y-0.5">
                        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Email</p>
                        <p className="text-sm">{form.getValues("email") || <span className="text-muted-foreground italic">Non renseigné</span>}</p>
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">SIRET</p>
                        <p className="text-sm">{form.getValues("siret") || <span className="text-muted-foreground italic">Non renseigné</span>}</p>
                      </div>
                      {form.getValues("description") && (
                        <div className="col-span-2 space-y-0.5">
                          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Description</p>
                          <p className="text-sm text-muted-foreground">{form.getValues("description")}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Info note */}
                <div className="flex gap-3 rounded-lg border border-primary/20 bg-primary/5 p-4">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/15 mt-0.5">
                    <Check className="h-3 w-3 text-primary" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Un espace de travail dédié sera créé pour{" "}
                    <span className="font-medium text-foreground">{watchedName || "votre entreprise"}</span>.
                    Vous pourrez ensuite inviter vos collaborateurs et configurer les plannings.
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <Button
                    variant="ghost"
                    type="button"
                    onClick={() => setStep(2)}
                    className="gap-2 text-muted-foreground"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Modifier
                  </Button>
                  <Button type="submit" disabled={isSubmitting} className="gap-2 min-w-36">
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Création…
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4" />
                        Créer l'espace de travail
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}
