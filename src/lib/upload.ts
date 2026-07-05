import { supabase } from "@/integrations/supabase/client";

export async function uploadImage(bucket: "ferasha-logos" | "listings" | "avatars", userId: string, file: File) {
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${userId}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: false });
  if (error) throw error;
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}
