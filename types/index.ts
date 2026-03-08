export * from "./database";
import type { Asset, AssetStatus } from "./database";

export interface ActionResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginatedResult<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface DashboardStats {
  totalValue: number;
  totalAssets: number;
  baseCurrency: string;
  categoryAllocation: { category: string; value: number; percentage: number }[];
  currencyAllocation: { currency: string; value: number; percentage: number }[];
  countryAllocation: { country: string; value: number; percentage: number }[];
  topHoldings: Asset[];
  recentlyUpdated: Asset[];
  staleAssets: Asset[];
}

export interface AssetFilters {
  search?: string;
  category?: string;
  status?: AssetStatus;
  country?: string;
  currency?: string;
  tags?: string[];
  sortBy?: "value" | "updated" | "acquired" | "category" | "name";
  sortOrder?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}
