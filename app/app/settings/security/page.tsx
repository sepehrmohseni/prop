"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { changePasswordSchema, type ChangePasswordInput } from "@/lib/validation";
import { changePassword } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function SecurityPage() {
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
  });

  async function onSubmit(data: ChangePasswordInput) {
    setSaving(true);
    const result = await changePassword(data.new_password);
    if (result.success) {
      toast.success("Password updated");
      reset();
    } else {
      toast.error(result.error ?? "Failed to update password");
    }
    setSaving(false);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Security</CardTitle>
        <CardDescription>Update your password</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new_password">New Password</Label>
            <Input id="new_password" type="password" autoComplete="new-password" {...register("new_password")} />
            {errors.new_password && <p className="text-sm text-destructive">{errors.new_password.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm_password">Confirm New Password</Label>
            <Input id="confirm_password" type="password" autoComplete="new-password" {...register("confirm_password")} />
            {errors.confirm_password && <p className="text-sm text-destructive">{errors.confirm_password.message}</p>}
          </div>
          <Button type="submit" disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Update Password
          </Button>
        </CardContent>
      </form>
    </Card>
  );
}
