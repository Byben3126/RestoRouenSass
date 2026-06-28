"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { ArrowRight, Loader2, MapPin } from "lucide-react";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { LatLng } from "@/components/map/center-pin-map";

import type { OnboardingValues } from "./onboarding.schema";

const CenterPinMap = dynamic(() => import("@/components/map/center-pin-map"), { ssr: false });

const DEFAULT_POSITION: LatLng = { lat: 49.4432, lng: 1.0993 };

interface CompanyStepProps {
  form: UseFormReturn<OnboardingValues>;
  onNext: () => void;
  isLoading?: boolean;
}

export function CompanyStep({ form, onNext, isLoading }: CompanyStepProps) {
  const [position, setPosition] = useState<LatLng>(DEFAULT_POSITION);

  function handlePositionChange(pos: LatLng) {
    setPosition(pos);
    form.setValue("latitude", pos.lat, { shouldValidate: true });
    form.setValue("longitude", pos.lng, { shouldValidate: true });
  }

  return (
    <div className="mx-auto w-full max-w-lg flex-1 px-6 py-16 space-y-10">

      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Créez votre espace</h1>
        <p className="text-muted-foreground">
          Donnez un nom à votre restaurant et positionnez-le sur la carte.
        </p>
      </div>

      <div className="space-y-8">

        {/* Nom */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs text-muted-foreground uppercase tracking-wider">
                Nom du restaurant
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Le Petit Bistrot…"
                  {...field}
                  className="text-base h-11"
                  autoFocus
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Carte */}
        <div className="space-y-2">
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground uppercase tracking-wider">
            <MapPin className="h-3.5 w-3.5" />
            Localisation
          </p>
          <p className="text-xs text-muted-foreground">
            Déplacez la carte pour positionner l'épingle sur votre restaurant.
          </p>
          <div className="rounded-xl overflow-hidden border h-72">
            <CenterPinMap
              initialPosition={position}
              onPositionChange={handlePositionChange}
            />
          </div>
          {form.formState.errors.latitude && (
            <p className="text-xs text-destructive">{form.formState.errors.latitude.message}</p>
          )}
        </div>

      </div>

      <Button type="button" onClick={onNext} size="lg" className="w-full gap-2" disabled={isLoading}>
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            Choisir mon plan
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </Button>

    </div>
  );
}
