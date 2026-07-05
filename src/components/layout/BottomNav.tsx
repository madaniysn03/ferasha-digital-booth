import { Link, useRouterState } from "@tanstack/react-router";
import { Compass, Store, PlusCircle, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/context";

type NavItem = { to: string; label: string; icon: typeof Compass; highlight?: boolean };

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { t } = useI18n();
  const items: NavItem[] = [
    { to: "/", label: t.nav.explore, icon: Compass },
    { to: "/my-ferasha", label: t.nav.myFerasha, icon: Store },
    { to: "/listings/new", label: t.nav.publish, icon: PlusCircle, highlight: true },
    { to: "/account", label: t.nav.account, icon: User },
  ];
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur md:hidden">
      <ul className="mx-auto flex max-w-md items-stretch justify-around px-2 py-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))]">
        {items.map(({ to, label, icon: Icon, highlight }) => {
          const active = pathname === to || (to !== "/" && pathname.startsWith(to));
          return (
            <li key={to} className="flex-1">
              <Link
                to={to as never}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 rounded-xl py-1.5 text-[10px] font-medium transition-colors",
                  highlight
                    ? "text-accent"
                    : active
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className={cn("size-5", highlight && "size-7")} strokeWidth={active || highlight ? 2.4 : 1.8} />
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
