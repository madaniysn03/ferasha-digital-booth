import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LogOut, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n/context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function AccountMenu() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user?.email ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  }

  if (!email) {
    return (
      <Link
        to="/auth"
        className="rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-semibold hover:bg-muted"
      >
        {t.nav.signIn}
      </Link>
    );
  }

  const initial = email.charAt(0).toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 rounded-full border border-border bg-card py-1 pe-3 ps-1 text-sm outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring">
        <span className="grid size-7 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
          {initial}
        </span>
        <span className="hidden max-w-[12rem] truncate text-xs font-medium text-muted-foreground sm:inline">
          {email}
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex flex-col gap-0.5">
          <span className="text-[10px] font-normal uppercase tracking-wide text-muted-foreground">
            {t.nav.myAccount}
          </span>
          <span className="truncate font-mono text-xs font-normal">{email}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="cursor-pointer">
          <Link to="/account">
            <User className="size-4" /> {t.nav.myAccount}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={(e) => {
            e.preventDefault();
            signOut();
          }}
          className="cursor-pointer text-destructive focus:text-destructive"
        >
          <LogOut className="size-4" /> {t.nav.signOut}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
