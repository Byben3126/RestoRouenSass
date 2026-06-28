"use client";

import { useState, useEffect } from "react";
import { Search, MoreHorizontal, Globe } from "lucide-react";
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
import { useCustomers } from "@/features/customers/hooks";
import type { components } from "@/types/api.generated";

type CustomerDto = components["schemas"]["CustomerDto"];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const ACTIVE_THRESHOLD_DAYS = 30;

function isActive(lastVisitDate?: string): boolean {
  if (!lastVisitDate) return false;
  const diff = Date.now() - new Date(lastVisitDate).getTime();
  return diff < ACTIVE_THRESHOLD_DAYS * 24 * 60 * 60 * 1000;
}

function initials(firstName: string, lastName?: string): string {
  return `${firstName[0]}${lastName ? lastName[0] : ""}`.toUpperCase();
}

function getAge(dateOfBirth?: string): string {
  if (!dateOfBirth) return "—";
  const diff = Date.now() - new Date(dateOfBirth).getTime();
  return `${Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25))} ans`;
}

function formatDate(date?: string): string {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
const GENDER_LABEL: Record<string, string> = {
  male: "Homme",
  female: "Femme",
};

// ─── Filter ──────────────────────────────────────────────────────────────────

type Filter = "all" | "inactive" | "top";

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all",      label: "Tous" },
  { value: "inactive", label: "Inactifs" },
  { value: "top",      label: "Meilleurs clients" },
];

const PER_PAGE = 10;

// ─── Page ────────────────────────────────────────────────────────────────────

export default function CustomersPage() {
  const [filter, setFilter] = useState<Filter>("all");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, isLoading } = useCustomers({
    page,
    limit: PER_PAGE,
    search: debouncedSearch || undefined,
    onlyInactive: filter === "inactive" ? true : undefined,
    sortBy: filter === "top" ? "top" : "latest",
  });

  const customers = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));
  const activeCount = customers.filter((c) => isActive(c.lastVisitDate)).length;

  function handleFilter(f: Filter) {
    setFilter(f);
    setPage(1);
  }

  function handleSearch(value: string) {
    setSearch(value);
    setPage(1);
  }

  return (
    <div className="space-y-4">

      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold">Clients</h1>
        <p className="text-sm text-muted-foreground">
          {isLoading ? "Chargement…" : `${activeCount} actifs · ${total} au total`}
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
          <Input
            placeholder="Rechercher…"
            className="pl-8 h-8 text-sm w-56"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
          />
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
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-sm text-muted-foreground py-10">
                  Chargement…
                </TableCell>
              </TableRow>
            ) : customers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-sm text-muted-foreground py-10">
                  Aucun client trouvé
                </TableCell>
              </TableRow>
            ) : customers.map((customer: CustomerDto) => (
              <TableRow key={customer.id}>

                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-7 w-7">
                      <AvatarFallback className="text-[10px] font-semibold bg-muted">
                        {initials(customer.user.firstName, customer.user.lastName)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-sm whitespace-nowrap">
                      {customer.user.firstName} {customer.user.lastName}
                    </span>
                  </div>
                </TableCell>

                <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                  {getAge(customer.user.dateOfBirth)}
                </TableCell>

                <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                  {customer.user.gender ? GENDER_LABEL[customer.user.gender] : "—"}
                </TableCell>

                <TableCell className="hidden lg:table-cell">
                  {customer.user.city || customer.user.country ? (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Globe className="h-3 w-3 shrink-0" />
                      {[customer.user.city, customer.user.country].filter(Boolean).join(", ")}
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground/40">—</span>
                  )}
                </TableCell>

                <TableCell className="hidden sm:table-cell text-xs text-muted-foreground">
                  {formatDate(customer.lastVisitDate)}
                </TableCell>

                <TableCell className="hidden sm:table-cell">
                  <span className="text-xs font-medium">
                    {customer.points.toLocaleString("fr-FR")}
                  </span>
                </TableCell>

                <TableCell className="hidden lg:table-cell">
                  <span className="text-xs text-muted-foreground">
                    {customer.totalPointsGained.toLocaleString("fr-FR")}
                  </span>
                </TableCell>

                <TableCell className="hidden sm:table-cell">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <div className={cn(
                      "h-1.5 w-1.5 rounded-full shrink-0",
                      isActive(customer.lastVisitDate) ? "bg-emerald-500" : "bg-zinc-400"
                    )} />
                    {isActive(customer.lastVisitDate) ? "Actif" : "Inactif"}
                  </div>
                </TableCell>

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
          {total === 0
            ? "Aucun résultat"
            : `${(page - 1) * PER_PAGE + 1}–${Math.min(page * PER_PAGE, total)} sur ${total} résultat${total > 1 ? "s" : ""}`}
        </p>
        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            <PaginationPrevious
              href="#"
              onClick={(e) => { e.preventDefault(); setPage((p) => Math.max(1, p - 1)); }}
              aria-disabled={page === 1}
              className={page === 1 ? "pointer-events-none opacity-50" : ""}
            />
            <span className="text-xs text-muted-foreground px-2">
              {page} / {totalPages}
            </span>
            <PaginationNext
              href="#"
              onClick={(e) => { e.preventDefault(); setPage((p) => Math.min(totalPages, p + 1)); }}
              aria-disabled={page === totalPages}
              className={page === totalPages ? "pointer-events-none opacity-50" : ""}
            />
          </div>
        )}
      </div>

    </div>
  );
}
