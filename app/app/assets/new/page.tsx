import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { AssetForm } from "@/components/asset-form";

export const metadata: Metadata = { title: "Add Asset" };

export default async function NewAssetPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: prefs } = await supabase
    .from("user_preferences")
    .select("base_currency")
    .eq("user_id", user.id)
    .single();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Add Asset</h1>
        <p className="text-muted-foreground">Add a new asset to your portfolio</p>
      </div>
      <AssetForm baseCurrency={prefs?.base_currency ?? "USD"} />
    </div>
  );
}
