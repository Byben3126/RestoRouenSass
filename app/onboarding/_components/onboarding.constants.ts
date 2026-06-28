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
    id: "starter",
    name: "Starter",
    price: 29,
    billingNote: "par mois, sans engagement",
    workers: 10,
    locations: 1,
    features: [
      "Jusqu'à 10 employés",
      "1 établissement",
      "Génération de planning",
      "Export PDF",
      "Support par email",
    ],
    highlight: false,
  },
  {
    id: "growth",
    name: "Growth",
    price: 79,
    billingNote: "par mois, sans engagement",
    workers: 30,
    locations: 3,
    features: [
      "Jusqu'à 30 employés",
      "3 établissements",
      "Génération de planning",
      "Export PDF & Excel",
      "Alertes de conflits",
      "Support prioritaire",
    ],
    highlight: true,
  },
  {
    id: "pro",
    name: "Pro",
    price: 149,
    billingNote: "par mois, sans engagement",
    workers: 100,
    locations: 10,
    features: [
      "Jusqu'à 100 employés",
      "10 établissements",
      "Plannings avancés",
      "Tous les formats d'export",
      "Notifications push & email",
      "Support dédié 7j/7",
    ],
    highlight: false,
  },
  // {
  //   id: "enterprise",
  //   name: "Enterprise",
  //   price: null,
  //   billingNote: "tarification personnalisée",
  //   workers: Infinity,
  //   locations: Infinity,
  //   features: [
  //     "Employés & sites illimités",
  //     "IA de génération de planning",
  //     "Intégrations sur mesure",
  //     "SSO / SAML",
  //     "Account manager dédié",
  //     "SLA contractuel",
  //   ],
  //   highlight: false,
  // },
] as const;

export type Plan = (typeof PLANS)[number];
export type EstablishmentType = (typeof ESTABLISHMENT_TYPES)[number];
