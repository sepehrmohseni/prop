export type AssetCategory =
  | "cash"
  | "foreign_cash"
  | "car"
  | "house"
  | "land"
  | "gold"
  | "silver"
  | "metals"
  | "stocks"
  | "cryptocurrency"
  | "business"
  | "collectibles"
  | "bonds"
  | "retirement"
  | "receivables"
  | "other";

export type AssetStatus = "active" | "sold" | "archived";
export type ValuationSourceType = "manual" | "api" | "hybrid";

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserPreferences {
  id: string;
  user_id: string;
  base_currency: string;
  locale: string | null;
  default_country: string | null;
  theme: "light" | "dark" | "system";
  created_at: string;
  updated_at: string;
}

export interface Currency {
  code: string;
  name: string;
  symbol: string;
  decimal_places: number;
}

export interface Country {
  code: string;
  name: string;
  currency_code: string;
}

export interface AssetCategoryRecord {
  id: string;
  slug: AssetCategory;
  name: string;
  icon: string;
  sort_order: number;
}

export interface Asset {
  id: string;
  user_id: string;
  category: AssetCategory;
  name: string;
  description: string | null;
  status: AssetStatus;
  currency: string;
  current_value: number;
  cost_basis: number | null;
  base_currency_value: number | null;
  conversion_rate: number | null;
  ownership_percentage: number;
  quantity: number | null;
  acquisition_date: string | null;
  country: string | null;
  region: string | null;
  tags: string[];
  metadata: Record<string, unknown>;
  notes: string | null;
  last_valuation_date: string | null;
  valuation_source: ValuationSourceType;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

export interface AssetValuation {
  id: string;
  asset_id: string;
  user_id: string;
  value_amount: number;
  currency: string;
  conversion_rate: number | null;
  base_currency_value: number | null;
  valuation_date: string;
  source_type: ValuationSourceType;
  source_name: string | null;
  confidence: string | null;
  notes: string | null;
  created_at: string;
}

export interface AssetTag {
  id: string;
  user_id: string;
  name: string;
  color: string | null;
  created_at: string;
}

export interface AssetPurchase {
  id: string;
  asset_id: string;
  user_id: string;
  source_name: string;
  quantity: number | null;
  unit_cost: number | null;
  total_cost: number;
  currency: string;
  acquisition_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface PriceSource {
  id: string;
  name: string;
  provider_type: string;
  asset_categories: AssetCategory[];
  countries: string[];
  is_active: boolean;
  config: Record<string, unknown>;
  created_at: string;
}

export interface PriceSnapshot {
  id: string;
  asset_id: string;
  source_id: string;
  price: number;
  currency: string;
  fetched_at: string;
  created_at: string;
}

export interface FxRate {
  id: string;
  from_currency: string;
  to_currency: string;
  rate: number;
  source: string;
  fetched_at: string;
  created_at: string;
}

export interface AiUsageLog {
  id: string;
  user_id: string;
  feature: string;
  input_tokens: number;
  output_tokens: number;
  model: string;
  created_at: string;
}

export type AssetWithCategory = Asset & {
  category_record?: AssetCategoryRecord;
};
