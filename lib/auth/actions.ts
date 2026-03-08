"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { env } from "@/lib/env";
import type { ActionResult } from "@/types";

export async function signUp(formData: {
  email: string;
  password: string;
  full_name: string;
}): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email: formData.email,
    password: formData.password,
    options: {
      data: { full_name: formData.full_name },
      emailRedirectTo: `${env.appUrl}/api/auth/callback`,
    },
  });
  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function signIn(formData: {
  email: string;
  password: string;
}): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: formData.email,
    password: formData.password,
  });
  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function forgotPassword(email: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${env.appUrl}/reset-password`,
  });
  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function resetPassword(password: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function changePassword(newPassword: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function getSession() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}
