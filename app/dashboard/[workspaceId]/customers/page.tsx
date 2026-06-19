"use client";

import { useState } from "react";
import { Search, MoreHorizontal, Globe } from "lucide-react";
import { useParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";

// ─── Types ───────────────────────────────────────────────────────────────────

type Gender = "male" | "female" | "other";

interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  gender?: Gender;
  city?: string;
  country?: string;
  isActive: boolean;
  lastVisit?: string;
  points: number;
  totalPointsEarned: number;
}

// ─── Fixtures ────────────────────────────────────────────────────────────────

const CUSTOMERS: Customer[] = [
  { id: "1", firstName: "Sophie",  lastName: "Martin",   dateOfBirth: "1990-04-12", gender: "female", city: "Rouen",      country: "France", isActive: true,  lastVisit: "2026-06-10", points: 240,  totalPointsEarned: 1840 },
  { id: "2", firstName: "Lucas",   lastName: "Bernard",  dateOfBirth: "1985-11-03", gender: "male",   city: "Paris",      country: "France", isActive: true,  lastVisit: "2026-06-08", points: 580,  totalPointsEarned: 3200 },
  { id: "3", firstName: "Emma",    lastName: "Dupont",   dateOfBirth: "1998-07-22", gender: "female", city: "Lyon",       country: "France", isActive: false, lastVisit: "2026-03-14", points: 90,   totalPointsEarned: 420  },
  { id: "4", firstName: "James",   lastName: "Smith",    dateOfBirth: "1978-01-30", gender: "male",   city: "London",     country: "UK",     isActive: true,  lastVisit: "2026-06-11", points: 1200, totalPointsEarned: 7650 },
  { id: "5", firstName: "Camille", lastName: "Leroy",    dateOfBirth: "2001-09-05", gender: "female", city: "Bordeaux",   country: "France", isActive: true,  lastVisit: "2026-05-29", points: 310,  totalPointsEarned: 1130 },
  { id: "6", firstName: "Noah",    lastName: "Williams", dateOfBirth: "1993-02-17", gender: "male",   city: "Manchester", country: "UK",     isActive: false, lastVisit: "2026-01-20", points: 45,   totalPointsEarned: 310  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function initials(c: Customer) {
  return `${c.firstName[0]}${c.lastName[0]}`.toUpperCase();
}

function getAge(dateOfBirth?: string): string {
  if (!dateOfBirth) return "—";
  const diff = Date.now() - new Date(dateOfBirth).getTime();
  return `${Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25))} ans`;
}

function formatDate(date?: string): string {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
}

const GENDER_LABEL: Record<Gender, string> = {
  male:   "Homme",
  female: "Femme",
  other:  "Autre",
};

// ─── Types ───────────────────────────────────────────────────────────────────

type Filter = "all" | "inactive" | "top";

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all",      label: "Tous" },
  { value: "inactive", label: "Inactifs" },
  { value: "top",      label: "Meilleurs clients" },
];

// ─── Page ────────────────────────────────────────────────────────────────────

export default function CustomersPage() {
  const params = useParams<{ workspaceId: string }>();
  const [filter, setFilter] = useState<Filter>("all");
  const [page, setPage] = useState(1);
  const PER_PAGE = 5;

  const filtered = CUSTOMERS.filter((c) => {
    if (filter === "inactive") return !c.isActive;
    if (filter === "top") return c.totalPointsEarned >= 1000;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const activeCount = CUSTOMERS.filter((c) => c.isActive).length;

  function goToPage(p: number) {
    setPage(Math.min(Math.max(1, p), totalPages));
  }

  // Reset page when filter changes
  function handleFilter(f: Filter) {
    setFilter(f);
    setPage(1);
  }

  return (
    <div className="space-y-4">

      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold">Clients</h1>
        <p className="text-sm text-muted-foreground">
          {activeCount} actifs · {CUSTOMERS.length} au total
        </p>
      </div>

      {/* Filters + Search */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => handleFilter(f.value)}
              className={cn(
                "rounded-lg border px-3 py-1.5 text-xs transition-all",
                filter === f.value
                  ? "border-foreground bg-foreground text-background font-medium"
                  : "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input placeholder="Rechercher…" className="pl-8 h-8 text-sm w-56" />
        </div>
      </div>

      {/* Table */}
      <div className="[&>div]:rounded-lg [&>div]:border">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Client</TableHead>
              <TableHead className="hidden md:table-cell">Âge</TableHead>
              <TableHead className="hidden md:table-cell">Genre</TableHead>
              <TableHead className="hidden lg:table-cell">Localisation</TableHead>
              <TableHead className="hidden sm:table-cell">Dernière visite</TableHead>
              <TableHead className="hidden sm:table-cell">Points</TableHead>
              <TableHead className="hidden lg:table-cell">Total gagné</TableHead>
              <TableHead className="hidden sm:table-cell">Statut</TableHead>
              <TableHead className="w-8" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.map((customer) => (
              <TableRow key={customer.id}>

                {/* Nom */}
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-7 w-7">
                      <AvatarFallback className="text-[10px] font-semibold bg-muted">
                        {initials(customer)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-sm whitespace-nowrap">
                      {customer.firstName} {customer.lastName}
                    </span>
                  </div>
                </TableCell>

                {/* Âge */}
                <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                  {getAge(customer.dateOfBirth)}
                </TableCell>

                {/* Genre */}
                <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                  {customer.gender ? GENDER_LABEL[customer.gender] : "—"}
                </TableCell>

                {/* Localisation */}
                <TableCell className="hidden lg:table-cell">
                  {customer.city || customer.country ? (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Globe className="h-3 w-3 shrink-0" />
                      {[customer.city, customer.country].filter(Boolean).join(", ")}
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground/40">—</span>
                  )}
                </TableCell>

                {/* Dernière visite */}
                <TableCell className="hidden sm:table-cell text-xs text-muted-foreground">
                  {formatDate(customer.lastVisit)}
                </TableCell>

                {/* Points */}
                <TableCell className="hidden sm:table-cell">
                  <span className="text-xs font-medium">{customer.points.toLocaleString("fr-FR")}</span>
                </TableCell>

                {/* Total gagné */}
                <TableCell className="hidden lg:table-cell">
                  <span className="text-xs text-muted-foreground">{customer.totalPointsEarned.toLocaleString("fr-FR")}</span>
                </TableCell>

                {/* Statut */}
                <TableCell className="hidden sm:table-cell">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <div className={cn(
                      "h-1.5 w-1.5 rounded-full shrink-0",
                      customer.isActive ? "bg-emerald-500" : "bg-zinc-400"
                    )} />
                    {customer.isActive ? "Actif" : "Inactif"}
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

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {filtered.length === 0
            ? "Aucun résultat"
            : `${(page - 1) * PER_PAGE + 1}–${Math.min(page * PER_PAGE, filtered.length)} sur ${filtered.length} résultat${filtered.length > 1 ? "s" : ""}`}
        </p>
        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            <PaginationPrevious
              href="#"
              onClick={(e) => { e.preventDefault(); goToPage(page - 1); }}
              aria-disabled={page === 1}
              className={page === 1 ? "pointer-events-none opacity-50" : ""}
            />
            <span className="text-xs text-muted-foreground px-2">
              {page} / {totalPages}
            </span>
            <PaginationNext
              href="#"
              onClick={(e) => { e.preventDefault(); goToPage(page + 1); }}
              aria-disabled={page === totalPages}
              className={page === totalPages ? "pointer-events-none opacity-50" : ""}
            />
          </div>
        )}
      </div>

    </div>
  );
}
