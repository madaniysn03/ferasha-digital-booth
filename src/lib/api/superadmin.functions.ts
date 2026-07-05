import { createServerFn } from "@tanstack/react-start";
import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { CATEGORY_VALUES } from "@/lib/categories";
import type { Database } from "@/integrations/supabase/types";

function generateTempPassword() {
  const bytes = new Uint8Array(12);
  crypto.getRandomValues(bytes);
  const random = Array.from(bytes, (b) => b.toString(36).padStart(2, "0")).join("");
  return `${random.slice(0, 16)}-Aa1`;
}

async function assertSuperadmin(supabase: SupabaseClient<Database>, userId: string) {
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role, account_status")
    .eq("id", userId)
    .maybeSingle();
  if (error || !profile || profile.role !== "superadmin" || profile.account_status !== "active") {
    throw new Error("Accès réservé au superadmin.");
  }
}

// Provisionne un compte pro : crée l'utilisateur auth (via l'Admin API, jamais
// exposée au navigateur) et assigne rôle/catégories. Le mot de passe temporaire
// n'est renvoyé qu'une seule fois — à transmettre au pro par un canal sûr.
export const provisionPro = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      email: z.string().email(),
      fullName: z.string().min(1),
      allowedCategories: z.array(z.enum(CATEGORY_VALUES)).min(1),
    }),
  )
  .handler(async ({ data, context }) => {
    await assertSuperadmin(context.supabase, context.userId);

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const tempPassword = generateTempPassword();

    const { data: created, error: eCreate } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: { full_name: data.fullName },
    });
    if (eCreate || !created.user) {
      throw new Error(eCreate?.message ?? "Échec de la création du compte.");
    }

    const { error: eProfile } = await supabaseAdmin
      .from("profiles")
      .update({
        role: "pro",
        allowed_categories: data.allowedCategories,
        must_change_password: true,
        account_status: "active",
        full_name: data.fullName,
      })
      .eq("id", created.user.id);
    if (eProfile) {
      throw new Error(eProfile.message);
    }

    return { email: data.email, tempPassword };
  });

// Modifie les catégories autorisées et/ou le statut d'un compte pro existant.
export const updateProAccess = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      proId: z.string().uuid(),
      allowedCategories: z.array(z.enum(CATEGORY_VALUES)).min(1).optional(),
      accountStatus: z.enum(["active", "suspended"]).optional(),
    }),
  )
  .handler(async ({ data, context }) => {
    await assertSuperadmin(context.supabase, context.userId);

    const patch: Partial<Pick<Database["public"]["Tables"]["profiles"]["Update"], "allowed_categories" | "account_status">> = {};
    if (data.allowedCategories) patch.allowed_categories = data.allowedCategories;
    if (data.accountStatus) patch.account_status = data.accountStatus;
    if (Object.keys(patch).length === 0) return { ok: true };

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("profiles")
      .update(patch)
      .eq("id", data.proId)
      .eq("role", "pro");
    if (error) throw new Error(error.message);
    return { ok: true };
  });
