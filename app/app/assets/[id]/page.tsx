import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAsset, getAssetPurchases } from "@/lib/db/assets";
import { AssetDetailContent } from "./asset-detail-content";

export const metadata: Metadata = { title: "Asset Detail" };

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AssetDetailPage({ params }: Props) {
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

  const [{ data: valuations }, purchases] = await Promise.all([
    supabase
      .from("asset_valuations")
      .select("*")
      .eq("asset_id", id)
      .eq("user_id", user.id)
      .order("valuation_date", { ascending: false })
      .limit(10),
    getAssetPurchases(id),
  ]);

  return (
    <AssetDetailContent
      asset={asset}
      baseCurrency={prefs?.base_currency ?? "USD"}
      valuations={valuations ?? []}
      purchases={purchases}
    />
  );
}
