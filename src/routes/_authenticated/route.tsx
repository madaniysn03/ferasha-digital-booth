import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async ({ location }) => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });

    const { data: profile } = await supabase
      .from("profiles")
      .select("role, account_status, must_change_password")
      .eq("id", data.user.id)
      .maybeSingle();

    if (profile?.account_status === "suspended") {
      await supabase.auth.signOut();
      throw redirect({ to: "/auth", search: { reason: "suspended" } });
    }

    if (profile?.must_change_password && location.pathname !== "/change-password") {
      throw redirect({ to: "/change-password" });
    }

    return { user: data.user, role: profile?.role ?? "client" };
  },
  component: () => <Outlet />,
});
