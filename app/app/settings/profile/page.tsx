"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileSchema, type ProfileInput } from "@/lib/validation";
import { getProfile, updateProfile } from "@/lib/db/profile";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: "",
      email: "",
    },
  });

  useEffect(() => {
    async function loadProfile() {
      try {
        // Try DB profile first
        const profile = await getProfile();
        if (profile && (profile.full_name || profile.email)) {
          reset({
            full_name: profile.full_name ?? "",
            email: profile.email ?? "",
          });
          setLoading(false);
          return;
        }
        // Fallback: read from auth user directly
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          reset({
            full_name: (user.user_metadata?.full_name as string) ?? profile?.full_name ?? "",
            email: user.email ?? profile?.email ?? "",
          });
        }
      } catch {
        // Silently fail — form stays with defaults
      }
      setLoading(false);
    }
    loadProfile();
  }, [reset]);

  async function onSubmit(data: ProfileInput) {
    setSaving(true);
    const result = await updateProfile({ full_name: data.full_name });
    if (result.success) {
      toast.success("Profile updated");
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
        <CardTitle>Profile</CardTitle>
        <CardDescription>Update your personal information</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name</Label>
            <Input id="full_name" {...register("full_name")} />
            {errors.full_name && <p className="text-sm text-destructive">{errors.full_name.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" {...register("email")} readOnly tabIndex={-1} className="bg-muted cursor-not-allowed" />
            <p className="text-xs text-muted-foreground">Email cannot be changed here</p>
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
