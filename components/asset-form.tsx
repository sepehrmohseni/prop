"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { assetFormSchema, type AssetFormInput, metadataSchemas } from "@/lib/validation";
import { createAsset, updateAsset } from "@/lib/db/assets";
import { currencies } from "@/lib/currencies";
import { countries } from "@/lib/countries";
import { categoryList } from "@/lib/categories";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import type { Asset, AssetCategory } from "@/types";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { improveAssetDetails } from "@/lib/ai/actions";

interface AssetFormProps {
  asset?: Asset;
  baseCurrency: string;
}

export function AssetForm({ asset, baseCurrency }: AssetFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiText, setAiText] = useState("");

  const isEditing = !!asset;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<AssetFormInput>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(assetFormSchema) as any,
    defaultValues: {
      name: asset?.name ?? "",
      category: (asset?.category ?? "cash") as AssetCategory,
      description: asset?.description ?? "",
      status: asset?.status ?? "active",
      currency: asset?.currency ?? baseCurrency,
      current_value: asset?.current_value ?? 0,
      cost_basis: asset?.cost_basis ?? undefined,
      conversion_rate: asset?.conversion_rate ?? undefined,
      base_currency_value: asset?.base_currency_value ?? undefined,
      ownership_percentage: asset?.ownership_percentage ?? 100,
      quantity: asset?.quantity ?? undefined,
      acquisition_date: asset?.acquisition_date ?? undefined,
      country: asset?.country ?? undefined,
      region: asset?.region ?? undefined,
      tags: asset?.tags ?? [],
      notes: asset?.notes ?? "",
      metadata: asset?.metadata ?? {},
    },
  });

  const category = watch("category") as AssetCategory;
  const currency = watch("currency");
  const needsConversion = currency !== baseCurrency;

  async function onSubmit(data: AssetFormInput) {
    setLoading(true);
    setError(null);

    const metadataSchema = metadataSchemas[data.category as AssetCategory];
    const parsedMetadata = metadataSchema ? metadataSchema.safeParse(data.metadata) : { success: true, data: {} };

    const payload = {
      ...data,
      description: data.description ?? null,
      cost_basis: data.cost_basis ?? null,
      conversion_rate: data.conversion_rate ?? null,
      base_currency_value: data.base_currency_value ?? null,
      quantity: data.quantity ?? null,
      acquisition_date: data.acquisition_date ?? null,
      country: data.country ?? null,
      region: data.region ?? null,
      notes: data.notes ?? null,
      metadata: parsedMetadata.success ? (parsedMetadata as { data: Record<string, unknown> }).data ?? {} : data.metadata,
      last_valuation_date: new Date().toISOString(),
      valuation_source: "manual" as const,
    };

    const result = isEditing
      ? await updateAsset(asset.id, payload)
      : await createAsset(payload);

    if (result.success) {
      toast.success(isEditing ? "Asset updated" : "Asset created");
      router.push(result.data ? `/app/assets/${result.data.id}` : "/app/assets");
      router.refresh();
    } else {
      setError(result.error ?? "Something went wrong");
    }
    setLoading(false);
  }

  async function handleAiSuggestion() {
    if (!aiText.trim()) return;
    setAiLoading(true);
    const result = await improveAssetDetails(aiText);
    if (result.success && result.data) {
      const d = result.data;
      if (d.name) setValue("name", String(d.name));
      if (d.category) setValue("category", String(d.category) as AssetCategory);
      if (d.currency) setValue("currency", String(d.currency));
      if (d.current_value) setValue("current_value", Number(d.current_value));
      if (d.cost_basis) setValue("cost_basis", Number(d.cost_basis));
      if (d.description) setValue("description", String(d.description));
      if (d.acquisition_date) setValue("acquisition_date", String(d.acquisition_date));
      if (d.country) setValue("country", String(d.country));
      if (d.metadata) setValue("metadata", d.metadata as Record<string, unknown>);
      toast.success("AI suggestions applied — review before saving");
    } else {
      toast.error(result.error ?? "AI suggestion failed");
    }
    setAiLoading(false);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            AI Assistant
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Paste a rough description and let AI extract structured details.
          </p>
          <Textarea
            value={aiText}
            onChange={(e) => setAiText(e.target.value)}
            placeholder='e.g. "my toyota camry 2018, paid 14k, now worth about 10k, bought in germany"'
            rows={2}
          />
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleAiSuggestion}
            disabled={aiLoading || !aiText.trim()}
          >
            {aiLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4" />
            )}
            Get Suggestions
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input id="name" {...register("name")} placeholder="My asset" />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={category}
                onValueChange={(v) => { if (v) setValue("category", v as AssetCategory); }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categoryList.map((c) => (
                    <SelectItem key={c.slug} value={c.slug}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" {...register("description")} rows={2} />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={watch("status")}
                onValueChange={(v) => { if (v) setValue("status", v as "active" | "sold" | "archived"); }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="sold">Sold</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="acquisition_date">Acquisition Date</Label>
              <Input id="acquisition_date" type="date" {...register("acquisition_date")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ownership_percentage">Ownership %</Label>
              <Input
                id="ownership_percentage"
                type="number"
                min={0}
                max={100}
                {...register("ownership_percentage")}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Valuation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="currency">Currency *</Label>
              <Select
                value={currency}
                onValueChange={(v) => { if (v) setValue("currency", v); }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((c) => (
                    <SelectItem key={c.code} value={c.code}>
                      {c.code} — {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="current_value">Current Value *</Label>
              <Input
                id="current_value"
                type="number"
                step="0.01"
                min={0}
                {...register("current_value")}
              />
              {errors.current_value && (
                <p className="text-sm text-destructive">{errors.current_value.message}</p>
              )}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="cost_basis">Cost Basis / Purchase Price</Label>
              <Input id="cost_basis" type="number" step="0.01" min={0} {...register("cost_basis")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input id="quantity" type="number" step="any" min={0} {...register("quantity")} />
            </div>
          </div>
          {needsConversion && (
            <>
              <Separator />
              <div className="rounded-lg bg-muted/50 p-4 space-y-3">
                <p className="text-sm font-medium">
                  Currency Conversion — {currency} → {baseCurrency}
                </p>
                <p className="text-xs text-muted-foreground">
                  Since this asset is in {currency} and your base currency is {baseCurrency},
                  please provide a conversion rate or the equivalent base value.
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="conversion_rate">
                      Conversion Rate (1 {currency} = ? {baseCurrency})
                    </Label>
                    <Input
                      id="conversion_rate"
                      type="number"
                      step="any"
                      {...register("conversion_rate")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="base_currency_value">
                      Value in {baseCurrency}
                    </Label>
                    <Input
                      id="base_currency_value"
                      type="number"
                      step="0.01"
                      min={0}
                      {...register("base_currency_value")}
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Location</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Select
                value={watch("country") ?? "none"}
                onValueChange={(v) => setValue("country", !v || v === "none" ? null : v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No country</SelectItem>
                  {countries.map((c) => (
                    <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="region">Region / State</Label>
              <Input id="region" {...register("region")} />
            </div>
          </div>
        </CardContent>
      </Card>

      <CategoryMetadataFields
        category={category}
        metadata={watch("metadata")}
        onChange={(m) => setValue("metadata", m)}
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea {...register("notes")} rows={3} placeholder="Any additional notes..." />
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEditing ? "Update Asset" : "Create Asset"}
        </Button>
      </div>
    </form>
  );
}

function CategoryMetadataFields({
  category,
  metadata,
  onChange,
}: {
  category: AssetCategory;
  metadata: Record<string, unknown>;
  onChange: (m: Record<string, unknown>) => void;
}) {
  const set = (key: string, value: string) =>
    onChange({ ...metadata, [key]: value });

  const get = (key: string) => (metadata[key] as string) ?? "";

  const fields: Record<string, { label: string; key: string; type?: string }[]> = {
    car: [
      { label: "Make", key: "make" },
      { label: "Model", key: "model" },
      { label: "Year", key: "year", type: "number" },
      { label: "Mileage", key: "mileage", type: "number" },
      { label: "License Plate", key: "plate" },
      { label: "Condition", key: "condition" },
      { label: "VIN", key: "vin" },
    ],
    house: [
      { label: "Property Type", key: "property_type" },
      { label: "Address Line 1", key: "address_line1" },
      { label: "Address Line 2", key: "address_line2" },
      { label: "City", key: "city" },
      { label: "State / Region", key: "state_region" },
      { label: "Postal Code", key: "postal_code" },
      { label: "Size", key: "size", type: "number" },
      { label: "Size Unit (sqft/sqm)", key: "size_unit" },
    ],
    land: [
      { label: "Property Type", key: "property_type" },
      { label: "Address Line 1", key: "address_line1" },
      { label: "City", key: "city" },
      { label: "State / Region", key: "state_region" },
      { label: "Size", key: "size", type: "number" },
      { label: "Size Unit", key: "size_unit" },
    ],
    gold: [
      { label: "Metal Type", key: "metal_type" },
      { label: "Form (coin, bar, etc.)", key: "form" },
      { label: "Weight", key: "weight", type: "number" },
      { label: "Weight Unit", key: "weight_unit" },
      { label: "Purity", key: "purity" },
      { label: "Storage Location", key: "storage_location" },
    ],
    silver: [
      { label: "Metal Type", key: "metal_type" },
      { label: "Form", key: "form" },
      { label: "Weight", key: "weight", type: "number" },
      { label: "Weight Unit", key: "weight_unit" },
      { label: "Purity", key: "purity" },
      { label: "Storage Location", key: "storage_location" },
    ],
    metals: [
      { label: "Metal Type", key: "metal_type" },
      { label: "Form", key: "form" },
      { label: "Weight", key: "weight", type: "number" },
      { label: "Weight Unit", key: "weight_unit" },
      { label: "Purity", key: "purity" },
      { label: "Storage Location", key: "storage_location" },
    ],
    stocks: [
      { label: "Ticker Symbol", key: "symbol" },
      { label: "Company Name", key: "company_name" },
      { label: "Exchange", key: "exchange" },
      { label: "Average Cost per Share", key: "average_cost", type: "number" },
    ],
    cryptocurrency: [
      { label: "Symbol", key: "symbol" },
      { label: "Asset Name", key: "asset_name" },
      { label: "Network", key: "network" },
      { label: "Wallet / Exchange", key: "wallet_exchange" },
    ],
    foreign_cash: [
      { label: "Storage Location", key: "location" },
      { label: "Original Amount", key: "original_amount", type: "number" },
      { label: "Original Currency", key: "original_currency" },
    ],
    cash: [
      { label: "Location / Account", key: "location" },
    ],
    business: [
      { label: "Business Name", key: "business_name" },
      { label: "Business Type", key: "business_type" },
      { label: "Industry", key: "industry" },
      { label: "Registration Number", key: "registration_number" },
    ],
    collectibles: [
      { label: "Item Type", key: "item_type" },
      { label: "Artist / Maker", key: "artist_maker" },
      { label: "Era / Year", key: "era_year" },
      { label: "Condition", key: "condition" },
      { label: "Authentication", key: "authentication" },
    ],
    bonds: [
      { label: "Issuer", key: "issuer" },
      { label: "Bond Type", key: "bond_type" },
      { label: "Coupon Rate (%)", key: "coupon_rate", type: "number" },
      { label: "Maturity Date", key: "maturity_date" },
      { label: "Face Value", key: "face_value", type: "number" },
    ],
    retirement: [
      { label: "Account Type", key: "account_type" },
      { label: "Institution", key: "institution" },
      { label: "Account Number (last 4)", key: "account_number_last4" },
    ],
    receivables: [
      { label: "Debtor Name", key: "debtor_name" },
      { label: "Due Date", key: "due_date" },
      { label: "Terms", key: "terms" },
    ],
    other: [
      { label: "Subtype", key: "subtype" },
    ],
  };

  const categoryFields = fields[category];
  if (!categoryFields || categoryFields.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base capitalize">{category.replace("_", " ")} Details</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2">
          {categoryFields.map((field) => (
            <div key={field.key} className="space-y-2">
              <Label>{field.label}</Label>
              <Input
                type={field.type ?? "text"}
                value={get(field.key)}
                onChange={(e) => set(field.key, e.target.value)}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
