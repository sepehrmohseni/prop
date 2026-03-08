"use client";

import { type ReactNode, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut } from "@/lib/auth/actions";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  LayoutDashboard,
  Wallet,
  Lightbulb,
  Settings,
  LogOut,
  Menu,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AppShellProps {
  children: ReactNode;
  user: {
    id: string;
    email: string;
    full_name: string;
    avatar_url: string | null;
  };
  preferences: {
    base_currency: string;
    theme: string;
  };
}

const navItems = [
  { href: "/app/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/app/assets", label: "Assets", icon: Wallet },
  { href: "/app/insights", label: "Insights", icon: Lightbulb },
  { href: "/app/settings", label: "Settings", icon: Settings },
];

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function AppShell({ children, user }: AppShellProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navContent = (
    <nav className="flex flex-col gap-1 px-3 py-2">
      {navItems.map((item) => {
        const isActive =
          pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <aside className="hidden lg:flex lg:w-64 lg:flex-col border-r bg-card">
        <div className="flex h-14 items-center gap-2 px-6 border-b">
          <Image src="/logo.png" alt="Prop" width={28} height={28} className="rounded" />
          <span className="text-lg font-bold tracking-tight">Prop</span>
        </div>
        <div className="flex-1 overflow-y-auto py-2">
          {navContent}
        </div>
        <div className="border-t p-4">
          <Link href="/app/assets/new">
            <Button className="w-full gap-2" size="sm">
              <Plus className="h-4 w-4" />
              Add Asset
            </Button>
          </Link>
        </div>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-14 items-center justify-between border-b bg-card px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <SheetTitle className="sr-only">Navigation</SheetTitle>
                <div className="flex h-14 items-center gap-2 px-6 border-b">
                  <Image src="/logo.png" alt="Prop" width={28} height={28} className="rounded" />
                  <span className="text-lg font-bold">Prop</span>
                </div>
                <div className="py-2">
                  {navContent}
                </div>
                <Separator />
                <div className="p-4">
                  <Link href="/app/assets/new" onClick={() => setMobileOpen(false)}>
                    <Button className="w-full gap-2" size="sm">
                      <Plus className="h-4 w-4" />
                      Add Asset
                    </Button>
                  </Link>
                </div>
              </SheetContent>
            </Sheet>
            <span className="text-sm font-medium text-muted-foreground lg:hidden">Prop</span>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Button variant="ghost" className="h-9 gap-2 px-2">
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="text-xs">
                      {getInitials(user.full_name || user.email)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:inline text-sm">
                    {user.full_name || user.email}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{user.full_name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Link href="/app/settings/profile">Profile Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href="/app/settings/preferences">Preferences</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => signOut()}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl p-4 lg:p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
