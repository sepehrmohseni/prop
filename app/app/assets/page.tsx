import type { Metadata } from "next";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { getAssets } from "@/lib/db/assets";
import { AssetsListContent } from "./assets-list-content";

export const metadata: Metadata = { title: "Assets" };

interface Props {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}

export default async function AssetsPage({ searchParams }: Props) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: prefs } = await supabase
    .from("user_preferences")
    .select("base_currency")
    .eq("user_id", user.id)
    .single();

  const baseCurrency = prefs?.base_currency ?? "USD";

  const filters = {
    search: params.search,
    category: params.category,
    status: params.status as "active" | "sold" | "archived" | undefined,
    currency: params.currency,
    country: params.country,
    sortBy: (params.sort as "value" | "updated" | "acquired" | "category" | "name") ?? "updated",
    sortOrder: (params.order as "asc" | "desc") ?? "desc",
    page: params.page ? parseInt(params.page) : 1,
    pageSize: 20,
  };

  const result = await getAssets(filters);

  return (
    <Suspense>
      <AssetsListContent
        assets={result.data}
        totalCount={result.count}
        currentPage={result.page}
        totalPages={result.totalPages}
        baseCurrency={baseCurrency}
        filters={filters}
      />
    </Suspense>
  );
}
