"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { preferencesSchema, type PreferencesInput } from "@/lib/validation";
import { getPreferences, updatePreferences } from "@/lib/db/profile";
import { currencies } from "@/lib/currencies";
import { countries } from "@/lib/countries";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function PreferencesPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const { setValue, watch, handleSubmit } = useForm<PreferencesInput>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: {
      base_currency: "USD",
      theme: "system",
    },
  });

  useEffect(() => {
    getPreferences().then((prefs) => {
      if (prefs) {
        setValue("base_currency", prefs.base_currency);
        setValue("theme", prefs.theme as "light" | "dark" | "system");
        setValue("default_country", prefs.default_country);
        setValue("locale", prefs.locale);
      }
      setLoading(false);
    });
  }, [setValue]);

  async function onSubmit(data: PreferencesInput) {
    setSaving(true);
    const result = await updatePreferences({
      base_currency: data.base_currency,
      locale: data.locale,
      default_country: data.default_country,
      theme: data.theme,
    });
    if (result.success) {
      toast.success("Preferences updated");
    } else {
      toast.error(result.error ?? "Failed to update");
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Preferences</CardTitle>
        <CardDescription>Configure your currency, locale, and display preferences</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Base Currency</Label>
            <Select value={watch("base_currency")} onValueChange={(v) => { if (v) setValue("base_currency", v); }}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((c) => (
                  <SelectItem key={c.code} value={c.code}>
                    {c.code} — {c.name} ({c.symbol})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              All portfolio values will be displayed in this currency
            </p>
          </div>
          <div className="space-y-2">
            <Label>Default Country</Label>
            <Select
              value={watch("default_country") ?? "none"}
              onValueChange={(v) => setValue("default_country", v === "none" ? null : v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No default</SelectItem>
                {countries.map((c) => (
                  <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Theme</Label>
            <Select
              value={watch("theme")}
              onValueChange={(v) => setValue("theme", v as "light" | "dark" | "system")}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="system">System</SelectItem>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </CardContent>
      </form>
    </Card>
  );
}
