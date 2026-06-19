"use client";

import { Plus, MoreHorizontal, MapPin, Users, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useParams, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

// ─── Fixtures ────────────────────────────────────────────────────────────────

const LOCATIONS = [
  {
    id: "1",
    name: "Le Comptoir",
    address: "12 rue de la Paix, 75001 Paris",
    workersCount: 5,
    openDays: ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"],
    openTime: "08:00",
    closeTime: "23:00",
    status: "Ouvert",
  },
  {
    id: "2",
    name: "La Terrasse",
    address: "3 avenue Montaigne, 75008 Paris",
    workersCount: 3,
    openDays: ["Mer", "Jeu", "Ven", "Sam", "Dim"],
    openTime: "12:00",
    closeTime: "00:00",
    status: "Ouvert",
  },
  {
    id: "3",
    name: "Bistrot Sud",
    address: "8 rue Sainte-Anne, 13001 Marseille",
    workersCount: 2,
    openDays: ["Lun", "Mar", "Mer", "Jeu", "Ven"],
    openTime: "09:00",
    closeTime: "22:00",
    status: "Fermé",
  },
];

const STATUS_STYLE: Record<string, string> = {
  Ouvert: "bg-emerald-500",
  Fermé: "bg-zinc-400",
};

// ─── Page ────────────────────────────────────────────────────────────────────

export default function LocationsPage() {
  const router = useRouter();
  const params = useParams<{ workspaceId: string }>();

  return (
    <div className="space-y-4">

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Sites</h1>
          <p className="text-sm text-muted-foreground">
            {LOCATIONS.length} établissements configurés
          </p>
        </div>
        <Button
          size="sm"
          className="gap-1.5"
          onClick={() => router.push(`/dashboard/${params.workspaceId}/locations/new`)}
        >
          <Plus className="h-4 w-4" />
          Nouveau site
        </Button>
      </div>

      <div className="[&>div]:rounded-lg [&>div]:border">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Site</TableHead>
              <TableHead className="hidden md:table-cell">
                <div className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />Adresse</div>
              </TableHead>
              <TableHead className="hidden sm:table-cell">
                <div className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5" />Employés</div>
              </TableHead>
              <TableHead className="hidden lg:table-cell">
                <div className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" />Horaires</div>
              </TableHead>
              <TableHead className="hidden lg:table-cell">Jours ouverts</TableHead>
              <TableHead className="hidden sm:table-cell">Statut</TableHead>
              <TableHead className="w-8" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {LOCATIONS.map((loc) => (
              <TableRow
                key={loc.id}
                className="cursor-pointer"
                onClick={() => router.push(`/dashboard/${params.workspaceId}/locations/${loc.id}`)}
              >
                <TableCell>
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted">
                      <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                    <span className="font-medium text-sm">{loc.name}</span>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                  {loc.address}
                </TableCell>
                <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                  {loc.workersCount}
                </TableCell>
                <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                  {loc.openTime} – {loc.closeTime}
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  <div className="flex gap-1 flex-wrap">
                    {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((day) => (
                      <span
                        key={day}
                        className={cn(
                          "text-[10px] font-medium px-1.5 py-px rounded",
                          loc.openDays.includes(day)
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground/30"
                        )}
                      >
                        {day}
                      </span>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <div className={cn("h-1.5 w-1.5 rounded-full shrink-0", STATUS_STYLE[loc.status])} />
                    {loc.status}
                  </div>
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
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
