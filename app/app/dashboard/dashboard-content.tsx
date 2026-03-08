"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { formatCurrency, formatPercentage, formatDateRelative } from "@/lib/formatting";
import { getCategoryConfig } from "@/lib/categories";
import type { Asset, AssetCategory } from "@/types";
import {
  Wallet,
  TrendingUp,
  Layers,
  AlertTriangle,
  Plus,
  ArrowRight,
  PieChart,
  Clock,
  Globe,
} from "lucide-react";
import {
  PieChart as RechartsPie,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import {
  PageTransition,
  StaggerList,
  StaggerItem,
  AnimatedCard,
  AnimatedNumber,
} from "@/components/motion";

const CHART_COLORS = [
  "hsl(215, 90%, 58%)",
  "hsl(160, 70%, 45%)",
  "hsl(280, 65%, 55%)",
  "hsl(35, 90%, 55%)",
  "hsl(340, 75%, 55%)",
  "hsl(180, 60%, 45%)",
  "hsl(50, 85%, 50%)",
  "hsl(0, 70%, 55%)",
  "hsl(250, 60%, 60%)",
  "hsl(305, 55%, 50%)",
];

interface DashboardContentProps {
  stats: {
    totalValue: number;
    totalAssets: number;
    baseCurrency: string;
    categoryAllocation: { category: string; value: number; percentage: number }[];
    currencyAllocation: { currency: string; value: number; percentage: number }[];
    countryAllocation: { country: string; value: number; percentage: number }[];
    topHoldings: Asset[];
    recentlyUpdated: Asset[];
    staleAssets: Asset[];
  } | null;
  baseCurrency: string;
}

function EmptyDashboard() {
  return (
    <PageTransition className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Your personal asset overview</p>
      </div>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
              className="mb-6 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 p-6"
            >
              <Wallet className="h-10 w-10 text-primary" />
            </motion.div>
            <motion.h3
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-xl font-semibold mb-2"
            >
              Welcome to Prop
            </motion.h3>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-muted-foreground max-w-sm mb-8"
            >
              Start by adding your first asset to see your portfolio overview, allocation charts, and insights.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Link href="/app/assets/new">
                <Button size="lg" className="gap-2 shadow-lg shadow-primary/20">
                  <Plus className="h-4 w-4" />
                  Add Your First Asset
                </Button>
              </Link>
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-lg text-left"
            >
              {[
                { title: "1. Add assets", desc: "Cash, property, stocks, crypto, and more" },
                { title: "2. Set values", desc: "Track current worth in any currency" },
                { title: "3. Get clarity", desc: "See allocation, trends, and insights" },
              ].map((step, i) => (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + i * 0.1 }}
                  className="rounded-xl border bg-card/50 p-4 hover:bg-accent/50 transition-colors"
                >
                  <p className="text-sm font-medium">{step.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{step.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </PageTransition>
  );
}

export function DashboardContent({ stats, baseCurrency }: DashboardContentProps) {
  if (!stats || stats.totalAssets === 0) {
    return <EmptyDashboard />;
  }

  const categoryData = stats.categoryAllocation.map((item) => ({
    name: getCategoryConfig(item.category as AssetCategory).name,
    value: item.value,
    percentage: item.percentage,
  }));

  const currencyData = stats.currencyAllocation.map((item) => ({
    name: item.currency,
    value: item.value,
    percentage: item.percentage,
  }));

  return (
    <PageTransition className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Your personal asset overview</p>
        </div>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Link href="/app/assets/new">
            <Button className="gap-2 shadow-sm" size="sm">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add Asset</span>
            </Button>
          </Link>
        </motion.div>
      </div>

      <StaggerList className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            title: "Total Value",
            icon: Wallet,
            value: formatCurrency(stats.totalValue, baseCurrency, { compact: true }),
            sub: `in ${baseCurrency}`,
            gradient: "from-blue-500/10 to-blue-500/5",
            iconColor: "text-blue-500",
          },
          {
            title: "Total Assets",
            icon: Layers,
            value: String(stats.totalAssets),
            sub: `across ${stats.categoryAllocation.length} categories`,
            gradient: "from-emerald-500/10 to-emerald-500/5",
            iconColor: "text-emerald-500",
          },
          {
            title: "Top Category",
            icon: PieChart,
            value: stats.categoryAllocation[0]
              ? getCategoryConfig(stats.categoryAllocation[0].category as AssetCategory).name
              : "—",
            sub: stats.categoryAllocation[0] ? formatPercentage(stats.categoryAllocation[0].percentage) : "",
            gradient: "from-violet-500/10 to-violet-500/5",
            iconColor: "text-violet-500",
          },
          {
            title: "Stale Valuations",
            icon: AlertTriangle,
            value: String(stats.staleAssets.length),
            sub: stats.staleAssets.length > 0 ? "need attention" : "all up to date",
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

      <div className="grid gap-6 lg:grid-cols-2">
        <AnimatedCard>
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <PieChart className="h-4 w-4 text-primary" />
              Category Allocation
            </CardTitle>
          </CardHeader>
          <CardContent>
            {categoryData.length > 0 ? (
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="w-48 h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPie>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {categoryData.map((_, i) => (
                          <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => formatCurrency(Number(value), baseCurrency)}
                      />
                    </RechartsPie>
                  </ResponsiveContainer>
                </div>
                <div className="flex-1 space-y-3 w-full">
                  {categoryData.slice(0, 6).map((item, i) => (
                    <motion.div
                      key={item.name}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + i * 0.05 }}
                      className="space-y-1"
                    >
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div
                            className="h-2.5 w-2.5 rounded-full"
                            style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
                          />
                          <span>{item.name}</span>
                        </div>
                        <span className="font-medium tabular-nums">{formatPercentage(item.percentage)}</span>
                      </div>
                      <Progress value={item.percentage} className="h-1.5" />
                    </motion.div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No data yet</p>
            )}
          </CardContent>
        </Card>
        </AnimatedCard>

        <AnimatedCard>
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Currency Exposure
            </CardTitle>
          </CardHeader>
          <CardContent>
            {currencyData.length > 0 ? (
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="w-48 h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPie>
                      <Pie
                        data={currencyData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {currencyData.map((_, i) => (
                          <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => formatCurrency(Number(value), baseCurrency)}
                      />
                    </RechartsPie>
                  </ResponsiveContainer>
                </div>
                <div className="flex-1 space-y-3 w-full">
                  {currencyData.slice(0, 6).map((item, i) => (
                    <motion.div
                      key={item.name}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + i * 0.05 }}
                      className="space-y-1"
                    >
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div
                            className="h-2.5 w-2.5 rounded-full"
                            style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
                          />
                          <span className="font-mono">{item.name}</span>
                        </div>
                        <span className="font-medium tabular-nums">{formatPercentage(item.percentage)}</span>
                      </div>
                      <Progress value={item.percentage} className="h-1.5" />
                    </motion.div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No data yet</p>
            )}
          </CardContent>
        </Card>
        </AnimatedCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <AnimatedCard>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Top Holdings
            </CardTitle>
            <Link href="/app/assets">
              <Button variant="ghost" size="sm" className="gap-1 text-xs">
                View all <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.topHoldings.map((asset, i) => {
                const config = getCategoryConfig(asset.category as AssetCategory);
                const Icon = config.icon;
                return (
                  <motion.div
                    key={asset.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.05 }}
                  >
                    <Link
                      href={`/app/assets/${asset.id}`}
                      className="flex items-center justify-between rounded-xl border p-3 hover:bg-accent/50 hover:shadow-sm transition-all active:scale-[0.99]"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`rounded-xl p-2.5 ${config.color} text-white shadow-sm`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold">{asset.name}</p>
                          <p className="text-xs text-muted-foreground">{config.name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {formatCurrency(asset.base_currency_value ?? asset.current_value, baseCurrency)}
                      </p>
                      {asset.currency !== baseCurrency && (
                        <p className="text-xs text-muted-foreground">
                          {formatCurrency(asset.current_value, asset.currency)}
                        </p>
                      )}
                    </div>
                    </Link>
                  </motion.div>
                );
              })}
              {stats.topHoldings.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No assets yet</p>
              )}
            </div>
          </CardContent>
        </Card>
        </AnimatedCard>

        <div className="space-y-6">
          <AnimatedCard>
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                Recently Updated
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.recentlyUpdated.map((asset, i) => {
                  const config = getCategoryConfig(asset.category as AssetCategory);
                  return (
                    <motion.div
                      key={asset.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.15 + i * 0.05 }}
                    >
                      <Link
                        href={`/app/assets/${asset.id}`}
                        className="flex items-center justify-between text-sm hover:bg-accent/50 rounded-lg p-2 -mx-2 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">{config.name}</Badge>
                        <span className="font-medium">{asset.name}</span>
                      </div>
                      <span className="text-muted-foreground text-xs">
                        {formatDateRelative(asset.updated_at)}
                      </span>
                      </Link>
                    </motion.div>
                  );
                })}
                {stats.recentlyUpdated.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-2">No recent updates</p>
                )}
              </div>
            </CardContent>
          </Card>
          </AnimatedCard>

          {stats.staleAssets.length > 0 && (
            <AnimatedCard>
            <Card className="border-amber-200/60 dark:border-amber-800/40 bg-gradient-to-br from-amber-50/40 to-transparent dark:from-amber-950/20 dark:to-transparent">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  Stale Valuations
                </CardTitle>
                <CardDescription>Assets not updated in over 90 days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {stats.staleAssets.map((asset, i) => (
                    <motion.div
                      key={asset.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.1 + i * 0.05 }}
                    >
                      <Link
                        href={`/app/assets/${asset.id}/edit`}
                        className="flex items-center justify-between text-sm rounded-lg p-2.5 hover:bg-amber-100/50 dark:hover:bg-amber-900/20 transition-colors -mx-2"
                    >
                      <span className="font-medium">{asset.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {asset.last_valuation_date
                          ? formatDateRelative(asset.last_valuation_date)
                          : "Never valued"}
                      </span>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
            </AnimatedCard>
          )}
        </div>
      </div>

      {stats.countryAllocation.length > 0 && (
        <AnimatedCard>
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Globe className="h-4 w-4 text-primary" />
              Country Exposure
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {stats.countryAllocation.slice(0, 6).map((item, i) => (
                <motion.div
                  key={item.country}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.05 }}
                  className="flex items-center justify-between rounded-xl border p-3.5 bg-card/50 hover:bg-accent/30 transition-colors"
                >                  <span className="text-sm font-medium">{item.country}</span>
                  <div className="text-right">
                    <span className="text-sm font-semibold tabular-nums">{formatPercentage(item.percentage)}</span>
                    <p className="text-xs text-muted-foreground">{formatCurrency(item.value, baseCurrency, { compact: true })}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
        </AnimatedCard>
      )}
    </PageTransition>
  );
}
