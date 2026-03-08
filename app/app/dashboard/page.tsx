import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getDashboardStats } from "@/lib/db/assets";
import { DashboardContent } from "./dashboard-content";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: prefs } = await supabase
    .from("user_preferences")
    .select("base_currency")
    .eq("user_id", user.id)
    .single();

  const baseCurrency = prefs?.base_currency ?? "USD";
  const stats = await getDashboardStats(baseCurrency);

  return <DashboardContent stats={stats} baseCurrency={baseCurrency} />;
}
