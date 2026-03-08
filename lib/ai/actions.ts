"use server";

import { env, hasOpenAI } from "@/lib/env";
import { appConfig } from "@/lib/config";
import { prompts, type PromptKey } from "@/lib/ai/prompts";
import OpenAI from "openai";
import { createClient } from "@/lib/supabase/server";

// ---------------------------------------------------------------------------
// Internals
// ---------------------------------------------------------------------------

function getClient() {
  if (!hasOpenAI()) return null;
  return new OpenAI({ apiKey: env.openaiApiKey });
}

async function checkRateLimit(userId: string): Promise<{ allowed: boolean; remaining: number; resetDate: Date }> {
  const supabase = await createClient();
  const windowStart = new Date();
  windowStart.setDate(windowStart.getDate() - appConfig.ai.rateLimit.windowDays);

  const { count } = await supabase
    .from("ai_usage_logs")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", windowStart.toISOString());

  const used = count ?? 0;
  const max = appConfig.ai.rateLimit.maxUsesPerWeek;
  const resetDate = new Date(windowStart);
  resetDate.setDate(resetDate.getDate() + appConfig.ai.rateLimit.windowDays);

  return { allowed: used < max, remaining: Math.max(0, max - used), resetDate };
}

async function logUsage(userId: string, feature: string, inputTokens: number, outputTokens: number) {
  try {
    const supabase = await createClient();
    await supabase.from("ai_usage_logs").insert({
      user_id: userId,
      feature,
      input_tokens: inputTokens,
      output_tokens: outputTokens,
      model: appConfig.ai.model,
    });
  } catch {}
}

type AiResult<T> = { success: boolean; data?: T; error?: string };

async function executeAi<T>(
  promptKey: PromptKey,
  feature: string,
  userContent: string,
): Promise<AiResult<T>> {
  const client = getClient();
  if (!client) return { success: false, error: "AI features are not configured" };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const rateStatus = await checkRateLimit(user.id);
  if (!rateStatus.allowed) {
    return {
      success: false,
      error: `AI limit reached (${appConfig.ai.rateLimit.maxUsesPerWeek}/week). Resets ${rateStatus.resetDate.toLocaleDateString()}.`,
    };
  }

  const prompt = prompts[promptKey];

  try {
    const response = await client.chat.completions.create({
      model: appConfig.ai.model,
      messages: [
        { role: "system", content: prompt.system },
        { role: "user", content: userContent },
      ],
      response_format: { type: "json_object" },
      max_tokens: prompt.maxTokens,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) return { success: false, error: "No response from AI" };

    await logUsage(
      user.id,
      feature,
      response.usage?.prompt_tokens ?? 0,
      response.usage?.completion_tokens ?? 0,
    );

    return { success: true, data: JSON.parse(content) as T };
  } catch {
    return { success: false, error: "AI request failed" };
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function getAiRateStatus(): Promise<{
  allowed: boolean;
  remaining: number;
  max: number;
  resetDate: string;
}> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { allowed: false, remaining: 0, max: appConfig.ai.rateLimit.maxUsesPerWeek, resetDate: new Date().toISOString() };

  const status = await checkRateLimit(user.id);
  return {
    allowed: status.allowed,
    remaining: status.remaining,
    max: appConfig.ai.rateLimit.maxUsesPerWeek,
    resetDate: status.resetDate.toISOString(),
  };
}

export async function improveAssetDetails(rawText: string) {
  return executeAi<Record<string, unknown>>("improveDetails", "improve_asset_details", rawText);
}

export async function categorizeAsset(description: string) {
  return executeAi<{ category: string; subtype?: string; suggestions: string[] }>(
    "categorize", "categorize_asset", description,
  );
}

export async function getPortfolioInsights(summary: {
  totalValue: number;
  baseCurrency: string;
  categoryAllocation: { category: string; percentage: number }[];
  currencyAllocation: { currency: string; percentage: number }[];
  totalAssets: number;
  staleCount: number;
}) {
  return executeAi<{ insights: string[] }>("portfolioInsights", "portfolio_insights", JSON.stringify(summary));
}

export async function getDataQualitySuggestions(assets: {
  name: string;
  category: string;
  has_acquisition_date: boolean;
  has_cost_basis: boolean;
  has_country: boolean;
  has_notes: boolean;
  days_since_valuation: number | null;
}[]) {
  return executeAi<{ suggestions: string[] }>("dataQuality", "data_quality", JSON.stringify(assets));
}
