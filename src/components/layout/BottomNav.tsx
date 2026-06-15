import { Link, useRouterState } from "@tanstack/react-router";
import { Compass, Store, PlusCircle, User } from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = { to: string; label: string; icon: typeof Compass; highlight?: boolean };
const items: NavItem[] = [
  { to: "/", label: "Explorer", icon: Compass },
  { to: "/my-ferasha", label: "Ma Ferasha", icon: Store },
  { to: "/listings/new", label: "Publier", icon: PlusCircle, highlight: true },
  { to: "/account", label: "Compte", icon: User },
];

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
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
