import type { AssetCategory } from "@/types";
import {
  Banknote,
  Globe,
  Car,
  Home,
  Mountain,
  CircleDollarSign,
  Coins,
  Gem,
  TrendingUp,
  Bitcoin,
  Building2,
  Palette,
  Receipt,
  PiggyBank,
  HandCoins,
  Package,
  type LucideIcon,
} from "lucide-react";

interface CategoryConfig {
  slug: AssetCategory;
  name: string;
  icon: LucideIcon;
  color: string;
}

export const categoryConfig: Record<AssetCategory, CategoryConfig> = {
  cash: { slug: "cash", name: "Cash", icon: Banknote, color: "bg-emerald-500" },
  foreign_cash: { slug: "foreign_cash", name: "Foreign Cash", icon: Globe, color: "bg-teal-500" },
  car: { slug: "car", name: "Car", icon: Car, color: "bg-blue-500" },
  house: { slug: "house", name: "House", icon: Home, color: "bg-violet-500" },
  land: { slug: "land", name: "Land", icon: Mountain, color: "bg-amber-700" },
  gold: { slug: "gold", name: "Gold", icon: CircleDollarSign, color: "bg-yellow-500" },
  silver: { slug: "silver", name: "Silver", icon: Coins, color: "bg-gray-400" },
  metals: { slug: "metals", name: "Metals", icon: Gem, color: "bg-slate-500" },
  stocks: { slug: "stocks", name: "Stocks", icon: TrendingUp, color: "bg-indigo-500" },
  cryptocurrency: { slug: "cryptocurrency", name: "Cryptocurrency", icon: Bitcoin, color: "bg-orange-500" },
  business: { slug: "business", name: "Business Ownership", icon: Building2, color: "bg-purple-500" },
  collectibles: { slug: "collectibles", name: "Collectibles", icon: Palette, color: "bg-pink-500" },
  bonds: { slug: "bonds", name: "Bonds", icon: Receipt, color: "bg-cyan-500" },
  retirement: { slug: "retirement", name: "Retirement Accounts", icon: PiggyBank, color: "bg-rose-500" },
  receivables: { slug: "receivables", name: "Receivables", icon: HandCoins, color: "bg-lime-600" },
  other: { slug: "other", name: "Other", icon: Package, color: "bg-neutral-500" },
};

export const categoryList = Object.values(categoryConfig);

export function getCategoryConfig(slug: AssetCategory): CategoryConfig {
  return categoryConfig[slug] ?? categoryConfig.other;
}
