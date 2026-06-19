"use client";

import { UseFormReturn } from "react-hook-form";
import { ImagePlus, Mail, Hash, FileText, ArrowRight } from "lucide-react";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import { ESTABLISHMENT_TYPES } from "./onboarding.constants";
import { TypePill } from "./type-pill";
import type { OnboardingValues } from "./onboarding.schema";

interface CompanyStepProps {
  form: UseFormReturn<OnboardingValues>;
  onNext: () => void;
}

export function CompanyStep({ form, onNext }: CompanyStepProps) {
  return (
    <div className="mx-auto w-full max-w-lg flex-1 px-6 py-16 space-y-10">

      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Créez votre espace</h1>
        <p className="text-muted-foreground">
          Donnez un nom à votre établissement et choisissez son secteur.
        </p>
      </div>

      <div className="space-y-8">

        {/* Logo + Nom */}
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/25 bg-muted/20 transition-all hover:border-foreground/40 hover:bg-muted/40 group">
            <ImagePlus className="h-5 w-5 text-muted-foreground/40 transition-all group-hover:text-foreground/60 group-hover:scale-110" />
          </div>
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel className="text-xs text-muted-foreground uppercase tracking-wider">
                  Nom de l'établissement
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Le Petit Bistrot, Groupe Saveurs…"
                    {...field}
                    className="text-base h-11"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Email + SIRET */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-1.5 text-xs text-muted-foreground uppercase tracking-wider">
                  <Mail className="h-3.5 w-3.5" />
                  Email
                </FormLabel>
                <FormControl>
                  <Input placeholder="direction@entreprise.com" type="email" {...field} className="h-11" />
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
                <FormLabel className="flex items-center gap-1.5 text-xs text-muted-foreground uppercase tracking-wider">
                  <Hash className="h-3.5 w-3.5" />
                  SIRET
                </FormLabel>
                <FormControl>
                  <Input placeholder="123 456 789 00012" {...field} className="h-11" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-1.5 text-xs text-muted-foreground uppercase tracking-wider">
                <FileText className="h-3.5 w-3.5" />
                Description
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Décrivez brièvement votre établissement…"
                  className="resize-none h-24"
                  {...field}
                />
              </FormControl>
              <div className="flex justify-end">
                <span className="text-xs text-muted-foreground">
                  {(field.value ?? "").length}/300
                </span>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Type */}
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs text-muted-foreground uppercase tracking-wider">
                Secteur d'activité
              </FormLabel>
              <FormControl>
                <div className="flex flex-wrap gap-2 pt-1">
                  {ESTABLISHMENT_TYPES.map((type) => (
                    <TypePill
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

      <Button type="button" onClick={onNext} size="lg" className="w-full gap-2">
        Choisir mon plan
        <ArrowRight className="h-4 w-4" />
      </Button>

    </div>
  );
}
