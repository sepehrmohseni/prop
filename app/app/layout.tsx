import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/app-shell";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const { data: preferences } = await supabase
    .from("user_preferences")
    .select("*")
    .eq("user_id", user.id)
    .single();

  return (
    <AppShell
      user={{
        id: user.id,
        email: user.email ?? "",
        full_name: profile?.full_name ?? "",
        avatar_url: profile?.avatar_url ?? null,
      }}
      preferences={{
        base_currency: preferences?.base_currency ?? "USD",
        theme: preferences?.theme ?? "system",
      }}
    >
      {children}
    </AppShell>
  );
}
