import { env } from "@/lib/env";

export const appConfig = {
  name: "Prop",
  description: "Personal Asset Tracker",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",

  ai: {
    enabled: !!process.env.OPENAI_API_KEY,
    model: env.openaiModel,
    maxTokens: {
      improveDetails: 500,
      categorize: 300,
      insights: 500,
      dataQuality: 400,
    },
    rateLimit: {
      maxUsesPerWeek: 5,
      windowDays: 7,
    },
  },

  assets: {
    staleThresholdDays: 90,
    pageSize: 20,
    maxTagsPerAsset: 10,
    maxPurchaseLots: 50,
  },

  dashboard: {
    topHoldingsCount: 5,
    recentlyUpdatedCount: 5,
    maxCountryExposure: 6,
    maxCategoryChart: 10,
  },

  valuation: {
    defaultSource: "manual" as const,
    confidenceLevels: ["high", "medium", "low", "estimate"] as const,
  },

  currency: {
    defaultBase: "USD",
  },

  theme: {
    default: "system" as const,
    options: ["light", "dark", "system"] as const,
  },
} as const;

export type AppConfig = typeof appConfig;
