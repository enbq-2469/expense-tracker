import { DashboardSkeleton } from "@/components/ui/Skeleton";

export default function HomeLoading() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="h-8 bg-gray-200 rounded w-40 mb-6 animate-pulse" />
      <DashboardSkeleton />
    </div>
  );
}
