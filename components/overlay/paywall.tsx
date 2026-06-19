"use client";

import { Lock, Ticket, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ConferencePaywall() {
  return (
    <div className="absolute inset-x-0 bottom-0 top-0 flex items-center justify-center z-50">
      {/* L'effet de flou dégradé qui part du haut vers le bas */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-white/80 to-white backdrop-blur-[6px]" />

      {/* Le contenu de l'appel à l'action */}
      <div className="relative z-10 w-full max-w-sm px-6 text-center space-y-8 animate-in fade-in zoom-in duration-500">
        
        {/* Icône flottante */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-black shadow-2xl shadow-black/20 ring-1 ring-white/20">
          <Lock className="h-7 w-7 text-white" />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-center gap-2">
            <span className="h-px w-8 bg-zinc-200" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Accès réservé</span>
            <span className="h-px w-8 bg-zinc-200" />
          </div>
          <h2 className="text-2xl font-bold tracking-tighter text-zinc-900">
            Prêt à rejoindre l'expérience ?
          </h2>
          <p className="text-sm text-zinc-500 leading-relaxed font-medium">
            Réservez votre place dès maintenant pour débloquer le programme complet et accéder aux ateliers exclusifs.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <Button className="group h-12 w-full rounded-xl bg-black text-[11px] font-black uppercase tracking-widest text-white transition-all hover:scale-[1.02] active:scale-95 shadow-xl shadow-black/10">
            Acheter mon ticket
            <Ticket className="ml-2 h-4 w-4 transition-transform group-hover:rotate-12" />
          </Button>
        </div>

        {/* Petite preuve sociale ou bonus */}
        <div className="pt-4 flex items-center justify-center gap-2 text-[10px] font-bold text-emerald-600 bg-emerald-50 py-2 rounded-full border border-emerald-100">
          <Sparkles className="h-3 w-3" />
          +12 conférenciers internationaux inclus
        </div>
      </div>
    </div>
  );
}