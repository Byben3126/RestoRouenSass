"use client";

import { Plus, MoreHorizontal, Clock, Users, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useParams, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

// ─── Fixtures ────────────────────────────────────────────────────────────────

const ROLES = [
  {
    id: "1",
    name: "Manager",
    color: "#6366f1",
    workersCount: 2,
    minHoursWeek: 35,
    maxHoursWeek: 48,
    minRestHours: 11,
    canOpenClose: true,
    weekendAllowed: true,
  },
  {
    id: "2",
    name: "Ouverture",
    color: "#f59e0b",
    workersCount: 3,
    minHoursWeek: 20,
    maxHoursWeek: 35,
    minRestHours: 11,
    canOpenClose: true,
    weekendAllowed: true,
  },
  {
    id: "3",
    name: "Fermeture",
    color: "#3b82f6",
    workersCount: 3,
    minHoursWeek: 20,
    maxHoursWeek: 35,
    minRestHours: 11,
    canOpenClose: true,
    weekendAllowed: true,
  },
  {
    id: "4",
    name: "Caisse",
    color: "#10b981",
    workersCount: 2,
    minHoursWeek: 15,
    maxHoursWeek: 35,
    minRestHours: 11,
    canOpenClose: false,
    weekendAllowed: false,
  },
  {
    id: "5",
    name: "Formation",
    color: "#8b5cf6",
    workersCount: 2,
    minHoursWeek: 24,
    maxHoursWeek: 35,
    minRestHours: 11,
    canOpenClose: false,
    weekendAllowed: true,
  },
];

// ─── Page ────────────────────────────────────────────────────────────────────

export default function RolesPage() {
  const router = useRouter();
  const params = useParams<{ workspaceId: string }>();

  return (
    <div className="space-y-4">

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Rôles</h1>
          <p className="text-sm text-muted-foreground">
            {ROLES.length} rôles · définissent les règles de planning
          </p>
        </div>
        <Button
          size="sm"
          className="gap-1.5"
          onClick={() => router.push(`/dashboard/${params.workspaceId}/roles/new`)}
        >
          <Plus className="h-4 w-4" />
          Nouveau rôle
        </Button>
      </div>

      <div className="[&>div]:rounded-lg [&>div]:border">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Rôle</TableHead>
              <TableHead className="hidden sm:table-cell">
                <div className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5" />Employés</div>
              </TableHead>
              <TableHead className="hidden md:table-cell">
                <div className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" />Heures / semaine</div>
              </TableHead>
              <TableHead className="hidden lg:table-cell">
                <div className="flex items-center gap-1.5"><Shield className="h-3.5 w-3.5" />Repos min.</div>
              </TableHead>
              <TableHead className="hidden lg:table-cell">Week-end</TableHead>
              <TableHead className="w-8" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {ROLES.map((role) => (
              <TableRow
                key={role.id}
                className="cursor-pointer"
                onClick={() => router.push(`/dashboard/${params.workspaceId}/roles/${role.id}`)}
              >
                <TableCell>
                  <div className="flex items-center gap-2.5">
                    <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: role.color }} />
                    <span className="font-medium text-sm">{role.name}</span>
                  </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                  {role.workersCount}
                </TableCell>
                <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                  {role.minHoursWeek}h – {role.maxHoursWeek}h
                </TableCell>
                <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                  {role.minRestHours}h
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  <span className={cn(
                    "text-xs font-medium",
                    role.weekendAllowed ? "text-emerald-600" : "text-muted-foreground"
                  )}>
                    {role.weekendAllowed ? "Oui" : "Non"}
                  </span>
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
