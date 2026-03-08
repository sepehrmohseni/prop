"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { User, Globe, Shield } from "lucide-react";

const tabs = [
  { href: "/app/settings/profile", label: "Profile", icon: User },
  { href: "/app/settings/preferences", label: "Preferences", icon: Globe },
  { href: "/app/settings/security", label: "Security", icon: Shield },
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account and preferences</p>
      </div>
      <div className="flex flex-col md:flex-row gap-6">
        <SettingsNav />
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}

function SettingsNav() {
  const pathname = usePathname();
  return (
    <nav className="flex md:flex-col gap-1 md:w-48 overflow-x-auto">
      {tabs.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className={cn(
            "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap",
            pathname === tab.href
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          )}
        >
          <tab.icon className="h-4 w-4" />
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
