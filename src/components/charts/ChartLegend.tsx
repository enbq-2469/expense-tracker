"use client";

import { CategoryChartData } from "@/types";
import { formatVndShort } from "@/lib/currency";

const CHART_COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
  "#f97316",
  "#84cc16",
  "#ec4899",
  "#6b7280",
];

interface ChartLegendProps {
  data: CategoryChartData[];
  totalVnd: number;
}

export function ChartLegend({ data, totalVnd }: ChartLegendProps) {
  if (data.length === 0) {
    return (
      <div className="text-sm text-gray-400 text-center py-4">
        Không có dữ liệu
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {data.map((item, index) => (
        <div key={item.categoryId} className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span
              className="flex-shrink-0 w-3 h-3 rounded-full"
              style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
            />
            <span className="text-sm text-gray-700 truncate">{item.categoryName}</span>
          </div>
          <div className="text-right flex-shrink-0">
            <span className="text-sm font-medium text-gray-900">
              {formatVndShort(item.amountVnd)}
            </span>
            <span className="text-xs text-gray-400 ml-1">({item.percentage}%)</span>
          </div>
        </div>
      ))}
      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <span className="text-sm font-medium text-gray-600">Tổng</span>
        <span className="text-sm font-bold text-gray-900">{formatVndShort(totalVnd)}</span>
      </div>
    </div>
  );
}

export { CHART_COLORS };
