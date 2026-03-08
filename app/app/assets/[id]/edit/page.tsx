import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAsset } from "@/lib/db/assets";
import { AssetForm } from "@/components/asset-form";

export const metadata: Metadata = { title: "Edit Asset" };

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditAssetPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const asset = await getAsset(id);
  if (!asset) notFound();

  const { data: prefs } = await supabase
    .from("user_preferences")
    .select("base_currency")
    .eq("user_id", user.id)
    .single();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Edit Asset</h1>
        <p className="text-muted-foreground">Update {asset.name}</p>
      </div>
      <AssetForm asset={asset} baseCurrency={prefs?.base_currency ?? "USD"} />
    </div>
  );
}
