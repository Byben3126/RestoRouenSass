"use client";

import { Search, Plus, MoreHorizontal, MapPin } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// ─── Types ───────────────────────────────────────────────────────────────────

type ContractType = "CDI" | "CDD" | "Extra" | "Apprentissage";
type Status = "Actif" | "Inactif" | "En congé";

interface Worker {
  id: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  roles: string[];       // rôles personnalisables — portent les règles de planning
  contractType: ContractType;
  status: Status;
  locations: string[];   // un ou plusieurs sites
  email: string;
  phone: string;
}

// ─── Fixtures ────────────────────────────────────────────────────────────────

const WORKERS: Worker[] = [
  { id: "1", firstName: "Marie",   lastName: "Fontaine", avatar: "https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-1.png", roles: ["Manager", "Ouverture"],          contractType: "CDI",          status: "Actif",    locations: ["Le Comptoir", "La Terrasse"],               email: "m.fontaine@example.com", phone: "06 12 34 56 78" },
  { id: "2", firstName: "Thomas",  lastName: "Bernard",  avatar: "https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-2.png", roles: ["Fermeture"],                      contractType: "CDI",          status: "Actif",    locations: ["Le Comptoir"],                              email: "t.bernard@example.com",  phone: "06 23 45 67 89" },
  { id: "3", firstName: "Camille", lastName: "Leroy",    avatar: "https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-3.png", roles: ["Ouverture"],                      contractType: "CDD",          status: "En congé", locations: ["La Terrasse"],                              email: "c.leroy@example.com",    phone: "06 34 56 78 90" },
  { id: "4", firstName: "Lucas",   lastName: "Moreau",   avatar: "https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-4.png", roles: ["Formation"],                      contractType: "Apprentissage", status: "Actif",    locations: ["Le Comptoir"],                              email: "l.moreau@example.com",   phone: "06 45 67 89 01" },
  { id: "5", firstName: "Inès",    lastName: "Dupuis",                                                                         roles: ["Manager", "Ouverture", "Caisse"], contractType: "CDI",          status: "Actif",    locations: ["Le Comptoir", "La Terrasse", "Bistrot Sud"],email: "i.dupuis@example.com",   phone: "06 56 78 90 12" },
  { id: "6", firstName: "Axel",    lastName: "Martin",                                                                         roles: ["Fermeture"],                      contractType: "Extra",        status: "Inactif",  locations: ["Bistrot Sud"],                              email: "a.martin@example.com",   phone: "06 67 89 01 23" },
  { id: "7", firstName: "Zoé",     lastName: "Petit",                                                                          roles: ["Caisse", "Ouverture"],            contractType: "CDI",          status: "Actif",    locations: ["Bistrot Sud"],                              email: "z.petit@example.com",    phone: "06 78 90 12 34" },
  { id: "8", firstName: "Hugo",    lastName: "Richard",                                                                        roles: ["Formation", "Fermeture"],         contractType: "CDI",          status: "Actif",    locations: ["Le Comptoir"],                              email: "h.richard@example.com",  phone: "06 89 01 23 45" },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const CONTRACT_COLORS: Record<ContractType, string> = {
  CDI:           "text-emerald-600",
  CDD:           "text-blue-600",
  Extra:         "text-orange-600",
  Apprentissage: "text-purple-600",
};

const STATUS_DOT: Record<Status, string> = {
  Actif:      "bg-emerald-500",
  Inactif:    "bg-zinc-400",
  "En congé": "bg-amber-400",
};

function initials(w: Worker) {
  return `${w.firstName[0]}${w.lastName[0]}`.toUpperCase();
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function WorkersPage() {
  const router = useRouter();
  const params = useParams<{ workspaceId: string }>();
  const activeCount = WORKERS.filter((w) => w.status === "Actif").length;

  return (
    <div className="space-y-4">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Employés</h1>
          <p className="text-sm text-muted-foreground">
            {activeCount} actifs · {WORKERS.length} au total
          </p>
        </div>
        <Button size="sm" className="gap-1.5" onClick={() => router.push(`/dashboard/${params.workspaceId}/workers/new`)}>
          <Plus className="h-4 w-4" />
          Ajouter
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <Input placeholder="Rechercher…" className="pl-8 h-8 text-sm" />
      </div>

      {/* Table */}
      <div className="[&>div]:rounded-lg [&>div]:border">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Employé</TableHead>
              <TableHead>Rôles</TableHead>
              <TableHead className="hidden md:table-cell">Contrat</TableHead>
              <TableHead className="hidden lg:table-cell">Sites</TableHead>
              <TableHead className="hidden sm:table-cell">Email</TableHead>
              <TableHead className="hidden sm:table-cell">Statut</TableHead>
              <TableHead className="w-8" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {WORKERS.map((worker) => (
              <TableRow key={worker.id}>

                {/* Nom + avatar */}
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-7 w-7">
                      {worker.avatar && <AvatarImage src={worker.avatar} alt={initials(worker)} />}
                      <AvatarFallback className="text-[10px] font-semibold bg-muted">
                        {initials(worker)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-sm whitespace-nowrap">
                      {worker.firstName} {worker.lastName}
                    </span>
                  </div>
                </TableCell>

                {/* Rôles */}
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {worker.roles.map((role) => (
                      <span
                        key={role}
                        className="rounded border bg-muted/40 px-1.5 py-px text-xs text-muted-foreground"
                      >
                        {role}
                      </span>
                    ))}
                  </div>
                </TableCell>

                {/* Contrat */}
                <TableCell className="hidden md:table-cell">
                  <span className={cn("text-xs font-medium", CONTRACT_COLORS[worker.contractType])}>
                    {worker.contractType}
                  </span>
                </TableCell>

                {/* Sites */}
                <TableCell className="hidden lg:table-cell">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3 shrink-0" />
                    {worker.locations.length === 1
                      ? worker.locations[0]
                      : `${worker.locations[0]} +${worker.locations.length - 1}`}
                  </div>
                </TableCell>

                {/* Email */}
                <TableCell className="hidden sm:table-cell text-xs text-muted-foreground">
                  {worker.email}
                </TableCell>

                {/* Statut */}
                <TableCell className="hidden sm:table-cell">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <div className={cn("h-1.5 w-1.5 rounded-full shrink-0", STATUS_DOT[worker.status])} />
                    {worker.status}
                  </div>
                </TableCell>

                {/* Actions */}
                <TableCell>
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <MoreHorizontal className="h-3.5 w-3.5" />
                  </Button>
                </TableCell>

              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

    </div>
  );
}
