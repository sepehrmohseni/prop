"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { formatCurrency, formatDate, isStaleValuation } from "@/lib/formatting";
import { getCategoryConfig, categoryList } from "@/lib/categories";
import { deleteAsset } from "@/lib/db/assets";
import type { Asset, AssetCategory, AssetFilters } from "@/types";
import { Plus, Search, AlertTriangle, Wallet, X, MoreHorizontal, Eye, Pencil, Trash2, Loader2 } from "lucide-react";
import { PageTransition, AnimatedCard } from "@/components/motion";
import { toast } from "sonner";

interface Props {
  assets: Asset[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  baseCurrency: string;
  filters: AssetFilters;
}

export function AssetsListContent({
  assets,
  totalCount,
  currentPage,
  totalPages,
  baseCurrency,
  filters,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(filters.search ?? "");
  const [deleteTarget, setDeleteTarget] = useState<Asset | null>(null);
  const [deleting, setDeleting] = useState(false);

  const updateFilter = useCallback(
    (key: string, value: string | null | undefined) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete("page");
      router.push(`/app/assets?${params.toString()}`);
    },
    [router, searchParams]
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilter("search", search || undefined);
  };

  const clearFilters = () => {
    router.push("/app/assets");
    setSearch("");
  };

  const hasFilters = filters.search || filters.category || filters.status || filters.currency;

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    const result = await deleteAsset(deleteTarget.id);
    if (result.success) {
      toast.success("Asset deleted");
      setDeleteTarget(null);
      router.refresh();
    } else {
      toast.error(result.error ?? "Failed to delete");
    }
    setDeleting(false);
  }

  const totalValue = assets.reduce(
    (sum, a) => sum + (a.base_currency_value ?? a.current_value) * (a.ownership_percentage / 100),
    0
  );

  if (totalCount === 0 && !hasFilters) {
    return (
      <PageTransition className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Assets</h1>
          <p className="text-muted-foreground">Manage your portfolio</p>
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
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
                No assets yet
              </motion.h3>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-muted-foreground max-w-sm mb-8"
              >
                Add your first asset to start building your portfolio overview.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Link href="/app/assets/new">
                  <Button className="gap-2 shadow-lg shadow-primary/20">
                    <Plus className="h-4 w-4" />
                    Add Your First Asset
                  </Button>
                </Link>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </PageTransition>
    );
  }

  return (
    <PageTransition className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Assets</h1>
          <p className="text-muted-foreground">
            {totalCount} asset{totalCount !== 1 ? "s" : ""} &middot;{" "}
            {formatCurrency(totalValue, baseCurrency, { compact: true })} total
          </p>
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

      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search assets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button type="submit" variant="secondary" size="sm">
            Search
          </Button>
        </form>
        <div className="flex gap-2">
          <Select
            value={filters.category ?? "all"}
            onValueChange={(v) => updateFilter("category", v === "all" ? undefined : v)}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categoryList.map((c) => (
                <SelectItem key={c.slug} value={c.slug}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={filters.status ?? "all"}
            onValueChange={(v) =>
              updateFilter("status", v === "all" ? undefined : v)
            }
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="sold">Sold</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
          {hasFilters && (
            <Button variant="ghost" size="icon" onClick={clearFilters}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="hidden md:block">
        <AnimatedCard>
        <div className="rounded-xl border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Asset</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Value</TableHead>
                <TableHead className="text-right">Gain / Loss</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead className="w-[50px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {assets.map((asset) => {
                const config = getCategoryConfig(asset.category as AssetCategory);
                const Icon = config.icon;
                const stale = isStaleValuation(asset.last_valuation_date);
                const gain = asset.cost_basis != null && asset.cost_basis > 0
                  ? asset.current_value - asset.cost_basis
                  : null;
                const gainPct = asset.cost_basis != null && asset.cost_basis > 0
                  ? ((asset.current_value - asset.cost_basis) / asset.cost_basis) * 100
                  : null;
                return (
                  <TableRow key={asset.id} className="cursor-pointer" onClick={() => router.push(`/app/assets/${asset.id}`)}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className={`rounded-lg p-1.5 ${config.color} text-white`}>
                          <Icon className="h-3.5 w-3.5" />
                        </div>
                        <div>
                          <span className="font-medium">{asset.name}</span>
                          {asset.quantity != null && (
                            <p className="text-xs text-muted-foreground">{asset.quantity} units</p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs">{config.name}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={asset.status === "active" ? "default" : "secondary"}
                        className="text-xs capitalize"
                      >
                        {asset.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <p className="font-medium">
                        {formatCurrency(asset.base_currency_value ?? asset.current_value, baseCurrency)}
                      </p>
                      {asset.currency !== baseCurrency && (
                        <p className="text-xs text-muted-foreground">
                          {formatCurrency(asset.current_value, asset.currency)}
                        </p>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {gain !== null ? (
                        <span className={`text-sm font-medium ${gain >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                          {gain >= 0 ? "+" : ""}{gainPct?.toFixed(1)}%
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {stale && <AlertTriangle className="h-3 w-3 text-amber-500" />}
                        <span className={stale ? "text-amber-600" : ""}>
                          {formatDate(asset.last_valuation_date)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); router.push(`/app/assets/${asset.id}`); }}>
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); router.push(`/app/assets/${asset.id}/edit`); }}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={(e) => { e.stopPropagation(); setDeleteTarget(asset); }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
        </AnimatedCard>
      </div>

      <div className="md:hidden space-y-3">
        {assets.map((asset, i) => {
          const config = getCategoryConfig(asset.category as AssetCategory);
          const Icon = config.icon;
          const stale = isStaleValuation(asset.last_valuation_date);
          const gain = asset.cost_basis != null && asset.cost_basis > 0
            ? asset.current_value - asset.cost_basis
            : null;
          const gainPct = asset.cost_basis != null && asset.cost_basis > 0
            ? ((asset.current_value - asset.cost_basis) / asset.cost_basis) * 100
            : null;
          return (
            <motion.div
              key={asset.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="hover:bg-accent/50 hover:shadow-sm transition-all active:scale-[0.99]">
                <CardContent className="p-4">
                  <Link href={`/app/assets/${asset.id}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`rounded-lg p-2 ${config.color} text-white`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{asset.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Badge variant="secondary" className="text-xs">{config.name}</Badge>
                            {stale && <AlertTriangle className="h-3 w-3 text-amber-500" />}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-sm">
                          {formatCurrency(asset.base_currency_value ?? asset.current_value, baseCurrency)}
                        </p>
                        {gain !== null && (
                          <p className={`text-xs ${gain >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                            {gain >= 0 ? "+" : ""}{gainPct?.toFixed(1)}%
                          </p>
                        )}
                        {asset.currency !== baseCurrency && (
                          <p className="text-xs text-muted-foreground">
                            {formatCurrency(asset.current_value, asset.currency)}
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t">
                    <p className="text-xs text-muted-foreground">{formatDate(asset.last_valuation_date)}</p>
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <MoreHorizontal className="h-3.5 w-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => router.push(`/app/assets/${asset.id}`)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push(`/app/assets/${asset.id}/edit`)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => setDeleteTarget(asset)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage <= 1}
            onClick={() => updateFilter("page", String(currentPage - 1))}
          >
            Previous
          </Button>
          <span className="flex items-center px-3 text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage >= totalPages}
            onClick={() => updateFilter("page", String(currentPage + 1))}
          >
            Next
          </Button>
        </div>
      )}

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Asset</AlertDialogTitle>
            <AlertDialogDescription>
              This will archive &quot;{deleteTarget?.name}&quot;. You can recover it later if needed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting}>
              {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageTransition>
  );
}
