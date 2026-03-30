"use client";

import { MonthlyDataPoint } from "@/types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  TooltipProps,
} from "recharts";
import { formatVnd, formatVndShort } from "@/lib/currency";

interface MonthlyBarChartProps {
  months: MonthlyDataPoint[];
}

const MONTH_LABELS = [
  "Th.1", "Th.2", "Th.3", "Th.4", "Th.5", "Th.6",
  "Th.7", "Th.8", "Th.9", "Th.10", "Th.11", "Th.12",
];

interface ChartDataPoint {
  month: string;
  monthNum: number;
  incomeVnd: number;
  expenseVnd: number;
}

function CustomTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2 space-y-1">
      <p className="text-sm font-semibold text-gray-800">Tháng {label}</p>
      {payload.map((entry) => (
        <p key={entry.name} className="text-sm" style={{ color: entry.color }}>
          {entry.name}: {formatVnd(entry.value as number)}
        </p>
      ))}
    </div>
  );
}

export function MonthlyBarChart({ months }: MonthlyBarChartProps) {
  const allZero = months.every((m) => m.incomeVnd === 0 && m.expenseVnd === 0);

  const chartData: ChartDataPoint[] = months.map((m) => ({
    month: MONTH_LABELS[m.month - 1],
    monthNum: m.month,
    incomeVnd: m.incomeVnd,
    expenseVnd: m.expenseVnd,
  }));

  if (allZero) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-gray-400">
        <p className="text-sm">Không có dữ liệu giao dịch trong năm này</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={chartData} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 12, fill: "#6b7280" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tickFormatter={(v: number) => formatVndShort(v)}
          width={72}
          tick={{ fontSize: 11, fill: "#6b7280" }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f9fafb" }} />
        <Legend
          formatter={(value) =>
            value === "incomeVnd" ? "Thu nhập" : "Chi tiêu"
          }
          wrapperStyle={{ fontSize: 13 }}
        />
        <Bar
          dataKey="incomeVnd"
          name="incomeVnd"
          fill="#16a34a"
          radius={[3, 3, 0, 0]}
          maxBarSize={28}
        />
        <Bar
          dataKey="expenseVnd"
          name="expenseVnd"
          fill="#dc2626"
          radius={[3, 3, 0, 0]}
          maxBarSize={28}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
