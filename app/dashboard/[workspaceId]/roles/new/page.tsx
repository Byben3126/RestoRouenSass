"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

// ─── Constants ───────────────────────────────────────────────────────────────

const DAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

// Plages horaires toutes les 30 min de 06:00 à 02:00 (lendemain)
const SLOTS: string[] = [];
for (let h = 6; h < 24; h++) {
  SLOTS.push(`${String(h).padStart(2, "0")}:00`);
  SLOTS.push(`${String(h).padStart(2, "0")}:30`);
}
SLOTS.push("00:00", "00:30", "01:00", "01:30", "02:00");

const PRESET_COLORS = ["#6366f1", "#f59e0b", "#3b82f6", "#10b981", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6"];

const TIME_PRESETS = [
  { label: "Journée",    startH: 8,  endH: 22 },
  { label: "Matin",      startH: 6,  endH: 14 },
  { label: "Après-midi", startH: 12, endH: 20 },
  { label: "Soir",       startH: 18, endH: 2  }, // overnight
];

const MAX_BRUSH = 8;

// hex alpha per employee count (index = count)
const CELL_ALPHA = ["", "3d", "5c", "7a", "99", "b3", "cc", "e0", "ff"];

// ─── Types ───────────────────────────────────────────────────────────────────

type TimeGrid = number[][];  // 0 = inactive, 1-N = employees required

function emptyGrid(): TimeGrid {
  return DAYS.map(() => SLOTS.map(() => 0));
}

// Returns the calendar hour (0-23) for a given slot index
function slotHour(s: number): number {
  if (s < 36) return 6 + Math.floor(s / 2);
  return Math.floor((s - 36) / 2); // 0, 0, 1, 1, 2
}

// ─── Section wrapper ─────────────────────────────────────────────────────────

function Section({ title, description, children }: {
  title: string; description?: string; children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div>
        <p className="text-sm font-medium">{title}</p>
        {description && <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{description}</p>}
      </div>
      <div className="md:col-span-2 space-y-4">{children}</div>
    </div>
  );
}

// ─── Stepper ─────────────────────────────────────────────────────────────────

function Stepper({ label, value, onChange, min = 0, max = 99, unit }: {
  label: string; value: number; onChange: (v: number) => void;
  min?: number; max?: number; unit?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground uppercase tracking-wider">{label}</Label>
      <div className="flex items-center gap-2">
        <div className="flex h-9 items-center rounded-md border bg-background overflow-hidden">
          <button
            type="button"
            onClick={() => onChange(Math.max(min, value - 1))}
            disabled={value <= min}
            className="px-2.5 h-full text-sm text-muted-foreground hover:bg-muted/50 disabled:opacity-30 transition-colors border-r"
          >
            −
          </button>
          <span className="w-10 text-center text-sm font-medium tabular-nums select-none">{value}</span>
          <button
            type="button"
            onClick={() => onChange(Math.min(max, value + 1))}
            disabled={value >= max}
            className="px-2.5 h-full text-sm text-muted-foreground hover:bg-muted/50 disabled:opacity-30 transition-colors border-l"
          >
            +
          </button>
        </div>
        {unit && <span className="text-xs text-muted-foreground">{unit}</span>}
      </div>
    </div>
  );
}

// ─── Toggle ──────────────────────────────────────────────────────────────────

function Toggle({ label, description, checked, onChange }: {
  label: string; description?: string; checked: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5">
      <div>
        <p className="text-sm">{label}</p>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors",
          checked ? "bg-primary" : "bg-muted"
        )}
      >
        <span className={cn(
          "pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform",
          checked ? "translate-x-4" : "translate-x-0"
        )} />
      </button>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function NewRolePage() {
  const router = useRouter();
  const params = useParams<{ workspaceId: string }>();

  // Identity
  const [name, setName]               = useState("");
  const [color, setColor]             = useState(PRESET_COLORS[0]);
  const [description, setDescription] = useState("");

  // Time grid
  const [grid, setGrid]           = useState<TimeGrid>(emptyGrid);
  const [isDragging, setIsDragging] = useState(false);
  const [dragValue, setDragValue]   = useState(0);
  const [brushCount, setBrushCount] = useState(1);

  // Planning rules
  const [minHoursDay, setMinHoursDay]                   = useState(4);
  const [maxHoursDay, setMaxHoursDay]                   = useState(10);
  const [minHoursWeek, setMinHoursWeek]                 = useState(20);
  const [maxHoursWeek, setMaxHoursWeek]                 = useState(35);
  const [minRestBetweenShifts, setMinRestBetweenShifts] = useState(11);
  const [maxConsecutiveDays, setMaxConsecutiveDays]     = useState(5);
  const [minConsecutiveDays, setMinConsecutiveDays]     = useState(1);
  const [breakAfterHours, setBreakAfterHours]           = useState(6);
  const [breakDurationMin, setBreakDurationMin]         = useState(30);
  const [minWorkersPerSlot, setMinWorkersPerSlot]       = useState(1);
  const [maxWorkersPerSlot, setMaxWorkersPerSlot]       = useState(3);

  // Availability
  const [weekendAllowed, setWeekendAllowed]     = useState(true);
  const [holidayAllowed, setHolidayAllowed]     = useState(false);
  const [nightShiftAllowed, setNightShiftAllowed] = useState(false);
  const [splitShiftAllowed, setSplitShiftAllowed] = useState(false);
  const [overtimeAllowed, setOvertimeAllowed]   = useState(false);

  // Constraints
  const [requiresQualification, setRequiresQualification] = useState(false);
  const [canBeAlone, setCanBeAlone]                       = useState(false);
  const [mandatoryPresence, setMandatoryPresence]         = useState(false);
  const [priorityLevel, setPriorityLevel]                 = useState(2);

  // ── Grid helpers ──────────────────────────────────────────────────────────

  function toggleDay(day: number) {
    const allOn = grid[day].every((v) => v > 0);
    setGrid(grid.map((r, d) => d === day ? r.map(() => allOn ? 0 : brushCount) : r));
  }

  function toggleSlot(slot: number) {
    const allOn = grid.every((r) => r[slot] > 0);
    setGrid(grid.map((r) => r.map((v, s) => s === slot ? (allOn ? 0 : brushCount) : v)));
  }

  function onMouseDown(day: number, slot: number) {
    const newVal = grid[day][slot] === brushCount ? 0 : brushCount;
    setDragValue(newVal);
    setIsDragging(true);
    setGrid(grid.map((r, d) => r.map((v, s) => d === day && s === slot ? newVal : v)));
  }

  function onMouseEnter(day: number, slot: number) {
    if (!isDragging) return;
    setGrid(grid.map((r, d) => r.map((v, s) => d === day && s === slot ? dragValue : v)));
  }

  function applyPreset(startH: number, endH: number) {
    setGrid(DAYS.map(() =>
      SLOTS.map((_, s) => {
        const h = slotHour(s);
        const active = startH < endH ? h >= startH && h < endH : h >= startH || h < endH;
        return active ? brushCount : 0;
      })
    ));
  }

  const activeSlots = grid.flat().filter((v) => v > 0).length;
  const activeHours = activeSlots * 0.5;

  return (
    <div
      className="space-y-0 select-none"
      onMouseUp={() => setIsDragging(false)}
      onMouseLeave={() => setIsDragging(false)}
    >

      {/* Header */}
      <div className="flex items-center gap-3 pb-6">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => router.push(`/dashboard/${params.workspaceId}/roles`)}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-xl font-semibold">Nouveau rôle</h1>
          <p className="text-sm text-muted-foreground">Définissez les règles qui influenceront la génération du planning.</p>
        </div>
      </div>

      <div className="space-y-6">

        {/* ── Identité ── */}
        <Section title="Identité" description="Nom et couleur affichés dans le planning et sur les profils employés.">

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground uppercase tracking-wider">Nom du rôle</Label>
            <div className="flex items-center gap-2.5 max-w-sm">
              <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
              <Input
                placeholder="Ex : Ouverture, Manager, Caisse…"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-9"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground uppercase tracking-wider">Couleur</Label>
            <div className="flex items-center gap-2 flex-wrap">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={cn(
                    "h-6 w-6 rounded-full border-2 transition-all",
                    color === c ? "border-foreground scale-110 shadow-sm" : "border-transparent hover:scale-105"
                  )}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground uppercase tracking-wider">Description <span className="normal-case">(optionnel)</span></Label>
            <Input
              placeholder="Brève description du rôle…"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="h-9 max-w-sm"
            />
          </div>

        </Section>

        <Separator />

        {/* ── Grille horaire ── */}
        <Section
          title="Plages horaires"
          description={
            activeSlots > 0
              ? `Créneaux autorisés pour ce rôle · ${activeHours}h sélectionnées`
              : "Cliquez ou glissez pour activer des créneaux. Cliquez sur un jour ou une heure pour tout basculer."
          }
        >

          {/* Pinceau — nombre d'employés */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs text-muted-foreground mr-0.5">Employés :</span>
            {Array.from({ length: MAX_BRUSH }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setBrushCount(n)}
                className={cn(
                  "h-6 w-6 rounded text-xs font-semibold border transition-all",
                  brushCount === n
                    ? "border-foreground bg-foreground text-background"
                    : "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground"
                )}
              >
                {n}
              </button>
            ))}
          </div>

          {/* Raccourcis */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs text-muted-foreground mr-0.5">Raccourcis :</span>
            {TIME_PRESETS.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => applyPreset(p.startH, p.endH)}
                className="text-xs rounded-md border px-2 py-1 text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-all"
              >
                {p.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setGrid(emptyGrid())}
              className="text-xs rounded-md border px-2 py-1 text-muted-foreground hover:text-destructive hover:border-destructive/30 transition-all ml-1"
            >
              Effacer
            </button>
          </div>

          {/* Grille */}
          <div className="overflow-x-auto rounded-lg border">
            <table className="text-xs border-collapse w-full">
              <thead>
                <tr>
                  {/* Coin vide */}
                  <th className="w-14 sticky left-0 z-10 bg-background border-b border-r" />
                  {DAYS.map((day, d) => {
                    const dayActive = grid[d].some((v) => v > 0);
                    return (
                      <th
                        key={day}
                        onClick={() => toggleDay(d)}
                        className="px-3 py-2 text-center border-b border-r last:border-r-0 cursor-pointer min-w-[44px]"
                      >
                        <div className="flex flex-col items-center gap-1">
                          <span className={cn(
                            "font-medium transition-colors",
                            dayActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                          )}>
                            {day}
                          </span>
                          <div className={cn(
                            "h-1 w-1 rounded-full transition-opacity",
                            dayActive ? "opacity-100" : "opacity-0"
                          )} style={{ backgroundColor: color }} />
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {SLOTS.map((slot, s) => {
                  const isFullHour = s % 2 === 0;
                  const hourBorder = isFullHour && s > 0 ? "border-t border-muted-foreground/15" : "";
                  return (
                    <tr key={slot}>
                      {/* Label heure */}
                      <td
                        className={cn(
                          "w-14 p-0 sticky left-0 z-10 bg-background border-r cursor-pointer hover:text-foreground transition-colors",
                          hourBorder
                        )}
                        onClick={() => toggleSlot(s)}
                      >
                        <div className={cn("flex items-center justify-end pr-2", isFullHour ? "h-5" : "h-3")}>
                          {isFullHour
                            ? <span className="text-[11px] text-muted-foreground leading-none">{slot}</span>
                            : <span className="text-[9px] text-muted-foreground/20 leading-none">·</span>
                          }
                        </div>
                      </td>
                      {/* Cellules */}
                      {DAYS.map((_, d) => {
                        const count = grid[d][s];
                        return (
                          <td
                            key={d}
                            className={cn(
                              "p-0 border-r last:border-r-0 cursor-pointer transition-colors",
                              hourBorder,
                              count > 0 ? "hover:opacity-75" : "hover:bg-muted/30"
                            )}
                            style={count > 0 ? { backgroundColor: color + (CELL_ALPHA[count] ?? "ff") } : undefined}
                            onMouseDown={() => onMouseDown(d, s)}
                            onMouseEnter={() => onMouseEnter(d, s)}
                          >
                            <div className={cn("w-full flex items-center justify-center", isFullHour ? "h-5" : "h-3")}>
                              {isFullHour && count > 0 && (
                                <span className="text-[9px] font-bold leading-none select-none" style={{ color: count >= 5 ? "rgba(255,255,255,0.9)" : "rgba(0,0,0,0.5)" }}>
                                  ×{count}
                                </span>
                              )}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

        </Section>

        <Separator />

        {/* ── Durée de shift ── */}
        <Section title="Durée de shift" description="Encadre la durée minimale et maximale d'un shift pour ce rôle.">
          <div className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
            <Stepper label="Min / jour"     value={minHoursDay}  onChange={setMinHoursDay}  min={1} max={12} unit="h" />
            <Stepper label="Max / jour"     value={maxHoursDay}  onChange={setMaxHoursDay}  min={1} max={12} unit="h" />
            <Stepper label="Min / semaine"  value={minHoursWeek} onChange={setMinHoursWeek} min={0} max={48} unit="h" />
            <Stepper label="Max / semaine"  value={maxHoursWeek} onChange={setMaxHoursWeek} min={0} max={48} unit="h" />
          </div>
        </Section>

        <Separator />

        {/* ── Repos & consécutivité ── */}
        <Section title="Repos & continuité" description="Règles légales et de bien-être entre les shifts.">
          <div className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
            <Stepper label="Repos min. entre shifts" value={minRestBetweenShifts} onChange={setMinRestBetweenShifts} min={8}  max={24} unit="h" />
            <Stepper label="Jours consécutifs max."  value={maxConsecutiveDays}   onChange={setMaxConsecutiveDays}   min={1}  max={7}  unit="j" />
            <Stepper label="Jours consécutifs min."  value={minConsecutiveDays}   onChange={setMinConsecutiveDays}   min={1}  max={7}  unit="j" />
          </div>
        </Section>

        <Separator />

        {/* ── Pause ── */}
        <Section title="Pause obligatoire" description="Pause imposée après un certain nombre d'heures travaillées.">
          <div className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
            <Stepper label="Pause après"       value={breakAfterHours}  onChange={setBreakAfterHours}  min={3} max={12} unit="h" />
            <Stepper label="Durée de la pause" value={breakDurationMin} onChange={setBreakDurationMin} min={15} max={60} unit="min" />
          </div>
        </Section>

        <Separator />

        {/* ── Effectifs ── */}
        <Section title="Effectifs par créneau" description="Nombre d'employés avec ce rôle requis simultanément sur un même créneau.">
          <div className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
            <Stepper label="Minimum requis"    value={minWorkersPerSlot} onChange={setMinWorkersPerSlot} min={0} max={20} unit="pers." />
            <Stepper label="Maximum autorisé"  value={maxWorkersPerSlot} onChange={setMaxWorkersPerSlot} min={1} max={20} unit="pers." />
          </div>
        </Section>

        <Separator />

        {/* ── Priorité ── */}
        <Section title="Priorité de planification" description="Ordre dans lequel le générateur remplit les créneaux. Un rôle haute priorité est planifié en premier.">
          <div className="flex items-center gap-2">
            {([1, 2, 3] as const).map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => setPriorityLevel(level)}
                className={cn(
                  "flex items-center gap-2 rounded-md border px-3 py-1.5 text-xs transition-all",
                  priorityLevel === level
                    ? "border-foreground bg-foreground text-background font-medium"
                    : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground"
                )}
              >
                <span className="font-semibold">{level}</span>
                <span>{level === 1 ? "Basse" : level === 2 ? "Normale" : "Haute"}</span>
              </button>
            ))}
          </div>
        </Section>

        <Separator />

        {/* ── Autorisations ── */}
        <Section title="Autorisations" description="Règles de disponibilité spécifiques à ce rôle.">
          <div className="rounded-lg border divide-y">
            {[
              { label: "Travail le week-end",     description: "Ce rôle peut être planifié le samedi et dimanche.",                             value: weekendAllowed,     onChange: setWeekendAllowed },
              { label: "Jours fériés",            description: "Ce rôle peut être planifié les jours fériés.",                                  value: holidayAllowed,     onChange: setHolidayAllowed },
              { label: "Shift de nuit",           description: "Autorise les créneaux entre 00h et 06h.",                                       value: nightShiftAllowed,  onChange: setNightShiftAllowed },
              { label: "Shift coupé",             description: "Autorise un employé à travailler deux plages non continues dans la journée.",    value: splitShiftAllowed,  onChange: setSplitShiftAllowed },
              { label: "Heures supplémentaires",  description: "Autorise le dépassement du maximum hebdomadaire défini.",                        value: overtimeAllowed,    onChange: setOvertimeAllowed },
            ].map((item) => (
              <div key={item.label} className="px-4">
                <Toggle {...item} />
              </div>
            ))}
          </div>
        </Section>

        <Separator />

        {/* ── Contraintes avancées ── */}
        <Section title="Contraintes avancées" description="Règles supplémentaires qui affectent la cohérence et la sécurité du planning.">
          <div className="rounded-lg border divide-y">
            {[
              { label: "Qualification requise",  description: "Seuls les employés ayant une qualification associée peuvent avoir ce rôle.",   value: requiresQualification, onChange: setRequiresQualification },
              { label: "Peut travailler seul",   description: "Un employé avec ce rôle peut être le seul présent sur un créneau.",            value: canBeAlone,            onChange: setCanBeAlone },
              { label: "Présence obligatoire",   description: "Au moins un employé avec ce rôle doit être présent à chaque créneau ouvert.",  value: mandatoryPresence,     onChange: setMandatoryPresence },
            ].map((item) => (
              <div key={item.label} className="px-4">
                <Toggle {...item} />
              </div>
            ))}
          </div>
        </Section>

        <Separator />

        {/* Actions */}
        <div className="flex items-center justify-between pb-8">
          <Button
            variant="ghost"
            onClick={() => router.push(`/dashboard/${params.workspaceId}/roles`)}
            className="text-muted-foreground"
          >
            Annuler
          </Button>
          <div className="flex items-center gap-2.5">
            <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
            <Button disabled={!name.trim()}>
              Créer le rôle
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}
