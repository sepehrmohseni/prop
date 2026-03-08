"use server";

import { createClient } from "@/lib/supabase/server";
import type { Profile, UserPreferences, ActionResult } from "@/types";

export async function getProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();
  return data;
}

export async function updateProfile(input: {
  full_name: string;
}): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: input.full_name,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function getPreferences(): Promise<UserPreferences | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("user_preferences")
    .select("*")
    .eq("user_id", user.id)
    .single();
  return data;
}

export async function updatePreferences(input: {
  base_currency: string;
  locale?: string | null;
  default_country?: string | null;
  theme: string;
}): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { error } = await supabase
    .from("user_preferences")
    .upsert({
      user_id: user.id,
      base_currency: input.base_currency,
      locale: input.locale ?? null,
      default_country: input.default_country ?? null,
      theme: input.theme,
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id" });

  if (error) return { success: false, error: error.message };
  return { success: true };
}
