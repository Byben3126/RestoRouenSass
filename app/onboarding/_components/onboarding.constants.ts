import { Utensils, Zap, Wine, Hotel, MoreHorizontal } from "lucide-react";

export const ESTABLISHMENT_TYPES = [
  { value: "restaurant", label: "Restaurant Gastronomique", icon: Utensils },
  { value: "fastfood",   label: "Restauration Rapide",      icon: Zap },
  { value: "bar",        label: "Bar / Brasserie",           icon: Wine },
  { value: "hotel",      label: "Hôtel",                    icon: Hotel },
  { value: "other",      label: "Autre",                    icon: MoreHorizontal },
] as const;

export const PLANS = [
  {
    id: "essai",
    name: "Essai gratuit",
    price: 0,
    billingNote: "14 jours, sans carte requise",
    workers: Infinity,
    locations: Infinity,
    features: [
      "Accès à toutes les fonctionnalités",
      "Employés & établissements illimités",
      "14 jours d'essai gratuit",
      "Aucun engagement",
      "Support par email",
    ],
    highlight: false,
  },
  {
    id: "pro",
    name: "Toutes les fonctionnalités",
    price: 79,
    billingNote: "par mois, sans engagement",
    workers: Infinity,
    locations: Infinity,
    features: [
      "Employés & établissements illimités",
      "Génération de planning avancée",
      "Tous les formats d'export",
      "Alertes de conflits",
      "Notifications push & email",
      "Support prioritaire",
    ],
    highlight: true,
  },
  {
    id: "click-collect",
    name: "Click & Collect",
    price: 150,
    billingNote: "par mois, sans engagement",
    workers: Infinity,
    locations: Infinity,
    features: [
      "Toutes les fonctionnalités du plan complet",
      "Commandes en ligne Click & Collect",
      "Synchronisation automatique des menus",
      "Account manager dédié",
    ],
    highlight: false,
  },
] as const;

export type Plan = (typeof PLANS)[number];
export type EstablishmentType = (typeof ESTABLISHMENT_TYPES)[number];
