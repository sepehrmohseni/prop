"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { DashboardStats } from "@/types";
import { AssetCategory } from "@/types";
import { getPortfolioInsights, getDataQualitySuggestions } from "@/lib/ai/actions";
import { hasOpenAI } from "@/lib/env";
import { formatCurrency, formatPercentage } from "@/lib/formatting";
import { getCategoryConfig } from "@/lib/categories";
import { appConfig } from "@/lib/config";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Sparkles,
  Loader2,
  PieChart,
  AlertTriangle,
  TrendingUp,
  Lightbulb,
  ShieldAlert,
  BarChart3,
  Clock,
} from "lucide-react";
import {
  PageTransition,
  StaggerList,
  StaggerItem,
  AnimatedCard,
  AnimatedNumber,
} from "@/components/motion";

interface InsightsContentProps {
  stats: DashboardStats;
  baseCurrency: string;
}

export function InsightsContent({ stats, baseCurrency }: InsightsContentProps) {
  const [aiInsights, setAiInsights] = useState<string[] | null>(null);
  const [dataQuality, setDataQuality] = useState<string[] | null>(null);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [loadingQuality, setLoadingQuality] = useState(false);
  const [rateLimitError, setRateLimitError] = useState<string | null>(null);
  const aiAvailable = hasOpenAI();

  async function handleGetInsights() {
    setLoadingInsights(true);
    const summary = {
      totalValue: stats.totalValue,
      baseCurrency,
      categoryAllocation: stats.categoryAllocation.map((c) => ({
        category: c.category,
        percentage: c.percentage,
      })),
      currencyAllocation: stats.currencyAllocation.map((c) => ({
        currency: c.currency,
        percentage: c.percentage,
      })),
      totalAssets: stats.totalAssets,
      staleCount: stats.staleAssets.length,
    };
    const result = await getPortfolioInsights(summary);
    if (result.success && result.data) {
      setAiInsights(result.data.insights);
      setRateLimitError(null);
    } else if (result.error) {
      setRateLimitError(result.error);
    }
    setLoadingInsights(false);
  }

  async function handleGetQuality() {
    setLoadingQuality(true);
    const assetSummary = stats.staleAssets.map((a) => ({
      name: a.name,
      category: a.category,
      has_acquisition_date: true,
      has_cost_basis: true,
      has_country: true,
      has_notes: true,
      days_since_valuation: a.last_valuation_date
        ? Math.floor((Date.now() - new Date(a.last_valuation_date).getTime()) / 86400000)
        : null,
    }));
    const result = await getDataQualitySuggestions(assetSummary);
    if (result.success && result.data) {
      setDataQuality(result.data.suggestions);
      setRateLimitError(null);
    } else if (result.error) {
      setRateLimitError(result.error);
    }
    setLoadingQuality(false);
  }

  const topCategory = stats.categoryAllocation[0];
  const concentrationRisk =
    topCategory && stats.totalAssets > 1
      ? topCategory.percentage
      : 0;

  return (
    <PageTransition className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Insights</h1>
        <p className="text-muted-foreground">Portfolio analysis and recommendations</p>
      </div>

      <StaggerList className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          {
            title: "Total Value",
            icon: BarChart3,
            value: formatCurrency(stats.totalValue, baseCurrency),
            sub: `Across ${stats.totalAssets} assets`,
            gradient: "from-blue-500/10 to-blue-500/5",
            iconColor: "text-blue-500",
          },
          {
            title: "Categories",
            icon: PieChart,
            value: String(stats.categoryAllocation.length),
            sub: "Asset types in portfolio",
            gradient: "from-violet-500/10 to-violet-500/5",
            iconColor: "text-violet-500",
          },
          {
            title: "Currencies",
            icon: TrendingUp,
            value: String(stats.currencyAllocation.length),
            sub: "Currency exposures",
            gradient: "from-emerald-500/10 to-emerald-500/5",
            iconColor: "text-emerald-500",
          },
          {
            title: "Stale Valuations",
            icon: AlertTriangle,
            value: String(stats.staleAssets.length),
            sub: "Need attention",
            gradient: stats.staleAssets.length > 0 ? "from-amber-500/10 to-amber-500/5" : "from-emerald-500/10 to-emerald-500/5",
            iconColor: stats.staleAssets.length > 0 ? "text-amber-500" : "text-emerald-500",
          },
        ].map((card) => (
          <StaggerItem key={card.title}>
            <Card className="relative overflow-hidden">
              <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} pointer-events-none`} />
              <CardHeader className="relative flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
                <card.icon className={`h-4 w-4 ${card.iconColor}`} />
              </CardHeader>
              <CardContent className="relative">
                <AnimatedNumber value={card.value} className="text-2xl font-bold" />
                <p className="text-xs text-muted-foreground mt-1">{card.sub}</p>
              </CardContent>
            </Card>
          </StaggerItem>
        ))}
      </StaggerList>

      <div className="grid gap-6 md:grid-cols-2">
        <AnimatedCard>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Category Allocation
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.categoryAllocation.length === 0 ? (
              <p className="text-sm text-muted-foreground">No assets yet</p>
            ) : (
              <div className="space-y-3">
                {stats.categoryAllocation.map((c) => {
                  const config = getCategoryConfig(c.category as AssetCategory);
                  const pct = c.percentage;
                  return (
                    <div key={c.category} className="space-y-1.5">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{config?.name ?? c.category}</span>
                        <span className="text-muted-foreground tabular-nums">
                          {formatCurrency(c.value, baseCurrency)} ({formatPercentage(pct)})
                        </span>
                      </div>
                      <Progress value={Math.min(pct, 100)} className="h-2" />
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
        </AnimatedCard>

        <AnimatedCard>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5" />
              Concentration Risk
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.totalAssets === 0 ? (
              <p className="text-sm text-muted-foreground">Add assets to see risk analysis</p>
            ) : (
              <div className="space-y-4">
                {concentrationRisk > 0 && topCategory && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Top Category</span>
                      <Badge variant={concentrationRisk > 60 ? "destructive" : concentrationRisk > 40 ? "secondary" : "outline"}>
                        {formatPercentage(concentrationRisk)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {getCategoryConfig(topCategory.category as AssetCategory)?.name ?? topCategory.category} makes up {formatPercentage(concentrationRisk)} of your portfolio
                    </p>
                    {concentrationRisk > 50 && (
                      <p className="text-sm text-amber-600 dark:text-amber-400">
                        Consider diversifying — heavy concentration in one category increases risk
                      </p>
                    )}
                  </div>
                )}
                <Separator />
                <div className="space-y-2">
                  <span className="text-sm font-medium">Currency Exposure</span>
                  {stats.currencyAllocation.map((c) => {
                    const pct = c.percentage;
                    return (
                      <div key={c.currency} className="flex items-center justify-between text-sm">
                        <span>{c.currency}</span>
                        <span className="text-muted-foreground">{formatPercentage(pct)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        </AnimatedCard>
      </div>

      {aiAvailable && (
        <>
          {rateLimitError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="border-amber-200/60 dark:border-amber-800/40 bg-gradient-to-br from-amber-50/40 to-transparent dark:from-amber-950/20 dark:to-transparent">
                <CardContent className="flex items-center gap-3 py-4">
                  <Clock className="h-5 w-5 text-amber-500 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-amber-700 dark:text-amber-400">{rateLimitError}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      AI features are limited to {appConfig.ai.rateLimit.maxUsesPerWeek} uses per week to ensure quality insights.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          <div className="grid gap-6 md:grid-cols-2">
            <AnimatedCard>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  AI Portfolio Insights
                </CardTitle>
                <CardDescription>
                  Get AI-powered analysis of your portfolio
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {aiInsights ? (
                  <ul className="space-y-3">
                    {aiInsights.map((insight, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="text-sm text-muted-foreground flex items-start gap-2"
                      >
                        <Sparkles className="h-3.5 w-3.5 text-primary mt-0.5 flex-shrink-0" />
                        {insight}
                      </motion.li>
                    ))}
                  </ul>
                ) : (
                  <Button onClick={handleGetInsights} disabled={loadingInsights || stats.totalAssets === 0} className="shadow-sm">
                    {loadingInsights ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Generate Insights
                      </>
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>
            </AnimatedCard>

            <AnimatedCard>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-primary" />
                  Data Quality
                </CardTitle>
                <CardDescription>
                  Suggestions to improve your asset data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {dataQuality ? (
                  <ul className="space-y-3">
                    {dataQuality.map((suggestion, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="text-sm text-muted-foreground flex items-start gap-2"
                      >
                        <Lightbulb className="h-3.5 w-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
                        {suggestion}
                      </motion.li>
                    ))}
                  </ul>
                ) : (
                  <Button onClick={handleGetQuality} disabled={loadingQuality || stats.totalAssets === 0} className="shadow-sm">
                    {loadingQuality ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Lightbulb className="mr-2 h-4 w-4" />
                        Check Data Quality
                      </>
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>
            </AnimatedCard>
          </div>
        </>
      )}
    </PageTransition>
  );
}
