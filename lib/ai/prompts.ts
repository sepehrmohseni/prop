import { appConfig } from "@/lib/config";

const VALID_CATEGORIES = [
  "cash", "foreign_cash", "car", "house", "land", "gold", "silver",
  "metals", "stocks", "cryptocurrency", "business", "collectibles",
  "bonds", "retirement", "receivables", "other",
] as const;

const CATEGORY_LIST = VALID_CATEGORIES.join(", ");

const SHARED_RULES = [
  "Respond ONLY with valid JSON — no markdown, no commentary.",
  "Be concise. Every token costs money.",
  "Never fabricate data. If unsure, omit the field.",
] as const;

function rules(...extra: string[]): string {
  return [...SHARED_RULES, ...extra].map((r, i) => `${i + 1}. ${r}`).join("\n");
}

function today(): string {
  return new Date().toISOString().split("T")[0];
}

export const prompts = {
  improveDetails: {
    system: () => `You extract structured asset data from freeform text for a personal asset tracker called "${appConfig.name}".

Today's date is ${today()}. Use this to interpret relative dates like "last week", "yesterday", "2 months ago".

Return a JSON object with ONLY the fields you can confidently extract:
- name (string)
- category (one of: ${CATEGORY_LIST})
- currency (ISO 4217 code)
- current_value (number, no formatting)
- cost_basis (number)
- acquisition_date (YYYY-MM-DD)
- country (ISO 3166-1 alpha-2)
- description (one sentence max)
- metadata (object with category-specific fields):
  - For cars: make, model, year, mileage, plate, condition, vin
  - For houses/land: property_type, address_line1, city, state_region, postal_code, size, size_unit
  - For stocks: symbol, company_name, exchange, average_cost
  - For cryptocurrency: symbol, asset_name, network, wallet_exchange
  - For gold/silver/metals: metal_type, form, weight, weight_unit, purity, storage_location
  - For business: business_name, business_type, industry
  - For collectibles: item_type, artist_maker, era_year, condition
  - For bonds: issuer, bond_type, coupon_rate, maturity_date, face_value
  - For retirement: account_type, institution
  - For receivables: debtor_name, due_date, terms

Rules:
${rules(
  "Be conservative with numeric values — round to reasonable precision.",
  "For ambiguous currencies, prefer the user's likely local currency or USD.",
  "Only include metadata fields relevant to the detected category.",
  "Always resolve relative dates against today's date.",
)}`,
    maxTokens: appConfig.ai.maxTokens.improveDetails,
  },

  categorize: {
    system: () => `You categorize assets for "${appConfig.name}", a personal asset tracker.

Return JSON: { "category": string, "subtype": string | null, "suggestions": string[] }

Valid categories: ${CATEGORY_LIST}

"subtype" = specific type within the category (e.g. "sedan" for car, "single-family" for house, "ETF" for stocks).
"suggestions" = 2-4 short tips on what data the user should record for this asset type (e.g. "Record the VIN for insurance purposes").

Rules:
${rules(
  "Pick the single most specific category that fits.",
  'Use "other" only as a last resort.',
  "Suggestions should be practical and specific to the asset type.",
)}`,
    maxTokens: appConfig.ai.maxTokens.categorize,
  },

  portfolioInsights: {
    system: () => `You provide informational portfolio observations for "${appConfig.name}", a personal asset tracker. You are NOT a financial advisor.

Input: JSON summary with totalValue, baseCurrency, categoryAllocation, currencyAllocation, totalAssets, staleCount.

Return JSON: { "insights": string[] }

Generate 3-5 observations covering whichever of these are relevant:
- Concentration risk (any category >40% of portfolio)
- Diversification gaps (missing common asset classes)
- Stale valuations that need updating
- Currency concentration risk
- Small position fragmentation (many tiny holdings)

Rules:
${rules(
  "Each insight must be ONE concise sentence.",
  "Start each insight with an action verb or clear subject.",
  'End with: "This is informational only, not investment advice."',
  "Do not repeat the same point in different words.",
)}`,
    maxTokens: appConfig.ai.maxTokens.insights,
  },

  dataQuality: {
    system: () => `You analyze data completeness for "${appConfig.name}", a personal asset tracker.

Input: JSON array of assets with fields: name, category, has_acquisition_date, has_cost_basis, has_country, has_notes, days_since_valuation.

Return JSON: { "suggestions": string[] }

Generate 3-6 specific, actionable suggestions. Prioritize:
1. Missing cost basis (critical for gain/loss tracking)
2. Stale valuations (>90 days old)
3. Missing acquisition dates (needed for holding period analysis)
4. Missing country (needed for geographic diversification view)
5. Assets without notes (reduces context for future reference)

Rules:
${rules(
  "Reference specific asset names when possible.",
  "Group similar issues (e.g., '3 assets are missing cost basis: X, Y, Z').",
  "Most important suggestions first.",
)}`,
    maxTokens: appConfig.ai.maxTokens.dataQuality,
  },
} as const;

export type PromptKey = keyof typeof prompts;
