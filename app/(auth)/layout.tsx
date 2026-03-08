import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="Prop" width={40} height={40} className="rounded-lg" />
            <span className="text-2xl font-bold tracking-tight">Prop</span>
          </Link>
        </div>
        {children}
      </div>
    </div>
  );
}
