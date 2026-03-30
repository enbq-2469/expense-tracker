"use client";

import { CategoryChartData } from "@/types";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  TooltipProps,
} from "recharts";
import { CHART_COLORS } from "./ChartLegend";
import { formatVnd } from "@/lib/currency";

interface ExpensePieChartProps {
  data: CategoryChartData[];
  totalVnd: number;
  title: string;
  colorClass?: string;
}

function CustomTooltip({ active, payload }: TooltipProps<number, string>) {
  if (active && payload && payload.length > 0) {
    const item = payload[0];
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2">
        <p className="text-sm font-medium text-gray-900">{item.name}</p>
        <p className="text-sm text-gray-600">{formatVnd(item.value as number)}</p>
        <p className="text-xs text-gray-400">{item.payload.percentage}%</p>
      </div>
    );
  }
  return null;
}

export function ExpensePieChart({ data, totalVnd, title, colorClass }: ExpensePieChartProps) {
  if (data.length === 0 || totalVnd === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-gray-400">
        <p className="text-sm">Không có dữ liệu {title.toLowerCase()}</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className={`text-center text-sm font-medium ${colorClass ?? "text-gray-700"}`}>
        {title}
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={data}
            dataKey="amountVnd"
            nameKey="categoryName"
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={90}
            paddingAngle={2}
          >
            {data.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={CHART_COLORS[index % CHART_COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
