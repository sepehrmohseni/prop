"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatDate, formatDateRelative, isStaleValuation, formatPercentage } from "@/lib/formatting";
import { getCategoryConfig } from "@/lib/categories";
import { getCountryName } from "@/lib/countries";
import { deleteAsset, deleteAssetPurchase } from "@/lib/db/assets";
import type { Asset, AssetCategory, AssetValuation, AssetPurchase } from "@/types";
import { Pencil, Trash2, AlertTriangle, Clock, ArrowLeft, ShoppingBag, Store } from "lucide-react";
import { toast } from "sonner";
import { PageTransition, AnimatedCard } from "@/components/motion";

interface Props {
  asset: Asset;
  baseCurrency: string;
  valuations: AssetValuation[];
  purchases: AssetPurchase[];
}

export function AssetDetailContent({ asset, baseCurrency, valuations, purchases }: Props) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const config = getCategoryConfig(asset.category as AssetCategory);
  const Icon = config.icon;
  const stale = isStaleValuation(asset.last_valuation_date);

  async function handleDelete() {
    setDeleting(true);
    const result = await deleteAsset(asset.id);
    if (result.success) {
      toast.success("Asset deleted");
      router.push("/app/assets");
      router.refresh();
    } else {
      toast.error(result.error ?? "Failed to delete");
      setDeleting(false);
    }
  }

  async function handleDeletePurchase(purchaseId: string) {
    const result = await deleteAssetPurchase(purchaseId);
    if (result.success) {
      toast.success("Purchase record removed");
      router.refresh();
    } else {
      toast.error(result.error ?? "Failed to delete purchase");
    }
  }

  const metadata = asset.metadata as Record<string, unknown>;
  const metadataEntries = Object.entries(metadata).filter(
    ([, v]) => v !== null && v !== undefined && v !== ""
  );

  return (
    <PageTransition className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className={`rounded-xl p-2.5 ${config.color} text-white shadow-sm`}
            >
              <Icon className="h-5 w-5" />
            </motion.div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{asset.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary">{config.name}</Badge>
                <Badge variant={asset.status === "active" ? "default" : "secondary"} className="capitalize">
                  {asset.status}
                </Badge>
                {stale && (
                  <Badge variant="outline" className="text-amber-600 border-amber-300">
                    <AlertTriangle className="mr-1 h-3 w-3" />
                    Stale
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/app/assets/${asset.id}/edit`}>
            <Button variant="outline" size="sm" className="gap-2">
              <Pencil className="h-4 w-4" />
              <span className="hidden sm:inline">Edit</span>
            </Button>
          </Link>
          <AlertDialog>
            <AlertDialogTrigger>
              <Button variant="outline" size="sm" className="gap-2 text-destructive">
                <Trash2 className="h-4 w-4" />
                <span className="hidden sm:inline">Delete</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Asset</AlertDialogTitle>
                <AlertDialogDescription>
                  This will archive &quot;{asset.name}&quot;. You can recover it later if needed.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} disabled={deleting}>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Valuation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Current Value</p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(asset.current_value, asset.currency)}
                  </p>
                </div>
                {asset.base_currency_value != null && asset.currency !== baseCurrency && (
                  <div>
                    <p className="text-sm text-muted-foreground">Base Currency Value ({baseCurrency})</p>
                    <p className="text-2xl font-bold">
                      {formatCurrency(asset.base_currency_value, baseCurrency)}
                    </p>
                    {asset.conversion_rate && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Rate: 1 {asset.currency} = {asset.conversion_rate} {baseCurrency}
                      </p>
                    )}
                  </div>
                )}
                {asset.cost_basis != null && (
                  <div>
                    <p className="text-sm text-muted-foreground">Cost Basis</p>
                    <p className="text-lg font-medium">
                      {formatCurrency(asset.cost_basis, asset.currency)}
                    </p>
                  </div>
                )}
                {asset.cost_basis != null && asset.cost_basis > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground">Gain / Loss</p>
                    {(() => {
                      const gain = asset.current_value - asset.cost_basis;
                      const pct = (gain / asset.cost_basis) * 100;
                      return (
                        <p className={`text-lg font-medium ${gain >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                          {gain >= 0 ? "+" : ""}{formatCurrency(gain, asset.currency)}
                          <span className="text-sm ml-1">({gain >= 0 ? "+" : ""}{pct.toFixed(1)}%)</span>
                        </p>
                      );
                    })()}
                  </div>
                )}
              </div>
              <Separator className="my-4" />
              <div className="grid gap-4 sm:grid-cols-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Last Valued</p>
                  <p className="font-medium">{formatDate(asset.last_valuation_date)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Source</p>
                  <p className="font-medium capitalize">{asset.valuation_source}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Ownership</p>
                  <p className="font-medium">{formatPercentage(asset.ownership_percentage, 0)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 text-sm">
                {asset.acquisition_date && (
                  <div>
                    <p className="text-muted-foreground">Acquisition Date</p>
                    <p className="font-medium">{formatDate(asset.acquisition_date)}</p>
                  </div>
                )}
                {asset.quantity != null && (
                  <div>
                    <p className="text-muted-foreground">Quantity</p>
                    <p className="font-medium">{asset.quantity}</p>
                  </div>
                )}
                {asset.country && (
                  <div>
                    <p className="text-muted-foreground">Country</p>
                    <p className="font-medium">{getCountryName(asset.country)}</p>
                  </div>
                )}
                {asset.region && (
                  <div>
                    <p className="text-muted-foreground">Region</p>
                    <p className="font-medium">{asset.region}</p>
                  </div>
                )}
                {asset.description && (
                  <div className="sm:col-span-2">
                    <p className="text-muted-foreground">Description</p>
                    <p className="font-medium">{asset.description}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {metadataEntries.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base capitalize">
                  {asset.category.replace("_", " ")} Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2 text-sm">
                  {metadataEntries.map(([key, value]) => (
                    <div key={key}>
                      <p className="text-muted-foreground capitalize">{key.replace(/_/g, " ")}</p>
                      <p className="font-medium">{String(value)}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {asset.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{asset.notes}</p>
              </CardContent>
            </Card>
          )}

          <AnimatedCard>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4 text-primary" />
                  Purchase Sources
                </CardTitle>
                <Badge variant="secondary" className="text-xs">
                  {purchases.length} {purchases.length === 1 ? "lot" : "lots"}
                </Badge>
              </CardHeader>
              <CardContent>
                {purchases.length > 0 ? (
                  <div className="rounded-xl border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Source</TableHead>
                          <TableHead className="text-right">Qty</TableHead>
                          <TableHead className="text-right">Unit Cost</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead className="w-[50px]" />
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {purchases.map((p, i) => (
                          <motion.tr
                            key={p.id}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="border-b last:border-0 hover:bg-accent/50 transition-colors"
                          >
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Store className="h-3.5 w-3.5 text-muted-foreground" />
                                <span className="font-medium text-sm">{p.source_name}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right tabular-nums text-sm">
                              {p.quantity ?? "—"}
                            </TableCell>
                            <TableCell className="text-right tabular-nums text-sm">
                              {p.unit_cost ? formatCurrency(p.unit_cost, p.currency) : "—"}
                            </TableCell>
                            <TableCell className="text-right font-medium tabular-nums text-sm">
                              {formatCurrency(p.total_cost, p.currency)}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {p.acquisition_date ? formatDate(p.acquisition_date) : "—"}
                            </TableCell>
                            <TableCell>
                              <AlertDialog>
                                <AlertDialogTrigger>
                                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive">
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Remove Purchase Record</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Remove the purchase from &quot;{p.source_name}&quot;? This cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeletePurchase(p.id)}>
                                      Remove
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </TableCell>
                          </motion.tr>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Store className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No purchase records yet</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Track where and how you acquired this asset
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </AnimatedCard>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Valuation History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {valuations.length > 0 ? (
                <div className="space-y-3">
                  {valuations.map((v) => (
                    <div key={v.id} className="flex items-center justify-between text-sm border-b pb-2 last:border-0">
                      <div>
                        <p className="font-medium">{formatCurrency(v.value_amount, v.currency)}</p>
                        <p className="text-xs text-muted-foreground capitalize">{v.source_type}</p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {formatDateRelative(v.valuation_date)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No valuation history</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created</span>
                <span>{formatDate(asset.created_at)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Updated</span>
                <span>{formatDateRelative(asset.updated_at)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">ID</span>
                <span className="font-mono text-xs">{asset.id.slice(0, 8)}</span>
              </div>
            </CardContent>
          </Card>

          {asset.tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {asset.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">{tag}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
