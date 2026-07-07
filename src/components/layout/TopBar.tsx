import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { LanguageSwitch } from "./LanguageSwitch";
import { AccountMenu } from "./AccountMenu";

export function TopBar({ right, title, showLangSwitch = false }: { right?: ReactNode; title?: string; showLangSwitch?: boolean }) {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid size-8 place-items-center rounded-xl bg-primary text-primary-foreground font-display text-sm font-bold">
            F
          </span>
          <span className="font-display text-lg font-semibold tracking-tight">
            {title ?? "Ferasha"}
            <span className="text-accent">·</span>
            <span className="text-secondary"> Quantic</span>
          </span>
        </Link>
        <div className="flex items-center gap-2">
          {showLangSwitch && <LanguageSwitch />}
          {right}
          <AccountMenu />
        </div>
      </div>
    </header>
  );
}
