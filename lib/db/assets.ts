"use server";

import { createClient } from "@/lib/supabase/server";
import type { Asset, AssetFilters, AssetPurchase, ActionResult, PaginatedResult } from "@/types";

export async function getAssets(filters: AssetFilters = {}): Promise<PaginatedResult<Asset>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: [], count: 0, page: 1, pageSize: 20, totalPages: 0 };

  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 20;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("assets")
    .select("*", { count: "exact" })
    .eq("user_id", user.id)
    .eq("is_deleted", false);

  if (filters.search) {
    query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
  }
  if (filters.category) {
    query = query.eq("category", filters.category);
  }
  if (filters.status) {
    query = query.eq("status", filters.status);
  }
  if (filters.country) {
    query = query.eq("country", filters.country);
  }
  if (filters.currency) {
    query = query.eq("currency", filters.currency);
  }

  const sortColumn = filters.sortBy === "value" ? "current_value"
    : filters.sortBy === "updated" ? "updated_at"
    : filters.sortBy === "acquired" ? "acquisition_date"
    : filters.sortBy === "category" ? "category"
    : filters.sortBy === "name" ? "name"
    : "updated_at";

  query = query.order(sortColumn, { ascending: filters.sortOrder === "asc" });
  query = query.range(from, to);

  const { data, count, error } = await query;

  if (error) return { data: [], count: 0, page, pageSize, totalPages: 0 };

  const total = count ?? 0;
  return {
    data: data ?? [],
    count: total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function getAsset(id: string): Promise<Asset | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("assets")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .eq("is_deleted", false)
    .single();

  return data;
}

export async function createAsset(
  input: Omit<Asset, "id" | "user_id" | "is_deleted" | "created_at" | "updated_at" | "last_valuation_date">
): Promise<ActionResult<Asset>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("assets")
    .insert({
      ...input,
      user_id: user.id,
      is_deleted: false,
      last_valuation_date: now,
      valuation_source: "manual",
      created_at: now,
      updated_at: now,
    })
    .select()
    .single();

  if (error) return { success: false, error: error.message };

  await supabase.from("asset_valuations").insert({
    asset_id: data.id,
    user_id: user.id,
    value_amount: input.current_value,
    currency: input.currency,
    conversion_rate: input.conversion_rate,
    base_currency_value: input.base_currency_value,
    valuation_date: now,
    source_type: "manual",
  });

  return { success: true, data };
}

export async function updateAsset(
  id: string,
  input: Partial<Omit<Asset, "id" | "user_id" | "is_deleted" | "created_at">>,
  options?: { updateValuation?: boolean }
): Promise<ActionResult<Asset>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const now = new Date().toISOString();
  const shouldUpdateValuation = options?.updateValuation === true;

  const updatePayload = {
    ...input,
    updated_at: now,
    ...(shouldUpdateValuation ? { last_valuation_date: now } : {}),
  };

  const { data, error } = await supabase
    .from("assets")
    .update(updatePayload)
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) return { success: false, error: error.message };

  if (shouldUpdateValuation && input.current_value !== undefined) {
    await supabase.from("asset_valuations").insert({
      asset_id: id,
      user_id: user.id,
      value_amount: input.current_value,
      currency: input.currency ?? data.currency,
      conversion_rate: input.conversion_rate,
      base_currency_value: input.base_currency_value,
      valuation_date: now,
      source_type: "manual",
    });
  }

  return { success: true, data };
}

export async function deleteAsset(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { error } = await supabase
    .from("assets")
    .update({ is_deleted: true, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function getDashboardStats(baseCurrency: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: assets } = await supabase
    .from("assets")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_deleted", false)
    .eq("status", "active");

  if (!assets || assets.length === 0) {
    return {
      totalValue: 0,
      totalAssets: 0,
      baseCurrency,
      categoryAllocation: [],
      currencyAllocation: [],
      countryAllocation: [],
      topHoldings: [],
      recentlyUpdated: [],
      staleAssets: [],
    };
  }

  const totalValue = assets.reduce((sum, a) => {
    const val = a.base_currency_value ?? a.current_value;
    return sum + val * (a.ownership_percentage / 100);
  }, 0);

  const categoryMap = new Map<string, number>();
  const currencyMap = new Map<string, number>();
  const countryMap = new Map<string, number>();

  assets.forEach((a) => {
    const val = (a.base_currency_value ?? a.current_value) * (a.ownership_percentage / 100);
    categoryMap.set(a.category, (categoryMap.get(a.category) ?? 0) + val);
    currencyMap.set(a.currency, (currencyMap.get(a.currency) ?? 0) + val);
    if (a.country) countryMap.set(a.country, (countryMap.get(a.country) ?? 0) + val);
  });

  const categoryAllocation = Array.from(categoryMap.entries())
    .map(([category, value]) => ({
      category,
      value,
      percentage: totalValue > 0 ? (value / totalValue) * 100 : 0,
    }))
    .sort((a, b) => b.value - a.value);

  const currencyAllocation = Array.from(currencyMap.entries())
    .map(([currency, value]) => ({
      currency,
      value,
      percentage: totalValue > 0 ? (value / totalValue) * 100 : 0,
    }))
    .sort((a, b) => b.value - a.value);

  const countryAllocation = Array.from(countryMap.entries())
    .map(([country, value]) => ({
      country,
      value,
      percentage: totalValue > 0 ? (value / totalValue) * 100 : 0,
    }))
    .sort((a, b) => b.value - a.value);

  const sorted = [...assets].sort(
    (a, b) =>
      (b.base_currency_value ?? b.current_value) - (a.base_currency_value ?? a.current_value)
  );

  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  const staleAssets = assets.filter(
    (a) => !a.last_valuation_date || new Date(a.last_valuation_date) < ninetyDaysAgo
  );

  const recentlyUpdated = [...assets]
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 5);

  return {
    totalValue,
    totalAssets: assets.length,
    baseCurrency,
    categoryAllocation,
    currencyAllocation,
    countryAllocation,
    topHoldings: sorted.slice(0, 5),
    recentlyUpdated,
    staleAssets: staleAssets.slice(0, 5),
  };
}

export async function getAssetPurchases(assetId: string): Promise<AssetPurchase[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("asset_purchases")
    .select("*")
    .eq("asset_id", assetId)
    .eq("user_id", user.id)
    .order("acquisition_date", { ascending: false, nullsFirst: false });

  return data ?? [];
}

export async function addAssetPurchase(
  input: Omit<AssetPurchase, "id" | "user_id" | "created_at" | "updated_at">
): Promise<ActionResult<AssetPurchase>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { data: asset } = await supabase
    .from("assets")
    .select("id")
    .eq("id", input.asset_id)
    .eq("user_id", user.id)
    .single();

  if (!asset) return { success: false, error: "Asset not found" };

  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("asset_purchases")
    .insert({
      ...input,
      user_id: user.id,
      created_at: now,
      updated_at: now,
    })
    .select()
    .single();

  if (error) return { success: false, error: error.message };
  return { success: true, data };
}

export async function deleteAssetPurchase(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { error } = await supabase
    .from("asset_purchases")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { success: false, error: error.message };
  return { success: true };
}
