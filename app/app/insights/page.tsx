import { getSession } from "@/lib/auth/actions";
import { getDashboardStats } from "@/lib/db/assets";
import { getPreferences } from "@/lib/db/profile";
import { redirect } from "next/navigation";
import { InsightsContent } from "./insights-content";

export default async function InsightsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const preferences = await getPreferences();
  const baseCurrency = preferences?.base_currency ?? "USD";
  const stats = await getDashboardStats(baseCurrency);

  if (!stats) redirect("/login");

  return <InsightsContent stats={stats} baseCurrency={baseCurrency} />;
}
