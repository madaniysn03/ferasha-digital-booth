import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MessageCircle, Phone, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { TopBar } from "@/components/layout/TopBar";
import { useI18n } from "@/lib/i18n/context";
import { contactUrls } from "@/lib/slug";
import { SUPERADMIN_WHATSAPP, SUPERADMIN_PHONE } from "@/lib/config";

export const Route = createFileRoute("/devenir-pro")({
  head: () => ({
    meta: [
      { title: "Devenir partenaire · Ferasha Quantic" },
      { name: "description", content: "Contacte notre équipe sur WhatsApp pour ouvrir ta Ferasha professionnelle." },
    ],
  }),
  component: DevenirPro,
});

function DevenirPro() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) {
        if (!cancelled) setChecking(false);
        return;
      }
      const { data: prof } = await supabase.from("profiles").select("role").eq("id", u.user.id).maybeSingle();
      if (cancelled) return;
      if (prof?.role === "pro" || prof?.role === "superadmin") {
        navigate({ to: "/my-ferasha", replace: true });
        return;
      }
      setChecking(false);
    })();
    return () => { cancelled = true; };
  }, [navigate]);

  const urls = contactUrls({
    whatsapp: SUPERADMIN_WHATSAPP,
    phone: SUPERADMIN_PHONE,
    prefilledMessage: t.devenirPro.prefilledMessage,
  });

  if (checking) {
    return <div className="grid min-h-screen place-items-center"><Loader2 className="size-6 animate-spin text-secondary" /></div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <TopBar showLangSwitch />
      <main className="mx-auto max-w-md px-4 py-8">
        <h1 className="font-display text-2xl font-bold">{t.devenirPro.title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t.devenirPro.subtitle}</p>

        <ol className="mt-6 space-y-2 text-sm text-foreground">
          <li>{t.devenirPro.step1}</li>
          <li>{t.devenirPro.step2}</li>
          <li>{t.devenirPro.step3}</li>
        </ol>

        <div className="mt-6 space-y-2">
          {urls.whatsapp && (
            <a href={urls.whatsapp} target="_blank" rel="noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-secondary px-4 py-3 text-sm font-semibold text-secondary-foreground shadow-soft transition hover:opacity-90">
              <MessageCircle className="size-4" /> {t.devenirPro.ctaWhatsapp}
            </a>
          )}
          {urls.phone && (
            <a href={urls.phone}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm font-semibold transition hover:bg-muted">
              <Phone className="size-4" /> {t.devenirPro.ctaCall}
            </a>
          )}
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {t.devenirPro.alreadyPro}{" "}
          <Link to="/auth" search={{ mode: "signin" }} className="font-semibold text-primary underline-offset-2 hover:underline">
            {t.devenirPro.alreadyProLink}
          </Link>
        </p>

        <p className="mt-6 text-center">
          <Link to="/" className="text-xs text-muted-foreground hover:text-foreground">← {t.devenirPro.backHome}</Link>
        </p>
      </main>
    </div>
  );
}
