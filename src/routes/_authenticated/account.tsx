import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, LogOut, Store, ShieldCheck, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { TopBar } from "@/components/layout/TopBar";
import { BottomNav } from "@/components/layout/BottomNav";

export const Route = createFileRoute("/_authenticated/account")({
  component: AccountPage,
});

function AccountPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string>("");
  const [isSuperadmin, setIsSuperadmin] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      setEmail(data.user?.email ?? "");
      if (data.user) {
        const { data: profile } = await supabase.from("profiles").select("role").eq("id", data.user.id).maybeSingle();
        setIsSuperadmin(profile?.role === "superadmin");
        setIsClient(profile?.role === "client");
      }
      setLoading(false);
    });
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  }

  if (loading) return <div className="grid min-h-screen place-items-center"><Loader2 className="size-6 animate-spin text-secondary" /></div>;

  return (
    <div className="min-h-screen pb-24 md:pb-12">
      <TopBar />
      <main className="mx-auto max-w-md px-4 py-6 space-y-4">
        <h1 className="font-display text-2xl font-bold">Mon compte</h1>
        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <p className="text-xs text-muted-foreground">Email</p>
          <p className="font-mono text-sm">{email}</p>
        </div>
        <Link to="/my-ferasha" className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-soft hover:opacity-90">
          <Store className="size-4" /> Ma Ferasha
        </Link>
        {isClient && (
          <Link to="/mes-avis" className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm font-semibold hover:bg-muted">
            <Star className="size-4" /> Mes avis
          </Link>
        )}
        {isSuperadmin && (
          <Link to="/superadmin" className="flex w-full items-center justify-center gap-2 rounded-xl border border-secondary bg-secondary/10 px-4 py-3 text-sm font-semibold text-secondary-foreground hover:bg-secondary/20">
            <ShieldCheck className="size-4" /> Espace superadmin
          </Link>
        )}
        <button onClick={signOut} className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm font-semibold hover:bg-muted">
          <LogOut className="size-4" /> Déconnexion
        </button>
      </main>
      <BottomNav />
    </div>
  );
}
