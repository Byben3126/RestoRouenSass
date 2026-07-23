"use client";

import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Building2, ChevronRight, LogOut, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { authClient } from "@/lib/auth-client";
import { useMe } from "@/features/user/hooks";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface OnboardingHeaderProps {
  step: number;
}

export function OnboardingHeader({ step }: OnboardingHeaderProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: me } = useMe();

  const fullName = [me?.firstName, me?.lastName].filter(Boolean).join(" ") || me?.email || "—";
  const initials = [me?.firstName?.[0], me?.lastName?.[0]].filter(Boolean).join("").toUpperCase() || "?";

  async function handleLogout() {
    await authClient.signOut();
    queryClient.clear();
    router.replace("/auth/login");
  }

  return (
    <header className="flex items-center justify-between border-b px-8 py-4">
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-foreground">
          <Building2 className="h-4 w-4 text-background" />
        </div>
        <span className="text-sm font-semibold">HCR</span>
      </div>

      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <span className={cn(step === 1 ? "font-medium text-foreground" : "")}>
          Votre entreprise
        </span>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className={cn(step === 2 ? "font-medium text-foreground" : "")}>
          Votre plan
        </span>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className={cn(step === 3 ? "font-medium text-foreground" : "")}>
          Paiement
        </span>
      </div>

      <div className="flex w-28 justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger className="group flex items-center gap-2 rounded-full py-1 pl-1 pr-2 outline-none transition-colors hover:bg-muted data-[state=open]:bg-muted">
            <Avatar className="h-7 w-7 rounded-full ring-1 ring-border">
              <AvatarImage src={me?.image ?? ""} alt={fullName} />
              <AvatarFallback className="rounded-full text-xs">{initials}</AvatarFallback>
            </Avatar>
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" sideOffset={4} className="w-56 rounded-lg">
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={me?.image ?? ""} alt={fullName} />
                  <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{fullName}</span>
                  <span className="text-muted-foreground truncate text-xs">{me?.email ?? "—"}</span>
                </div>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
              <LogOut />
              Se déconnecter
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
