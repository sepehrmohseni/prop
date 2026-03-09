import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { LandingAnimations } from "@/components/landing-animations";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
              P
            </div>
            <span className="text-xl font-bold group-hover:text-primary transition-colors">Prop</span>
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            {user ? (
              <Link
                href="/app/dashboard"
                className="inline-flex h-9 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm shadow-primary/20"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className="inline-flex h-9 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm shadow-primary/20"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <LandingAnimations />

      <footer className="border-t">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <p className="text-sm text-muted-foreground">Prop</p>
          <p className="text-sm text-muted-foreground">
            made by a human called{" "}
            <a href="https://sepr.dev" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground transition-colors">sepehr</a>.
          </p>
        </div>
      </footer>
    </div>
  );
}
