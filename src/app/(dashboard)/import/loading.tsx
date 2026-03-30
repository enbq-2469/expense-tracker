import { Skeleton, TransactionRowSkeleton } from "@/components/ui/Skeleton";

export default function ImportLoading() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="h-8 bg-gray-200 rounded w-56 mb-6 animate-pulse" />
      <div className="flex justify-end mb-4">
        <Skeleton className="h-10 w-36" />
      </div>
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {["Ngày", "Ghi chú", "Số tiền", "Loại", "Danh mục", "Thao tác"].map((h) => (
                <th key={h} className="px-4 py-2 text-left text-xs font-medium text-gray-300">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 8 }).map((_, i) => (
              <TransactionRowSkeleton key={i} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
