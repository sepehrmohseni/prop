import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="space-y-2">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-56" />
      </div>
      <div className="flex flex-col md:flex-row gap-6">
        <Skeleton className="h-10 w-full md:w-48" />
        <div className="flex-1 space-y-4">
          <Skeleton className="h-[200px] rounded-xl" />
        </div>
      </div>
    </div>
  );
}
